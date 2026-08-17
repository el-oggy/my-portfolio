"use client";

import { useScene, RoomId } from "@/context/SceneContext";
import { identity, links, experience, education, projects } from "@/lib/data";
import ProjectGallery from "./ProjectGallery";

export default function RoomOverlay() {
  const { currentRoom, exitRoom } = useScene();

  if (!currentRoom) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg-paper)]/95 backdrop-blur-md transition-all duration-500 animate-in fade-in zoom-in-95">
      {/* Top Header / Back Bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b-2 border-[var(--pencil-line)] bg-[var(--bg-paper-warm)]/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={exitRoom}
            className="sketch-btn py-1.5 px-4 text-sm font-bold flex items-center gap-2 hover:bg-[var(--note-yellow)]"
          >
            <span>←</span>
            <span>BACK TO CORRIDOR</span>
          </button>
          <span className="text-xs font-mono text-[var(--ink-faint)] hidden sm:inline">
            [ESC OR CLICK BACK]
          </span>
        </div>

        <div className="font-caveat text-xl sm:text-2xl text-[var(--ink)] font-bold">
          {getRoomTitle(currentRoom)}
        </div>
      </header>

      {/* Room Content Container */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <RoomContent room={currentRoom} />
      </main>
    </div>
  );
}

function getRoomTitle(room: RoomId) {
  switch (room) {
    case "pcb":
      return "01 / Circuit Hub & PCB Design";
    case "embedded":
      return "02 / Embedded & Microcontrollers";
    case "iot":
      return "03 / IoT & Sensor Telemetry";
    case "drone":
      return "04 / STM32 Hexacopter Flight Controller";
    case "firmware":
      return "05 / Firmware & RTOS Engineering";
    case "rtl":
      return "06 / RTL & Systolic Array Accelerator";
    case "projects":
      return "07 / Interactive Projects Gallery";
    case "journey":
      return "08 / Engineering Journey & Timeline";
    case "contact":
      return "09 / Transmission & Inquiries";
    default:
      return "Room";
  }
}

