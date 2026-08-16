import ExperienceRoot from "@/components/experience/ExperienceRoot";
import { SCENES } from "@/lib/sceneConfig";
import { identity, links, experience, education, skills, projects } from "@/lib/data";

/**
 * Main page. The semantic DOM scroll skeleton lives here — tall sections for
 * the master ScrollTrigger to measure a full 0..1 journey over. Each section's
 * copy is crawlable (§49) and screen-reader readable (§31). The 3D canvas
 * (mounted by ExperienceRoot behind this DOM) is the enhancement.
 *
 * The visible "Hello." intro is rendered by <IntroOverlay> (DOM, above the
 * canvas) so glyphs stay crisp/accessible; this page keeps a tall empty #top
 * section to preserve scroll length while the overlay reads.
 */
export default function Page() {
  return (
    <ExperienceRoot>
      <main id="top">
        {/* ─────────── Intro / First Boot ───────────
            Visual reveal is handled by IntroOverlay; this section holds the
            scroll real estate + an accessible sr-only identity block. */}
        <section
          className="ScrollSection"
          id="silicon-intro-here"
          aria-label="First Boot"
        >
          <h1 className="sr-only">{identity.name} — {identity.titleLine1} · {identity.titleLine2}</h1>
          <p className="sr-only">
            {identity.supportingLine}
          </p>
        </section>

        {/* Render one semantic section per non-intro scene. */}
        {SCENES.filter((s) => s.key !== "intro").map((s) => (
          <section
            key={s.key}
            id={s.anchor.replace("#", "")}
            className="ScrollSection"
            aria-label={s.label}
          >
            <div className="mx-auto max-w-3xl">
              <span className="tech-chip" style={{ color: `var(${s.accent})` }}>
                {s.label}
              </span>
              <SectionCopy scene={s.key} />
            </div>
          </section>
        ))}
      </main>
    </ExperienceRoot>
  );
}

/** Concise, accurate per-scene copy for the foundation skeleton. */
function SectionCopy({ scene }: { scene: string }) {
  switch (scene) {
    case "silicon":
      return (
        <>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-light tracking-tight">
            Silicon Hub
          </h2>
          <p className="mt-5 max-w-xl text-[var(--text-dim)]">
            The portfolio opens onto a stylized silicon die. From this central hub the
            visitor travels outward into each engineering region — RTL, ASIC physical
            design, timing, FPGA, embedded systems — then into the journey and contact.
          </p>
        </>
      );
    case "rtl":
      return (
        <>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-light tracking-tight">
            RTL Design
          </h2>
          <p className="mt-5 max-w-xl text-[var(--text-dim)]">
            Register-transfer-level design in Verilog. Featured work includes a fully
            pipelined 2D systolic array for INT8 matrix multiplication and Mealy/Moore
            sequence detectors.
          </p>
          <ul className="mt-6 space-y-2 font-[family-name:var(--font-mono)] text-sm text-[var(--text-dim)]">
            {projectsFor("rtl").map((p) => (
              <li key={p.id}>
                <span style={{ color: "var(--accent-rtl)" }}>▸</span> {p.title}{" "}
                <span className="text-[var(--text-faint)]">— {p.year}</span>
              </li>
            ))}
          </ul>
        </>
      );
    case "asic":
      return (
        <>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-light tracking-tight">
            ASIC · Physical Design
          </h2>
          <p className="mt-5 max-w-xl text-[var(--text-dim)]">
            Currently developing expertise in the RTL-to-GDSII physical design flow.
            The visualization stages the journey: floorplanning, placement, power
            planning, CTS, routing, timing, and GDSII.
          </p>
          <p className="mt-4 font-[family-name:var(--font-mono)] text-sm text-[var(--text-faint)]">
            Training / Exposure — not professional tapeout experience.
          </p>
        </>
      );
    case "timing":
      return (
        <>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-light tracking-tight">
            Timing · Static Timing Analysis
          </h2>
          <p className="mt-5 max-w-xl text-[var(--text-dim)]">
            A storytelling visualization of a timing path — launch register through
            combinational logic to the capture register — with clock, data path,
            arrival time, required time, and slack.
          </p>
        </>
      );
    case "fpga":
      return (
        <>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-light tracking-tight">
            FPGA
          </h2>
          <p className="mt-5 max-w-xl text-[var(--text-dim)]">
            Hardware-oriented FPGA work — logic fabric, routing, clock distribution.
            Including the Basys-3 up/down counter built during the PMEC VLSI intensive.
          </p>
        </>
      );
    case "systems":
      return (
        <>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-light tracking-tight">
            Embedded Systems
          </h2>
          <p className="mt-5 max-w-xl text-[var(--text-dim)]">
            STM32, ESP32, and IoT work — drone telemetry, weather station, home
            automation, ZMK keyboard firmware. Visually distinct from the VLSI world.
          </p>
        </>
      );
    case "journey":
      return (
        <>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-light tracking-tight">
            Journey
          </h2>
          <ol className="mt-6 space-y-5 border-l border-white/10 pl-6">
            {experience.map((e) => (
              <li key={e.id} className="relative">
                <span
                  className="absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full"
                  style={{
                    background:
                      e.kind === "Training / Exposure"
                        ? "var(--accent-timing)"
                        : "var(--accent-rtl)",
                  }}
                />
                <div className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-[var(--text-faint)]">
                  {e.period} · {e.kind}
                </div>
                <div className="mt-1 text-lg text-[var(--text)]">
                  {e.org} — <span className="text-[var(--text-dim)]">{e.title}</span>
                </div>
                <p className="mt-1 max-w-xl text-sm text-[var(--text-dim)]">
                  {e.summary}
                </p>
              </li>
            ))}
            {education.map((ed) => (
              <li key={ed.id} className="relative">
                <span className="absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full bg-white/40" />
                <div className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-[var(--text-faint)]">
                  Education · {ed.status}
                </div>
                <div className="mt-1 text-[var(--text)]">
                  {ed.degree}
                </div>
                <div className="text-sm text-[var(--text-dim)]">{ed.org} · {ed.period}</div>
              </li>
            ))}
          </ol>
        </>
      );
    case "contact":
      return (
        <>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-6xl font-light tracking-tight">
            Let&rsquo;s build something reliable.
          </h2>
          <div className="mt-8 space-y-3 font-[family-name:var(--font-mono)] text-sm">
            <ContactRow label="Email" href={`mailto:${links.email}`} value={links.email} />
            <ContactRow label="GitHub" href={links.github} value={links.github} />
            <ContactRow label="LinkedIn" href={links.linkedin} value="adarsh-swarup-maharana" />
            <ContactRow label="Résumé" href={links.resume} value="resume.pdf" />
          </div>
          <p className="mt-10 text-[var(--text-faint)]">{identity.location}</p>
        </>
      );
    default:
      return null;
  }
}

function ContactRow({ label, href, value }: { label: string; href: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="w-20 text-[var(--text-faint)]">{label}</span>
      <a href={href} className="text-[var(--text)] underline-offset-4 hover:underline">
        {value}
      </a>
    </div>
  );
}

function projectsFor(scene: string) {
  return projects.filter((p) => p.scene === scene);
}

void skills; // skills render lands in Phase 5; referenced to keep import used.
