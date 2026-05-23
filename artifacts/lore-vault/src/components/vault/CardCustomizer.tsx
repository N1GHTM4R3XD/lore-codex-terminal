import { useEffect, useMemo, useRef, useState } from "react";
import { Sliders, Plus, Trash2, Palette as PaletteIcon, User, ChevronDown, ChevronUp, Music, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Character, CardAnimation, FrameStyle, AvatarBorderStyle, CustomPalette, CustomFont } from "@/lib/vault-types";
import { FONT_PRESETS, fontFamilyStack, loadFont, loadFonts, loadCustomFont } from "@/lib/fontLoader";
import { AVATAR_BORDER_CLASS } from "@/components/vault/CharacterCard";
import { completePalette, darkenHex, deriveRune, lightenHex } from "@/lib/paletteUtils";
import { cn } from "@/lib/utils";

interface Props {
  character: Character;
  update: (patch: Partial<Character>) => void;
  customPalettes: CustomPalette[];
  addCustomPalette: (p: CustomPalette) => void;
  removeCustomPalette: (id: string) => void;
  customFonts?: CustomFont[];
  onAddCustomFont?: (f: CustomFont) => void;
  onRemoveCustomFont?: (id: string) => void;
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
  { id: "pixel",     label: "Pixel",     desc: "podwójna pikselowa" },
  { id: "ornament",  label: "Ornament",  desc: "narożne klamry" },
  { id: "neon",      label: "Neon",      desc: "świecąca poświata" },
  { id: "parchment", label: "Pergamin",  desc: "gradient tła" },
  { id: "arcane",    label: "Arkana",    desc: "magiczny kontur" },
  { id: "gothic",    label: "Gotyk",     desc: "ciężka krawędź" },
  { id: "circuit",   label: "Circuit",   desc: "techno narożniki" },
  { id: "minimal",   label: "Minimal",   desc: "dyskretna linia" },
  { id: "chain",     label: "Chain",     desc: "przerywany łańcuch" },
  { id: "flame",     label: "Płomień",   desc: "ogniste narożniki" },
  { id: "ice",       label: "Lód",       desc: "lodowa poświata" },
  { id: "vines",     label: "Pnącza",    desc: "narożne liście" },
  { id: "crown",     label: "Korona",    desc: "górna obwiednia" },
  { id: "diamond",   label: "Diament",   desc: "uściosowany" },
  { id: "shadow",    label: "Cień",      desc: "wielokrotny cień" },
  { id: "tapestry",  label: "Arras",     desc: "poziome linie" },
  { id: "none",      label: "Brak",      desc: "cienka ramka" },
];

const FRAME_CLASS: Record<FrameStyle, string> = {
  pixel: "frame-pixel", ornament: "frame-ornament", neon: "frame-neon",
  parchment: "frame-parchment", none: "frame-none",
  arcane: "frame-arcane", gothic: "frame-gothic",
  circuit: "frame-circuit", minimal: "frame-minimal",
  chain: "frame-chain", flame: "frame-flame", ice: "frame-ice",
  vines: "frame-vines", crown: "frame-crown", diamond: "frame-diamond",
  shadow: "frame-shadow", tapestry: "frame-tapestry",
};

