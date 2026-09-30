import { brand, lifeline } from "../copy/content";
import type { LifelineData } from "./lifeline";

const W = 1600;
const H = 1000;
const BG = "#070706";
const CARD = "#16140F";
const CREAM = "#E8DCBA";
const CREAM_DIM = "rgba(232, 220, 186, 0.62)";
const GOLD = "#C4A35A";

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

function wrap(ctx: Ctx, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderLifelinePng(d: LifelineData): Promise<Blob | null> {
  try {
    await Promise.all([
      document.fonts.load('500 80px "Cormorant Garamond"'),
      document.fonts.load('italic 400 36px "Cormorant Garamond"'),
      document.fonts.load('500 20px "IBM Plex Sans"'),
      document.fonts.load('400 28px "IBM Plex Sans"'),
    ]);
  } catch {
    /* fall back to system fonts */
  }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d") as Ctx | null;
  if (!ctx) return null;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // Watermark rings.
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1;
  [300, 470, 660, 880].forEach((r, i) => {
    ctx.globalAlpha = 0.14 - i * 0.03;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  const cardW = 940;
  const cardX = (W - cardW) / 2;
  const pad = 76;
  const inner = cardW - pad * 2;

  const rows: [string, string, string, number][] = [
    [lifeline.fields.instance, d.society, '400 30px "IBM Plex Sans", sans-serif', 40],
    [lifeline.fields.birth, d.birth, '400 30px "IBM Plex Sans", sans-serif', 40],
    [lifeline.fields.functions, d.functions, '400 30px "IBM Plex Sans", sans-serif', 40],
    [lifeline.fields.stress, d.stresses, '400 30px "IBM Plex Sans", sans-serif', 40],
    [lifeline.fields.note, d.note, 'italic 400 40px "Cormorant Garamond", Georgia, serif', 48],
  ];

  // Measure first so the card fits its content.
  const laid = rows.map(([label, value, font, lh]) => {
    ctx.font = font;
    return { label, font, lh, lines: wrap(ctx, value, inner) };
  });
  const rowsHeight = laid.reduce((h, r) => h + 34 + r.lines.length * r.lh + 26, 0);
  const headerH = 250;
  const cardH = Math.min(H - 60, headerH + rowsHeight + pad - 10);
  const cardY = (H - cardH) / 2;

  ctx.fillStyle = CARD;
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  const x = cardX + pad;
  let y = cardY + pad + 14;
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = GOLD;
  ctx.font = '500 22px "IBM Plex Sans", sans-serif';
  ctx.letterSpacing = "7px";
  ctx.fillText(lifeline.kicker.toUpperCase(), x, y);

  // Fit the Actor name to the card.
  let size = 88;
  ctx.font = `500 ${size}px "Cormorant Garamond", Georgia, serif`;
  ctx.letterSpacing = "2px";
  while (ctx.measureText(d.name).width > inner && size > 36) {
    size -= 4;
    ctx.font = `500 ${size}px "Cormorant Garamond", Georgia, serif`;
  }
  y += 92;
  ctx.fillStyle = CREAM;
  ctx.fillText(d.name, x, y);

  y += 40;
  ctx.fillStyle = "rgba(232, 220, 186, 0.28)";
  ctx.fillRect(x, y, inner, 1);
  y += 58;

  for (const r of laid) {
    ctx.font = '500 18px "IBM Plex Sans", sans-serif';
    ctx.letterSpacing = "5px";
    ctx.fillStyle = GOLD;
    ctx.fillText(r.label.toUpperCase(), x, y);
    ctx.letterSpacing = "0px";
    ctx.font = r.font;
    ctx.fillStyle = CREAM;
    let ly = y + 40;
    for (const line of r.lines) {
      ctx.fillText(line, x, ly);
      ly += r.lh;
    }
    y = ly - r.lh + 26 + 34;
  }

  ctx.fillStyle = CREAM_DIM;
  ctx.font = '500 16px "IBM Plex Sans", sans-serif';
  ctx.letterSpacing = "5px";
  ctx.textAlign = "center";
  ctx.fillText(brand.footer.replace(/\s+/g, " ").toUpperCase(), W / 2, H - 20);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

export function pngFilename(name: string): string {
  const slug = name.trim().replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/^-+|-+$/g, "");
  return `lifeline-${slug || "actor"}.png`;
}
