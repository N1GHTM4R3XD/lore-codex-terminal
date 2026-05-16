import { useState } from "react";
import { Plus, Trash2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VaultState } from "@/lib/vault-types";

interface Props { state: VaultState; update: (p: Partial<VaultState>) => void }

export const MoodboardTab = ({ state, update }: Props) => {
  const [url, setUrl] = useState("");

  const add = () => {
    if (!url.trim()) return;
    update({ moodboard: [{ id: crypto.randomUUID(), url: url.trim() }, ...state.moodboard] });
    setUrl("");
  };
  const remove = (id: string) => update({ moodboard: state.moodboard.filter((m) => m.id !== id) });

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <ImagePlus className="h-5 w-5 text-[hsl(var(--rune))]" />
          Moodboard
        </h2>
      </header>

      <div className="vault-panel p-4 flex gap-2 flex-wrap">
        <Input
          placeholder="Wklej URL obrazu..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="flex-1 min-w-[240px] font-mono text-sm"
        />
        <Button onClick={add} className="font-mono uppercase text-xs">
          <Plus className="h-3.5 w-3.5 mr-1.5" />Dodaj
        </Button>
      </div>

      {state.moodboard.length === 0 ? (
        <p className="italic text-muted-foreground text-center py-12">Brak obrazów w tablicy nastrojów.</p>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {state.moodboard.map((m) => (
            <figure key={m.id} className="vault-panel corner-frame group relative overflow-hidden aspect-[4/5] animate-scale-in">
              <img
                src={m.url}
                alt={m.caption || "Moodboard"}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
              <button
                onClick={() => remove(m.id)}
                className="absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full bg-background/70 backdrop-blur border border-border opacity-0 group-hover:opacity-100 transition hover:text-destructive"
                aria-label="Usuń obraz"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
};
