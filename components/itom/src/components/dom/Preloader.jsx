import { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAudio } from '../../context/AudioManager';

/**
 * Preloader — smooth boot gate
 *
 * Performance contract: ~130 texture requests stream through
 * THREE.DefaultLoadingManager during boot. None of that traffic may re-render
 * this component — progress lives in refs and is pushed to the DOM with direct
 * style/innerText writes from a single gsap.ticker loop. React state is used
 * exactly once: `isDone` unmounts the overlay after the paper-tear exit.
 *
 * Flow:
 *   1. LoadingManager callbacks -> ref writes only.
 *   2. gsap.ticker eases the displayed % toward the real target
 *      (framerate-independent exponential smoothing, monotonic, held at 99
 *      while the scene compiles).
 *   3. displayed >= 99.5 && scene ready -> 1.8s power3.inOut paper tear that
 *      hands straight off into the entrance.
 */
const PATH_LENGTH = 120;

// Tear line drawn along the tear seam (revealed as progress climbs)
const TearLineSVG = ({ svgPathData, pathRef }) => (
  <svg
    className="preloader__overlay"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style={{ pointerEvents: 'none' }}
  >
    <path
      ref={pathRef}
      d={svgPathData}
      fill="none"
      stroke="#1a1a1a"
      strokeWidth="0.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: PATH_LENGTH,
        strokeDashoffset: PATH_LENGTH,
      }}
    />
  </svg>
);

// Ring loader — clean dashed circles spinning around the percentage
const RingLoader = () => (
  <div className="preloader__ring">
    <svg width="120" height="120" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <circle
        cx="50" cy="50" r="45"
        fill="none"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="10 15"
        opacity="0.8"
      />
      <circle
        cx="50" cy="50" r="35"
        fill="none"
        stroke="#000"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="5 10"
        opacity="0.5"
        style={{
          animation: 'ring-spin-reverse 4s linear infinite',
          transformOrigin: '50% 50%'
        }}
      />
    </svg>
    <style>{`
      @keyframes ring-spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
      @keyframes ring-spin-reverse {
        0% { transform: rotate(360deg); }
        100% { transform: rotate(0deg); }
      }
      .preloader__ring {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 120px;
        height: 120px;
        pointer-events: none;
        z-index: 5;
        animation: ring-spin 10s linear infinite;
      }
    `}</style>
  </div>
);
const percentageStyle = {
  position: 'absolute',
  top: '50%',
  left: '0',
  width: '100%',
  transform: 'translateY(-50%)',
  textAlign: 'center',
  zIndex: 20,
  fontFamily: "'Inter', sans-serif",
  fontSize: '2rem',
  fontWeight: 'bold',
  mixBlendMode: 'multiply',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'visible'
};

