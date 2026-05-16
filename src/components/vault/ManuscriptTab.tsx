import { useMemo, useState } from "react";
import { Feather, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VaultState } from "@/lib/vault-types";
import { renderLore } from "@/lib/loreParser";

interface Props { state: VaultState; update: (p: Partial<VaultState>) => void }

export const ManuscriptTab = ({ state, update }: Props) => {
  const [mode, setMode] = useState<"read" | "edit">("edit");
  const { words, chars } = useMemo(() => {
    const t = state.manuscript.trim();
    return { words: t ? t.split(/\s+/).length : 0, chars: t.length };
  }, [state.manuscript]);

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <Feather className="h-5 w-5 text-[hsl(var(--rune))]" />
          Manuskrypt
        </h2>
        <div className="flex items-center gap-4">
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <span className="text-[hsl(var(--rune))]">{words}</span> słów ·
            <span className="text-[hsl(var(--rune))] ml-1">{chars}</span> znaków
          </div>
          <Button size="sm" variant={mode === "read" ? "default" : "outline"} onClick={() => setMode("read")} className="font-mono uppercase text-xs">
            <Eye className="h-3.5 w-3.5 mr-1.5" />Czytaj
          </Button>
          <Button size="sm" variant={mode === "edit" ? "default" : "outline"} onClick={() => setMode("edit")} className="font-mono uppercase text-xs">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />Pisz
          </Button>
        </div>
      </header>

      <div className="vault-panel corner-frame p-6 md:p-10 min-h-[60vh]">
        {mode === "edit" ? (
          <Textarea
            value={state.manuscript}
            onChange={(e) => update({ manuscript: e.target.value })}
            placeholder="Rozdział I — ..."
            className="min-h-[55vh] font-body text-lg leading-relaxed bg-background/40 resize-y"
          />
        ) : (
          <article className="lore-prose font-body text-lg leading-relaxed max-w-3xl mx-auto animate-fade-in">
            {state.manuscript.trim()
              ? renderLore(state.manuscript, state.entities)
              : <p className="text-muted-foreground italic text-center">Pusta strona oczekuje pióra.</p>}
          </article>
        )}
      </div>
    </section>
  );
};
