"use client";

import { useEffect } from "react";
import EmailForm from "../email/EmailForm";
import { useScene } from "../itom/src/context/SceneContext";

/**
 * EmailOverlay — the contact form rendered INSIDE the portfolio experience.
 * Opens over the canvas (no route change, no reload, 3D state preserved).
 * Mount once inside ItomExperienceCore; toggle via useScene().openEmail().
 */
const EmailOverlay = () => {
    const { emailOpen, closeEmail } = useScene();

    // Escape closes; lock is already handled by webgl-active scroll lock
    useEffect(() => {
        if (!emailOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') closeEmail();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [emailOpen, closeEmail]);

    if (!emailOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[rgba(30,28,25,0.55)] px-4 py-8 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Email Adarsh"
            onClick={(e) => {
                if (e.target === e.currentTarget) closeEmail();
            }}
        >
            <div className="relative w-full max-w-2xl">
                {/* Close */}
                <button
                    type="button"
                    onClick={closeEmail}
                    aria-label="Close email form"
                    className="absolute -right-3 -top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border-4 border-[var(--ink)] bg-[var(--note-yellow)] text-xl font-bold text-[var(--ink)] shadow-md transition hover:rotate-90"
                >
                    ✕
                </button>

                {/* Header strip (form card carries its own paper styling) */}
                <div className="mb-[-14px] flex items-center justify-between px-6">
                    <span className="font-caveat text-2xl text-white drop-shadow">
                        ✉ quick signal
                    </span>
                </div>

                <EmailForm />

                <p className="mt-4 text-center font-mono text-xs text-white/80 drop-shadow">
                    Press Esc or ✕ to slide back into the corridor
                </p>
            </div>
        </div>
    );
};

export default EmailOverlay;
