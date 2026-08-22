"use client";

type SoundName = "openDoor" | "hoverDoor" | "closeDoor" | "paper" | "achievement";

class SoundEffects {
  private enabled = true;
  private context: AudioContext | null = null;

  private getContext() {
    if (!this.context && typeof window !== "undefined") {
      const AudioContextConstructor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextConstructor) this.context = new AudioContextConstructor();
    }
    return this.context;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled() {
    return this.enabled;
  }

  public play(name: SoundName) {
    if (!this.enabled || typeof window === "undefined") return;
    const context = this.getContext();
    if (!context) return;
    void context.resume().catch(() => undefined);
    const now = context.currentTime;

    if (name === "paper") this.playNoise(context, now, 0.16, 1800, 0.1);
    else if (name === "achievement") {
      this.playTone(context, now, 440, 441, 0.16, "sine", 0.06);
      this.playTone(context, now + 0.13, 659, 660, 0.24, "sine", 0.05);
    } else if (name === "hoverDoor") this.playTone(context, now, 520, 540, 0.05, "triangle", 0.04);
    else if (name === "openDoor") this.playTone(context, now, 130, 240, 0.22, "sine", 0.09);
    else this.playTone(context, now, 210, 95, 0.2, "sine", 0.08);
  }

  private playTone(
    context: AudioContext,
    startTime: number,
    from: number,
    to: number,
    duration: number,
    type: OscillatorType,
    volume = 0.07,
  ) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, to), startTime + duration);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }

  private playNoise(
    context: AudioContext,
    startTime: number,
    duration: number,
    cutoff: number,
    volume: number,
  ) {
    const samples = Math.floor(context.sampleRate * duration);
    const buffer = context.createBuffer(1, samples, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < samples; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / samples) ** 2;
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = cutoff;
    filter.Q.value = 0.7;
    const gain = context.createGain();
    gain.gain.value = volume;
    source.connect(filter).connect(gain).connect(context.destination);
    source.start(startTime);
  }
}

export const sfx = new SoundEffects();
