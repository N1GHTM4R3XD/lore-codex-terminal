import { useEffect, useMemo, useState } from "react";
import { Sliders, Plus, Trash2, Palette as PaletteIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Character, CardAnimation, FrameStyle, CustomPalette } from "@/lib/vault-types";
import { FONT_PRESETS, fontFamilyStack, loadFont, loadFonts } from "@/lib/fontLoader";

interface Props {
  character: Character;
  update: (patch: Partial<Character>) => void;
  customPalettes: CustomPalette[];
  addCustomPalette: (p: CustomPalette) => void;
  removeCustomPalette: (id: string) => void;
}

const BUILTIN_PALETTES: { id: string; label: string; swatch: string }[] = [
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
  { id: "pixel", label: "Pixel" }, { id: "ornament", label: "Ornament" },
  { id: "neon", label: "Neon" },   { id: "parchment", label: "Pergamin" }, { id: "none", label: "Brak" },
];

const ANIMS: { id: CardAnimation; label: string; emoji: string }[] = [
  { id: "none",         label: "Brak",         emoji: "—" },
  { id: "float",        label: "Unoszenie",    emoji: "🌫" },
  { id: "glow",         label: "Poświata",     emoji: "✨" },
  { id: "shake",        label: "Drganie",      emoji: "⚡" },
  { id: "sparkle",      label: "Iskry",        emoji: "💥" },
  { id: "pixel-twinkle",label: "Pixel migot",  emoji: "🔮" },
  { id: "tilt",         label: "Przechył",     emoji: "↔" },
  { id: "breathe",      label: "Oddech",       emoji: "🌊" },
  { id: "leaves",       label: "Liście",       emoji: "🍂" },
  { id: "rain-card",    label: "Deszcz",       emoji: "🌧" },
  { id: "fog",          label: "Mgła",         emoji: "🌫️" },
  { id: "bubbles",      label: "Bąbelki",      emoji: "🫧" },
  { id: "waves",        label: "Fale",         emoji: "🌊" },
  { id: "stars-card",   label: "Gwiazdy",      emoji: "⭐" },
];

const FONT_CATEGORIES: { id: string; label: string }[] = [
  { id: "pixel", label: "Pixel / Retro" },
  { id: "gothic", label: "Gotyk / Display" },
  { id: "serif", label: "Serif" },
  { id: "sans", label: "Sans" },
  { id: "mono", label: "Mono" },
  { id: "handwritten", label: "Pisane" },
  { id: "display", label: "Inne" },
];

