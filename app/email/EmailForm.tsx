"use client";

import { useState } from "react";

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "";
const EMAIL = "adarshswarupmaharana@gmail.com";

type Status = "idle" | "sending" | "success" | "error";

export default function EmailForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!WEB3FORMS_KEY) {
      // No key configured — fall back to the visitor's mail client
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
        subject || "Hello from your portfolio"
      )}&body=${encodeURIComponent(message)}`;
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name: "Portfolio Email Page",
          name,
          email,
          subject: subject || `Message from ${name || email}`,
          message,
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Failed to send");
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const inputCls =
    "w-full rounded-md border-2 border-[var(--pencil-line)] bg-white px-4 py-3 font-mono text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--accent-contact)] focus:outline-none";

  if (status === "success") {
    return (
      <div className="sketch-card relative mx-auto max-w-xl p-10 text-center">
        <div className="sketch-tape" />
        <div className="font-caveat text-4xl text-[var(--accent-contact)]">Sent! ✉️</div>
        <p className="mt-4 text-[var(--ink-dim)]">
          Your message is on its way. Adarsh will get back to you soon.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="sketch-btn mt-8 bg-[var(--note-yellow)] text-sm"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="sketch-card relative mx-auto max-w-xl p-8 sm:p-10">
      <div className="sketch-tape" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-hand text-sm text-[var(--ink-dim)]">Your name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className="block">
          <span className="font-hand text-sm text-[var(--ink-dim)]">Your email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className={`mt-1 ${inputCls}`}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="font-hand text-sm text-[var(--ink-dim)]">Subject</span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Collaboration, internship, just saying hi…"
          className={`mt-1 ${inputCls}`}
        />
      </label>

      <label className="mt-4 block">
        <span className="font-hand text-sm text-[var(--ink-dim)]">Message</span>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell me about your project or idea…"
          className={`mt-1 resize-y ${inputCls}`}
        />
      </label>

      {status === "error" && (
        <p className="mt-4 rounded border-2 border-red-300 bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
          Couldn&apos;t send: {errorMsg} — try the direct address below.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="sketch-btn mt-6 w-full bg-[var(--note-yellow)] text-base disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send it ✈"}
      </button>

      <p className="mt-4 text-center font-mono text-xs text-[var(--ink-faint)]">
        or write directly:{" "}
        <a className="underline hover:text-[var(--accent-contact)]" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
      </p>
    </form>
  );
}
