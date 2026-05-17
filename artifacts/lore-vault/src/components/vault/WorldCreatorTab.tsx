import { useState } from "react";
import { Plus, Trash2, Globe, Users, X, ChevronDown, ChevronUp, User, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { World, Character } from "@/lib/vault-types";

interface Props {
  worlds: World[];
  characters: Character[];
  addWorld: (w: Omit<World, "id">) => void;
  updateWorld: (id: string, patch: Partial<World>) => void;
  deleteWorld: (id: string) => void;
}

function WorldCard({ world, characters, onUpdate, onDelete, onToggleChar }: {
  world: World;
  characters: Character[];
  onUpdate: (patch: Partial<World>) => void;
  onDelete: () => void;
  onToggleChar: (charId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const linkedChars = characters.filter((c) => world.characterIds.includes(c.id));
  const unlinkedChars = characters.filter((c) => !world.characterIds.includes(c.id));

  return (
    <article className="vault-panel p-4 space-y-3">
      <header className="flex items-start gap-3">
        <Globe className="h-4 w-4 text-[hsl(195,85%,60%)] mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {editing ? (
            <Input
              autoFocus
              defaultValue={world.name}
              onBlur={(e) => { onUpdate({ name: e.target.value }); setEditing(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              className="font-display text-lg h-8 px-2"
            />
          ) : (
            <h3
              className="font-display text-lg leading-tight text-[hsl(var(--rune))] cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setEditing(true)}
            >
              {world.name || "Nowy świat"}
            </h3>
          )}
          <Textarea
            defaultValue={world.description}
            onBlur={(e) => onUpdate({ description: e.target.value })}
            placeholder="Opis świata…"
            className="mt-1.5 text-sm bg-transparent border-transparent hover:border-border focus:border-border transition-colors resize-none min-h-0"
            rows={2}
          />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link
            to={`/world/${world.id}`}
            className="h-7 w-7 grid place-items-center rounded text-muted-foreground hover:text-[hsl(var(--rune))] transition-colors"
            title="Otwórz kartę świata"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Button
            size="icon" variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="h-7 w-7 text-muted-foreground"
            aria-label="Rozwiń"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="icon" variant="ghost"
            onClick={() => { if (confirm(`Usunąć świat „${world.name}"?`)) onDelete(); }}
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            aria-label="Usuń świat"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* Linked characters */}
      <div className="flex flex-wrap gap-2 items-center">
        {linkedChars.length === 0 ? (
          <span className="text-[11px] font-mono text-muted-foreground italic">Brak postaci</span>
        ) : (
          linkedChars.map((c) => (
            <button
              key={c.id}
              onClick={() => onToggleChar(c.id)}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-background/60 border border-border text-[11px] font-mono hover:border-destructive/60 hover:text-destructive transition-colors group"
              title="Kliknij, aby odłączyć"
            >
              {c.avatar
                ? <img src={c.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                : <User className="h-3 w-3" />}
              {c.name}
              <X className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))
        )}
      </div>

      {/* Expandable: add characters */}
      {expanded && unlinkedChars.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Dodaj postać:</p>
          <div className="flex flex-wrap gap-2">
            {unlinkedChars.map((c) => (
              <button
                key={c.id}
                onClick={() => onToggleChar(c.id)}
                className="flex items-center gap-1.5 px-2 py-1 rounded border border-dashed border-border text-[11px] font-mono hover:border-[hsl(var(--rune))] hover:text-[hsl(var(--rune))] transition-colors"
              >
                <Plus className="h-3 w-3" />
                {c.avatar && <img src={c.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />}
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export const WorldCreatorTab = ({ worlds, characters, addWorld, updateWorld, deleteWorld }: Props) => {
  const handleToggleChar = (worldId: string, charId: string, current: string[]) => {
    const next = current.includes(charId)
      ? current.filter((id) => id !== charId)
      : [...current, charId];
    updateWorld(worldId, { characterIds: next });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[hsl(195,85%,60%)] font-mono">
          <Globe className="h-4 w-4" />
          Światy
          <span className="text-muted-foreground">({worlds.length})</span>
        </div>
        <Button
          size="sm" variant="outline" className="font-mono uppercase text-xs"
          onClick={() => addWorld({ name: "Nowy świat", description: "", characterIds: [] })}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />Stwórz świat
        </Button>
      </div>

      {worlds.length === 0 ? (
        <div className="vault-panel p-10 text-center">
          <p className="font-pixel text-2xl text-[hsl(195,85%,60%)] mb-3">◈</p>
          <p className="font-display text-xl">Brak światów</p>
          <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
            Stwórz świat, aby grupować postacie i budować siatkę połączeń w zakładce Powiązania.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {worlds.map((w) => (
            <WorldCard
              key={w.id}
              world={w}
              characters={characters}
              onUpdate={(patch) => updateWorld(w.id, patch)}
              onDelete={() => deleteWorld(w.id)}
              onToggleChar={(charId) => handleToggleChar(w.id, charId, w.characterIds)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
