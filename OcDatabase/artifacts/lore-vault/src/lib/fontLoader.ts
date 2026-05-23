/**
 * Dynamic Google Fonts loader. Appends a single <link> per family.
 */

export interface FontPreset {
  family: string;
  category: "pixel" | "gothic" | "serif" | "sans" | "mono" | "handwritten" | "display";
  /** Google fonts URL param value with weights, e.g. "Inter:wght@400;600". */
  spec?: string;
}

export const FONT_PRESETS: FontPreset[] = [
  // pixel / retro
  { family: "Pixelify Sans", category: "pixel", spec: "Pixelify+Sans:wght@400;500;600;700" },
  { family: "Press Start 2P", category: "pixel", spec: "Press+Start+2P" },
  { family: "VT323", category: "pixel", spec: "VT323" },
  { family: "Silkscreen", category: "pixel", spec: "Silkscreen:wght@400;700" },
  { family: "Jersey 10", category: "pixel", spec: "Jersey+10" },
  // gothic / display
  { family: "Cinzel", category: "gothic", spec: "Cinzel:wght@400;500;600;700;800" },
  { family: "Cinzel Decorative", category: "gothic", spec: "Cinzel+Decorative:wght@400;700;900" },
  { family: "UnifrakturCook", category: "gothic", spec: "UnifrakturCook:wght@700" },
  { family: "MedievalSharp", category: "gothic", spec: "MedievalSharp" },
  { family: "Uncial Antiqua", category: "gothic", spec: "Uncial+Antiqua" },
  { family: "IM Fell English", category: "gothic", spec: "IM+Fell+English:ital@0;1" },
  { family: "Pirata One", category: "gothic", spec: "Pirata+One" },
  // serif
  { family: "Cormorant Garamond", category: "serif", spec: "Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500" },
  { family: "Playfair Display", category: "serif", spec: "Playfair+Display:ital,wght@0,400;0,700;1,400" },
  { family: "Lora", category: "serif", spec: "Lora:ital,wght@0,400;0,600;1,400" },
  { family: "EB Garamond", category: "serif", spec: "EB+Garamond:ital,wght@0,400;0,600;1,400" },
  { family: "Merriweather", category: "serif", spec: "Merriweather:ital,wght@0,400;0,700;1,400" },
  { family: "Crimson Text", category: "serif", spec: "Crimson+Text:ital,wght@0,400;0,600;1,400" },
  // sans
  { family: "Inter", category: "sans", spec: "Inter:wght@400;500;600;700" },
  { family: "Manrope", category: "sans", spec: "Manrope:wght@400;500;600;700" },
  { family: "Space Grotesk", category: "sans", spec: "Space+Grotesk:wght@400;500;700" },
  { family: "Bebas Neue", category: "sans", spec: "Bebas+Neue" },
  { family: "Oswald", category: "sans", spec: "Oswald:wght@400;500;600;700" },
  // mono
  { family: "JetBrains Mono", category: "mono", spec: "JetBrains+Mono:wght@400;500;600" },
  { family: "Fira Code", category: "mono", spec: "Fira+Code:wght@400;500;600" },
  { family: "IBM Plex Mono", category: "mono", spec: "IBM+Plex+Mono:wght@400;500;600" },
  // handwritten / atmosphere
  { family: "Caveat", category: "handwritten", spec: "Caveat:wght@400;600;700" },
  { family: "Indie Flower", category: "handwritten", spec: "Indie+Flower" },
  { family: "Dancing Script", category: "handwritten", spec: "Dancing+Script:wght@400;600;700" },
  { family: "Special Elite", category: "handwritten", spec: "Special+Elite" },
  { family: "Tangerine", category: "handwritten", spec: "Tangerine:wght@400;700" },
  { family: "Great Vibes", category: "handwritten", spec: "Great+Vibes" },
  // display extras
  { family: "Cormorant Unicase", category: "display", spec: "Cormorant+Unicase:wght@400;500;600;700" },
  { family: "Almendra", category: "display", spec: "Almendra:ital,wght@0,400;0,700;1,400" },
];

const loaded = new Set<string>();

export function loadFont(family: string) {
  if (!family || loaded.has(family)) return;
  const preset = FONT_PRESETS.find((f) => f.family === family);
  const spec = preset?.spec ?? family.replace(/\s+/g, "+");
  const id = `gf-${spec}`;
  if (document.getElementById(id)) {
    loaded.add(family);
    return;
  }
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
  document.head.appendChild(link);
  loaded.add(family);
}

export function loadFonts(families: (string | undefined)[]) {
  families.forEach((f) => f && loadFont(f));
}

/** Load a user-uploaded font file via data: URL into a <style> @font-face block. */
export function loadCustomFont(name: string, src: string) {
  const id = `cf-${name.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `@font-face { font-family: "${name}"; src: url("${src}"); font-display: swap; }`;
  document.head.appendChild(style);
}

export function fontFamilyStack(family: string): string {
  const preset = FONT_PRESETS.find((f) => f.family === family);
  if (!preset) return `"${family}", system-ui, sans-serif`;
  const fallback =
    preset.category === "mono" ? "monospace" :
    preset.category === "serif" || preset.category === "gothic" ? "Georgia, serif" :
    preset.category === "handwritten" ? "cursive" :
    preset.category === "pixel" ? "monospace" :
    "system-ui, sans-serif";
  return `"${family}", ${fallback}`;
}
