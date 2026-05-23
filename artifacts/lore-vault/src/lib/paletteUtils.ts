import type { CustomPalette } from "./vault-types";

/* ── Hex helpers ─────────────────────────────────────────────── */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").padEnd(6, "0");
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r,g,b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2,"0")).join("");
}

export function lightenHex(hex: string, amount: number): string {
  const [r,g,b] = hexToRgb(hex);
  return rgbToHex(r + (255-r)*amount, g + (255-g)*amount, b + (255-b)*amount);
}

export function darkenHex(hex: string, amount: number): string {
  const [r,g,b] = hexToRgb(hex);
  return rgbToHex(r*(1-amount), g*(1-amount), b*(1-amount));
}

/** Blend two hex colors: t=0 → hex1, t=1 → hex2 */
export function blendHex(hex1: string, hex2: string, t: number): string {
  const [r1,g1,b1] = hexToRgb(hex1);
  const [r2,g2,b2] = hexToRgb(hex2);
  return rgbToHex(r1*(1-t)+r2*t, g1*(1-t)+g2*t, b1*(1-t)+b2*t);
}

/* ── Auto-derivation for optional palette fields ─────────────── */
export function deriveCard(background: string): string { return lightenHex(background, 0.07); }
export function deriveAccent(primary: string): string { return darkenHex(primary, 0.18); }
export function deriveRune(primary: string): string { return blendHex(primary, "#f3c98b", 0.6); }

/** Fill in missing optional fields from the 3 required base colors. */
export function completePalette(p: CustomPalette): Required<CustomPalette> {
  return {
    ...p,
    card: p.card ?? deriveCard(p.background),
    accent: p.accent ?? deriveAccent(p.primary),
    rune: p.rune ?? deriveRune(p.primary),
  };
}

/* ── Hex → HSL var string ────────────────────────────────────── */
export function hexToHslVar(hex: string): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let H = 0, S = 0;
  const L = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    S = L > 0.5 ? d / (2 - max - min) : (d / (max + min));
    switch (max) {
      case r: H = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: H = ((b - r) / d + 2); break;
      case b: H = ((r - g) / d + 4); break;
    }
    H /= 6;
  }
  return `${Math.round(H * 360)} ${Math.round(S * 100)}% ${Math.round(L * 100)}%`;
}

/** Compile all custom palettes into a single <style> block in <head>. */
export function applyCustomPaletteStyles(palettes: CustomPalette[]) {
  const id = "lv-custom-palettes";
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = palettes
    .map((raw) => {
      const p = completePalette(raw);
      const bg = hexToHslVar(p.background);
      const card = hexToHslVar(p.card);
      const primary = hexToHslVar(p.primary);
      const accent = hexToHslVar(p.accent);
      const rune = hexToHslVar(p.rune);
      const fg = hexToHslVar(p.foreground);
      return `
[data-palette="${p.id}"] {
  --background: ${bg};
  --card: ${card};
  --foreground: ${fg};
  --primary: ${primary};
  --primary-foreground: ${bg};
  --accent: ${accent};
  --rune: ${rune};
  --rune-glow: ${rune};
  --ring: ${primary};
  --border: ${primary};
  --muted: ${card};
  --muted-foreground: ${fg};
  --popover: ${card};
  --popover-foreground: ${fg};
  --secondary: ${card};
  --secondary-foreground: ${fg};
  --input: ${card};
}`;
    })
    .join("\n");
}

/* ── Extract dominant colors from image file ─────────────────── */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2 / 255;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 * 255 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h /= 6;
  }
  return [h, s, l];
}

/** Extract 3 key colors (background, foreground, primary) from an image File. */
export async function extractColorsFromFile(file: File): Promise<{
  background: string; foreground: string; primary: string; preview: string[];
}> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(img, 0, 0, size, size);

  const pixels = ctx.getImageData(0, 0, size, size).data;
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();

  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
    if (a < 120) continue;
    const qr = Math.round(r / 20) * 20;
    const qg = Math.round(g / 20) * 20;
    const qb = Math.round(b / 20) * 20;
    const key = `${qr},${qg},${qb}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count++;
    } else {
      buckets.set(key, { r: qr, g: qg, b: qb, count: 1 });
    }
  }

  const sorted = Array.from(buckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  // Compute luminance and sort dark → light
  const withLum = sorted.map((c) => {
    const lum = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
    return { ...c, lum };
  }).sort((a, b) => a.lum - b.lum);

  // Background = darkest dominant (but not pure black if possible)
  let bgIdx = 0;
  while (bgIdx < withLum.length - 1 && withLum[bgIdx].lum < 15) bgIdx++;
  const background = rgbToHex(withLum[bgIdx].r, withLum[bgIdx].g, withLum[bgIdx].b);

  // Foreground = lightest dominant (but not pure white if possible)
  let fgIdx = withLum.length - 1;
  while (fgIdx > 0 && withLum[fgIdx].lum > 245) fgIdx--;
  const foreground = rgbToHex(withLum[fgIdx].r, withLum[fgIdx].g, withLum[fgIdx].b);

  // Primary = mid-luminance color with best saturation (most "colorful")
  const mids = withLum.slice(Math.max(1, Math.floor(withLum.length * 0.25)), Math.min(withLum.length - 1, Math.ceil(withLum.length * 0.75)));
  const mostSaturated = mids.length > 0
    ? mids.reduce((best, cur) => {
        const [, sCur] = rgbToHsl(cur.r, cur.g, cur.b);
        const [, sBest] = rgbToHsl(best.r, best.g, best.b);
        return sCur > sBest ? cur : best;
      })
    : withLum[Math.floor(withLum.length / 2)];
  const primary = rgbToHex(mostSaturated.r, mostSaturated.g, mostSaturated.b);

  const preview = withLum.slice(0, 6).map((c) => rgbToHex(c.r, c.g, c.b));

  return { background, foreground, primary, preview };
}
