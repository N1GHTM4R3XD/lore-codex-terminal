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
    S = L > 0.5 ? d / (2 - max - min) : d / (max + min);
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
