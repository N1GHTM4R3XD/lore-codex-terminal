import { useState } from "react";
import { Library, Plus, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Entity, VaultState } from "@/lib/vault-types";

interface Props {
  state: VaultState;
  update: (p: Partial<VaultState>) => void;
  focusName?: string | null;
}

export const EncyclopediaTab = ({ state, update, focusName }: Props) => {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Entity>({ id: "", name: "", type: "Postać", description: "" });

  const add = () => {
    if (!draft.name.trim()) return;
    update({ entities: [...state.entities, { ...draft, id: crypto.randomUUID() }] });
    setDraft({ id: "", name: "", type: "Postać", description: "" });
  };
  const remove = (id: string) => update({ entities: state.entities.filter((e) => e.id !== id) });
  const patch = (id: string, p: Partial<Entity>) =>
    update({ entities: state.entities.map((e) => (e.id === id ? { ...e, ...p } : e)) });

  const filtered = state.entities.filter(
    (e) =>
      !query.trim() ||
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.type.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <Library className="h-5 w-5 text-[hsl(var(--rune))]" />
          Encyklopedia
        </h2>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj..."
            className="pl-9 w-64 font-mono text-sm"
          />
        </div>
      </header>

      <div className="vault-panel p-5 grid gap-3 md:grid-cols-[1fr,160px,2fr,auto]">
        <Input placeholder="Nazwa" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="font-display" />
        <Input placeholder="Typ" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className="font-mono text-sm" />
        <Input placeholder="Opis" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <Button onClick={add} className="font-mono uppercase text-xs">
          <Plus className="h-3.5 w-3.5 mr-1.5" />Dodaj
        </Button>
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <p className="italic text-muted-foreground text-center py-10">Brak haseł.</p>
        )}
        {filtered.map((e) => {
          const highlight = focusName && focusName.toLowerCase() === e.name.toLowerCase();
          return (
            <HoverCard key={e.id} openDelay={120}>
              <HoverCardTrigger asChild>
                <article
                  className={`vault-panel p-4 grid gap-3 md:grid-cols-[1fr,160px,2fr,auto] items-center transition ${
                    highlight ? "border-[hsl(var(--rune))] shadow-rune animate-fade-in" : ""
                  }`}
                >
                  <Input value={e.name} onChange={(ev) => patch(e.id, { name: ev.target.value })} className="font-display bg-background/40" />
                  <Input value={e.type} onChange={(ev) => patch(e.id, { type: ev.target.value })} className="font-mono text-xs bg-background/40" />
                  <Textarea
                    value={e.description}
                    onChange={(ev) => patch(e.id, { description: ev.target.value })}
                    className="min-h-[44px] bg-background/40"
                  />
                  <button
                    onClick={() => remove(e.id)}
                    className="text-muted-foreground hover:text-destructive p-2"
                    aria-label="Usuń hasło"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </article>
              </HoverCardTrigger>
              <HoverCardContent side="top" className="vault-panel w-80">
                <p className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))]">{e.type}</p>
                <h4 className="font-display text-lg mt-1">{e.name}</h4>
                <p className="text-sm text-[hsl(var(--ink))]/80 mt-2">{e.description || "Brak opisu."}</p>
              </HoverCardContent>
            </HoverCard>
          );
        })}
      </div>
    </section>
  );
};
