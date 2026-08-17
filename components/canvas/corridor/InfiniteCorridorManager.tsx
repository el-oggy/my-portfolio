"use client";

import { useScene } from "@/context/SceneContext";
import CorridorWalls from "./CorridorWalls";
import Door from "./Door";
import Avatar from "./Avatar";
import { Text } from "@react-three/drei";

export default function InfiniteCorridorManager() {
  const { enterRoom } = useScene();

  return (
    <group>
      {/* Authentic Hand-Drawn Physical Corridor Walls, Floor Planks & Ceiling */}
      <CorridorWalls zStart={25} length={190} />

      {/* Walking Doodle Avatar at Hallway Start */}
      <Avatar position={[0, 1.1, 2]} />

      {/* Welcome Hallway Overhead Title */}
      <group position={[0, 3.8, 3]}>
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.32}
          color="#1a1917"
          font="/fonts/CabinSketch-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          ✦ ENGINEERING CORRIDOR ✦
        </Text>
        <Text
          position={[0, -0.25, 0]}
          fontSize={0.2}
          color="#57534e"
          font="/fonts/CabinSketch-Regular.ttf"
          anchorX="center"
          anchorY="middle"
        >
          SCROLL TO GLIDE · TOUCH DOORS TO ENTER
        </Text>
      </group>

      {/* --- Authentic Hand-Drawn Corridor Doors --- */}

      {/* Door 01: PCB Hub */}
      <Door
        z={-18}
        side="left"
        number="01"
        doorType="projekty"
        label="CIRCUIT & PCB HUB"
        sublabel="KiCad · Power · Signal Integrity"
        accentColor="#059669"
        roomId="pcb"
        onEnter={enterRoom}
      />

      {/* Door 02: Embedded Systems */}
      <Door
        z={-32}
        side="right"
        number="02"
        doorType="about"
        label="EMBEDDED & SILICON"
        sublabel="STM32 · ESP32 · C/C++ Registers"
        accentColor="#0284c7"
        roomId="embedded"
        onEnter={enterRoom}
      />

      {/* Door 03: IoT & Telemetry */}
      <Door
        z={-48}
        side="left"
        number="03"
        doorType="kontakt"
        label="IOT & TELEMETRY"
        sublabel="Sensors · Blynk · Solar Weather"
        accentColor="#d97706"
        roomId="iot"
        onEnter={enterRoom}
      />

      {/* Door 04: Hexacopter Drone */}
      <Door
        z={-62}
        side="right"
        number="04"
        doorType="social"
        label="STM32 HEXACOPTER"
        sublabel="Flight Controller · IMU · Telemetry"
        accentColor="#2563eb"
        roomId="drone"
        onEnter={enterRoom}
      />

      {/* Door 05: Firmware & Software */}
      <Door
        z={-78}
        side="left"
        number="05"
        doorType="projekty"
        label="FIRMWARE & RTOS"
        sublabel="Zephyr RTOS · ZMK · CI/CD"
        accentColor="#7c3aed"
        roomId="firmware"
        onEnter={enterRoom}
      />

      {/* Door 06: RTL & Systolic Array */}
      <Door
        z={-92}
        side="right"
        number="06"
        doorType="about"
        label="RTL · SYSTOLIC ARRAY"
        sublabel="Verilog · INT8 Matrix PE Compute"
        accentColor="#ea580c"
        roomId="rtl"
        onEnter={enterRoom}
      />

      {/* Door 07: Projects Gallery Gateway */}
      <Door
        z={-110}
        side="center"
        number="07"
        doorType="projekty"
        label="PROJECTS GALLERY"
        sublabel="All Hardware Builds · Schematics"
        accentColor="#db2777"
        roomId="projects"
        onEnter={enterRoom}
      />

      {/* Door 08: Career & Journey */}
      <Door
        z={-126}
        side="center"
        number="08"
        doorType="social"
        label="ENGINEERING JOURNEY"
        sublabel="Experience · Education · Signal Path"
        accentColor="#059669"
        roomId="journey"
        onEnter={enterRoom}
      />

      {/* Door 09: Contact & Transmission */}
      <Door
        z={-142}
        side="center"
        number="09"
        doorType="kontakt"
        label="CONTACT & TRANSMISSION"
        sublabel="Direct Inquiries · Résumé PDF"
        accentColor="#0891b2"
        roomId="contact"
        onEnter={enterRoom}
      />
    </group>
  );
}
