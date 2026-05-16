/** Convert hex → "H S% L%" string (the format CSS vars use). */
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

import type { CustomPalette } from "./vault-types";

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
    .map((p) => {
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