function RoomContent({ room }: { room: RoomId }) {
  switch (room) {
    case "pcb":
      return (
        <div className="sketch-card p-8 sm:p-12 relative">
          <div className="sketch-tape" />
          <div className="font-caveat text-3xl text-[var(--accent-pcb)] mb-2">
            ✦ Hardware Hub ✦
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--ink)] tracking-tight">
            Circuit & PCB Design
          </h2>
          <p className="mt-4 text-lg text-[var(--ink-dim)] leading-relaxed">
            Every hardware build begins at the schematic. Designing custom printed circuit boards in KiCad, 
            routing high-speed differential signal traces, and integrating low-noise power delivery networks for microcontrollers and sensors.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--bg-paper-warm)] border-2 border-[var(--pencil-line)] rounded-lg">
              <div className="font-bold text-base text-[var(--ink)]">Schematic Capture & EDA</div>
              <p className="text-sm text-[var(--ink-dim)] mt-1">KiCad 8.0, component footprint validation, DRC rules, custom symbol libraries.</p>
            </div>
            <div className="p-4 bg-[var(--bg-paper-warm)] border-2 border-[var(--pencil-line)] rounded-lg">
              <div className="font-bold text-base text-[var(--ink)]">Signal & Power Integrity</div>
              <p className="text-sm text-[var(--ink-dim)] mt-1">Ground plane partitioning, decoupling capacitor placement, low-dropout regulation.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="sketch-tag">KiCad PCB</span>
            <span className="sketch-tag">SMD Soldering</span>
            <span className="sketch-tag">4-Layer Routing</span>
            <span className="sketch-tag">Power Distribution</span>
          </div>
        </div>
      );

    case "embedded":
      return (
        <div className="sketch-card p-8 sm:p-12 relative">
          <div className="sketch-tape" />
          <div className="font-caveat text-3xl text-[var(--accent-embedded)] mb-2">
            ✦ Register-Level Engineering ✦
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--ink)] tracking-tight">
            Embedded & Microcontrollers
          </h2>
          <p className="mt-4 text-lg text-[var(--ink-dim)] leading-relaxed">
            Working close to the metal with STM32 (ARM Cortex-M), ESP32 (Xtensa), and AVR. Writing bare-metal C/C++, 
            configuring nested vectored interrupt controllers (NVIC), direct memory access (DMA), and low-latency peripherals.
          </p>

          <div className="mt-8 space-y-3 font-mono text-sm">
            <div className="p-3 bg-[var(--bg-paper-warm)] border border-[var(--pencil-line)] rounded flex justify-between">
              <span>▸ STM32 HAL / LL & Bare-Metal C</span>
              <span className="text-xs text-[var(--accent-embedded)] font-bold">ARM Cortex-M4</span>
            </div>
            <div className="p-3 bg-[var(--bg-paper-warm)] border border-[var(--pencil-line)] rounded flex justify-between">
              <span>▸ Communication Buses: UART · SPI · I2C</span>
              <span className="text-xs text-[var(--accent-embedded)] font-bold">DMA Driven</span>
            </div>
            <div className="p-3 bg-[var(--bg-paper-warm)] border border-[var(--pencil-line)] rounded flex justify-between">
              <span>▸ Timers, ADC Sampling & PWM Modulation</span>
              <span className="text-xs text-[var(--accent-embedded)] font-bold">Hardware Accurate</span>
            </div>
          </div>
        </div>
      );

    case "iot":
      return (
        <div className="sketch-card p-8 sm:p-12 relative">
          <div className="sketch-tape" />
          <div className="font-caveat text-3xl text-[var(--accent-iot)] mb-2">
            ✦ Wireless Sensor Nodes ✦
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--ink)] tracking-tight">
            IoT & Telemetry Systems
          </h2>
          <p className="mt-4 text-lg text-[var(--ink-dim)] leading-relaxed">
            Building autonomous connected hardware stations that measure environmental parameters, manage power dynamically, 
            and transmit telemetry over Wi-Fi/cellular networks to cloud dashboards.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--bg-paper-warm)] border-2 border-[var(--pencil-line)] rounded-lg">
              <div className="font-bold text-[var(--ink)]">Solar-Powered Weather Node</div>
              <p className="text-sm text-[var(--ink-dim)] mt-1">BME280 (Pressure/Temp/Humidity), BH1750 (Lux), DS18B20 soil sensor, deep-sleep power cycling.</p>
            </div>
            <div className="p-4 bg-[var(--bg-paper-warm)] border-2 border-[var(--pencil-line)] rounded-lg">
              <div className="font-bold text-[var(--ink)]">Home Automation Hub</div>
              <p className="text-sm text-[var(--ink-dim)] mt-1">ESP32 relay controller, Blynk IoT cloud telemetry, automated smart staircase illumination.</p>
            </div>
          </div>
        </div>
      );

    case "drone":
      return (
        <div className="sketch-card p-8 sm:p-12 relative bg-[#fffdfa]">
          <div className="sketch-tape" />
          <div className="absolute -top-3 -right-3 sticky-note text-xs py-1 px-4 hidden sm:block">
            ★ Hero Hardware Build
          </div>
          <div className="font-caveat text-3xl text-[var(--accent-drone)] mb-2">
            ✦ Robotics & Flight Dynamics ✦
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--ink)] tracking-tight">
            STM32 Hexacopter
          </h2>
          <p className="mt-4 text-lg text-[var(--ink-dim)] leading-relaxed">
            A custom six-rotor aerial robotics flight controller built from scratch. Powered by an STM32 MCU on a custom PCB, 
            featuring 6-axis MPU6500 IMU sensor fusion, GPS UART telemetry, and a custom ground control web dashboard.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 bg-[var(--bg-paper-warm)] border border-[var(--pencil-line)] rounded text-center">
              <div className="font-bold text-[var(--accent-drone)]">6x ESCs</div>
              <div className="text-[var(--ink-dim)] mt-0.5">PWM 400Hz</div>
            </div>
            <div className="p-3 bg-[var(--bg-paper-warm)] border border-[var(--pencil-line)] rounded text-center">
              <div className="font-bold text-[var(--accent-drone)]">MPU6500</div>
              <div className="text-[var(--ink-dim)] mt-0.5">SPI @ 1MHz</div>
            </div>
            <div className="p-3 bg-[var(--bg-paper-warm)] border border-[var(--pencil-line)] rounded text-center">
              <div className="font-bold text-[var(--accent-drone)]">GPS Telemetry</div>
              <div className="text-[var(--ink-dim)] mt-0.5">NMEA UART</div>
            </div>
          </div>
        </div>
      );

    case "firmware":
      return (
        <div className="sketch-card p-8 sm:p-12 relative">
          <div className="sketch-tape" />
          <div className="font-caveat text-3xl text-[var(--accent-firmware)] mb-2">
            ✦ Software for Hardware ✦
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--ink)] tracking-tight">
            Firmware & RTOS Engineering
          </h2>
          <p className="mt-4 text-lg text-[var(--ink-dim)] leading-relaxed">
            Writing maintainable embedded software. Zephyr RTOS-based ZMK custom keyboard firmware with GitHub Actions CI/CD automated builds, 
            plus modular client applications using modern vanilla JavaScript and IndexedDB.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="sketch-tag">Zephyr RTOS</span>
            <span className="sketch-tag">ZMK Firmware</span>
            <span className="sketch-tag">GitHub Actions CI</span>
            <span className="sketch-tag">ES6 Vanilla JS</span>
          </div>
        </div>
      );

    case "rtl":
      return (
        <div className="sketch-card p-8 sm:p-12 relative">
          <div className="sketch-tape" />
          <div className="font-caveat text-3xl text-[var(--accent-rtl)] mb-2">
            ✦ Digital Logic & Compute ✦
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--ink)] tracking-tight">
            RTL · Systolic Array Accelerator
          </h2>
          <p className="mt-4 text-lg text-[var(--ink-dim)] leading-relaxed">
            Hardware acceleration: a 2D systolic processing array for INT8 matrix multiplication implemented in Verilog HDL. 
            Exploring pipelined parallel compute architectures for neural acceleration and DSP.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="sketch-tag">Verilog HDL</span>
            <span className="sketch-tag">Systolic PE Grid</span>
            <span className="sketch-tag">INT8 Matrix Math</span>
            <span className="sketch-tag">ModelSim Simulation</span>
          </div>
        </div>
      );

    case "projects":
      return (
        <div>
          <div className="text-center mb-8">
            <div className="font-caveat text-3xl text-[var(--accent-projects)]">
              ✦ Selected Works & Hardware Builds ✦
            </div>
            <h2 className="text-4xl sm:text-6xl font-extrabold text-[var(--ink)] tracking-tight mt-2">
              Projects Gallery
            </h2>
            <p className="mt-3 text-base text-[var(--ink-dim)] max-w-xl mx-auto">
              Click any project card to inspect the full schematic breakdown, architecture diagrams, and hardware specifications.
            </p>
          </div>
          <ProjectGallery />
        </div>
      );

    case "journey":
      return (
        <div className="sketch-card p-8 sm:p-12 relative">
          <div className="sketch-tape" />
          <div className="font-caveat text-3xl text-[var(--accent-timeline)] mb-2">
            ✦ Timeline & Education ✦
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--ink)] tracking-tight">
            Professional Journey
          </h2>

          <div className="mt-8 space-y-6">
            {experience.map((e) => (
              <div key={e.id} className="p-4 bg-[var(--bg-paper-warm)] border-2 border-[var(--pencil-line)] rounded-lg">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--pencil-line)]/20 pb-2 mb-2">
                  <span className="font-bold text-lg text-[var(--ink)]">{e.title}</span>
                  <span className="font-mono text-xs bg-white px-2 py-0.5 border border-[var(--pencil-line)] rounded">
                    {e.period}
                  </span>
                </div>
                <div className="font-caveat text-xl text-[var(--accent-embedded)] font-semibold">
                  {e.org} · <span className="font-mono text-xs text-[var(--ink-faint)] font-normal">{e.kind}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--ink-dim)] leading-relaxed">{e.summary}</p>
              </div>
            ))}

            <div className="pt-6 border-t-2 border-dashed border-[var(--pencil-line)]/30">
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
            ✦ Let&apos;s build something together! ✦
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold text-[var(--ink)] tracking-tight">
            Get In Touch
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--ink-dim)] max-w-md mx-auto">
            Open for embedded systems, IoT hardware design, and robotics engineering collaborations.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={`mailto:${links.email}`}
              className="sketch-btn bg-[var(--note-yellow)] text-sm"
            >
              ✉ {links.email}
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
