import { Globe, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { World, Character } from "@/lib/vault-types";

interface Props {
  world: World;
  characters: Character[];
  onDelete: (id: string) => void;
}

export const WorldCard = ({ world, characters, onDelete }: Props) => {
  const worldChars = characters.filter((c) => world.characterIds.includes(c.id));

  return (
    <div className="vault-panel group relative overflow-hidden hover:border-[hsl(var(--rune)/0.5)] transition-colors">
      <Link to={`/world/${world.id}`} className="block focus:outline-none" aria-label={`Otwórz świat ${world.name}`}>
        {/* Image / placeholder */}
        <div className="aspect-[5/3] overflow-hidden relative bg-muted">
          {world.imageUrl ? (
            <img
              src={world.imageUrl}
              alt={world.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full grid place-items-center bg-gradient-to-br from-[hsl(195,85%,8%)] to-[hsl(270,70%,7%)]">
              <Globe className="h-10 w-10 text-[hsl(195,85%,40%)] opacity-40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />

          {/* Avatar cluster */}
          {worldChars.length > 0 && (
            <div className="absolute bottom-2 left-2 flex -space-x-2">
              {worldChars.slice(0, 5).map((c) =>
                c.avatar ? (
                  <img
                    key={c.id}
                    src={c.avatar}
                    alt={c.name}
                    title={c.name}
                    className="h-7 w-7 rounded-full object-cover border-2 border-card"
                  />
                ) : (
                  <div
                    key={c.id}
                    className="h-7 w-7 rounded-full bg-muted border-2 border-card grid place-items-center"
                    title={c.name}
                  >
                    <Users className="h-3 w-3 text-muted-foreground" />
                  </div>
                ),
              )}
              {worldChars.length > 5 && (
                <div className="h-7 w-7 rounded-full bg-background border-2 border-card grid place-items-center font-mono text-[9px] text-muted-foreground">
                  +{worldChars.length - 5}
                </div>
              )}
            </div>
          )}

          {/* Character count badge */}
          <span className="absolute top-2 right-2 font-mono text-[9px] uppercase px-2 py-1 bg-background/80 text-[hsl(195,85%,60%)] border border-[hsl(195,85%,60%)/0.4] flex items-center gap-1">
            <Users className="h-2.5 w-2.5" />
            {worldChars.length}
          </span>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            {world.imageUrl && (
              <img
                src={world.imageUrl}
                alt=""
                className="h-6 w-6 rounded-full object-cover border border-border shrink-0"
              />
            )}
            <h3 className="font-display text-[1.15rem] leading-snug group-hover:text-[hsl(var(--rune))] transition-colors">
              {world.name}
            </h3>
          </div>
          {world.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {world.description}
            </p>
          )}
        </div>
      </Link>

      {/* Delete */}
      <button
        onClick={(e) => {
          e.preventDefault();
          if (confirm(`Usunąć świat „${world.name}"?\nPowiązania z postaciami zostaną usunięte.`))
            onDelete(world.id);
        }}
        className="absolute top-2 left-2 z-10 h-6 w-6 bg-background/90 border border-border rounded-full grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
        aria-label={`Usuń świat ${world.name}`}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
};
