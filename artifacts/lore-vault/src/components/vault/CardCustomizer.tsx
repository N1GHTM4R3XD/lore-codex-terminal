import { useEffect, useMemo, useState } from "react";
import { Sliders, Plus, Trash2, Palette as PaletteIcon, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Character, CardAnimation, FrameStyle, AvatarBorderStyle, CustomPalette } from "@/lib/vault-types";
import { FONT_PRESETS, fontFamilyStack, loadFont, loadFonts } from "@/lib/fontLoader";
import { AVATAR_BORDER_CLASS } from "@/components/vault/CharacterCard";
import { cn } from "@/lib/utils";

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

const FRAMES: { id: FrameStyle; label: string; desc: string }[] = [
  { id: "pixel",    label: "Pixel",    desc: "podwójna pikselowa" },
  { id: "ornament", label: "Ornament", desc: "narożne klamry" },
  { id: "neon",     label: "Neon",     desc: "świecąca poświata" },
  { id: "parchment",label: "Pergamin", desc: "gradient tła" },
  { id: "arcane",   label: "Arkana",   desc: "magiczny kontur" },
  { id: "gothic",   label: "Gotyk",    desc: "ciężka krawędź" },
  { id: "circuit",  label: "Circuit",  desc: "techno narożniki" },
  { id: "minimal",  label: "Minimal",  desc: "dyskretna linia" },
  { id: "none",     label: "Brak",     desc: "cienka ramka" },
];

const FRAME_CLASS: Record<FrameStyle, string> = {
  pixel: "frame-pixel", ornament: "frame-ornament", neon: "frame-neon",
  parchment: "frame-parchment", none: "frame-none",
  arcane: "frame-arcane", gothic: "frame-gothic",
  circuit: "frame-circuit", minimal: "frame-minimal",
};

const AVATAR_BORDERS: { id: AvatarBorderStyle; label: string }[] = [
  { id: "rune",   label: "Runa" },
  { id: "double", label: "Podwójna" },
  { id: "glow",   label: "Blask" },
  { id: "pixel",  label: "Piksel" },
  { id: "ornate", label: "Ornament" },
  { id: "thin",   label: "Cienka" },
  { id: "none",   label: "Brak" },
];

const ANIMS: { id: CardAnimation; label: string; emoji: string }[] = [
  { id: "none",    label: "Brak",    emoji: "—" },
  { id: "rain",    label: "Deszcz",  emoji: "🌧" },
  { id: "fire",    label: "Ogień",   emoji: "🔥" },
  { id: "stars",   label: "Gwiazdy", emoji: "⭐" },
  { id: "embers",  label: "Żar",     emoji: "🔸" },
  { id: "void",    label: "Pustka",  emoji: "🌀" },
  { id: "leaves",  label: "Liście",  emoji: "🍂" },
  { id: "fog",     label: "Mgła",    emoji: "🌫️" },
  { id: "bubbles", label: "Bąbelki", emoji: "🫧" },
  { id: "snow",    label: "Śnieg",   emoji: "❄️" },
];

const FONT_CATEGORIES: { id: string; label: string }[] = [
  { id: "pixel",       label: "Pixel / Retro" },
  { id: "gothic",      label: "Gotyk / Display" },
  { id: "serif",       label: "Serif" },
  { id: "sans",        label: "Sans" },
  { id: "mono",        label: "Mono" },
  { id: "handwritten", label: "Pisane" },
  { id: "display",     label: "Inne" },
];

function FontSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
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
    background: "#0e0a07", card: "#1a1410", foreground: "#f0e6d2",
    primary: "#cf9d7b", accent: "#a35a3a", rune: "#f3c98b",
  });
  const fields: { key: keyof typeof draft; label: string; type?: string }[] = [
    { key: "label", label: "Nazwa", type: "text" },
    { key: "background", label: "Tło" }, { key: "card", label: "Panel" },
    { key: "foreground", label: "Tekst" }, { key: "primary", label: "Główny" },
    { key: "accent", label: "Akcent" }, { key: "rune", label: "Runa" },
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
                <Input value={draft[f.key] as string} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} className="flex-1" />
              ) : (
                <>
                  <input type="color" value={draft[f.key] as string}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                    className="h-9 w-12 rounded border border-border bg-transparent cursor-pointer" />
                  <Input value={draft[f.key] as string}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                    className="font-mono text-xs flex-1" />
                </>
              )}
            </div>
          ))}
          <div className="h-16 mt-2 grid grid-cols-6 rounded overflow-hidden border border-border">
            {(["background","card","foreground","primary","accent","rune"] as const).map((k) => (
              <div key={k} style={{ background: draft[k] }} title={k} />
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => { const p: CustomPalette = { ...draft, id: `custom_${Date.now().toString(36)}` }; onCreate(p); setOpen(false); }}
            className="pixel-btn">Zapisz paletę</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Mini card preview ─────────────────────────────────────── */
function FramePreview({ character, frame, avatarBorder, fonts }: {
  character: Character;
  frame: FrameStyle;
  avatarBorder: AvatarBorderStyle;
  fonts: { display: string; body: string; mono: string };
}) {
  const abCls = AVATAR_BORDER_CLASS[avatarBorder];
  return (
    <div
      data-palette={character.palette}
      className={cn("lv-card-scope overflow-hidden transition-all duration-300", FRAME_CLASS[frame])}
      style={{
        ["--font-display" as any]: fontFamilyStack(fonts.display),
        ["--font-body" as any]: fontFamilyStack(fonts.body),
      }}
    >
      <div className="relative aspect-[5/2] bg-muted overflow-hidden">
        {character.background && (
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${character.background}")`, opacity: (character.bgOpacity ?? 65) / 100 }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/85 to-transparent" />
        <div className="absolute inset-0 flex items-center gap-3 px-4">
          <div className={cn(
            "h-12 w-12 rounded-full overflow-hidden flex-shrink-0",
            avatarBorder === "pixel" ? "rounded-none" : "rounded-full",
            abCls,
          )}>
            {character.avatar
              ? <img src={character.avatar} alt="" className="h-full w-full object-cover" />
              : <div className="h-full w-full grid place-items-center bg-card/60"><User className="h-5 w-5 text-muted-foreground" /></div>
            }
          </div>
          <div className="min-w-0">
            <p className="text-[hsl(var(--rune))] text-sm leading-tight line-clamp-1"
              style={{ fontFamily: "var(--font-display)" }}>{character.name}</p>
            <p className="text-xs italic text-muted-foreground line-clamp-1"
              style={{ fontFamily: "var(--font-body)" }}>{character.tagline}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────── */
export const CardCustomizer = ({ character, update, customPalettes, addCustomPalette, removeCustomPalette }: Props) => {
  const fonts = character.fonts ?? { display: character.font || "Pixelify Sans", body: "Cormorant Garamond", mono: "JetBrains Mono" };
  const currentFrame = character.frame ?? "pixel";
  const currentAvatarBorder = character.avatarBorder ?? "rune";
  const bgOpacity = character.bgOpacity ?? 65;

  useEffect(() => { loadFonts([fonts.display, fonts.body, fonts.mono]); }, [fonts.display, fonts.body, fonts.mono]);

  const allPalettes = useMemo(
    () => [
      ...BUILTIN_PALETTES,
      ...customPalettes.map((p) => ({
        id: p.id, label: p.label,
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
          <Sliders className="h-3.5 w-3.5 mr-1.5" />Personalizuj
        </Button>
      </DialogTrigger>
      <DialogContent className="vault-panel max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display rune-text text-2xl">Personalizacja karty</DialogTitle>
          <DialogDescription className="font-mono text-xs uppercase tracking-widest">
            Paleta · ramka · obramówka · tło · animacja · fonty · muzyka
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">

          {/* ── Palette ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))]">Paleta</Label>
              <PaletteCreator onCreate={addCustomPalette} />
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {allPalettes.map((p: any) => (
                <div key={p.id} className="relative">
                  <button
                    onClick={() => update({ palette: p.id })}
                    className={cn(
                      "group relative aspect-square w-full border-2 transition",
                      character.palette === p.id ? "border-[hsl(var(--rune))] shadow-rune" : "border-border hover:border-[hsl(var(--rune)/0.5)]"
                    )}
                    style={{ background: p.swatch }}
                    aria-label={p.label} aria-pressed={character.palette === p.id}
                  >
                    <span className="absolute inset-x-0 -bottom-5 text-[9px] font-mono uppercase tracking-wider text-center text-muted-foreground truncate px-1">
                      {p.label}
                    </span>
                  </button>
                  {p.custom && (
                    <button onClick={() => removeCustomPalette(p.id)}
                      className="absolute -top-2 -right-2 h-5 w-5 grid place-items-center rounded-full bg-background border border-border hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── Frame ── */}
          <section className="pt-5 border-t border-border">
            <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-3 block">
              Ramka karty
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
              {FRAMES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => update({ frame: f.id })}
                  className={cn(
                    "px-2 py-1.5 text-xs font-mono transition-colors border text-left rounded",
                    currentFrame === f.id
                      ? "bg-[hsl(var(--rune)/0.15)] border-[hsl(var(--rune)/0.6)] text-[hsl(var(--rune))]"
                      : "border-border text-muted-foreground hover:border-[hsl(var(--rune)/0.4)] hover:text-foreground"
                  )}
                >
                  <span className="block font-semibold">{f.label}</span>
                  <span className="text-[9px] opacity-60 normal-case">{f.desc}</span>
                </button>
              ))}
            </div>

            {/* Live frame + avatar preview */}
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Podgląd na żywo:</p>
              <FramePreview
                character={character}
                frame={currentFrame}
                avatarBorder={currentAvatarBorder}
                fonts={fonts}
              />
            </div>
          </section>

          {/* ── Avatar border ── */}
          <section className="border-t border-border pt-5">
            <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-3 block">
              Obramówka profilowego
            </Label>
            <div className="flex flex-wrap gap-2" data-palette={character.palette}>
              {AVATAR_BORDERS.map((ab) => (
                <button
                  key={ab.id}
                  onClick={() => update({ avatarBorder: ab.id })}
                  className={cn("flex flex-col items-center gap-2 p-2 rounded border transition-colors lv-card-scope", {
                    "border-[hsl(var(--rune)/0.6)] bg-[hsl(var(--rune)/0.08)]": currentAvatarBorder === ab.id,
                    "border-border hover:border-[hsl(var(--rune)/0.3)]": currentAvatarBorder !== ab.id,
                  })}
                >
                  <div className={cn(
                    "h-10 w-10 overflow-hidden",
                    ab.id === "pixel" ? "rounded-none" : "rounded-full",
                    AVATAR_BORDER_CLASS[ab.id],
                  )}>
                    {character.avatar
                      ? <img src={character.avatar} alt="" className="h-full w-full object-cover" />
                      : <div className="h-full w-full grid place-items-center bg-muted"><User className="h-4 w-4 text-muted-foreground" /></div>
                    }
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{ab.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Background opacity ── */}
          {character.background && (
            <section className="border-t border-border pt-5">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))]">
                  Widoczność tła
                </Label>
                <span className="font-mono text-xs text-muted-foreground">{bgOpacity}%</span>
              </div>
              <Slider
                min={0} max={100} step={5}
                value={[bgOpacity]}
                onValueChange={([v]) => update({ bgOpacity: v })}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="font-mono text-[9px] text-muted-foreground">Przezroczyste</span>
                <span className="font-mono text-[9px] text-muted-foreground">Pełne</span>
              </div>
            </section>
          )}

          {/* ── Animation ── */}
          <section className="border-t border-border pt-5">
            <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-2 block">
              Efekt otoczenia <span className="text-muted-foreground normal-case tracking-normal">(pełna strona postaci)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {ANIMS.map((a) => (
                <Button key={a.id} variant={character.animation === a.id ? "default" : "outline"} size="sm"
                  onClick={() => update({ animation: a.id })} className="font-mono uppercase text-xs gap-1">
                  <span aria-hidden>{a.emoji}</span>{a.label}
                </Button>
              ))}
            </div>
          </section>

          {/* ── Typography ── */}
          <section className="border-t border-border pt-5">
            <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-2 block">
              Typografia (Google Fonts)
            </Label>
            <div className="grid sm:grid-cols-3 gap-3">
              <FontSelect label="Nagłówki" value={fonts.display}
                onChange={(v) => update({ font: v, fonts: { ...fonts, display: v } })} />
              <FontSelect label="Tekst" value={fonts.body}
                onChange={(v) => update({ fonts: { ...fonts, body: v } })} />
              <FontSelect label="Etykiety" value={fonts.mono}
                onChange={(v) => update({ fonts: { ...fonts, mono: v } })} />
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

          {/* ── Music ── */}
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
