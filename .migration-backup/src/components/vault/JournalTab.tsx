import { useState } from "react";
import { Plus, Trash2, ScrollText, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JournalEntry, VaultState } from "@/lib/vault-types";

interface Props { state: VaultState; update: (p: Partial<VaultState>) => void }

export const JournalTab = ({ state, update }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<JournalEntry | null>(null);

  const startNew = () => {
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      title: "",
      body: "",
    };
    setDraft(entry);
    setEditingId(entry.id);
  };

  const save = () => {
    if (!draft) return;
    const exists = state.journal.find((j) => j.id === draft.id);
    const next = exists
      ? state.journal.map((j) => (j.id === draft.id ? draft : j))
      : [draft, ...state.journal];
    update({ journal: next });
    setEditingId(null);
    setDraft(null);
  };

  const remove = (id: string) => update({ journal: state.journal.filter((j) => j.id !== id) });
  const beginEdit = (e: JournalEntry) => { setDraft({ ...e }); setEditingId(e.id); };

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-[hsl(var(--rune))]" />
          Dziennik Wędrowca
        </h2>
        <Button onClick={startNew} size="sm" className="font-mono uppercase text-xs">
          <Plus className="h-3.5 w-3.5 mr-1.5" />Nowy wpis
        </Button>
      </header>

      {editingId && draft && (
        <div className="vault-panel corner-frame p-6 animate-fade-in space-y-3">
          <div className="flex gap-3 flex-wrap">
            <Input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className="w-44 font-mono"
            />
            <Input
              placeholder="Tytuł wpisu"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="flex-1 font-display"
            />
          </div>
          <Textarea
            placeholder="Treść wpisu..."
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            className="min-h-[180px] font-body"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={save} className="font-mono uppercase text-xs">
              <Save className="h-3.5 w-3.5 mr-1.5" />Zapisz
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setDraft(null); }} className="font-mono uppercase text-xs">
              <X className="h-3.5 w-3.5 mr-1.5" />Anuluj
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {state.journal.length === 0 && !editingId && (
          <p className="italic text-muted-foreground col-span-full text-center py-12">
            Karty dziennika są jeszcze puste...
          </p>
        )}
        {state.journal.map((entry) => (
          <article
            key={entry.id}
            className="vault-panel p-5 group animate-fade-in cursor-pointer hover:border-[hsl(var(--rune)/0.6)] transition"
            onClick={() => beginEdit(entry)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))]">{entry.date}</p>
                <h3 className="font-display text-xl mt-1">{entry.title || "Bez tytułu"}</h3>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); remove(entry.id); }}
                className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive"
                aria-label="Usuń wpis"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="font-body text-[hsl(var(--ink))]/85 whitespace-pre-wrap line-clamp-5">
              {entry.body || <span className="italic text-muted-foreground">Pusty wpis</span>}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};
