import { Link } from "react-router-dom";
import { Trash2, User } from "lucide-react";
import { CSSProperties, useEffect } from "react";
import { Character } from "@/lib/vault-types";
import { Button } from "@/components/ui/button";
import { fontFamilyStack, loadFonts } from "@/lib/fontLoader";

interface Props {
  character: Character;
  onDelete: (id: string) => void;
}

export const CharacterCard = ({ character, onDelete }: Props) => {
  const { id, name, tagline, avatar, palette, animation, frame } = character;
  const f = character.fonts ?? { display: character.font, body: "Cormorant Garamond", mono: "JetBrains Mono" };

  useEffect(() => { loadFonts([f.display, f.body, f.mono]); }, [f.display, f.body, f.mono]);

  const fontStyle: CSSProperties = {
    ["--font-display" as any]: fontFamilyStack(f.display),
    ["--font-body" as any]: fontFamilyStack(f.body),
    ["--font-mono" as any]: fontFamilyStack(f.mono),
  };

  return (
    <article
      data-palette={palette}
      className={`relative bg-card text-card-foreground p-4 frame-${frame} group lv-card-scope`}
      style={fontStyle}
    >
      {/* Animation lives on an inner wrapper so transforms don't fight with hover styling. */}
      <div data-card-anim={animation} className="will-change-transform">
        <Link to={`/character/${id}`} className="block focus:outline-none" aria-label={`Otwórz kartę ${name}`}>
          <div className="aspect-[4/5] overflow-hidden mb-3 bg-muted relative">
            {avatar ? (
              <img
                src={avatar}
                alt={`Awatar ${name}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-muted-foreground">
                <User className="h-12 w-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
            <span className="absolute top-2 left-2 font-pixel text-[8px] uppercase px-1.5 py-1 bg-background/80 text-[hsl(var(--rune))] border border-[hsl(var(--rune)/0.5)]">
              {palette}
            </span>
          </div>
          <h2
            className="text-xl text-[hsl(var(--rune))] leading-tight line-clamp-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {name}
          </h2>
          <p
            className="text-sm italic text-muted-foreground mt-1 line-clamp-2"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {tagline}
          </p>
        </Link>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
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
            if (confirm(`Usunąć kartę „${name}”?`)) onDelete(id);
          }}
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  );
};