const AVATAR_BORDERS: { id: AvatarBorderStyle; label: string }[] = [
  { id: "rune",      label: "Runa" },
  { id: "double",    label: "Podwójna" },
  { id: "glow",      label: "Blask" },
  { id: "pixel",     label: "Piksel" },
  { id: "ornate",    label: "Ornament" },
  { id: "thin",      label: "Cienka" },
  { id: "chain",     label: "Łańcuszek" },
  { id: "flame",     label: "Płomień" },
  { id: "ice",       label: "Lód" },
  { id: "crown",     label: "Korona" },
  { id: "starburst", label: "Gwiazda" },
  { id: "feather",   label: "Pierzko" },
  { id: "diamond",   label: "Diament" },
  { id: "thorn",     label: "Cierń" },
  { id: "aura",      label: "Aura" },
  { id: "none",      label: "Brak" },
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

/* ── Improved FontSelect ─────────────────────────────────────── */
function FontSelect({
  label, hint, value, sampleText, onChange, customFonts = [],
}: {
  label: string; hint: string; value: string; sampleText: string; onChange: (v: string) => void; customFonts?: CustomFont[];
}) {
  useEffect(() => { loadFont(value); }, [value]);
  return (
    <div className="space-y-1.5">
      <div>
        <Label className="font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--rune))]">{label}</Label>
        <p className="font-mono text-[9px] text-muted-foreground">{hint}</p>
      </div>
      <Select value={value} onValueChange={(v) => { loadFont(v); onChange(v); }}>
        <SelectTrigger className="h-9 border-border" style={{ fontFamily: fontFamilyStack(value) }}>
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
                    <span style={{ fontFamily: fontFamilyStack(f.family), fontSize: "0.9rem" }}>{f.family}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
          {customFonts.length > 0 && (
            <SelectGroup>
              <SelectLabel className="font-mono text-[10px] uppercase tracking-widest">Własne</SelectLabel>
              {customFonts.map((cf) => (
                <SelectItem key={cf.id} value={cf.name} onPointerEnter={() => loadCustomFont(cf.name, cf.src)}>
                  <span style={{ fontFamily: `"${cf.name}", system-ui, sans-serif`, fontSize: "0.9rem" }}>{cf.name}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
      {/* Live sample */}
      <div
        className="vault-panel px-3 py-2 text-center min-h-[2.5rem] grid place-items-center"
        style={{ fontFamily: fontFamilyStack(value) }}
      >
        <span className="text-lg leading-snug text-[hsl(var(--rune))]">{sampleText || value}</span>
      </div>
    </div>
  );
}

/* ── Custom font upload ───────────────────────────────────────── */
function CustomFontUpload({
  customFonts = [], onAdd, onRemove,
}: {
  customFonts?: CustomFont[];
  onAdd?: (f: CustomFont) => void;
  onRemove?: (id: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.replace(/\.[^/.]+$/, "").slice(0, 28);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target!.result as string;
      onAdd?.({ id: `cf_${Date.now().toString(36)}`, name, src });
      loadCustomFont(name, src);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Własne czcionki</Label>
        <span className="font-mono text-[9px] text-muted-foreground">{customFonts.length} / 10</span>
      </div>

      {customFonts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {customFonts.map((cf) => (
            <div key={cf.id} className="group flex items-center gap-1 px-2 py-1 rounded border border-border bg-card/50 font-mono text-[10px]">
              <span style={{ fontFamily: `"${cf.name}", sans-serif` }}>{cf.name}</span>
              <button onClick={() => onRemove?.(cf.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                aria-label="Usuń czcionkę">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input ref={fileRef} type="file" accept=".ttf,.woff,.woff2,.otf" className="hidden"
        onChange={handleFile} />
      <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}
        className="font-mono uppercase text-xs" disabled={customFonts.length >= 10}>
        <Upload className="h-3.5 w-3.5 mr-1" />
        {customFonts.length >= 10 ? "Limit (10)" : "Wgraj font (.ttf / .woff)"}
      </Button>
    </div>
  );
}

/* ── Color field with picker + hex input ──────────────────────── */
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-10 shrink-0 rounded border border-border bg-transparent cursor-pointer p-0.5"
      />
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs h-7 py-0"
          placeholder="#rrggbb"
        />
      </div>
    </div>
  );
}

/* ── Palette Creator — variable number of colors ─────────────── */
function PaletteCreator({ onCreate }: { onCreate: (p: CustomPalette) => void }) {
  const [open, setOpen] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [draft, setDraft] = useState<CustomPalette>({
    id: "", label: "Mój motyw",
    background: "#0e0a07",
    foreground: "#f0e6d2",
    primary: "#cf9d7b",
  });

  const filled = completePalette(draft);
  const swatchColors = [filled.background, filled.card, filled.foreground, filled.primary, filled.accent, filled.rune];

  const set = (k: keyof CustomPalette, v: string) => setDraft((d) => ({ ...d, [k]: v }));
  const clearOptional = (k: "card" | "accent" | "rune") => setDraft((d) => { const n = { ...d }; delete n[k]; return n; });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono uppercase text-xs">
          <Plus className="h-3 w-3 mr-1" />Własna paleta
        </Button>
      </DialogTrigger>
      <DialogContent className="vault-panel max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display rune-text text-xl flex items-center gap-2">
            <PaletteIcon className="h-5 w-5" /> Nowa paleta
          </DialogTitle>
          <DialogDescription className="font-mono text-xs uppercase tracking-widest">
            3 wymagane + opcjonalne kolory
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {/* Name */}
          <div className="flex items-center gap-2">
            <Label className="w-16 font-mono text-[10px] uppercase tracking-widest shrink-0">Nazwa</Label>
            <Input value={draft.label} onChange={(e) => set("label", e.target.value)} className="flex-1" />
          </div>

          {/* Required 3 */}
          <div className="border border-border rounded p-3 space-y-2.5">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[hsl(var(--rune))] mb-1">Wymagane</p>
            <ColorField label="Tło" value={draft.background} onChange={(v) => set("background", v)} />
            <ColorField label="Tekst" value={draft.foreground} onChange={(v) => set("foreground", v)} />
            <ColorField label="Główny akcent" value={draft.primary} onChange={(v) => set("primary", v)} />
          </div>

          {/* Optional 3 */}
          <div className="border border-border rounded p-3 space-y-2.5">
            <button
              type="button"
              onClick={() => setShowOptional((v) => !v)}
              className="flex items-center justify-between w-full font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition"
            >
              <span>Opcjonalne (auto-pochodne gdy puste)</span>
              {showOptional ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showOptional && (
              <div className="space-y-2.5 pt-1">
                {/* Card */}
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <ColorField
                      label={`Panel ${!draft.card ? `(auto: ${lightenHex(draft.background, 0.07)})` : ""}`}
                      value={draft.card ?? lightenHex(draft.background, 0.07)}
                      onChange={(v) => set("card", v)}
                    />
                  </div>
                  {draft.card && (
                    <button title="Resetuj do auto" onClick={() => clearOptional("card")}
                      className="mt-5 text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {/* Accent */}
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <ColorField
                      label={`Akcent ${!draft.accent ? `(auto: ${darkenHex(draft.primary, 0.18)})` : ""}`}
                      value={draft.accent ?? darkenHex(draft.primary, 0.18)}
                      onChange={(v) => set("accent", v)}
                    />
                  </div>
                  {draft.accent && (
                    <button title="Resetuj do auto" onClick={() => clearOptional("accent")}
                      className="mt-5 text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {/* Rune */}
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <ColorField
                      label={`Runa ${!draft.rune ? `(auto: ${deriveRune(draft.primary)})` : ""}`}
                      value={draft.rune ?? deriveRune(draft.primary)}
                      onChange={(v) => set("rune", v)}
                    />
                  </div>
                  {draft.rune && (
                    <button title="Resetuj do auto" onClick={() => clearOptional("rune")}
                      className="mt-5 text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Live swatch preview */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5">Podgląd:</p>
            <div className="h-10 grid rounded overflow-hidden border border-border" style={{ gridTemplateColumns: `repeat(${swatchColors.length}, 1fr)` }}>
              {swatchColors.map((c, i) => (
                <div key={i} style={{ background: c }} title={c} />
              ))}
            </div>
            {/* Mini card mockup */}
            <div className="mt-2 rounded border p-3 flex items-center gap-3" style={{ background: filled.background, borderColor: filled.primary + "55" }}>
              <div className="h-8 w-8 rounded-full shrink-0 border-2" style={{ background: filled.card, borderColor: filled.rune }} />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: filled.rune }}>{draft.label}</p>
                <p className="text-[10px] truncate" style={{ color: filled.foreground + "99" }}>Podgląd tekstu postaci</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              const p: CustomPalette = { ...draft, id: `custom_${Date.now().toString(36)}` };
              onCreate(p);
              setOpen(false);
              setDraft({ id: "", label: "Mój motyw", background: "#0e0a07", foreground: "#f0e6d2", primary: "#cf9d7b" });
              setShowOptional(false);
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

/* ── Playlist Editor ──────────────────────────────────────── */
function PlaylistEditor({ playlist, onChange }: { playlist: string[]; onChange: (urls: string[]) => void }) {
  const [addUrl, setAddUrl] = useState("");

  const shortUrl = (t: string) => t.replace(/^https?:\/\/(www\.)?/, "").slice(0, 44);

  const add = () => {
    const t = addUrl.trim();
    if (!t || playlist.includes(t)) return;
    onChange([...playlist, t]);
    setAddUrl("");
  };

  const remove = (i: number) => onChange(playlist.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <Label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block">
        Playlista dodatkowa <span className="normal-case tracking-normal">({playlist.length} {playlist.length === 1 ? "utwór" : "utworów"})</span>
      </Label>

      {playlist.length > 0 && (
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {playlist.map((t, i) => (
            <div key={i} className="flex items-center gap-2 group rounded px-2 py-1 hover:bg-muted/40">
              <Music className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="flex-1 font-mono text-[10px] text-muted-foreground truncate">{shortUrl(t)}</span>
              <button onClick={() => remove(i)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                aria-label="Usuń utwór">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        <Input
          value={addUrl}
          onChange={(e) => setAddUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Dodaj URL YouTube / SoundCloud…"
          className="h-8 text-[10px] font-mono flex-1"
        />
        <Button size="sm" variant="outline" onClick={add} className="h-8 px-2 font-mono text-xs" aria-label="Dodaj">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
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
export const CardCustomizer = ({ character, update, customPalettes, addCustomPalette, removeCustomPalette, customFonts, onAddCustomFont, onRemoveCustomFont }: Props) => {
  const fonts = character.fonts ?? { display: character.font || "Pixelify Sans", body: "Cormorant Garamond", mono: "JetBrains Mono" };
  const currentFrame = character.frame ?? "pixel";
  const currentAvatarBorder = character.avatarBorder ?? "rune";
  const bgOpacity = character.bgOpacity ?? 65;

  useEffect(() => { loadFonts([fonts.display, fonts.body, fonts.mono]); }, [fonts.display, fonts.body, fonts.mono]);

  const allPalettes = useMemo(
    () => [
      ...BUILTIN_PALETTES,
      ...customPalettes.map((p) => {
        const filled = completePalette(p);
        return { id: p.id, label: p.label, swatch: `linear-gradient(135deg, ${filled.primary}, ${filled.rune})`, custom: true };
      }),
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
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Podgląd ramki:</p>
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
            <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-1 block">
              Typografia
            </Label>
            <p className="font-mono text-[9px] text-muted-foreground mb-4">
              Zmiana widoczna na żywo — nagłówki, tekst i etykiety można dobrać niezależnie.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              <FontSelect
                label="Nagłówki"
                hint="Imię postaci, tytuły sekcji"
                value={fonts.display}
                sampleText={character.name || "Nagłówek"}
                onChange={(v) => update({ font: v, fonts: { ...fonts, display: v } })}
                customFonts={customFonts}
              />
              <FontSelect
                label="Tekst"
                hint="Lore, dziennik, rękopis"
                value={fonts.body}
                sampleText={character.tagline || "Tekst narracji"}
                onChange={(v) => update({ fonts: { ...fonts, body: v } })}
                customFonts={customFonts}
              />
              <FontSelect
                label="Etykiety"
                hint="Tagi, chipsy, interfejs"
                value={fonts.mono}
                sampleText="LORE VAULT · UI"
                onChange={(v) => update({ fonts: { ...fonts, mono: v } })}
                customFonts={customFonts}
              />
            </div>

            {/* Custom font upload */}
            <div className="pt-2 border-t border-border/40">
              <CustomFontUpload customFonts={customFonts} onAdd={onAddCustomFont} onRemove={onRemoveCustomFont} />
            </div>

            {/* Combined live preview */}
            <div className="mt-4 vault-panel p-4 space-y-1">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Podgląd na żywo:</p>
              <p style={{ fontFamily: fontFamilyStack(fonts.display) }} className="text-2xl text-[hsl(var(--rune))] leading-tight">
                {character.name || "Imię Postaci"}
              </p>
              <p style={{ fontFamily: fontFamilyStack(fonts.body) }} className="text-base italic text-foreground/80 leading-snug">
                {character.tagline || "Tagline lub motto postaci, które opowiada jej historię."}
              </p>
              <p style={{ fontFamily: fontFamilyStack(fonts.mono) }} className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
                Lore Vault · Codex Terminal · {fonts.mono}
              </p>
            </div>
          </section>

          {/* ── Music ── */}
          <section className="pt-2 border-t border-border space-y-3">
            <Label className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] block">
              Muzyka w tle
            </Label>
            <p className="font-mono text-[9px] text-muted-foreground -mt-2">
              YouTube lub SoundCloud · odtwarzanie audio w tle bez wideo
            </p>

            {/* Primary URL */}
            <div>
              <Label htmlFor="music-url" className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">
                Główny link
              </Label>
              <Input
                id="music-url"
                defaultValue={character.musicUrl ?? ""}
                placeholder="https://www.youtube.com/watch?v=..."
                onBlur={(e) => update({ musicUrl: e.target.value || undefined })}
              />
            </div>

            {/* Playlist */}
            <PlaylistEditor
              playlist={character.musicPlaylist ?? []}
              onChange={(urls) => update({ musicPlaylist: urls })}
            />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
