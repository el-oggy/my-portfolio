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

export function createTransistorDoorTexture(accent: string) {
  return createTexture(256, 448, (context, width, height) => {
    context.fillStyle = "#fffdf7";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#1a1917";
    context.lineWidth = 9;
    context.strokeRect(10, 10, width - 20, height - 20);
    const cx = width / 2;
    const cy = height / 2;
    context.save();
    context.translate(cx, cy);
    context.strokeStyle = accent;
    context.lineWidth = 5;
    // Circle
    context.beginPath();
    context.arc(0, 0, 62, 0, Math.PI * 2);
    context.stroke();
    // Base line vertical
    context.beginPath();
    context.moveTo(-28, -48);
    context.lineTo(-28, 48);
    context.stroke();
    // Collector lead (top-right diagonal + up)
    context.beginPath();
    context.moveTo(-24, -20);
    context.lineTo(36, -44);
    context.lineTo(36, -72);
    context.stroke();
    // Emitter lead (bottom-right diagonal + arrowhead + down)
    context.beginPath();
    context.moveTo(-24, 20);
    context.lineTo(36, 44);
    context.lineTo(36, 72);
    context.stroke();
    // Arrow on emitter
    context.beginPath();
    context.moveTo(20, 32);
    context.lineTo(30, 40);
    context.lineTo(18, 42);
    context.closePath();
    context.fillStyle = accent;
    context.fill();
    // Base lead left
    context.beginPath();
    context.moveTo(-28, 0);
    context.lineTo(-68, 0);
    context.stroke();
    // Labels C, B, E
    context.font = "600 18px ui-sans-serif, system-ui, sans-serif";
    context.fillStyle = "#1a1917";
    context.textAlign = "center";
    context.fillText("C", 46, -80);
    context.fillText("B", -82, 4);
    context.fillText("E", 46, 86);
    context.restore();
    // Title text
    context.font = "700 22px ui-sans-serif, system-ui, sans-serif";
    context.textAlign = "center";
    context.fillStyle = "#1a1917";
    context.fillText("NPN", cx, 58);
    pencilNoise(context, width, height, 100, 0.06);
  });
}

export function createResCapDoorTexture(accent: string) {
  return createTexture(256, 448, (context, width, height) => {
    context.fillStyle = "#fffdf7";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#1a1917";
    context.lineWidth = 9;
    context.strokeRect(10, 10, width - 20, height - 20);
    const cx = width / 2;
    context.strokeStyle = accent;
    context.lineWidth = 5;

    // Resistor zigzag at upper half
    const ry = 140;
    context.beginPath();
    context.moveTo(40, ry);
    let rx = 40;
    for (let i = 0; i < 6; i++) {
      rx += 14;
      context.lineTo(rx, ry + (i % 2 === 0 ? -16 : 16));
      rx += 14;
      context.lineTo(rx, ry);
    }
    context.lineTo(216, ry);
    context.stroke();

    context.font = "600 15px ui-sans-serif, system-ui, sans-serif";
    context.textAlign = "center";
    context.fillStyle = "#1a1917";
    context.fillText("RESISTOR", cx, 178);

    // Polarized capacitor at lower half
    const cy = 280;
    context.beginPath();
    context.moveTo(70, cy - 26);
    context.lineTo(70, cy + 26);
    context.stroke();
    context.lineWidth = 8;
    context.beginPath();
    context.moveTo(96, cy - 26);
    context.lineTo(96, cy + 26);
    context.stroke();
    context.lineWidth = 5;
    // Leads
    context.beginPath();
    context.moveTo(40, cy);
    context.lineTo(70, cy);
    context.moveTo(96, cy);
    context.lineTo(126, cy);
    context.stroke();
    // Plus sign
    context.font = "700 20px ui-sans-serif, system-ui, sans-serif";
    context.fillStyle = accent;
    context.fillText("+", 56, cy - 34);
    context.fillStyle = "#1a1917";
    context.font = "600 15px ui-sans-serif, system-ui, sans-serif";
    context.fillText("CAPACITOR", cx, cy + 52);

    // Ground symbol at bottom
    const gy = 370;
    context.beginPath();
    context.moveTo(cx, gy);
    context.lineTo(cx, gy + 12);
    context.stroke();
    [16, 10, 4].forEach((halfW, i) => {
      const y = gy + 12 + i * 7;
      context.beginPath();
      context.moveTo(cx - halfW, y);
      context.lineTo(cx + halfW, y);
      context.stroke();
    });
    pencilNoise(context, width, height, 90, 0.06);
  });
}

