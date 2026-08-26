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
    <main className="min-h-screen bg-[var(--bg-paper)] px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center">
          <div className="font-caveat text-3xl text-[var(--accent-contact)]">
            ✉ drop me a line ✉
          </div>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl">
            Email Adarsh
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-[var(--ink-dim)]">
            Open for embedded systems, IoT hardware design, VLSI, and robotics
            collaborations — messages land straight in the inbox.
          </p>
        </div>

        {/* Contact details strip */}
        <div className="mx-auto mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
          <a
            href={`mailto:${links.email}`}
            className="rounded-lg border-2 border-[var(--pencil-line)] bg-white p-3 text-center transition hover:-translate-y-0.5"
          >
            <div className="font-hand text-xs text-[var(--ink-faint)]">direct</div>
            <div className="truncate font-mono text-xs font-bold text-[var(--ink)]">
              {links.email}
            </div>
          </a>
          <a
            href={links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border-2 border-[var(--pencil-line)] bg-white p-3 text-center transition hover:-translate-y-0.5"
          >
            <div className="font-hand text-xs text-[var(--ink-faint)]">code</div>
            <div className="font-mono text-xs font-bold text-[var(--ink)]">GitHub ↗</div>
          </a>
          <a
            href={links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border-2 border-[var(--pencil-line)] bg-white p-3 text-center transition hover:-translate-y-0.5"
          >
            <div className="font-hand text-xs text-[var(--ink-faint)]">network</div>
            <div className="font-mono text-xs font-bold text-[var(--ink)]">LinkedIn ↗</div>
          </a>
        </div>

        {/* The form */}
        <div className="mt-10">
          <EmailForm />
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <Link href="/" className="sketch-btn inline-block text-sm">
            ← Back to the 3D portfolio
          </Link>
          <div className="mt-6 font-mono text-xs text-[var(--ink-faint)]">
            📍 {identity.location}
          </div>
        </div>
      </div>
    </main>
  );
}
