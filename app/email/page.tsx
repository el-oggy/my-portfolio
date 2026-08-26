import type { Metadata } from "next";
import Link from "next/link";
import EmailForm from "./EmailForm";
import { identity, links } from "@/lib/data";

export const metadata: Metadata = {
  title: "Email Me",
  description:
    "Write directly to Adarsh Swarup Maharana — embedded systems, IoT hardware design, and robotics engineering collaborations.",
};

export default function EmailPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-paper)] px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* ===== HEADER BAND ===== */}
        <header className="text-center">
          <div className="font-caveat text-3xl text-[var(--accent-contact)]">
            ✉ drop me a line ✉
          </div>
          <h1 className="mt-2 text-5xl font-extrabold tracking-tight text-[var(--ink)] sm:text-6xl">
            Send a Signal
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--ink-dim)]">
            Open for embedded systems, IoT hardware design, VLSI, and robotics
            collaborations. Messages land straight in the inbox — no middlemen.
          </p>

          {/* Signal-wave divider */}
          <div className="mt-6 flex items-center justify-center gap-1.5" aria-hidden>
            {[8, 18, 30, 44, 56, 64, 56, 44, 30, 18, 8].map((h, i) => (
              <span
                key={i}
                className={`w-2 rounded-full ${i === 5 ? "bg-[var(--accent-contact)]" : "bg-[var(--pencil-line)]"}`}
                style={{ height: h / 2 + 8 }}
              />
            ))}
          </div>
        </header>

        {/* ===== TWO-COLUMN BODY ===== */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.35fr]">
          {/* Left — who you're writing to */}
          <aside className="sketch-card relative h-fit p-8 lg:sticky lg:top-10">
            <div className="sketch-tape" />
            <div
              className="flex h-20 w-20 items-center justify-center rounded-xl border-4 border-[var(--ink)] bg-[var(--accent-contact)] font-caveat text-5xl text-white"
              aria-hidden
            >
              A
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-[var(--ink)]">
              {identity.name}
            </h2>
            <p className="font-hand text-lg text-[var(--accent-contact)]">
              embedded · vlsi · iot
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-dim)]">
              Electronics engineer from {identity.location}. Builds flight
              controllers, keyboard firmware, and systolic arrays — happy to
              talk hardware, internships, or wild ideas.
            </p>

            <dl className="mt-6 space-y-3 font-mono text-xs">
              <div>
                <dt className="font-hand text-sm text-[var(--ink-faint)]">direct</dt>
                <dd>
                  <a
                    href={`mailto:${links.email}`}
                    className="break-all text-[var(--ink)] underline hover:text-[var(--accent-contact)]"
                  >
                    {links.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-hand text-sm text-[var(--ink-faint)]">response time</dt>
                <dd className="flex items-center gap-2 text-[var(--ink)]">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                  usually within 24 hours
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-2">
              <a href={links.github} target="_blank" rel="noopener noreferrer" className="sketch-tag">
                GitHub ↗
              </a>
              <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="sketch-tag">
                LinkedIn ↗
              </a>
              <a href={links.resume} target="_blank" rel="noopener noreferrer" className="sketch-tag">
                CV ↗
              </a>
            </div>
          </aside>

          {/* Right — the form */}
          <section aria-label="Contact form">
            <EmailForm />
          </section>
        </div>

        {/* ===== FOOTER ===== */}
        <footer className="mt-16 border-t-2 border-dashed border-[var(--pencil-line)]/40 pt-6 text-center">
          <Link href="/" className="sketch-btn inline-block text-sm">
            ← Back to the 3D portfolio
          </Link>
          <div className="mt-4 font-mono text-xs text-[var(--ink-faint)]">
            📍 {identity.location} · built with react-three-fiber & too much coffee
          </div>
        </footer>
      </div>
    </main>
  );
}
