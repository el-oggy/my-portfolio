"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";

const ItomExperienceCore = dynamic(() => import("./ItomExperienceCore"), {
  ssr: false,
  loading: () => (
    <div className="app">
      <div className="canvas-wrapper" aria-hidden />
      <div className="preloader">
        <div className="preloader__content">
          <p>Loading the sketch world…</p>
        </div>
      </div>
    </div>
  ),
});

export default function ItomExperience({ fallback }: { fallback?: ReactNode }) {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      setWebglSupported(Boolean(gl));
    } catch {
      setWebglSupported(false);
    }
  }, []);

  useEffect(() => {
    if (webglSupported === null) return;
    const overflow = webglSupported ? "hidden" : "auto";
    document.documentElement.style.overflow = overflow;
    document.body.style.overflow = overflow;
  }, [webglSupported]);

  if (webglSupported === false) {
    return <div className="fallback-content">{fallback}</div>;
  }

  return <ItomExperienceCore fallback={fallback} />;
}
