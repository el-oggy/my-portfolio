"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { links } from "@/lib/data";

interface MailFormModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MailFormModal({ open, onClose }: MailFormModalProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const subject = encodeURIComponent(`Portfolio Contact from ${email || "visitor"}`);
      const body = encodeURIComponent(message);
      window.location.href = `mailto:${links.email}?subject=${subject}&body=${body}`;
      onClose();
    },
    [email, message, onClose],
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Send a message"
      ref={dialogRef}
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(26,25,23,0.6)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          width: "min(92vw, 480px)",
          background: "#fffdf7",
          border: "3px solid #1a1917",
          borderRadius: "2px",
          padding: "32px 28px",
          fontFamily: "'Geist Mono', ui-monospace, monospace",
          boxShadow: "8px 8px 0 rgba(26,25,23,0.2)",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "#78716c",
          }}
        >
          ✕
        </button>

        <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#1a1917" }}>
          ✉ Send a Transmission
        </h2>
        <p style={{ margin: "0 0 24px", fontSize: 12, color: "#78716c" }}>
          Your message will open in your default email client.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="mail-from" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44403c", marginBottom: 4 }}>
            YOUR EMAIL
          </label>
          <input
            id="mail-from"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: "100%",
              padding: "10px 12px",
              marginBottom: 18,
              border: "2px solid #d6d3d1",
              borderRadius: 2,
              fontSize: 14,
              fontFamily: "inherit",
              color: "#1a1917",
              background: "#fbf9f5",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <label htmlFor="mail-body" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44403c", marginBottom: 4 }}>
            MESSAGE
          </label>
          <textarea
            id="mail-body"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell me about your project..."
            style={{
              width: "100%",
              padding: "10px 12px",
              marginBottom: 22,
              border: "2px solid #d6d3d1",
              borderRadius: 2,
              fontSize: 14,
              fontFamily: "inherit",
              color: "#1a1917",
              background: "#fbf9f5",
              outline: "none",
              resize: "vertical" as const,
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px 0",
              background: "#c2410c",
              color: "#fffdf7",
              border: "none",
              borderRadius: 2,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              letterSpacing: 0.5,
            }}
          >
            ✉ SEND ➔
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
