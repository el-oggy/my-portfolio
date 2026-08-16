"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { scenePresence } from "@/lib/stage";

/**
 * Lazy-load mount gate (§50). A scene's heavy inner content only mounts when
 * the camera approaches its world region — and unmounts shortly after it has
 * left (hysteresis) — so the initial load stays light and GPU memory stays
 * bounded across the long journey.
 */
export function LazyLoadScene({
  sceneKey,
  children,
}: {
  sceneKey:
    | "pcb"
    | "embedded"
    | "iot"
    | "drone"
    | "firmware"
    | "rtl"
    | "journey"
    | "contact";
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let raf = 0;
    let aliveSince = 0;
    const loop = () => {
      const presence = scenePresence(sceneKey);
      if (presence > 0.04) {
        if (!mounted) {
          setMounted(true);
          aliveSince = performance.now();
        }
      } else if (mounted && performance.now() - aliveSince > 900) {
        // Hysteresis: keep mounted ~0.9s after leaving to avoid flicker.
        setMounted(false);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneKey, mounted]);

  if (!mounted) return null;
  return <group key={sceneKey}>{children}</group>;
}

/**
 * Dynamically import a scene component with SSR disabled (verified pattern —
 * R3F hooks like useThree/useFrame must not run server-side). Use inside the
 * persistent Canvas, wrapped in <Suspense>.
 */
export function lazyScene(loader: () => Promise<{ default: React.ComponentType }>) {
  return dynamic(loader, { ssr: false });
}
