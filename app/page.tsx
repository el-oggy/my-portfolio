import ExperienceRoot from "@/components/experience/ExperienceRoot";
import { SCENES } from "@/lib/sceneConfig";
import { identity, links, experience, education, skills, projects } from "@/lib/data";
import ProjectGallery from "@/components/ui/ProjectGallery";

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
          id="first-boot"
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
    case "pcb":
      return (
        <>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-light tracking-tight">
            Circuit Hub
          </h2>
          <p className="mt-5 max-w-xl text-[var(--text-dim)]">
            The portfolio opens onto a stylized printed circuit board. From this central
            hub the visitor travels outward into each engineering region — embedded
            microcontrollers, IoT and wireless, drones and robotics, firmware — then
            into the journey and contact.
          </p>
        </>
      );
    case "embedded":
      return (
        <>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-light tracking-tight">
            Embedded · Microcontrollers
          </h2>
          <p className="mt-5 max-w-xl text-[var(--text-dim)]">
            Working at the register level with STM32, ESP32, and Arduino — peripherals,
            interrupts, and the I2C / UART / SPI buses that connect sensors to silicon.
            The region is staged as a breadboard: MCU, display, and peripheral blocks
            linked by signal lines.
          </p>
          <ul className="mt-6 space-y-2 font-[family-name:var(--font-mono)] text-sm text-[var(--text-dim)]">
            <li>
              <span style={{ color: "var(--accent-embedded)" }}>▸</span> Embedded C/C++ ·
              GPIO / ADC / PWM <span className="text-[var(--text-faint)]">— Proficient</span>
            </li>
            <li>
              <span style={{ color: "var(--accent-embedded)" }}>▸</span> STM32 · ESP32 ·
              Arduino <span className="text-[var(--text-faint)]">— hands-on builds</span>
            </li>
          </ul>
        </>
      );
    case "iot":
      return (
        <>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-light tracking-tight">
            IoT · Sensors & Wireless
          </h2>
          <p className="mt-5 max-w-xl text-[var(--text-dim)]">
            Connected devices that sense the physical world and report it — solar-powered
            weather stations, relay-driven home automation over Blynk, and the sensor
            fusion that makes them useful.
          </p>
          <ul className="mt-6 space-y-2 font-[family-name:var(--font-mono)] text-sm text-[var(--text-dim)]">
            {projectsFor("iot").map((p) => (
              <li key={p.id}>
                <span style={{ color: "var(--accent-iot)" }}>▸</span> {p.title}{" "}
                <span className="text-[var(--text-faint)]">— {p.year}</span>
              </li>
            ))}
          </ul>
        </>
      );
    case "drone":
      return (
        <>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-light tracking-tight">
            Drone · Robotics
          </h2>
          <p className="mt-5 max-w-xl text-[var(--text-dim)]">
            The hero build of the embedded/IoT journey: a custom STM32-based
            hexacopter flight controller with a custom PCB, MPU6500 IMU, and
            GPS. A full hardware, firmware, and telemetry system, under active
            development. The full details are in the Projects gallery.
          </p>
          <p className="mt-4 font-[family-name:var(--font-mono)] text-sm text-[var(--text-faint)]">
            Corridor diorama · full details in the Projects gallery room.
          </p>
        </>
      );
    case "firmware":
      return (
        <>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-light tracking-tight">
            Firmware & Software
          </h2>
          <p className="mt-5 max-w-xl text-[var(--text-dim)]">
            The code side of the hardware world — ZMK keyboard firmware with a CI build
            pipeline, and an offline-first productivity dashboard in vanilla JavaScript.
          </p>
          <ul className="mt-6 space-y-2 font-[family-name:var(--font-mono)] text-sm text-[var(--text-dim)]">
            {projectsFor("firmware").map((p) => (
              <li key={p.id}>
                <span style={{ color: "var(--accent-firmware)" }}>▸</span> {p.title}{" "}
                <span className="text-[var(--text-faint)]">— {p.year}</span>
              </li>
            ))}
          </ul>
        </>
      );
    case "projects":
      return (
        <>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-light tracking-tight">
            Projects · Gallery
          </h2>
          <p className="mt-5 max-w-xl text-[var(--text-dim)]">
            The full body of work in one place — every build across embedded,
            IoT, robotics, firmware, and RTL. Click any card for the full story.
          </p>
          <ProjectGallery />
        </>
      );
    case "journey":
      return (
        <>
          <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-light tracking-tight">
            Journey
          </h2>
          <ol className="mt-6 space-y-5 border-l border-black/10 pl-6">
            {experience.map((e) => (
              <li key={e.id} className="relative">
                <span
                  className="absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full"
                  style={{
                    background:
                      e.kind === "Training / Exposure"
                        ? "var(--accent-iot)"
                        : "var(--accent-embedded)",
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
                <span className="absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full bg-black/10" />
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
            Let&rsquo;s build something connected.
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

const heroProject = projects.find((p) => p.hero) ?? projects[0];

void skills; // skills render lands in a later phase; referenced to keep import used.
