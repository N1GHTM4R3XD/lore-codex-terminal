import { useState } from "react";
import { Library, Plus, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Entity, VaultState } from "@/lib/vault-types";
import { useLang } from "@/hooks/useLang";
import { t, ENTITY_TYPES } from "@/lib/i18n";

interface Props {
  state: VaultState;
  update: (p: Partial<VaultState>) => void;
  focusName?: string | null;
}

export const EncyclopediaTab = ({ state, update, focusName }: Props) => {
  const { lang } = useLang();
  const types = ENTITY_TYPES(lang);

  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Entity>({ id: "", name: "", type: types[0].value, description: "" });

  const add = () => {
    if (!draft.name.trim()) return;
    update({ entities: [...state.entities, { ...draft, id: crypto.randomUUID() }] });
    setDraft({ id: "", name: "", type: types[0].value, description: "" });
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
          {t("enc.title", lang)}
        </h2>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("enc.search", lang)}
            className="pl-9 w-64 font-mono text-sm"
          />
        </div>
      </header>

      <div className="vault-panel p-5 grid gap-3 md:grid-cols-[1fr,180px,2fr,auto] items-start">
        <Input
          placeholder={t("enc.name", lang)}
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          className="font-display"
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
        />
        <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v })}>
          <SelectTrigger className="font-mono text-sm">
            <SelectValue placeholder={t("enc.type", lang)} />
          </SelectTrigger>
          <SelectContent>
            {types.map((tp) => (
              <SelectItem key={tp.value} value={tp.value}>{tp.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder={t("enc.desc", lang)}
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
        />
        <Button onClick={add} className="font-mono uppercase text-xs">
          <Plus className="h-3.5 w-3.5 mr-1.5" />{t("enc.add", lang)}
        </Button>
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <p className="italic text-muted-foreground text-center py-10">{t("enc.empty", lang)}</p>
        )}
        {filtered.map((e) => {
          const highlight = focusName && focusName.toLowerCase() === e.name.toLowerCase();
          return (
            <article
              key={e.id}
              className={`vault-panel p-4 grid gap-3 md:grid-cols-[1fr,180px,2fr,auto] items-center transition ${
                highlight ? "border-[hsl(var(--rune))] shadow-rune animate-fade-in" : ""
              }`}
            >
              <Input
                value={e.name}
                onChange={(ev) => patch(e.id, { name: ev.target.value })}
                className="font-display bg-background/40"
                placeholder={t("enc.name", lang)}
              />
              <Select value={e.type} onValueChange={(v) => patch(e.id, { type: v })}>
                <SelectTrigger className="font-mono text-xs bg-background/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map((tp) => (
                    <SelectItem key={tp.value} value={tp.value}>{tp.label}</SelectItem>
                  ))}
                  {!types.find(tp => tp.value === e.type) && (
                    <SelectItem value={e.type}>{e.type}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Textarea
                value={e.description}
                onChange={(ev) => patch(e.id, { description: ev.target.value })}
                className="min-h-[44px] bg-background/40"
                placeholder={t("enc.desc", lang)}
              />
              <button
                onClick={() => remove(e.id)}
                className="text-muted-foreground hover:text-destructive p-2"
                aria-label={t("enc.remove", lang)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};
