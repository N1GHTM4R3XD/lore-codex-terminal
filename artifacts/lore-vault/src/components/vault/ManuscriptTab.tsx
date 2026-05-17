import { useMemo, useRef, useState } from "react";
import { Feather, Eye, Pencil, Plus, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VaultState, ManuscriptChapter } from "@/lib/vault-types";
import { renderLore } from "@/lib/loreParser";
import { cn } from "@/lib/utils";

interface Props { state: VaultState; update: (p: Partial<VaultState>) => void }

function makeChapter(name: string, content = ""): ManuscriptChapter {
  return { id: `ch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`, name, content };
}

/** Derive the chapter list: fall back to legacy `manuscript` string if needed. */
function useChapters(state: VaultState) {
  return useMemo<ManuscriptChapter[]>(() => {
    if (state.manuscriptChapters && state.manuscriptChapters.length > 0) {
      return state.manuscriptChapters;
    }
    return [makeChapter("Rozdział I", state.manuscript ?? "")];
  }, [state.manuscriptChapters, state.manuscript]);
}

export const ManuscriptTab = ({ state, update }: Props) => {
  const chapters = useChapters(state);
  const [activeId, setActiveId] = useState<string>(chapters[0].id);
  const [mode, setMode] = useState<"edit" | "read">("edit");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);

  const activeChapter = chapters.find((c) => c.id === activeId) ?? chapters[0];

  /* ── chapter mutations ── */
  const saveChapters = (next: ManuscriptChapter[]) =>
    update({ manuscriptChapters: next });

  const addChapter = () => {
    const ch = makeChapter(`Rozdział ${chapters.length + 1}`);
    saveChapters([...chapters, ch]);
    setActiveId(ch.id);
    setMode("edit");
  };

  const deleteChapter = (id: string) => {
    if (chapters.length <= 1) return;
    const target = chapters.find((c) => c.id === id);
    if (!confirm(`Usunąć rozdział „${target?.name ?? id}"?`)) return;
    const next = chapters.filter((c) => c.id !== id);
    saveChapters(next);
    if (activeId === id) setActiveId(next[next.length - 1].id);
  };

  const updateContent = (id: string, content: string) =>
    saveChapters(chapters.map((c) => (c.id === id ? { ...c, content } : c)));

  const startRename = (ch: ManuscriptChapter) => {
    setRenamingId(ch.id);
    setRenameVal(ch.name);
    setTimeout(() => renameRef.current?.select(), 0);
  };

  const commitRename = () => {
    if (!renamingId) return;
    const name = renameVal.trim() || "Rozdział";
    saveChapters(chapters.map((c) => (c.id === renamingId ? { ...c, name } : c)));
    setRenamingId(null);
  };

  /* ── stats ── */
  const { words, chars } = useMemo(() => {
    const t = activeChapter.content.trim();
    return { words: t ? t.split(/\s+/).length : 0, chars: t.length };
  }, [activeChapter.content]);

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <Feather className="h-5 w-5 text-[hsl(var(--rune))]" />
          Manuskrypt
        </h2>
        <div className="flex items-center gap-4">
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <span className="text-[hsl(var(--rune))]">{words}</span> słów ·{" "}
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

      {/* ── chapter tab strip ── */}
      <div className="flex items-stretch gap-1 overflow-x-auto pb-0 border-b border-border">
        {chapters.map((ch) => {
          const isActive = ch.id === activeId;
          const isRenaming = renamingId === ch.id;
          return (
            <div
              key={ch.id}
              className={cn(
                "group flex items-center gap-1 px-3 py-2 border-b-2 text-sm font-mono whitespace-nowrap cursor-pointer transition-colors select-none min-w-0 flex-shrink-0",
                isActive
                  ? "border-b-[hsl(var(--rune))] text-[hsl(var(--rune))] bg-[hsl(var(--rune)/0.05)]"
                  : "border-b-transparent text-muted-foreground hover:text-foreground hover:border-b-[hsl(var(--rune)/0.3)]"
              )}
              onClick={() => { if (!isRenaming) { setActiveId(ch.id); setMode("edit"); } }}
            >
              {isRenaming ? (
                <form
                  className="flex items-center gap-1"
                  onSubmit={(e) => { e.preventDefault(); commitRename(); }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Input
                    ref={renameRef}
                    value={renameVal}
                    onChange={(e) => setRenameVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Escape") setRenamingId(null); }}
                    className="h-6 w-32 text-xs font-mono py-0 px-1"
                  />
                  <button type="submit" className="text-[hsl(var(--rune))] hover:opacity-80">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => setRenamingId(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : (
                <>
                  <span className="truncate max-w-[120px]">{ch.name}</span>
                  <span
                    className={cn("flex items-center gap-0.5 transition-opacity", isActive ? "opacity-60" : "opacity-0 group-hover:opacity-60")}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      title="Zmień nazwę"
                      onClick={() => startRename(ch)}
                      className="hover:text-[hsl(var(--rune))] p-0.5"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    {chapters.length > 1 && (
                      <button
                        title="Usuń rozdział"
                        onClick={() => deleteChapter(ch.id)}
                        className="hover:text-destructive p-0.5"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                </>
              )}
            </div>
          );
        })}

        {/* add chapter */}
        <button
          onClick={addChapter}
          title="Nowy rozdział"
          className="flex items-center gap-1 px-3 py-2 border-b-2 border-b-transparent text-muted-foreground hover:text-[hsl(var(--rune))] hover:border-b-[hsl(var(--rune)/0.3)] font-mono text-xs transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Nowy
        </button>
      </div>

      {/* ── editor / reader ── */}
      <div className="vault-panel corner-frame p-6 md:p-10 min-h-[60vh]">
        {mode === "edit" ? (
          <Textarea
            key={activeChapter.id}
            value={activeChapter.content}
            onChange={(e) => updateContent(activeChapter.id, e.target.value)}
            placeholder={`${activeChapter.name} — zacznij pisać...`}
            className="min-h-[55vh] font-body text-lg leading-relaxed bg-background/40 resize-y"
          />
        ) : (
          <article className="lore-prose font-body text-lg leading-relaxed max-w-3xl mx-auto animate-fade-in">
            {activeChapter.content.trim()
              ? renderLore(activeChapter.content, state.entities)
              : <p className="text-muted-foreground italic text-center">Pusta strona oczekuje pióra.</p>
            }
          </article>
        )}
      </div>
    </section>
  );
};
