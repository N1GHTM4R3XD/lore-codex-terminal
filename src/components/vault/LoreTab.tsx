import { useMemo, useState } from "react";
import { BookOpen, Eye, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Entity, VaultState } from "@/lib/vault-types";
import { detectProperNouns, renderLore } from "@/lib/loreParser";
import { toast } from "@/hooks/use-toast";

interface Props {
  state: VaultState;
  update: (p: Partial<VaultState>) => void;
  onEntity: (name: string) => void;
}

export const LoreTab = ({ state, update, onEntity }: Props) => {
  const [mode, setMode] = useState<"read" | "edit">("read");

  const detected = useMemo(
    () => detectProperNouns(state.lore, state.entities.map((e) => e.name)),
    [state.lore, state.entities],
  );

  const addAllDetected = () => {
    if (!detected.length) return;
    const next: Entity[] = detected.map((name) => ({
      id: crypto.randomUUID(),
      name,
      type: "Nieznane",
      description: "Auto-wykryty rzeczownik własny. Uzupełnij opis w Encyklopedii.",
    }));
    update({ entities: [...state.entities, ...next] });
    toast({ title: "Dodano do Encyklopedii", description: `${next.length} nowych haseł` });
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr,320px]">
      <div className="vault-panel corner-frame p-6 md:p-10 min-h-[60vh]">
        <header className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h2 className="font-display text-2xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[hsl(var(--rune))]" />
            Kodeks Lore
          </h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === "read" ? "default" : "outline"}
              onClick={() => setMode("read")}
              className="font-mono uppercase text-xs"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />Czytaj
            </Button>
            <Button
              size="sm"
              variant={mode === "edit" ? "default" : "outline"}
              onClick={() => setMode("edit")}
              className="font-mono uppercase text-xs"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />Edytuj
            </Button>
          </div>
        </header>

        {mode === "read" ? (
          <article className="lore-prose font-body text-lg leading-relaxed max-w-3xl animate-fade-in">
            {state.lore.trim()
              ? renderLore(state.lore, state.entities, onEntity)
              : <p className="text-muted-foreground italic">Pusty pergamin. Przejdź do trybu edycji.</p>}
          </article>
        ) : (
          <Textarea
            value={state.lore}
            onChange={(e) => update({ lore: e.target.value })}
            placeholder="Spisuj lore... Używaj [[Wiki Linków]], **pogrubienia**, *kursywy*, > cytatów, # nagłówków."
            className="min-h-[55vh] font-body text-base leading-relaxed bg-background/40 resize-y"
          />
        )}
      </div>

      <aside className="space-y-4">
        <div className="vault-panel p-5">
          <h3 className="font-display text-sm uppercase tracking-widest text-[hsl(var(--rune))] mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Auto-wykrycie
          </h3>
          {detected.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Brak nowych rzeczowników własnych.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5 mb-3 max-h-40 overflow-auto">
                {detected.map((d) => (
                  <span key={d} className="text-xs font-mono px-2 py-1 rounded border border-border bg-muted/40">
                    {d}
                  </span>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={addAllDetected} className="w-full font-mono uppercase text-xs">
                Dodaj do Encyklopedii ({detected.length})
              </Button>
            </>
          )}
        </div>

        <div className="vault-panel p-5">
          <h3 className="font-display text-sm uppercase tracking-widest text-[hsl(var(--rune))] mb-3">Składnia</h3>
          <ul className="text-sm space-y-1.5 font-mono text-muted-foreground">
            <li><span className="text-[hsl(var(--rune))]">[[Nazwa]]</span> — wiki-link</li>
            <li><span className="text-[hsl(var(--rune))]">**tekst**</span> — pogrubienie</li>
            <li><span className="text-[hsl(var(--rune))]">*tekst*</span> — kursywa</li>
            <li><span className="text-[hsl(var(--rune))]">&gt; cytat</span> — blokowy cytat</li>
            <li><span className="text-[hsl(var(--rune))]"># nagłówek</span> — h1/h2/h3</li>
          </ul>
        </div>
      </aside>
    </section>
  );
};
