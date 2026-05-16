import { Sliders } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Character, CardAnimation, FontTheme, FrameStyle, Palette } from "@/lib/vault-types";

interface Props {
  character: Character;
  update: (patch: Partial<Character>) => void;
}

const PALETTES: { id: Palette; label: string; swatch: string }[] = [
  { id: "pixel-dark",   label: "Pixel Dark",  swatch: "linear-gradient(135deg,#1a1714,#cf9d7b)" },
  { id: "abyss",        label: "Otchłań",     swatch: "linear-gradient(135deg,hsl(195,85%,60%),hsl(270,70%,65%))" },
  { id: "crimson",      label: "Karmin",      swatch: "linear-gradient(135deg,hsl(0,75%,55%),hsl(20,80%,55%))" },
  { id: "arcane",       label: "Arkana",      swatch: "linear-gradient(135deg,hsl(280,80%,65%),hsl(200,90%,60%))" },
  { id: "ember",        label: "Żar",         swatch: "linear-gradient(135deg,hsl(30,95%,55%),hsl(0,80%,55%))" },
  { id: "verdant",      label: "Zieleń",      swatch: "linear-gradient(135deg,hsl(145,70%,50%),hsl(90,60%,55%))" },
  { id: "cozy-forest",  label: "Cozy Forest", swatch: "linear-gradient(135deg,#7a9b6e,#e8e0cf)" },
  { id: "pastel-dream", label: "Pastel",      swatch: "linear-gradient(135deg,#e8c5d0,#9b88c4)" },
];

const FRAMES: { id: FrameStyle; label: string }[] = [
  { id: "pixel",     label: "Pixel" },
  { id: "ornament",  label: "Ornament" },
  { id: "neon",      label: "Neon" },
  { id: "parchment", label: "Pergamin" },
  { id: "none",      label: "Brak" },
];

const ANIMS: { id: CardAnimation; label: string }[] = [
  { id: "none",          label: "Brak" },
  { id: "float",         label: "Unoszenie" },
  { id: "glow",          label: "Poświata" },
  { id: "shake",         label: "Drganie" },
  { id: "sparkle",       label: "Iskry" },
  { id: "pixel-twinkle", label: "Pixel migot" },
];

const FONTS: { id: FontTheme; label: string; cls: string }[] = [
  { id: "pixel",       label: "Pixel",      cls: "font-pixel" },
  { id: "gothic",      label: "Gotyk",      cls: "font-gothic" },
  { id: "serif",       label: "Serif",      cls: "font-body" },
  { id: "handwritten", label: "Pisany",     cls: "font-handwritten" },
];

export const CardCustomizer = ({ character, update }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono uppercase tracking-wider text-xs">
          <Sliders className="h-3.5 w-3.5 mr-1.5" />
          Personalizuj
        </Button>
      </DialogTrigger>
      <DialogContent className="vault-panel max-w-xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display rune-text text-2xl">Personalizacja karty</DialogTitle>
          <DialogDescription className="font-mono text-xs uppercase tracking-widest">
            Motyw, ramka, animacja, font, muzyka
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <section>
            <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))]">Paleta</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => update({ palette: p.id })}
                  className={`group relative aspect-square border-2 transition ${
                    character.palette === p.id ? "border-[hsl(var(--rune))] shadow-rune" : "border-border hover:border-[hsl(var(--rune)/0.5)]"
                  }`}
                  style={{ background: p.swatch }}
                  aria-label={p.label}
                  aria-pressed={character.palette === p.id}
                >
                  <span className="absolute inset-x-0 -bottom-5 text-[10px] font-mono uppercase tracking-wider text-center text-muted-foreground">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="pt-4">
            <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))]">Ramka</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {FRAMES.map((f) => (
                <Button
                  key={f.id}
                  variant={character.frame === f.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => update({ frame: f.id })}
                  className="font-mono uppercase text-xs"
                  aria-pressed={character.frame === f.id}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </section>

          <section>
            <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))]">Animacja</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ANIMS.map((a) => (
                <Button
                  key={a.id}
                  variant={character.animation === a.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => update({ animation: a.id })}
                  className="font-mono uppercase text-xs"
                  aria-pressed={character.animation === a.id}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          </section>

          <section>
            <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))]">Typografia</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => update({ font: f.id })}
                  className={`px-2 py-3 border-2 transition text-sm ${f.cls} ${
                    character.font === f.id ? "border-[hsl(var(--rune))] bg-card" : "border-border hover:border-[hsl(var(--rune)/0.5)]"
                  }`}
                  aria-pressed={character.font === f.id}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </section>

          <section className="pt-2 border-t border-border">
            <Label htmlFor="music-url" className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))]">
              Muzyka w tle (YouTube / SoundCloud)
            </Label>
            <Input
              id="music-url"
              defaultValue={character.musicUrl ?? ""}
              placeholder="https://www.youtube.com/watch?v=... lub https://soundcloud.com/..."
              onBlur={(e) => update({ musicUrl: e.target.value || undefined })}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Wklej link i kliknij poza polem, aby zapisać.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
