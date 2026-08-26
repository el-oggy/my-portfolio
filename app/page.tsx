import ExperienceRoot from "@/components/experience/ExperienceRoot";
import { SCENES } from "@/lib/sceneConfig";
import { identity, links, experience, education, skills } from "@/lib/data";
import ProjectGallery from "@/components/ui/ProjectGallery";

export default function Page() {
  return (
    <ExperienceRoot>
      <main id="top">
        {/* First Boot Hero Space */}
        <section
          className="ScrollSection flex items-center justify-center"
          id="first-boot"
          aria-label="First Boot"
        >
          <h1 className="sr-only">
            {identity.name} — {identity.titleLine1} · {identity.titleLine2}
          </h1>
          <p className="sr-only">{identity.supportingLine}</p>
        </section>

        {/* Semantic Handcrafted Sections */}
        {SCENES.filter((s) => s.key !== "intro").map((s) => (
          <section
            key={s.key}
            id={s.anchor.replace("#", "")}
            className="ScrollSection flex flex-col justify-center"
            aria-label={s.label}
          >
            <div className="mx-auto max-w-3xl w-full">
              <div className="flex items-center gap-3 mb-2 font-hand text-sm text-[var(--ink-faint)]">
                <span>✦</span>
                <span>{s.label}</span>
                <span className="h-px flex-1 bg-[var(--pencil-line)]/15" />
              </div>
              <SectionCopy scene={s.key} />
            </div>
          </section>
        ))}
      </main>
    </ExperienceRoot>
  );
}

