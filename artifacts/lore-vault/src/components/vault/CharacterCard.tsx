import { Link } from "react-router-dom";
import { Trash2, User, Globe, Link2 } from "lucide-react";
import { CSSProperties, useEffect } from "react";
import { Character, AvatarBorderStyle, World } from "@/lib/vault-types";
import { Button } from "@/components/ui/button";
import { fontFamilyStack, loadFonts } from "@/lib/fontLoader";
import { cn } from "@/lib/utils";

interface Props {
  character: Character;
  worlds?: World[];
  onDelete: (id: string) => void;
  onDragStart?: (id: string) => void;
  onDropChar?: (targetId: string) => void;
  dragOverId?: string | null;
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
  chain:    "frame-chain",
  flame:    "frame-flame",
  ice:      "frame-ice",
  vines:    "frame-vines",
  crown:    "frame-crown",
  diamond:  "frame-diamond",
  shadow:   "frame-shadow",
  tapestry: "frame-tapestry",
};

export const AVATAR_BORDER_CLASS: Record<AvatarBorderStyle, string> = {
  rune:     "border-2 border-[hsl(var(--rune))] shadow-[0_0_8px_hsl(var(--rune)/0.5)]",
  double:   "border-2 border-[hsl(var(--rune))] ring-2 ring-[hsl(var(--rune)/0.35)] ring-offset-2 ring-offset-card",
  glow:     "border-2 border-[hsl(var(--rune))] shadow-[0_0_20px_hsl(var(--rune)/0.7),0_0_40px_hsl(var(--rune)/0.3)]",
  pixel:    "border-[3px] border-[hsl(var(--rune))] rounded-none shadow-[3px_3px_0_hsl(var(--vault-deep))]",
  none:     "",
  thin:     "border border-[hsl(var(--rune)/0.4)]",
  ornate:   "border-2 border-[hsl(var(--rune))] shadow-[0_0_0_5px_hsl(var(--rune)/0.18),0_0_0_8px_hsl(var(--rune)/0.08)]",
  chain:    "border-2 border-[hsl(var(--rune))] shadow-[inset_0_0_0_4px_hsl(var(--rune)/0.12),0_0_12px_hsl(var(--rune)/0.5)]",
  flame:    "border-2 border-[hsl(var(--primary))] shadow-[0_0_16px_hsl(var(--primary)/0.6),0_0_32px_hsl(var(--accent)/0.3)]",
  ice:      "border-2 border-[hsl(195,85%,70%)] shadow-[0_0_14px_hsla(195,80%,70%,0.5),0_0_28px_hsla(200,80%,80%,0.25)]",
  crown:    "border-2 border-[hsl(var(--rune))] shadow-[0_0_0_3px_hsl(var(--rune)/0.2),0_-4px_12px_hsl(var(--rune)/0.4)]",
  starburst:"border-2 border-[hsl(var(--rune))] shadow-[0_0_12px_hsl(var(--rune)/0.6),0_0_24px_hsl(var(--primary)/0.3)]",
  feather:  "border border-[hsl(var(--rune)/0.6)] shadow-[0_4px_14px_hsl(var(--rune)/0.25)]",
  diamond:  "border-[3px] border-[hsl(var(--rune))] shadow-[0_0_10px_hsl(var(--rune)/0.5)]",
  thorn:    "border-2 border-[hsl(var(--accent))] shadow-[0_0_10px_hsl(var(--accent)/0.5),0_0_20px_hsl(var(--accent)/0.2)]",
  aura:     "border-0 shadow-[0_0_0_4px_hsl(var(--rune)/0.35),0_0_0_8px_hsl(var(--rune)/0.15),0_0_24px_hsl(var(--rune)/0.4)]",
};

