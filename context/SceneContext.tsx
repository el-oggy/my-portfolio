"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export type RoomId = 
  | "pcb"
  | "embedded"
  | "iot"
  | "drone"
  | "firmware"
  | "rtl"
  | "projects"
  | "journey"
  | "contact"
  | null;

export interface SceneContextType {
  hasEntered: boolean;
  currentRoom: RoomId;
  isInRoom: boolean;
  isTeleporting: boolean;
  markEntered: () => void;
  enterRoom: (roomId: RoomId) => void;
  exitRoom: () => void;
  teleportTo: (roomId: RoomId) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const SceneContext = createContext<SceneContextType | null>(null);

export const useScene = () => {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error("useScene must be used within a SceneProvider");
  }
  return context;
};

export const SceneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasEntered, setHasEntered] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomId>(null);
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const markEntered = useCallback(() => {
    setHasEntered(true);
  }, []);

  const enterRoom = useCallback((roomId: RoomId) => {
    setCurrentRoom(roomId);
    setIsTeleporting(false);
  }, []);

  const exitRoom = useCallback(() => {
    setCurrentRoom(null);
    setIsTeleporting(false);
  }, []);

  const teleportTo = useCallback((roomId: RoomId) => {
    if (!roomId) {
      exitRoom();
      return;
    }
    setHasEntered(true);
    setCurrentRoom(roomId);
  }, [exitRoom]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      hasEntered,
      currentRoom,
      isInRoom: currentRoom !== null,
      isTeleporting,
      markEntered,
      enterRoom,
      exitRoom,
      teleportTo,
      soundEnabled,
      toggleSound,
    }),
    [hasEntered, currentRoom, isTeleporting, soundEnabled, markEntered, enterRoom, exitRoom, teleportTo, toggleSound]
  );

  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
};

export default SceneContext;
