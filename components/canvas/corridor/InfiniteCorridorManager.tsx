"use client";

import { useScene, RoomId } from "@/context/SceneContext";
import CorridorWalls from "./CorridorWalls";
import Door from "./Door";
import { Text } from "@react-three/drei";

export default function InfiniteCorridorManager() {
  const { enterRoom } = useScene();

  return (
    <group>
      {/* 3D Physical Corridor Walls & Ceilings */}
      <CorridorWalls zStart={25} length={190} />

      {/* Intro Hallway Overhead Sign */}
      <group position={[0, 4.0, 3]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.28}
          color="#1a1917"
          anchorX="center"
          anchorY="middle"
        >
          ✦ MAIN ENGINEERING CORRIDOR ✦
        </Text>
        <Text
          position={[0, -0.3, 0]}
          fontSize={0.16}
          color="#78716c"
          anchorX="center"
          anchorY="middle"
        >
          SCROLL TO WALK · CLICK ANY DOOR TO ENTER ROOM
        </Text>
      </group>

      {/* --- Corridor Doors --- */}

      {/* Door 01: PCB Hub */}
      <Door
        z={-18}
        side="left"
        number="01"
        label="CIRCUIT & PCB HUB"
        sublabel="KiCad · Power · Signal Integrity"
        accentColor="#c2410c"
        roomId="pcb"
        onEnter={enterRoom}
      />

      {/* Door 02: Embedded Systems */}
      <Door
        z={-32}
        side="right"
        number="02"
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
        label="IOT & TELEMETRY"
        sublabel="Sensors · Blynk · Solar Weather"
        accentColor="#16a34a"
        roomId="iot"
        onEnter={enterRoom}
      />

      {/* Door 04: Hexacopter Drone */}
      <Door
        z={-62}
        side="right"
        number="04"
        label="STM32 HEXACOPTER"
        sublabel="Flight Controller · IMU · GPS Telemetry"
        accentColor="#9333ea"
        roomId="drone"
        onEnter={enterRoom}
      />

      {/* Door 05: Firmware & Software */}
      <Door
        z={-78}
        side="left"
        number="05"
        label="FIRMWARE & RTOS"
        sublabel="Zephyr RTOS · ZMK · CI/CD"
        accentColor="#d97706"
        roomId="firmware"
        onEnter={enterRoom}
      />

      {/* Door 06: RTL & Systolic Array */}
      <Door
        z={-92}
        side="right"
        number="06"
        label="RTL · SYSTOLIC ARRAY"
        sublabel="Verilog · INT8 Matrix PE Compute"
        accentColor="#e11d48"
        roomId="rtl"
        onEnter={enterRoom}
      />

      {/* Door 07: Projects Gallery Gateway */}
      <Door
        z={-110}
        side="center"
        number="07"
        label="PROJECTS GALLERY"
        sublabel="All Hardware Builds · Schematics · Demos"
        accentColor="#2563eb"
        roomId="projects"
        onEnter={enterRoom}
      />

      {/* Door 08: Career & Journey */}
      <Door
        z={-126}
        side="center"
        number="08"
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
        label="CONTACT & TRANSMISSION"
        sublabel="Direct Inquiries · Résumé · Collaborations"
        accentColor="#ea580c"
        roomId="contact"
        onEnter={enterRoom}
      />
    </group>
  );
}