function SectionCopy({ scene }: { scene: string }) {
  switch (scene) {
    case "pcb":
      return (
        <div className="sketch-card p-8 sm:p-10 relative">
          <div className="sketch-tape" />
          <div className="font-caveat text-2xl text-[var(--accent-pcb)] mb-1">
            01 / Hardware Hub ↴
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--ink)]">
            Circuit & PCB Design
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--ink-dim)] leading-relaxed">
            Every build starts on the schematic. Designing custom printed circuit boards in KiCad, 
            routing high-speed signal traces, and integrating power regulation for embedded systems.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="sketch-tag">KiCad PCB</span>
            <span className="sketch-tag">Schematic Capture</span>
            <span className="sketch-tag">Power Management</span>
            <span className="sketch-tag">Signal Integrity</span>
          </div>
        </div>
      );

    case "embedded":
      return (
        <div className="sketch-card p-8 sm:p-10 relative">
          <div className="sketch-tape" />
          <div className="font-caveat text-2xl text-[var(--accent-embedded)] mb-1">
            02 / Silicon ↴
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--ink)]">
            Embedded & Microcontrollers
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--ink-dim)] leading-relaxed">
            Working at the register level with STM32, ESP32, and Arduino — writing bare-metal C/C++, 
            managing interrupts, and driving I2C, SPI, and UART communication buses.
          </p>
          <ul className="mt-6 space-y-3 font-mono text-sm text-[var(--ink-dim)]">
            <li className="flex items-center gap-2">
              <span className="font-hand text-base text-[var(--accent-embedded)]">▸</span>
              <span>STM32 & ESP32 Microcontrollers</span>
              <span className="text-xs bg-[var(--bg-paper-warm)] px-2 py-0.5 border border-[var(--pencil-line)]/30 rounded font-hand">Hands-on</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-hand text-base text-[var(--accent-embedded)]">▸</span>
              <span>Embedded C/C++ · GPIO / ADC / PWM / Timers</span>
              <span className="text-xs bg-[var(--bg-paper-warm)] px-2 py-0.5 border border-[var(--pencil-line)]/30 rounded font-hand">Proficient</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-hand text-base text-[var(--accent-embedded)]">▸</span>
              <span>Bus Protocols: UART · I2C · SPI</span>
            </li>
          </ul>
        </div>
      );

    case "iot":
      return (
        <div className="sketch-card p-8 sm:p-10 relative">
          <div className="sketch-tape" />
          <div className="font-caveat text-2xl text-[var(--accent-iot)] mb-1">
            03 / Wireless Telemetry ↴
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--ink)]">
            IoT & Sensor Fusion
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--ink-dim)] leading-relaxed">
            Building autonomous connected systems that sense environmental parameters and transmit telemetry 
            over wireless networks. Solar-powered stations, sensor calibration, and cloud dashboards.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 bg-[var(--bg-paper-warm)] border border-[var(--pencil-line)] rounded">
              <div className="font-bold text-[var(--ink)]">Solar Weather Station</div>
              <div className="text-[var(--ink-faint)] mt-1">BME280 · BH1750 · DS18B20 · ESP32</div>
            </div>
            <div className="p-3 bg-[var(--bg-paper-warm)] border border-[var(--pencil-line)] rounded">
              <div className="font-bold text-[var(--ink)]">Home Automation</div>
              <div className="text-[var(--ink-faint)] mt-1">Blynk IoT · Relays · Smart Staircase</div>
            </div>
          </div>
        </div>
      );

    case "drone":
      return (
        <div className="sketch-card p-8 sm:p-10 relative bg-[#fffdfa]">
          <div className="sketch-tape" />
          <div className="absolute -top-3 -right-3 sticky-note text-xs py-1 px-3 hidden sm:block">
            ★ Hero Hardware Build
          </div>
          <div className="font-caveat text-2xl text-[var(--accent-drone)] mb-1">
            04 / Robotics ↴
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--ink)]">
            STM32 Hexacopter
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--ink-dim)] leading-relaxed">
            A complete six-rotor flight controller designed from scratch around an STM32 MCU. Features a custom 
            KiCad PCB, MPU6500 6-axis IMU, GPS telemetry, and a custom browser ground station.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="sketch-tag">STM32 MCU</span>
            <span className="sketch-tag">Custom PCB</span>
            <span className="sketch-tag">MPU6500 IMU</span>
            <span className="sketch-tag">GPS UART</span>
            <span className="sketch-tag">Embedded C++</span>
          </div>
        </div>
      );

    case "firmware":
      return (
        <div className="sketch-card p-8 sm:p-10 relative">
          <div className="sketch-tape" />
          <div className="font-caveat text-2xl text-[var(--accent-firmware)] mb-1">
            05 / Code & Automation ↴
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--ink)]">
            Firmware & Software
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--ink-dim)] leading-relaxed">
            Writing reliable software for hardware — Zephyr RTOS-based ZMK custom keyboard firmware with 
            continuous integration pipelines, plus modular vanilla JavaScript applications.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="sketch-tag">ZMK Firmware</span>
            <span className="sketch-tag">Zephyr RTOS</span>
            <span className="sketch-tag">GitHub Actions CI</span>
            <span className="sketch-tag">Vanilla JS (ES6)</span>
            <span className="sketch-tag">IndexedDB</span>
          </div>
        </div>
      );

    case "rtl":
      return (
        <div className="sketch-card p-8 sm:p-10 relative">
          <div className="sketch-tape" />
          <div className="font-caveat text-2xl text-[var(--accent-rtl)] mb-1">
            06 / Digital Architecture ↴
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--ink)]">
            RTL · Systolic Array
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--ink-dim)] leading-relaxed">
            Hardware acceleration: a 2D systolic array for INT8 matrix multiplication implemented in Verilog. 
            Exploring parallel computing architectures for neural compute and high-throughput DSP.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="sketch-tag">Verilog HDL</span>
            <span className="sketch-tag">INT8 Matrix Multiply</span>
            <span className="sketch-tag">Systolic PE Array</span>
            <span className="sketch-tag">Digital Logic</span>
          </div>
        </div>
      );

    case "projects":
      return (
        <div className="w-full">
          <div className="text-center mb-6">
            <div className="font-caveat text-3xl text-[var(--accent-projects)]">
              ✦ Selected Works & Hardware Builds ✦
            </div>
            <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[var(--ink)] mt-2">
              Projects Gallery
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[var(--ink-dim)] max-w-xl mx-auto">
              Hover over cards to reveal them, and click any project to open the full technical breakdown.
            </p>
          </div>
          <ProjectGallery />
        </div>
      );

    case "journey":
      return (
        <div className="sketch-card p-8 sm:p-12 relative">
          <div className="sketch-tape" />
          <div className="font-caveat text-3xl text-[var(--accent-timeline)] mb-1">
            Timeline & Experience ↴
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--ink)]">
            Professional Journey
          </h2>
          
          <div className="mt-8 space-y-6">
            {experience.map((e) => (
              <div key={e.id} className="p-4 bg-[var(--bg-paper-warm)] border-2 border-[var(--pencil-line)] rounded-lg relative">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--pencil-line)]/20 pb-2 mb-2">
                  <span className="font-bold text-lg text-[var(--ink)]">{e.title}</span>
                  <span className="font-mono text-xs bg-white px-2 py-0.5 border border-[var(--pencil-line)] rounded">
                    {e.period}
                  </span>
                </div>
                <div className="font-caveat text-xl text-[var(--accent-embedded)] font-semibold">
                  {e.org} · <span className="font-mono text-xs text-[var(--ink-faint)] font-normal">{e.kind}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--ink-dim)] leading-relaxed">
                  {e.summary}
                </p>
              </div>
            ))}

            <div className="pt-4 border-t-2 border-dashed border-[var(--pencil-line)]/30">
              <div className="font-hand text-sm text-[var(--ink-faint)] mb-4">🎓 Academic Background</div>
              {education.map((ed) => (
                <div key={ed.id} className="mb-3 p-3 bg-white border border-[var(--pencil-line)] rounded flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm text-[var(--ink)]">{ed.degree}</div>
                    <div className="text-xs text-[var(--ink-dim)]">{ed.org}</div>
                  </div>
                  <span className="font-mono text-xs text-[var(--ink-faint)]">{ed.period}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "contact":
      return (
        <div className="sketch-card p-8 sm:p-12 relative text-center">
          <div className="sketch-tape" />
          <div className="font-caveat text-3xl text-[var(--accent-contact)] mb-2">
            Let&apos;s build something together! ✦
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--ink)]">
            Get In Touch
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--ink-dim)] max-w-md mx-auto">
            Open for embedded systems, IoT hardware design, and robotics engineering collaborations.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="/email"
              className="sketch-btn bg-[var(--note-yellow)] text-sm"
            >
              ✉ Email me
            </a>
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="sketch-btn text-sm"
            >
              GitHub ↗
            </a>
            <a
              href={links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="sketch-btn text-sm"
            >
              LinkedIn ↗
            </a>
            <a
              href={links.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="sketch-btn text-sm"
            >
              Résumé PDF ↗
            </a>
          </div>

          <div className="mt-8 font-mono text-xs text-[var(--ink-faint)]">
            📍 {identity.location}
          </div>
        </div>
      );

    default:
      return null;
  }
}

void skills;