export const CharacterCard = ({ character, worlds, onDelete, onDragStart, onDropChar, dragOverId }: Props) => {
  const { id, name, tagline, avatar, palette, animation, frame } = character;
  const world = worlds?.find((w) => w.characterIds?.includes(id));
  const f = character.fonts ?? { display: character.font, body: "Cormorant Garamond", mono: "JetBrains Mono" };
  const avatarBorder = character.avatarBorder ?? "rune";
  const isDragOver = dragOverId === id;

  useEffect(() => { loadFonts([f.display, f.body, f.mono]); }, [f.display, f.body, f.mono]);

  const fontStyle: CSSProperties = {
    ["--font-display" as any]: fontFamilyStack(f.display),
    ["--font-body" as any]: fontFamilyStack(f.body),
    ["--font-mono" as any]: fontFamilyStack(f.mono),
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/char-id", id);
    e.dataTransfer.effectAllowed = "link";
    onDragStart?.(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "link";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/char-id");
    if (sourceId && sourceId !== id) {
      onDropChar?.(id);
    }
  };

  return (
    <article
      data-palette={palette}
      className={cn(
        "relative overflow-hidden group transition-all duration-200 bg-[hsl(var(--background))]",
        isDragOver && "ring-2 ring-[hsl(var(--rune))] ring-offset-2 ring-offset-background scale-[1.01] z-20"
      )}
      style={fontStyle}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* ── Background image full bleed ── */}
      <div className="absolute inset-0 z-0">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-[hsl(var(--card))]" />
        )}
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
      </div>

      {/* ── Horizontal banner content ── */}
      <div className="relative z-10 aspect-[16/7] flex flex-col">

        {/* Inner frame overlay — uses palette-scoped CSS vars for color */}
        <div
          className={cn(
            "absolute inset-2 pointer-events-none z-20",
            FRAME_CLASS[frame],
            // Override bg-based frame styles to be transparent since image is behind
            "!bg-transparent"
          )}
          aria-hidden
        />

        <Link
          to={`/character/${id}`}
          className="flex-1 flex items-center gap-4 px-5 py-3 focus:outline-none"
          aria-label={`Otwórz kartę ${name}`}
        >
          {/* Avatar circle */}
          <div className={cn(
            "shrink-0 h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden",
            avatarBorder !== "pixel" ? "rounded-full" : "rounded-none",
            AVATAR_BORDER_CLASS[avatarBorder],
          )}>
            {avatar ? (
              <img src={avatar} alt={`Awatar ${name}`} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center bg-[hsl(var(--card)/0.5)]">
                <User className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
              </div>
            )}
          </div>

          {/* Name + tagline */}
          <div className="flex-1 min-w-0">
            <h2
              className="leading-tight line-clamp-1 drop-shadow-lg"
              style={{
                fontFamily: "var(--font-display)",
                color: "hsl(var(--rune))",
                textShadow: "0 2px 12px rgba(0,0,0,0.8)",
                fontSize: "clamp(0.95rem, 2.5vw, 1.3rem)",
                lineHeight: 1.2,
              }}
            >
              {name}
            </h2>
            {tagline && (
              <p
                className="italic mt-0.5 line-clamp-1 drop-shadow"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "rgba(255,255,255,0.72)",
                  textShadow: "0 1px 6px rgba(0,0,0,0.7)",
                  fontSize: "clamp(0.72rem, 1.8vw, 0.85rem)",
                }}
              >
                {tagline}
              </p>
            )}
            {/* World + animation badges */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {world && (
                <span className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 bg-black/50 text-[hsl(195,85%,65%)] border border-[hsl(195,85%,60%)/0.4] backdrop-blur-sm rounded-sm">
                  <Globe className="h-2.5 w-2.5" />{world.name}
                </span>
              )}
              {animation !== "none" && (
                <span className="font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 bg-black/50 text-[hsl(var(--rune)/0.8)] border border-[hsl(var(--rune)/0.25)] backdrop-blur-sm rounded-sm">
                  {animation}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Drag handle */}
        {onDragStart && (
          <div
            draggable
            onDragStart={handleDragStart}
            onClick={(e) => e.preventDefault()}
            className="absolute top-2 right-10 z-30 h-6 w-6 rounded-full bg-black/60 border border-[hsl(var(--rune)/0.5)] grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:border-[hsl(var(--rune))] hover:scale-110"
            title="Przeciągnij, aby połączyć z inną postacią"
          >
            <Link2 className="h-3 w-3 text-[hsl(var(--rune))]" />
          </div>
        )}

        {/* Delete button */}
        <div className="absolute bottom-2 right-3 z-30">
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Usuń ${name}`}
            onClick={(e) => {
              e.preventDefault();
              if (confirm(`Usunąć kartę „${name}"?`)) onDelete(id);
            }}
            className="h-7 w-7 bg-black/40 text-white/50 hover:text-red-400 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
};
