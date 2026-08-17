"use client";

class SoundEffects {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      this.preload("openDoor", "/sounds/otwarciedrzwi.mp3", 0.6);
      this.preload("hoverDoor", "/sounds/uchyleniedrzwi.mp3", 0.4);
      this.preload("closeDoor", "/sounds/zamknieciedrzwi.mp3", 0.5);
      this.preload("paper", "/sounds/papersound.mp3", 0.4);
    }
  }

  private preload(name: string, url: string, volume: number) {
    try {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.preload = "auto";
      this.sounds.set(name, audio);
    } catch {
      // Audio autoplay policy / SSR fallback
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public play(name: "openDoor" | "hoverDoor" | "closeDoor" | "paper") {
    if (!this.enabled) return;
    try {
      const audio = this.sounds.get(name);
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Ignore browser autoplay block before user interaction
        });
      }
    } catch {
      // Ignored
    }
  }
}

export const sfx = new SoundEffects();
