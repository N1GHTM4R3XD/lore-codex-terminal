import { Link } from "react-router-dom";
import { Trash2, User } from "lucide-react";
import { Character } from "@/lib/vault-types";
import { Button } from "@/components/ui/button";

interface Props {
  character: Character;
  onDelete: (id: string) => void;
}

export const CharacterCard = ({ character, onDelete }: Props) => {
  const { id, name, tagline, avatar, palette, animation, frame, font } = character;

  return (
    <article
      data-palette={palette}
      data-card-anim={animation}
      data-card-font={font}
      className={`group relative bg-card text-card-foreground p-4 frame-${frame} transition-transform hover:-translate-y-1`}
    >
      <Link to={`/character/${id}`} className="block focus:outline-none" aria-label={`Otwórz kartę ${name}`}>
        <div className="aspect-[4/5] overflow-hidden mb-3 bg-muted relative">
          {avatar ? (
            <img
              src={avatar}
              alt={`Awatar ${name}`}
              loading="lazy"
              className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                font === "pixel" ? "pixelated" : ""
              }`}
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
        <h2 className="card-display text-xl text-[hsl(var(--rune))] leading-tight line-clamp-2">
          {name}
        </h2>
        <p className="text-sm italic text-muted-foreground mt-1 line-clamp-2">{tagline}</p>
      </Link>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
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
