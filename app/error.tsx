"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#fafafa] p-4 text-center">
      <div className="sketch-card p-8 sm:p-12 relative max-w-md w-full">
        <div className="sketch-tape" />
        <div className="font-caveat text-3xl text-[#cc0000] mb-2">
          Oops! ✦
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-[var(--ink)]">
          System Fault
        </h2>
        <p className="mt-4 text-base text-[var(--ink-dim)]">
          Something went wrong in the immersive experience. 
        </p>
        <button
          onClick={() => reset()}
          className="sketch-btn mt-8 bg-[var(--note-yellow)]"
        >
          Try to Recover ↺
        </button>
      </div>
    </div>
  );
}
