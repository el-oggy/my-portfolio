"use client";

import * as THREE from "three";

type Draw = (context: CanvasRenderingContext2D, width: number, height: number) => void;

function createTexture(width: number, height: number, draw: Draw) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");
  draw(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(4, window.devicePixelRatio || 1);
  return texture;
}

function pencilNoise(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number,
  alpha = 0.05,
) {
  context.save();
  context.strokeStyle = "#57534e";
  context.globalAlpha = alpha;
  for (let index = 0; index < count; index += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const length = 3 + Math.random() * 12;
    const angle = (Math.random() - 0.5) * 0.7;
    context.lineWidth = Math.random() * 1.2 + 0.25;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    context.stroke();
  }
  context.restore();
}

export function createPaperTexture(repeatX = 4, repeatY = 2) {
  const texture = createTexture(512, 512, (context, width, height) => {
    context.fillStyle = "#fbf9f5";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(28, 27, 24, 0.06)";
    for (let y = 32; y < height; y += 42) {
      context.beginPath();
      context.moveTo(0, y);
      context.bezierCurveTo(width / 3, y - 3, (width * 2) / 3, y + 3, width, y);
      context.stroke();
    }
    pencilNoise(context, width, height, 180);
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return texture;
}

export function createWoodTexture(repeatX = 2, repeatY = 12) {
  const texture = createTexture(512, 512, (context, width, height) => {
    context.fillStyle = "#f8f4ec";
    context.fillRect(0, 0, width, height);
    for (let y = 0; y < height; y += 64) {
      context.fillStyle = y % 128 === 0 ? "#f3ead9" : "#efe5d2";
      context.fillRect(0, y, width, 60);
      context.strokeStyle = "rgba(68, 64, 60, 0.22)";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, y + 62);
      context.lineTo(width, y + 62);
      context.stroke();
    }
    pencilNoise(context, width, height, 90, 0.04);
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return texture;
}

export function createDoorTexture(accent: string, number: string, painted: boolean) {
  return createTexture(256, 448, (context, width, height) => {
    context.fillStyle = painted ? "#ffedd5" : "#fffdf7";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#1a1917";
    context.lineWidth = 9;
    context.strokeRect(10, 10, width - 20, height - 20);
    context.save();
    context.translate(width / 2, height / 2);
    context.rotate(-0.02);
    context.globalAlpha = painted ? 0.82 : 0.16;
    context.fillStyle = accent;
    context.fillRect(-74, -140, 148, 280);
    context.restore();
    context.lineWidth = 5;
    [96, 218].forEach((y) => context.strokeRect(38, y, width - 76, 72));
    context.beginPath();
    context.arc(width - 52, height / 2 + 14, 13, 0, Math.PI * 2);
    context.fillStyle = painted ? accent : "#78716c";
    context.fill();
    context.stroke();
    context.font = "700 46px ui-sans-serif, system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#1a1917";
    context.fillText(number, width / 2, 58);
    pencilNoise(context, width, height, painted ? 80 : 130, 0.08);
  });
}

export function createAvatarTexture(frame: number) {
  return createTexture(192, 256, (context, width, height) => {
    context.clearRect(0, 0, width, height);
    context.lineCap = "round";
    context.strokeStyle = "#1a1917";
    context.lineWidth = 8;
    context.beginPath();
    context.arc(width / 2, 62, 26, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(width / 2, 88);
    context.lineTo(width / 2, 166);
    context.stroke();
    const swing = Math.sin((frame / 9) * Math.PI * 2) * 24;
    context.beginPath();
    context.moveTo(width / 2, 108);
    context.lineTo(width / 2 - 32 + swing * 0.4, 138);
    context.moveTo(width / 2, 108);
    context.lineTo(width / 2 + 32 - swing * 0.4, 138);
    context.stroke();
    context.beginPath();
    context.moveTo(width / 2, 166);
    context.lineTo(width / 2 - 18 + swing, 232);
    context.moveTo(width / 2, 166);
    context.lineTo(width / 2 + 18 - swing, 232);
    context.stroke();
    context.strokeStyle = "#c2410c";
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(width / 2 - 15, 45);
    context.quadraticCurveTo(width / 2, 36, width / 2 + 15, 47);
    context.stroke();
  });
}

export function createCloudTexture() {
  return createTexture(256, 144, (context, width, height) => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(255, 255, 255, 0.88)";
    context.strokeStyle = "#1a1917";
    context.lineWidth = 4;
    [
      [72, 92, 38],
      [126, 70, 49],
      [184, 94, 36],
    ].forEach(([x, y, radius]) => {
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    });
    pencilNoise(context, width, height, 40, 0.03);
  });
}

export function createSwatchTexture(color: string, painted = false) {
  return createTexture(256, 256, (context, width, height) => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#fffdf7";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#1a1917";
    context.lineWidth = 7;
    context.strokeRect(8, 8, width - 16, height - 16);
    context.globalAlpha = painted ? 0.85 : 0.14;
    context.fillStyle = color;
    context.beginPath();
    context.ellipse(width / 2, height / 2, 84, 66, -0.1, 0, Math.PI * 2);
    context.fill();
  });
}
