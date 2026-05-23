import { Link } from "react-router-dom";
import { Trash2, User, Globe } from "lucide-react";
import { CSSProperties, useEffect } from "react";
import { Character, AvatarBorderStyle, World } from "@/lib/vault-types";
import { Button } from "@/components/ui/button";
import { fontFamilyStack, loadFonts } from "@/lib/fontLoader";
import { cn } from "@/lib/utils";

interface Props {
  character: Character;
  worlds?: World[];
  onDelete: (id: string) => void;
}

const FRAME_CLASS: Record<Character["frame"], string> = {
  pixel:    "frame-pixel",
  ornament: "frame-ornament",
  neon:     "frame-neon",
  parchment:"frame-parchment",
  none:     "frame-none",
  arcane:   "frame-arcane",
  gothic:   "frame-gothic",
  circuit:  "frame-circuit",
  minimal:  "frame-minimal",
};

export const AVATAR_BORDER_CLASS: Record<AvatarBorderStyle, string> = {
  rune:   "border-2 border-[hsl(var(--rune))] shadow-[0_0_8px_hsl(var(--rune)/0.5)]",
  double: "border-2 border-[hsl(var(--rune))] ring-2 ring-[hsl(var(--rune)/0.35)] ring-offset-2 ring-offset-card",
  glow:   "border-2 border-[hsl(var(--rune))] shadow-[0_0_20px_hsl(var(--rune)/0.7),0_0_40px_hsl(var(--rune)/0.3)]",
  pixel:  "border-[3px] border-[hsl(var(--rune))] rounded-none shadow-[3px_3px_0_hsl(var(--vault-deep))]",
  none:   "",
  thin:   "border border-[hsl(var(--rune)/0.4)]",
  ornate: "border-2 border-[hsl(var(--rune))] shadow-[0_0_0_5px_hsl(var(--rune)/0.18),0_0_0_8px_hsl(var(--rune)/0.08)]",
};

export const CharacterCard = ({ character, worlds, onDelete }: Props) => {
  const { id, name, tagline, avatar, palette, animation, frame } = character;
  const world = worlds?.find((w) => w.characterIds?.includes(id));
  const f = character.fonts ?? { display: character.font, body: "Cormorant Garamond", mono: "JetBrains Mono" };
  const avatarBorder = character.avatarBorder ?? "rune";
  const bgOpacity = (character.bgOpacity ?? 65) / 100;

  useEffect(() => { loadFonts([f.display, f.body, f.mono]); }, [f.display, f.body, f.mono]);

  const fontStyle: CSSProperties = {
    ["--font-display" as any]: fontFamilyStack(f.display),
    ["--font-body" as any]: fontFamilyStack(f.body),
    ["--font-mono" as any]: fontFamilyStack(f.mono),
  };

  return (
    <article
      data-palette={palette}
      className={`relative bg-card text-card-foreground ${FRAME_CLASS[frame]} group lv-card-scope`}
      style={fontStyle}
    >
      <div data-card-anim={animation} className="will-change-transform">
        <Link to={`/character/${id}`} className="block focus:outline-none" aria-label={`Otwórz kartę ${name}`}>

          {/* ── Image / background section ── */}
          <div className="aspect-[4/5] relative overflow-hidden">

            {/* Layer 1: base card colour */}
            <div className="absolute inset-0 bg-muted" />

            {/* Layer 2: background image with opacity */}
            {character.background && (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url("${character.background}")`,
                  opacity: bgOpacity,
                }}
              />
            )}

            {/* Layer 3: vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />

            {/* Layer 4: avatar centred */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pb-10">
              <div className={cn(
                "relative overflow-hidden flex-shrink-0 transition-transform duration-700 group-hover:scale-[1.04]",
                avatarBorder === "pixel" ? "rounded-none" : "rounded-full",
                "h-28 w-28",
                AVATAR_BORDER_CLASS[avatarBorder],
              )}>
                {avatar
                  ? <img src={avatar} alt={`Awatar ${name}`} loading="lazy" className="h-full w-full object-cover" />
                  : <div className="h-full w-full grid place-items-center bg-card/60 text-muted-foreground"><User className="h-10 w-10" /></div>
                }
              </div>
            </div>

            {/* Layer 5: name + tagline at bottom */}
            <div className="absolute bottom-0 inset-x-0 px-4 pb-3 pt-12 bg-gradient-to-t from-card/95 to-transparent">
              <h2
                className="text-xl text-[hsl(var(--rune))] leading-tight line-clamp-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {name}
              </h2>
              <p
                className="text-sm italic text-muted-foreground mt-0.5 line-clamp-1"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {tagline}
              </p>
            </div>

            {/* World badge */}
            {world && (
              <span className="absolute top-2 left-2 font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 bg-background/80 text-[hsl(195,85%,60%)] border border-[hsl(195,85%,60%)/0.5] flex items-center gap-1">
                <Globe className="h-2.5 w-2.5" />{world.name}
              </span>
            )}

            {/* Palette badge */}
            <span className="absolute top-2 right-2 font-pixel text-[8px] uppercase px-1.5 py-1 bg-background/80 text-[hsl(var(--rune))] border border-[hsl(var(--rune)/0.5)]">
              {palette}
            </span>
          </div>
        </Link>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <span
          className="text-[10px] uppercase tracking-widest text-muted-foreground"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {animation === "none" ? "—" : animation}
        </span>
        <Button
          size="icon"
          variant="ghost"
          aria-label={`Usuń ${name}`}
          onClick={(e) => {
            e.preventDefault();
            if (confirm(`Usunąć kartę „${name}"?`)) onDelete(id);
          }}
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  );
};
