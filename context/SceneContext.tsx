"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export type RoomId = "gallery" | "studio" | "about" | "contact" | null;

export interface SceneContextType {
  hasEntered: boolean;
  currentRoom: RoomId;
  isInRoom: boolean;
  isTransitioning: boolean;
  transitionPhase: "closed" | "opening" | null;
  pendingRoom: RoomId;
  markEntered: () => void;
  enterRoom: (roomId: RoomId) => void;
  exitRoom: () => void;
  teleportTo: (roomId: RoomId) => void;
  commitTransition: () => void;
  completeTransition: () => void;
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
  const [pendingRoom, setPendingRoom] = useState<RoomId>(null);
  const [transitionPhase, setTransitionPhase] = useState<"closed" | "opening" | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const markEntered = useCallback(() => {
    setHasEntered(true);
  }, []);

  const enterRoom = useCallback((roomId: RoomId) => {
    setCurrentRoom(roomId);
    setPendingRoom(null);
    setTransitionPhase(null);
  }, []);

  const exitRoom = useCallback(() => {
    setPendingRoom(null);
    setTransitionPhase("closed");
  }, []);

  const teleportTo = useCallback((roomId: RoomId) => {
    if (roomId === currentRoom) return;
    setHasEntered(true);
    setPendingRoom(roomId);
    setTransitionPhase("closed");
  }, [currentRoom]);

  const commitTransition = useCallback(() => {
    setCurrentRoom(pendingRoom);
    setPendingRoom(null);
    setTransitionPhase("opening");
  }, [pendingRoom]);

  const completeTransition = useCallback(() => {
    setTransitionPhase(null);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      hasEntered,
      currentRoom,
      isInRoom: currentRoom !== null,
      isTransitioning: transitionPhase !== null,
      transitionPhase,
      pendingRoom,
      markEntered,
      enterRoom,
      exitRoom,
      teleportTo,
      commitTransition,
      completeTransition,
      soundEnabled,
      toggleSound,
    }),
    [hasEntered, currentRoom, transitionPhase, pendingRoom, soundEnabled, markEntered, enterRoom, exitRoom, teleportTo, commitTransition, completeTransition, toggleSound]
  );

  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
};

export default SceneContext;