const Preloader = ({ onComplete, ready }) => {
  // The ONE piece of React state: unmount after the exit timeline finishes.
  const [isDone, setIsDone] = useState(false);

  const { play } = useAudio();

  // DOM refs — written to directly every tick, bypassing React render
  const containerRef = useRef(null);
  const leftHalfRef = useRef(null);
  const rightHalfRef = useRef(null);
  const pathLeftRef = useRef(null);
  const pathRightRef = useRef(null);
  const textLeftRef = useRef(null);
  const textRightRef = useRef(null);

  // Loading state — refs only, so ~130 asset events never re-render
  const realProgressRef = useRef(0);    // raw DefaultLoadingManager %
  const activeRef = useRef(true);       // manager is mid-batch
  const targetRef = useRef(0);          // monotonic easing target
  const displayProgressRef = useRef(0); // eased value currently shown
  const readyRef = useRef(false);
  const forcedReadyRef = useRef(false);
  const waitStartRef = useRef(0);       // boot-watchdog timer start
  const exitStartedRef = useRef(false);
  const pencilSoundRef = useRef(null);

  // Latest-callback refs so the ticker never holds stale closures
  const playRef = useRef(play);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { playRef.current = play; }, [play]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { readyRef.current = ready; }, [ready]);

  // ----------------------------------------
  // ASSET PROGRESS — LoadingManager writes straight into refs.
  // No setState here: this fires once per texture request.
  // ----------------------------------------
  useEffect(() => {
    const mgr = THREE.DefaultLoadingManager;
    const origOnStart = mgr.onStart;
    const origOnProgress = mgr.onProgress;
    const origOnLoad = mgr.onLoad;

    mgr.onStart = (url, loaded, total) => {
      activeRef.current = true;
      origOnStart?.(url, loaded, total);
    };

    mgr.onProgress = (url, loaded, total) => {
      if (total > 0) realProgressRef.current = (loaded / total) * 100;
      origOnProgress?.(url, loaded, total);
    };

    mgr.onLoad = () => {
      realProgressRef.current = 100;
      activeRef.current = false;
      origOnLoad?.();
    };

    return () => {
      mgr.onStart = origOnStart;
      mgr.onProgress = origOnProgress;
      mgr.onLoad = origOnLoad;
    };
  }, []);


  // ----------------------------------------
  // GENERATE TEAR PATH
  // ----------------------------------------
  const tearPoints = useMemo(() => {
    const points = [];
    const segments = 12;

    points.push([50, 0]);

    for (let i = 1; i < segments; i++) {
      const y = (i / segments) * 100;
      const xOffset = (Math.random() - 0.5) * 6;
      const x = 50 + xOffset;
      points.push([x, y]);
    }

    points.push([50, 100]);
    return points;
  }, []);

  const svgPathData = useMemo(() => {
    return tearPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]} `).join(' ');
  }, [tearPoints]);

  const leftClipPoly = useMemo(() => {
    let poly = '0% 0%, ';
    tearPoints.forEach(p => { poly += `${p[0]}% ${p[1]}%, `; });
    poly += '0% 100%';
    return `polygon(${poly})`;
  }, [tearPoints]);

  const rightClipPoly = useMemo(() => {
    let poly = '100% 0%, ';
    poly += '100% 100%, ';
    [...tearPoints].reverse().forEach(p => { poly += `${p[0]}% ${p[1]}%, `; });
    return `polygon(${poly.slice(0, -2)})`;
  }, [tearPoints]);


  // ----------------------------------------
  // SMOOTH PROGRESS LOOP — one ticker, zero re-renders
  // ----------------------------------------
  useEffect(() => {
    const BOOT_WATCHDOG_MS = 6000;

    // Paper-tear exit — ITom timing: 1.8s power3.inOut, halves rotate apart
    const startExit = () => {
      if (pencilSoundRef.current) {
        pencilSoundRef.current.stop();
        pencilSoundRef.current = null;
      }
      playRef.current('tear', { volume: 0.8 });

      const tl = gsap.timeline({
        onComplete: () => {
          setIsDone(true);
          onCompleteRef.current?.();
        }
      });

      // Quick pause before the tear
      tl.to({}, { duration: 0.1 });

      tl.to(leftHalfRef.current, {
        xPercent: -100,
        rotation: -2,
        duration: 1.8,
        ease: 'power3.inOut'
      }, 'tear');

      tl.to(rightHalfRef.current, {
        xPercent: 100,
        rotation: 2,
        duration: 1.8,
        ease: 'power3.inOut'
      }, 'tear');

      tl.to(containerRef.current, {
        opacity: 0,
        duration: 0.5
      }, '-=0.5');
    };

    const checkProgressTriggers = (val) => {
      // Pencil scratch loop while the line draws, stop once we hit the tear
      if (val < 99 && !pencilSoundRef.current) {
        pencilSoundRef.current = playRef.current('pencil', { loop: true, volume: 0.5 });
      } else if (val >= 99 && pencilSoundRef.current) {
        pencilSoundRef.current.stop();
        pencilSoundRef.current = null;
      }

      if (val >= 99.5 && (readyRef.current || forcedReadyRef.current) && !exitStartedRef.current) {
        exitStartedRef.current = true;
        startExit();
      }
    };

    const tick = (time, deltaMs) => {
      if (exitStartedRef.current) return;

      // Resolve the easing target from raw loading state
      const real = realProgressRef.current;
      const sceneReady = readyRef.current || forcedReadyRef.current;
      let target = real;
      if (!activeRef.current && real >= 100) {
        // Assets done — hold at 99 while the scene compiles, then release
        target = sceneReady ? 100 : 99;
      }
      if (target > targetRef.current) targetRef.current = target;
      target = targetRef.current;

      // Boot watchdog: assets in but the scene never signalled ready (e.g. a
      // driver where gl.compileAsync never settles) — open the doors after a
      // grace period instead of trapping the visitor at 99%.
      if (!activeRef.current && real >= 100 && !sceneReady) {
        if (!waitStartRef.current) waitStartRef.current = performance.now();
        if (performance.now() - waitStartRef.current > BOOT_WATCHDOG_MS) {
          forcedReadyRef.current = true;
        }
      } else {
        waitStartRef.current = 0;
      }

      // Framerate-independent exponential smoothing toward the target
      const dt = Math.min(deltaMs / 1000, 0.1);
      const current = displayProgressRef.current;
      let next = current + (target - current) * Math.min(1, dt * 3.5);
      if (Math.abs(target - next) < 0.05) next = target;
      displayProgressRef.current = next;

      // Direct DOM writes — bypass React render entirely
      const safe = Math.min(100, Math.max(0, next));
      const offset = PATH_LENGTH - (PATH_LENGTH * safe) / 100;
      const text = `${Math.round(safe)}%`;
      if (textLeftRef.current) textLeftRef.current.innerText = text;
      if (textRightRef.current) textRightRef.current.innerText = text;
      if (pathLeftRef.current) pathLeftRef.current.style.strokeDashoffset = offset;
      if (pathRightRef.current) pathRightRef.current.style.strokeDashoffset = offset;

      checkProgressTriggers(safe);
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      if (pencilSoundRef.current) {
        pencilSoundRef.current.stop();
        pencilSoundRef.current = null;
      }
    };
  }, []);

  if (isDone) return null;

  return (
    <div className="preloader" ref={containerRef} role="status" aria-live="polite" aria-label="Loading portfolio">
      {/* LEFT HALF */}
      <div
        className="preloader__half preloader__half--left"
        ref={leftHalfRef}
        style={{ clipPath: leftClipPoly }}
      >
        <div className="preloader__percentage" style={percentageStyle}>
          <span ref={textLeftRef}>0%</span>
          <RingLoader />
        </div>
        <TearLineSVG pathRef={pathLeftRef} svgPathData={svgPathData} />
      </div>

      {/* RIGHT HALF */}
      <div
        className="preloader__half preloader__half--right"
        ref={rightHalfRef}
        style={{ clipPath: rightClipPoly }}
      >
        <div className="preloader__percentage" style={percentageStyle}>
          <span ref={textRightRef}>0%</span>
          <RingLoader />
        </div>
        <TearLineSVG pathRef={pathRightRef} svgPathData={svgPathData} />
      </div>
    </div>
  );
};

export default Preloader;

