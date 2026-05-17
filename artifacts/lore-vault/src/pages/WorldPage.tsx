import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Globe, Users, Plus, BookOpen, Image as ImageIcon,
  Scroll, Layers, LayoutDashboard, Eye, Pencil, Trash2,
  X, Settings, Music, Check, Save,
} from "lucide-react";
import { useVaultDB } from "@/hooks/useVaultDB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Character, Entity, MoodImage, World, WorldHistoryEntry, Whiteboard } from "@/lib/vault-types";
import { WhiteboardCanvas } from "@/components/vault/WhiteboardCanvas";
import { MusicPlayer } from "@/components/vault/MusicPlayer";
import { renderLore } from "@/lib/loreParser";
import { cn } from "@/lib/utils";

/* ── Tab types ─────────────────────────────────────────────── */
type WorldTab = "kronika" | "encyklopedia" | "historia" | "moodboard" | "tablica" | "postacie";

const TABS: { id: WorldTab; label: string; icon: React.ElementType }[] = [
  { id: "kronika",      label: "Kronika",      icon: BookOpen },
  { id: "encyklopedia", label: "Encyklopedia", icon: Layers },
  { id: "historia",     label: "Historia",     icon: Scroll },
  { id: "moodboard",    label: "Moodboard",    icon: ImageIcon },
  { id: "tablica",      label: "Tablica",      icon: LayoutDashboard },
  { id: "postacie",     label: "Postacie",     icon: Users },
];

/* ── Kronika (Lore) tab ──────────────────────────────────────── */
function KronikaTab({ world, update }: { world: World; update: (p: Partial<World>) => void }) {
  const [mode, setMode] = useState<"read" | "edit">("read");
  const entities = world.entities ?? [];

  return (
    <div className="vault-panel corner-frame p-6 md:p-10 min-h-[60vh]">
      <header className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[hsl(var(--rune))]" />
          Kronika świata
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "read" ? "default" : "outline"}
            onClick={() => setMode("read")} className="font-mono uppercase text-xs">
            <Eye className="h-3.5 w-3.5 mr-1.5" />Czytaj
          </Button>
          <Button size="sm" variant={mode === "edit" ? "default" : "outline"}
            onClick={() => setMode("edit")} className="font-mono uppercase text-xs">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />Edytuj
          </Button>
        </div>
      </header>

      {mode === "edit" ? (
        <Textarea
          autoFocus
          value={world.lore ?? ""}
          onChange={(e) => update({ lore: e.target.value })}
          className="min-h-[50vh] font-body text-base bg-transparent border-border/50 resize-none"
          placeholder={"Opisz swój świat…\n\nUżyj **pogrubienia**, *kursywy*, > cytatów, # nagłówków i [[Nazwy]] do linkowania encji."}
        />
      ) : (
        <div className="prose-lore min-h-[50vh]">
          {world.lore
            ? renderLore(world.lore, entities)
            : <p className="italic text-muted-foreground">Brak treści — kliknij Edytuj, aby zacząć.</p>
          }
        </div>
      )}
    </div>
  );
}