function FontSelect({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  useEffect(() => { loadFont(value); }, [value]);
  return (
    <div>
      <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={(v) => { loadFont(v); onChange(v); }}>
        <SelectTrigger className="mt-1 h-9" style={{ fontFamily: fontFamilyStack(value) }}>
          <SelectValue placeholder="Wybierz font" />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {FONT_CATEGORIES.map((cat) => {
            const fonts = FONT_PRESETS.filter((f) => f.category === cat.id);
            if (!fonts.length) return null;
            return (
              <SelectGroup key={cat.id}>
                <SelectLabel className="font-mono text-[10px] uppercase tracking-widest">{cat.label}</SelectLabel>
                {fonts.map((f) => (
                  <SelectItem key={f.family} value={f.family} onPointerEnter={() => loadFont(f.family)}>
                    <span style={{ fontFamily: fontFamilyStack(f.family) }}>{f.family}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function PaletteCreator({ onCreate }: { onCreate: (p: CustomPalette) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Omit<CustomPalette, "id">>({
    label: "Mój motyw",
    background: "#0e0a07",
    card: "#1a1410",
    foreground: "#f0e6d2",
    primary: "#cf9d7b",
    accent: "#a35a3a",
    rune: "#f3c98b",
  });
  const fields: { key: keyof typeof draft; label: string; type?: string }[] = [
    { key: "label", label: "Nazwa", type: "text" },
    { key: "background", label: "Tło" },
    { key: "card", label: "Panel" },
    { key: "foreground", label: "Tekst" },
    { key: "primary", label: "Główny" },
    { key: "accent", label: "Akcent" },
    { key: "rune", label: "Runa" },
  ];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono uppercase text-xs">
          <Plus className="h-3 w-3 mr-1" />Własna paleta
        </Button>
      </DialogTrigger>
      <DialogContent className="vault-panel max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display rune-text text-xl flex items-center gap-2">
            <PaletteIcon className="h-5 w-5" /> Nowa paleta
          </DialogTitle>
          <DialogDescription className="font-mono text-xs uppercase tracking-widest">
            Pick 6 colors · podgląd na żywo
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 pt-2">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center gap-3">
              <Label className="w-20 font-mono text-xs uppercase tracking-widest">{f.label}</Label>
              {f.type === "text" ? (
                <Input
                  value={draft[f.key] as string}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  className="flex-1"
                />
              ) : (
                <>
                  <input
                    type="color"
                    value={draft[f.key] as string}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                    className="h-9 w-12 rounded border border-border bg-transparent cursor-pointer"
                  />
                  <Input
                    value={draft[f.key] as string}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                    className="font-mono text-xs flex-1"
                  />
                </>
              )}
            </div>
          ))}
          <div
            className="h-16 mt-2 grid grid-cols-6 rounded overflow-hidden border border-border"
            aria-label="Podgląd"
          >
            {(["background","card","foreground","primary","accent","rune"] as const).map((k) => (
              <div key={k} style={{ background: draft[k] }} title={k} />
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              const p: CustomPalette = { ...draft, id: `custom_${Date.now().toString(36)}` };
              onCreate(p);
              setOpen(false);
            }}
            className="pixel-btn"
          >
            Zapisz paletę
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const CardCustomizer = ({ character, update, customPalettes, addCustomPalette, removeCustomPalette }: Props) => {
  const fonts = character.fonts ?? { display: character.font || "Pixelify Sans", body: "Cormorant Garamond", mono: "JetBrains Mono" };

  useEffect(() => {
    loadFonts([fonts.display, fonts.body, fonts.mono]);
  }, [fonts.display, fonts.body, fonts.mono]);

  const allPalettes = useMemo(
    () => [
      ...BUILTIN_PALETTES,
      ...customPalettes.map((p) => ({
        id: p.id,
        label: p.label,
        swatch: `linear-gradient(135deg, ${p.primary}, ${p.rune})`,
        custom: true,
      })),
    ],
    [customPalettes],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono uppercase tracking-wider text-xs">
          <Sliders className="h-3.5 w-3.5 mr-1.5" />
          Personalizuj
        </Button>
      </DialogTrigger>
      <DialogContent className="vault-panel max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display rune-text text-2xl">Personalizacja karty</DialogTitle>
          <DialogDescription className="font-mono text-xs uppercase tracking-widest">
            Paleta · ramka · animacja · fonty · muzyka
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <section>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))]">Paleta</Label>
              <PaletteCreator onCreate={addCustomPalette} />
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {allPalettes.map((p: any) => (
                <div key={p.id} className="relative">
                  <button
                    onClick={() => update({ palette: p.id })}
                    className={`group relative aspect-square w-full border-2 transition ${
                      character.palette === p.id ? "border-[hsl(var(--rune))] shadow-rune" : "border-border hover:border-[hsl(var(--rune)/0.5)]"
                    }`}
                    style={{ background: p.swatch }}
                    aria-label={p.label}
                    aria-pressed={character.palette === p.id}
                  >
                    <span className="absolute inset-x-0 -bottom-5 text-[9px] font-mono uppercase tracking-wider text-center text-muted-foreground truncate px-1">
                      {p.label}
                    </span>
                  </button>
                  {p.custom && (
                    <button
                      onClick={() => removeCustomPalette(p.id)}
                      className="absolute -top-2 -right-2 h-5 w-5 grid place-items-center rounded-full bg-background border border-border hover:text-destructive"
                      aria-label={`Usuń paletę ${p.label}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="pt-4">
            <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))]">Ramka</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {FRAMES.map((f) => (
                <Button key={f.id} variant={character.frame === f.id ? "default" : "outline"} size="sm"
                  onClick={() => update({ frame: f.id })} className="font-mono uppercase text-xs">
                  {f.label}
                </Button>
              ))}
            </div>
          </section>

          <section>
            <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))]">Animacja karty</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ANIMS.map((a) => (
                <Button key={a.id} variant={character.animation === a.id ? "default" : "outline"} size="sm"
                  onClick={() => update({ animation: a.id })} className="font-mono uppercase text-xs gap-1">
                  <span aria-hidden>{a.emoji}</span>{a.label}
                </Button>
              ))}
            </div>
          </section>

          <section>
            <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-2 block">
              Typografia (Google Fonts)
            </Label>
            <div className="grid sm:grid-cols-3 gap-3">
              <FontSelect
                label="Nagłówki"
                value={fonts.display}
                onChange={(v) => update({ font: v, fonts: { ...fonts, display: v } })}
              />
              <FontSelect
                label="Tekst"
                value={fonts.body}
                onChange={(v) => update({ fonts: { ...fonts, body: v } })}
              />
              <FontSelect
                label="Etykiety"
                value={fonts.mono}
                onChange={(v) => update({ fonts: { ...fonts, mono: v } })}
              />
            </div>
            <div className="mt-3 vault-panel p-3 text-center">
              <p style={{ fontFamily: fontFamilyStack(fonts.display) }} className="text-2xl text-[hsl(var(--rune))]">
                {character.name}
              </p>
              <p style={{ fontFamily: fontFamilyStack(fonts.body) }} className="text-sm italic">
                {character.tagline}
              </p>
              <p style={{ fontFamily: fontFamilyStack(fonts.mono) }} className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                Lore Vault · Codex Terminal
              </p>
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
