import Link from "next/link";
import "@/components/itom/src/styles/main.scss";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#fafafa] p-4 text-center">
      <div className="sketch-card p-8 sm:p-12 relative max-w-md w-full">
        <div className="sketch-tape" />
        <div className="font-caveat text-4xl text-[var(--ink)] mb-2">
          404 ✦
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-[var(--ink)]">
          Page Not Found
        </h2>
        <p className="mt-4 text-base text-[var(--ink-dim)]">
          It looks like you've wandered out of bounds. Let's get you back to the hardware lab.
        </p>
        <Link href="/">
          <button className="sketch-btn mt-8 bg-[var(--note-yellow)]">
            Return Home ↗
          </button>
        </Link>
      </div>
    </div>
  );
}