/* ── Encyklopedia tab ────────────────────────────────────────── */
function EncyklopediaTab({ world, update }: { world: World; update: (p: Partial<World>) => void }) {
  const entities = world.entities ?? [];
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Omit<Entity, "id">>({ name: "", type: "Miejsce", description: "" });
  const [editing, setEditing] = useState<string | null>(null);

  const addEntity = () => {
    if (!draft.name.trim()) return;
    update({ entities: [...entities, { id: crypto.randomUUID(), ...draft }] });
    setDraft({ name: "", type: "Miejsce", description: "" });
    setAdding(false);
  };

  const removeEntity = (id: string) => update({ entities: entities.filter((e) => e.id !== id) });

  const updateEntity = (id: string, patch: Partial<Entity>) =>
    update({ entities: entities.map((e) => (e.id === id ? { ...e, ...patch } : e)) });

  const TYPES = ["Miejsce", "Postać", "Artefakt", "Frakcja", "Wydarzenie", "Pojęcie", "Inne"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <Layers className="h-5 w-5 text-[hsl(var(--rune))]" />
          Encyklopedia
        </h2>
        <Button size="sm" variant="outline" onClick={() => setAdding(true)} className="font-mono uppercase text-xs">
          <Plus className="h-3.5 w-3.5 mr-1.5" />Nowy wpis
        </Button>
      </div>

      {adding && (
        <div className="vault-panel p-4 space-y-3 animate-fade-in">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Nazwa…" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="font-display" />
            <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm font-mono">
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <Textarea placeholder="Opis…" value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            className="resize-none min-h-[80px]" />
          <div className="flex gap-2">
            <Button size="sm" onClick={addEntity} className="pixel-btn" disabled={!draft.name.trim()}>Dodaj</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Anuluj</Button>
          </div>
        </div>
      )}

      {entities.length === 0 && !adding ? (
        <div className="vault-panel p-10 text-center">
          <Layers className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="font-display text-xl mb-1">Pusta encyklopedia</p>
          <p className="text-muted-foreground text-sm">Dodaj miejsca, artefakty, frakcje i inne pojęcia świata.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {entities.map((e) => (
            <article key={e.id} className="vault-panel p-4 space-y-2 group">
              {editing === e.id ? (
                <>
                  <Input value={e.name} onChange={(ev) => updateEntity(e.id, { name: ev.target.value })} className="font-display h-8" />
                  <select value={e.type} onChange={(ev) => updateEntity(e.id, { type: ev.target.value })}
                    className="w-full h-8 rounded border border-input bg-background px-2 text-xs font-mono">
                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <Textarea value={e.description} onChange={(ev) => updateEntity(e.id, { description: ev.target.value })}
                    className="resize-none text-sm min-h-[60px]" />
                  <Button size="sm" onClick={() => setEditing(null)} className="font-mono uppercase text-xs w-full">
                    <Check className="h-3 w-3 mr-1" />Gotowe
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display leading-tight">{e.name}</p>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[hsl(var(--rune))] opacity-70">{e.type}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing(e.id)} className="text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => removeEntity(e.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  {e.description && <p className="text-sm text-muted-foreground leading-relaxed">{e.description}</p>}
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Historia tab ────────────────────────────────────────────── */
function HistoriaTab({ world, update }: { world: World; update: (p: Partial<World>) => void }) {
  const entries = world.history ?? [];
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Omit<WorldHistoryEntry, "id">>({ era: "", title: "", body: "" });
  const [expanded, setExpanded] = useState<string | null>(null);

  const addEntry = () => {
    if (!draft.title.trim()) return;
    update({ history: [...entries, { id: crypto.randomUUID(), ...draft }] });
    setDraft({ era: "", title: "", body: "" });
    setAdding(false);
  };

  const removeEntry = (id: string) => update({ history: entries.filter((e) => e.id !== id) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <Scroll className="h-5 w-5 text-[hsl(var(--rune))]" />
          Oś historii
        </h2>
        <Button size="sm" variant="outline" onClick={() => setAdding(true)} className="font-mono uppercase text-xs">
          <Plus className="h-3.5 w-3.5 mr-1.5" />Nowe wydarzenie
        </Button>
      </div>

      {adding && (
        <div className="vault-panel p-4 space-y-3 animate-fade-in">
          <div className="grid sm:grid-cols-[1fr,2fr] gap-3">
            <Input placeholder="Era / Okres (np. III wiek)" value={draft.era}
              onChange={(e) => setDraft({ ...draft, era: e.target.value })} className="font-mono text-sm" />
            <Input placeholder="Tytuł wydarzenia" value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="font-display" />
          </div>
          <Textarea placeholder="Opis…" value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            className="resize-none min-h-[80px]" />
          <div className="flex gap-2">
            <Button size="sm" onClick={addEntry} className="pixel-btn" disabled={!draft.title.trim()}>Dodaj</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Anuluj</Button>
          </div>
        </div>
      )}

      {entries.length === 0 && !adding ? (
        <div className="vault-panel p-10 text-center">
          <Scroll className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="font-display text-xl mb-1">Pusta historia</p>
          <p className="text-muted-foreground text-sm">Zapisuj kluczowe wydarzenia, epoki i momenty zwrotne świata.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-0">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-[hsl(var(--rune)/0.6)] via-[hsl(var(--rune)/0.2)] to-transparent" />
          {entries.map((entry) => (
            <div key={entry.id} className="relative group">
              <div className="absolute -left-[1.35rem] top-5 h-2.5 w-2.5 rounded-full border-2 border-[hsl(var(--rune))] bg-background" />
              <div
                className="vault-panel ml-2 mb-3 p-4 cursor-pointer hover:border-[hsl(var(--rune)/0.4)] transition-colors"
                onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {entry.era && (
                      <p className="font-mono text-[9px] uppercase tracking-widest text-[hsl(var(--rune))] mb-0.5">{entry.era}</p>
                    )}
                    <p className="font-display text-base leading-tight">{entry.title}</p>
                    {expanded === entry.id && entry.body && (
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed animate-fade-in">{entry.body}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0 mt-0.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Moodboard tab ───────────────────────────────────────────── */
function MoodboardTab({ world, update }: { world: World; update: (p: Partial<World>) => void }) {
  const images = world.moodboard ?? [];
  const [url, setUrl] = useState("");

  const add = () => {
    if (!url.trim()) return;
    update({ moodboard: [{ id: crypto.randomUUID(), url: url.trim() }, ...images] });
    setUrl("");
  };

  const remove = (id: string) => update({ moodboard: images.filter((m) => m.id !== id) });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="font-display text-2xl flex items-center gap-2 mr-auto">
          <ImageIcon className="h-5 w-5 text-[hsl(var(--rune))]" />
          Moodboard
        </h2>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Wklej URL obrazu…"
          className="max-w-xs font-mono text-sm h-9"
        />
        <Button size="sm" onClick={add} disabled={!url.trim()} className="font-mono uppercase text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" />Dodaj
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="vault-panel p-10 text-center">
          <ImageIcon className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="font-display text-xl mb-1">Pusty moodboard</p>
          <p className="text-muted-foreground text-sm">Wklej URL obrazu, aby zbudować nastrój świata.</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {images.map((img) => (
            <div key={img.id} className="relative group break-inside-avoid">
              <img src={img.url} alt="" loading="lazy"
                className="w-full rounded border border-border/40 object-cover transition-opacity group-hover:opacity-80" />
              <button
                onClick={() => remove(img.id)}
                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-background/90 border border-border grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Postacie tab ────────────────────────────────────────────── */
function PostacieTab({ world, characters, update }: {
  world: World; characters: Character[]; update: (p: Partial<World>) => void;
}) {
  const linked = characters.filter((c) => world.characterIds.includes(c.id));
  const unlinked = characters.filter((c) => !world.characterIds.includes(c.id));

  const toggle = (charId: string) => {
    const next = world.characterIds.includes(charId)
      ? world.characterIds.filter((id) => id !== charId)
      : [...world.characterIds, charId];
    update({ characterIds: next });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <Users className="h-5 w-5 text-[hsl(var(--rune))]" />
          Postacie świata
          <span className="font-mono text-sm text-muted-foreground">({linked.length})</span>
        </h2>
      </div>

      {linked.length === 0 ? (
        <div className="vault-panel p-6 text-center text-muted-foreground italic text-sm">
          Brak przypisanych postaci. Dodaj poniżej.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {linked.map((c) => (
            <div key={c.id} className="vault-panel p-4 flex items-center gap-3 group">
              {c.avatar
                ? <img src={c.avatar} alt={c.name} className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                : <div className="h-12 w-12 rounded-full bg-muted grid place-items-center flex-shrink-0"><Users className="h-5 w-5 text-muted-foreground" /></div>
              }
              <div className="flex-1 min-w-0">
                <Link to={`/character/${c.id}`} className="font-display truncate block hover:text-[hsl(var(--rune))] transition-colors">
                  {c.name}
                </Link>
                <p className="text-xs text-muted-foreground line-clamp-1">{c.tagline}</p>
              </div>
              <button
                onClick={() => toggle(c.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0"
                title="Odłącz od świata"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {unlinked.length > 0 && (
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Dodaj postać do świata:</p>
          <div className="flex flex-wrap gap-2">
            {unlinked.map((c) => (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded border border-dashed border-border font-mono text-xs hover:border-[hsl(var(--rune)/0.5)] hover:text-[hsl(var(--rune))] transition-colors"
              >
                <Plus className="h-3 w-3" />
                {c.avatar && <img src={c.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />}
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Settings panel ──────────────────────────────────────────── */
function WorldSettings({ world, update, onDelete }: {
  world: World;
  update: (p: Partial<World>) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        size="icon" variant="outline"
        onClick={() => setOpen((v) => !v)}
        aria-label="Ustawienia świata"
        className="h-9 w-9"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 vault-panel p-4 space-y-3 z-50 animate-fade-in">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Ustawienia świata</p>

          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">URL obrazu tła</label>
            <Input
              value={world.imageUrl ?? ""}
              onChange={(e) => update({ imageUrl: e.target.value })}
              placeholder="https://…"
              className="font-mono text-sm h-8"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Muzyka ambient (YouTube / SC)</label>
            <Input
              value={world.musicUrl ?? ""}
              onChange={(e) => update({ musicUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=…"
              className="font-mono text-sm h-8"
            />
          </div>

          <div className="pt-1 border-t border-border/40">
            <Button
              variant="destructive" size="sm" className="w-full font-mono uppercase text-xs"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />Usuń świat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
const WorldPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { db, updateWorld, deleteWorld, addWorld } = useVaultDB();
  const worlds = db.worlds ?? [];
  const characters = db.characters ?? [];
  const world = worlds.find((w) => w.id === id);

  const [tab, setTab] = useState<WorldTab>("kronika");
  const [editingHero, setEditingHero] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  if (!world) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="vault-panel p-8 max-w-md text-center">
          <p className="font-pixel text-xl text-[hsl(var(--rune))] mb-3">404</p>
          <h1 className="font-display text-2xl mb-2">Nie znaleziono świata</h1>
          <Button onClick={() => navigate("/tablica-swiata")} className="pixel-btn">
            <ArrowLeft className="h-3 w-3 mr-1.5" /> Wróć
          </Button>
        </div>
      </div>
    );
  }

  const update = (patch: Partial<World>) => updateWorld(world.id, patch);

  const handleDelete = () => {
    if (confirm(`Usunąć świat „${world.name}"? Tej akcji nie można cofnąć.`)) {
      deleteWorld(world.id);
      navigate("/tablica-swiata");
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Top bar */}
      <div className="fixed top-4 left-4 z-40">
        <Button asChild variant="outline" size="sm" className="font-mono uppercase tracking-wider text-xs">
          <Link to="/tablica-swiata">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Światy
          </Link>
        </Button>
      </div>

      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <WorldSettings world={world} update={update} onDelete={handleDelete} />
      </div>

      <main>
        {/* ── Hero ── */}
        <header className="relative isolate overflow-hidden">
          {world.imageUrl ? (
            <div className="absolute inset-0 -z-10 bg-cover bg-center animate-fade-in"
              style={{ backgroundImage: `url("${world.imageUrl}")` }} />
          ) : (
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[hsl(195,85%,7%)] via-[hsl(240,50%,6%)] to-[hsl(270,60%,5%)]" />
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 -z-10 bg-grain opacity-20 mix-blend-overlay" />

          <div className="container relative py-20 md:py-28">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-[hsl(195,85%,60%)] font-mono animate-fade-in mb-8">
              <span className="h-px w-10 bg-[hsl(195,85%,60%)]" />
              Lore Vault // Świat
              <span className="h-px w-10 bg-[hsl(195,85%,60%)]" />
            </div>

            <div className="flex items-start gap-6">
              {/* World icon */}
              <div className="relative hidden md:flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border border-[hsl(195,85%,60%)/0.4] bg-[hsl(195,85%,6%)] shadow-[0_0_40px_hsl(195,85%,20%)]">
                <Globe className="h-9 w-9 text-[hsl(195,85%,55%)] opacity-80" />
              </div>

              <div className="flex-1 space-y-3 animate-fade-in">
                {editingHero ? (
                  <>
                    <Input value={world.name}
                      onChange={(e) => update({ name: e.target.value })}
                      className="text-3xl md:text-5xl h-auto py-3 font-display bg-background/40 max-w-2xl" />
                    <Input value={world.description}
                      onChange={(e) => update({ description: e.target.value })}
                      className="bg-background/40 max-w-2xl font-body italic"
                      placeholder="Krótki opis świata…" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-4xl md:text-6xl font-display text-[hsl(195,85%,70%)] leading-tight text-balance">
                        {world.name}
                      </h1>
                      {musicPlaying && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full vault-panel border border-[hsl(195,85%,60%)/0.4] text-[hsl(195,85%,60%)] font-mono text-[9px] uppercase tracking-widest animate-fade-in">
                          <Music className="h-2.5 w-2.5 animate-pulse" />
                          Leci
                        </span>
                      )}
                    </div>
                    {world.description && (
                      <p className="text-lg md:text-xl italic text-muted-foreground max-w-2xl text-balance font-body">
                        {world.description}
                      </p>
                    )}
                  </>
                )}

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm"
                    onClick={() => setEditingHero((v) => !v)}
                    className="font-mono uppercase tracking-wider text-xs">
                    {editingHero
                      ? <><Check className="h-3.5 w-3.5 mr-1.5" />Zapisz</>
                      : <><Pencil className="h-3.5 w-3.5 mr-1.5" />Edytuj</>
                    }
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-[hsl(195,85%,40%)/0.5] to-transparent" />
        </header>

        <div className="container py-8">
          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
            {/* Sidebar */}
            <aside className="space-y-2 lg:sticky lg:top-6 self-start">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Wszystkie światy</p>
              {worlds.map((w) => (
                <button
                  key={w.id}
                  onClick={() => navigate(`/world/${w.id}`)}
                  className={cn(
                    "w-full text-left vault-panel px-3 py-2 text-sm flex items-center gap-2 transition-colors",
                    w.id === world.id
                      ? "border-[hsl(195,85%,60%)/0.5] text-[hsl(195,85%,60%)]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Globe className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                  <span className="truncate">{w.name}</span>
                </button>
              ))}
              <Button variant="outline" size="sm" className="w-full font-mono uppercase text-xs mt-2"
                onClick={() => {
                  const created = addWorld({ name: "Nowy świat", description: "", characterIds: [] });
                  navigate(`/world/${created.id}`);
                }}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />Nowy świat
              </Button>
            </aside>

            {/* Main content */}
            <section className="min-w-0 space-y-6">
              {/* Tab nav */}
              <nav className="flex items-center gap-1 border-b border-border overflow-x-auto pb-px">
                {TABS.map(({ id: tid, label, icon: Icon }) => (
                  <button
                    key={tid}
                    onClick={() => setTab(tid)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono uppercase tracking-widest border-b-2 -mb-px transition-colors whitespace-nowrap",
                      tab === tid
                        ? "border-[hsl(195,85%,60%)] text-[hsl(195,85%,60%)]"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </nav>

              {/* Tab content */}
              <div key={tab} className="animate-fade-in">
                {tab === "kronika" && <KronikaTab world={world} update={update} />}
                {tab === "encyklopedia" && <EncyklopediaTab world={world} update={update} />}
                {tab === "historia" && <HistoriaTab world={world} update={update} />}
                {tab === "moodboard" && <MoodboardTab world={world} update={update} />}
                {tab === "tablica" && (
                  <WhiteboardCanvas
                    key={`world-wb-${world.id}`}
                    board={world.whiteboard ?? { notes: [], strokes: [] }}
                    onChange={(next: Whiteboard) => update({ whiteboard: next })}
                    title={`Tablica · ${world.name}`}
                  />
                )}
                {tab === "postacie" && <PostacieTab world={world} characters={characters} update={update} />}
              </div>
            </section>
          </div>
        </div>

        <footer className="container py-12 text-center font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
          <span className="inline-flex items-center gap-3">
            <span className="h-px w-12 bg-border" />
            {world.name}
            <span className="h-px w-12 bg-border" />
          </span>
        </footer>
      </main>

      {/* Music player */}
      {world.musicUrl && (
        <MusicPlayer
          url={world.musicUrl}
          onPlayingChange={setMusicPlaying}
        />
      )}
    </div>
  );
};

export default WorldPage;