export function createFrameQuoteTexture(title: string, body: string) {
  return createTexture(512, 384, (context, width, height) => {
    context.fillStyle = "#fbf9f5";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#1a1917";
    context.lineWidth = 3;
    context.strokeRect(6, 6, width - 12, height - 12);
    // Decorative corner marks
    [[14, 14], [width - 14, 14], [14, height - 14], [width - 14, height - 14]].forEach(([x, y]) => {
      context.beginPath();
      context.moveTo(x - 10, y);
      context.lineTo(x + 10, y);
      context.moveTo(x, y - 10);
      context.lineTo(x, y + 10);
      context.stroke();
    });
    // Title
    context.font = "700 20px ui-sans-serif, system-ui, sans-serif";
    context.textAlign = "center";
    context.fillStyle = "#c2410c";
    context.fillText(title.toUpperCase(), width / 2, 50);
    // Divider
    context.beginPath();
    context.moveTo(width / 4, 66);
    context.lineTo(width * 3 / 4, 66);
    context.stroke();
    // Body with word wrap
    context.font = "400 17px ui-sans-serif, system-ui, sans-serif";
    context.fillStyle = "#44403c";
    const words = body.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (context.measureText(testLine).width > width - 80 && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    const startY = 110;
    const lineHeight = 26;
    lines.slice(0, 8).forEach((line, i) => {
      context.fillText(line, width / 2, startY + i * lineHeight);
    });
    pencilNoise(context, width, height, 60, 0.03);
  });
}

export function createFrameVlsiTexture(type: string) {
  return createTexture(512, 384, (context, width, height) => {
    context.fillStyle = "#fbf9f5";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#1a1917";
    context.lineWidth = 3;
    context.strokeRect(6, 6, width - 12, height - 12);
    context.lineWidth = 3;
    const cx = width / 2;
    const cy = height / 2;

    switch (type) {
      case "nand": {
        context.font = "700 18px ui-sans-serif, system-ui, sans-serif";
        context.textAlign = "center";
        context.fillStyle = "#c2410c";
        context.fillText("NAND GATE", cx, 36);
        // Gate body (D shape)
        context.beginPath();
        context.moveTo(cx - 60, cy - 50);
        context.lineTo(cx - 10, cy - 50);
        context.arc(cx - 10, cy, 50, -Math.PI / 2, Math.PI / 2);
        context.lineTo(cx - 60, cy + 50);
        context.closePath();
        context.stroke();
        // Bubble
        context.beginPath();
        context.arc(cx + 50, cy, 10, 0, Math.PI * 2);
        context.stroke();
        // Inputs
        context.beginPath();
        context.moveTo(cx - 120, cy - 25); context.lineTo(cx - 60, cy - 25);
        context.moveTo(cx - 120, cy + 25); context.lineTo(cx - 60, cy + 25);
        // Output
        context.moveTo(cx + 60, cy); context.lineTo(cx + 130, cy);
        context.stroke();
        // Labels
        context.font = "500 14px ui-sans-serif, system-ui, sans-serif";
        context.fillStyle = "#1a1917";
        context.fillText("A", cx - 130, cy - 35);
        context.fillText("B", cx - 130, cy + 38);
        break;
      }
      case "xor": {
        context.font = "700 18px ui-sans-serif, system-ui, sans-serif";
        context.textAlign = "center";
        context.fillStyle = "#c2410c";
        context.fillText("XOR GATE", cx, 36);
        // Back curve
        context.beginPath();
        context.arc(cx - 75, cy, 50, -Math.PI / 3, Math.PI / 3);
        context.stroke();
        // Front curve
        context.beginPath();
        context.arc(cx - 60, cy, 50, -Math.PI / 3, Math.PI / 3);
        context.stroke();
        // Top and bottom lines to front arc
        context.beginPath();
        const fx = cx - 60;
        const fr = 50;
        const topY = cy - fr * Math.sin(Math.PI / 3);
        const botY = cy + fr * Math.sin(Math.PI / 3);
        const topX = fx + fr * Math.cos(Math.PI / 3);
        const botX = topX;
        context.moveTo(topX, topY); context.lineTo(cx - 100, cy - 25); context.lineTo(fx, cy - 25);
        context.moveTo(botX, botY); context.lineTo(cx - 100, cy + 25); context.lineTo(fx, cy + 25);
        context.moveTo(topX, topY);
        context.quadraticCurveTo(topX + 30, cy, topX, botY);
        context.stroke();
        // Output
        context.beginPath();
        context.moveTo(topX + 10, cy); context.lineTo(cx + 120, cy);
        context.stroke();
        break;
      }
      case "dff": {
        context.font = "700 18px ui-sans-serif, system-ui, sans-serif";
        context.textAlign = "center";
        context.fillStyle = "#c2410c";
        context.fillText("D FLIP-FLOP", cx, 36);
        // Rectangle
        context.strokeRect(cx - 50, cy - 55, 100, 110);
        // D input
        context.beginPath();
        context.moveTo(cx - 110, cy - 30); context.lineTo(cx - 50, cy - 30);
        context.stroke();
        context.fillText("D", cx - 65, cy - 35);
        // Clock input
        context.beginPath();
        context.moveTo(cx - 110, cy + 10);
        context.lineTo(cx - 62, cy + 10);
        context.lineTo(cx - 62, cy - 2);
        context.lineTo(cx - 50, cy + 10);
        context.stroke();
        // Q output
        context.beginPath();
        context.moveTo(cx + 50, cy - 10); context.lineTo(cx + 120, cy - 10);
        context.stroke();
        context.fillText("Q", cx + 65, cy - 20);
        // Q-bar output
        context.beginPath();
        context.moveTo(cx + 50, cy + 30); context.lineTo(cx + 120, cy + 30);
        context.stroke();
        context.fillText("Q\u0305", cx + 65, cy + 22);
        // CLK label
        context.fillText("CLK", cx - 85, cy + 28);
        break;
      }
      case "adder": {
        context.font = "700 18px ui-sans-serif, system-ui, sans-serif";
        context.textAlign = "center";
        context.fillStyle = "#c2410c";
        context.fillText("FULL ADDER", cx, 36);
        // Truth table
        const cols = ["A", "B", "Cin", "S", "Cout"];
        const rows = [
          ["0","0","0","0","0"],
          ["0","0","1","1","0"],
          ["0","1","0","1","0"],
          ["0","1","1","0","1"],
          ["1","0","0","1","0"],
          ["1","0","1","0","1"],
          ["1","1","0","0","1"],
          ["1","1","1","1","1"],
        ];
        context.font = "600 13px ui-monospace, monospace";
        const colW = 64;
        const startX = cx - colW * 2.5;
        const rowH = 24;
        const tableY = 70;
        cols.forEach((col, ci) => {
          context.fillStyle = "#1a1917";
          context.fillText(col, startX + ci * colW + colW / 2, tableY);
        });
        rows.forEach((row, ri) => {
          row.forEach((cell, ci) => {
            context.fillStyle = "#57534e";
            context.fillText(cell, startX + ci * colW + colW / 2, tableY + 24 + ri * rowH);
          });
        });
        // Table borders
        context.strokeStyle = "#d6d3d1";
        context.lineWidth = 1;
        for (let ri = 0; ri <= rows.length; ri++) {
          context.beginPath();
          context.moveTo(startX, tableY + 8 + ri * rowH);
          context.lineTo(startX + colW * 5, tableY + 8 + ri * rowH);
          context.stroke();
        }
        break;
      }
      case "mosfet": {
        context.font = "700 18px ui-sans-serif, system-ui, sans-serif";
        context.textAlign = "center";
        context.fillStyle = "#c2410c";
        context.fillText("NMOS CROSS-SECTION", cx, 36);
        // Substrate rectangle
        context.fillStyle = "#e7e5e4";
        context.fillRect(cx - 120, cy - 20, 240, 80);
        context.strokeStyle = "#1a1917";
        context.strokeRect(cx - 120, cy - 20, 240, 80);
        // N+ source/drain regions
        context.fillStyle = "#78716c";
        context.fillRect(cx - 115, cy + 20, 50, 35);
        context.fillRect(cx + 65, cy + 20, 50, 35);
        // Channel
        context.fillStyle = "#fbbf24";
        context.fillRect(cx - 45, cy + 18, 90, 6);
        // Gate oxide
        context.fillStyle = "#93c5fd";
        context.fillRect(cx - 50, cy - 5, 100, 8);
        // Gate poly
        context.fillStyle = "#1a1917";
        context.fillRect(cx - 45, cy - 20, 90, 15);
        // Labels
        context.font = "500 13px ui-sans-serif, system-ui, sans-serif";
        context.fillStyle = "#1a1917";
        context.fillText("G", cx, cy - 28);
        context.fillText("S", cx - 95, cy + 78);
        context.fillText("D", cx + 95, cy + 78);
        context.fillText("N+", cx - 92, cy + 44);
        context.fillText("N+", cx + 90, cy + 44);
        break;
      }
      case "clock": {
        context.font = "700 18px ui-sans-serif, system-ui, sans-serif";
        context.textAlign = "center";
        context.fillStyle = "#c2410c";
        context.fillText("CLOCK WAVEFORM", cx, 36);
        const baseY = cy + 30;
        const highY = cy - 40;
        const period = 80;
        const startX = 50;
        context.strokeStyle = "#1a1917";
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(startX, baseY);
        let px = startX;
        for (let cycle = 0; cycle < 5; cycle++) {
          px += period / 2;
          context.lineTo(px, baseY);
          context.lineTo(px, highY);
          px += period / 2;
          context.lineTo(px, highY);
          context.lineTo(px, baseY);
        }
        context.stroke();
        // Time axis
        context.lineWidth = 1;
        context.strokeStyle = "#78716c";
        context.beginPath();
        context.moveTo(startX - 10, baseY + 20);
        context.lineTo(px + 20, baseY + 20);
        context.stroke();
        // Period annotation
        context.strokeStyle = "#c2410c";
        context.setLineDash([4, 4]);
        context.beginPath();
        context.moveTo(startX + period, highY - 10);
        context.lineTo(startX + period * 2, highY - 10);
        context.stroke();
        context.setLineDash([]);
        context.fillStyle = "#c2410c";
        context.font = "500 14px ui-sans-serif, system-ui, sans-serif";
        context.fillText("T", startX + period * 1.5, highY - 18);
        break;
      }
      case "fsm": {
        context.font = "700 18px ui-sans-serif, system-ui, sans-serif";
        context.textAlign = "center";
        context.fillStyle = "#c2410c";
        context.fillText("FSM STATE DIAGRAM", cx, 36);
        const r = 36;
        // State S0 (top-left)
        const s0x = cx - 80;
        const s0y = cy;
        context.beginPath();
        context.arc(s0x, s0y, r, 0, Math.PI * 2);
        context.stroke();
        context.fillText("S0", s0x, s0y + 5);
        // State S1 (bottom-right)
        const s1x = cx + 80;
        const s1y = cy;
        context.beginPath();
        context.arc(s1x, s1y, r, 0, Math.PI * 2);
        context.stroke();
        context.fillText("S1", s1x, s1y + 5);
        // Arrow S0 -> S1
        context.beginPath();
        context.moveTo(s0x + r, s0y - 10);
        context.lineTo(s1x - r, s0y - 10);
        context.stroke();
        context.fillText("0/0", (s0x + s1x) / 2, s0y - 18);
        // Arrow S1 -> S0
        context.beginPath();
        context.moveTo(s1x - r, s1y + 10);
        context.lineTo(s0x + r, s1y + 10);
        context.stroke();
        context.fillText("1/1", (s0x + s1x) / 2, s1y + 26);
        // Initial arrow
        context.beginPath();
        context.moveTo(s0x - 80, s0y);
        context.lineTo(s0x - r, s0y);
        context.stroke();
        context.beginPath();
        context.arc(s0x - 85, s0y, 3, 0, Math.PI * 2);
        context.fillStyle = "#1a1917";
        context.fill();
        break;
      }
    }
    pencilNoise(context, width, height, 50, 0.02);
  });
}
