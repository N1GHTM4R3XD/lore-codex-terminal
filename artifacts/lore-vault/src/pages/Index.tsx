import { useState } from "react";
import { Plus, LayoutDashboard, FolderPlus, ChevronDown, ChevronRight, Trash2, FolderMinus, FolderOpen, User, HardDrive, Search, Globe, X } from "lucide-react";
import { useVaultDB } from "@/hooks/useVaultDB";
import { ParticleCanvas } from "@/components/vault/ParticleCanvas";
import { CharacterCard } from "@/components/vault/CharacterCard";
import { WorldCard } from "@/components/vault/WorldCard";
import { SettingsModal } from "@/components/vault/SettingsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Character, Folder } from "@/lib/vault-types";
import { cn } from "@/lib/utils";
import { useLang } from "@/hooks/useLang";

function getStorageSize(): string {
  try {
    const raw = localStorage.getItem("lore-vault:db:v3") ?? "";
    const bytes = new Blob([raw]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  } catch {
    return "?";
  }
}

function AutosaveBadge() {
  const { lang } = useLang();
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-muted-foreground/70">
      <span className="h-1.5 w-1.5 rounded-full bg-green-400/70 animate-pulse" />
      {lang === "pl" ? "Autozapis aktywny" : "Autosave active"}
      <span className="opacity-50">·</span>
      <HardDrive className="h-3 w-3 opacity-50" />
      <span className="opacity-70">{getStorageSize()} · localStorage</span>
    </span>
  );
}

const FOLDER_COLORS = [
  "#cf9d7b", "#8fc4d8", "#cfa8e0", "#a8d8a0", "#e89a9a",
  "#f7d774", "#f0c89e", "#d4a0c4", "#7ab8a8",
];

function FolderSection({
  folder,
  characters,
  allChars,
  onUpdate,
  onDelete,
  onDeleteChar,
  onRemoveChar,
  onAddChar,
}: {
  folder: Folder;
  characters: Character[];
  allChars: Character[];
  onUpdate: (patch: Partial<Folder>) => void;
  onDelete: () => void;
  onDeleteChar: (id: string) => void;
  onRemoveChar: (charId: string) => void;
  onAddChar: (charId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(folder.collapsed ?? false);
  const [renaming, setRenaming] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const unassigned = allChars.filter((c) => !folder.characterIds.includes(c.id));

  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-3 group"
        style={{ borderLeft: `3px solid ${folder.color}`, paddingLeft: "12px" }}
      >
        <button
          onClick={() => { setCollapsed(!collapsed); onUpdate({ collapsed: !collapsed }); }}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={collapsed ? "Rozwiń" : "Zwiń"}
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />
          }
        </button>

        <FolderOpen className="h-4 w-4 flex-shrink-0" style={{ color: folder.color }} />

        {renaming ? (
          <Input
            autoFocus
            defaultValue={folder.name}
            className="h-7 text-sm font-display w-40 px-2"
            onBlur={(e) => { onUpdate({ name: e.target.value }); setRenaming(false); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") setRenaming(false);
            }}
          />
        ) : (
          <h2
            className="font-display text-lg text-[hsl(var(--rune))] cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: folder.color }}
            onClick={() => setRenaming(true)}
          >
            {folder.name}
          </h2>
        )}

        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {characters.length}
        </span>

        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {FOLDER_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onUpdate({ color: c })}
              className="h-3.5 w-3.5 rounded-full border transition-transform hover:scale-125"
              style={{ background: c, borderColor: folder.color === c ? "white" : "transparent" }}
              aria-label={`Kolor ${c}`}
            />
          ))}
          <Button
            size="icon" variant="ghost"
            onClick={() => { if (confirm(`Usunąć folder „${folder.name}"? Postacie nie zostaną usunięte.`)) onDelete(); }}
            className="h-6 w-6 ml-1 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <>
          {characters.length === 0 ? (
            <p className="font-mono text-xs italic text-muted-foreground pl-8 opacity-60">
              Brak postaci w tym folderze
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pl-4">
              {characters.map((c) => (
                <div key={c.id} className="relative group/card">
                  <CharacterCard character={c} onDelete={onDeleteChar} />
                  <button
                    onClick={() => onRemoveChar(c.id)}
                    className="absolute top-2 left-2 z-20 h-6 w-6 bg-background/90 border border-border rounded-full grid place-items-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:text-destructive"
                    title="Wyjmij z folderu"
                    aria-label="Wyjmij z folderu"
                  >
                    <FolderMinus className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {unassigned.length > 0 && (
            <div className="pl-4">
              {addOpen ? (
                <div className="flex items-center gap-2">
                  <Select onValueChange={(v) => { onAddChar(v); setAddOpen(false); }}>
                    <SelectTrigger className="h-8 w-56 text-xs font-mono">
                      <SelectValue placeholder="Wybierz postać…" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassigned.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-2">
                            {c.avatar
                              ? <img src={c.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                              : <User className="h-3 w-3" />
                            }
                            {c.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" onClick={() => setAddOpen(false)} className="h-8 font-mono text-xs">
                    Anuluj
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddOpen(true)}
                  className="font-mono uppercase text-[10px] h-7 border-dashed"
                  style={{ borderColor: `${folder.color}60`, color: folder.color }}
                >
                  <Plus className="h-3 w-3 mr-1" />Dodaj postać
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const Index = () => {
  const {
    db, addCharacter, deleteCharacter, setDb,
    addFolder, updateFolder, deleteFolder, toggleCharInFolder,
    deleteWorld,
  } = useVaultDB();
  const navigate = useNavigate();

  const [showFolderCreate, setShowFolderCreate] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.documentElement.dataset.palette = "pixel-dark";
  }, []);

  const folders = db.folders ?? [];
  const worlds = db.worlds ?? [];
  const assignedCharIds = new Set(folders.flatMap((f) => f.characterIds));
  const unassignedChars = db.characters.filter((c) => !assignedCharIds.has(c.id));

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const color = FOLDER_COLORS[folders.length % FOLDER_COLORS.length];
    addFolder(newFolderName.trim(), color);
    setNewFolderName("");
    setShowFolderCreate(false);
  };

  // Search filtering
  const q = search.toLowerCase().trim();
  const searchActive = q.length > 0;

  const filteredChars = searchActive
    ? db.characters.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q),
      )
    : null;

  const filteredWorlds = searchActive
    ? worlds.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q),
      )
    : worlds;

  return (
    <div className="relative min-h-screen">
      <ParticleCanvas effect={db.settings.effect} />

      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <SettingsModal db={db} setDb={setDb} />
      </div>

      <main className="relative z-10">
        <header className="container pt-16 pb-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-[hsl(var(--rune))] font-pixel animate-fade-in">
            <span className="h-px w-10 bg-[hsl(var(--rune))]" />
            Lore Vault
            <span className="h-px w-10 bg-[hsl(var(--rune))]" />
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-display rune-text leading-tight">
            Archiwum
          </h1>
          <p className="mt-3 max-w-2xl text-lg italic text-muted-foreground">
            Mroczny kodeks twoich bohaterów. Każda karta to własny świat — paleta, ramka,
            animacje, fonty i muzyka.
          </p>

          {/* Action bar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                const c = addCharacter();
                navigate(`/character/${c.id}`);
              }}
              className="pixel-btn"
              aria-label="Dodaj nową kartę postaci"
            >
              <Plus className="h-3 w-3 mr-1.5" /> Nowa karta
            </Button>

            {showFolderCreate ? (
              <div className="flex items-center gap-2">
                <Input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nazwa folderu…"
                  className="h-9 w-44 font-mono text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                    if (e.key === "Escape") setShowFolderCreate(false);
                  }}
                />
                <Button size="sm" onClick={handleCreateFolder} className="font-mono uppercase text-xs">
                  Utwórz
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowFolderCreate(false)} className="font-mono text-xs">
                  Anuluj
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFolderCreate(true)}
                className="font-mono uppercase text-xs"
              >
                <FolderPlus className="h-3.5 w-3.5 mr-1.5" /> Nowy folder
              </Button>
            )}

            <Button asChild variant="outline" size="sm" className="font-mono uppercase text-xs">
              <Link to="/tablica-swiata">
                <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" /> Tablica Świata
              </Link>
            </Button>

            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {db.characters.length}{" "}
              {db.characters.length === 1 ? "postać" : db.characters.length < 5 ? "postacie" : "postaci"}
              {worlds.length > 0 && (
                <> · {worlds.length}{" "}
                  {worlds.length === 1 ? "świat" : worlds.length < 5 ? "światy" : "światów"}
                </>
              )}
            </span>
          </div>

          {/* Search bar */}
          <div className="mt-5 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj po nazwie postaci lub świata…"
              className="pl-9 pr-9 h-9 font-mono text-sm bg-background/60"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Wyczyść wyszukiwanie"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </header>

        <section className="container pb-20 space-y-12">
          {/* ── SEARCH RESULTS ── */}
          {searchActive && (
            <div className="space-y-8 animate-fade-in">
              {/* Characters */}
              {filteredChars!.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
                    Postacie ({filteredChars!.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredChars!.map((c) => (
                      <CharacterCard key={c.id} character={c} onDelete={deleteCharacter} />
                    ))}
                  </div>
                </div>
              )}

              {/* Worlds */}
              {filteredWorlds.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
                    Światy ({filteredWorlds.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredWorlds.map((w) => (
                      <WorldCard
                        key={w.id}
                        world={w}
                        characters={db.characters}
                        onDelete={deleteWorld}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredChars!.length === 0 && filteredWorlds.length === 0 && (
                <div className="vault-panel p-10 text-center max-w-md mx-auto">
                  <p className="font-display text-xl text-muted-foreground">Brak wyników</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nie znaleziono postaci ani światów pasujących do „{search}".
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── NORMAL VIEW ── */}
          {!searchActive && (
            <>
              {/* Characters */}
              {db.characters.length === 0 ? (
                <div className="vault-panel p-12 text-center max-w-lg mx-auto">
                  <p className="font-pixel text-2xl text-[hsl(var(--rune))] mb-4">✦</p>
                  <p className="font-display text-2xl">Vault jest pusty</p>
                  <p className="text-muted-foreground mt-2">
                    Stwórz pierwszą kartę, aby rozpocząć kronikę.
                  </p>
                </div>
              ) : (
                <>
                  {folders.map((folder) => {
                    const folderChars = folder.characterIds
                      .map((id) => db.characters.find((c) => c.id === id))
                      .filter(Boolean) as Character[];
                    return (
                      <FolderSection
                        key={folder.id}
                        folder={folder}
                        characters={folderChars}
                        allChars={db.characters}
                        onUpdate={(patch) => updateFolder(folder.id, patch)}
                        onDelete={() => deleteFolder(folder.id)}
                        onDeleteChar={deleteCharacter}
                        onRemoveChar={(charId) => toggleCharInFolder(folder.id, charId)}
                        onAddChar={(charId) => toggleCharInFolder(folder.id, charId)}
                      />
                    );
                  })}

                  {(unassignedChars.length > 0 || folders.length === 0) && (
                    <div className={cn(folders.length > 0 && "border-t border-border pt-8")}>
                      {folders.length > 0 && (
                        <div className="flex items-center gap-3 mb-5 text-xs uppercase tracking-[0.3em] text-muted-foreground font-mono">
                          <span className="h-px flex-1 bg-border" />
                          Bez folderu ({unassignedChars.length})
                          <span className="h-px flex-1 bg-border" />
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
                        {(folders.length === 0 ? db.characters : unassignedChars).map((c) => (
                          <div key={c.id} className="relative group/card">
                            <CharacterCard character={c} onDelete={deleteCharacter} />
                            {folders.length > 0 && (
                              <div className="absolute top-2 left-2 z-20 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                <Select onValueChange={(fid) => toggleCharInFolder(fid, c.id)}>
                                  <SelectTrigger className="h-6 w-6 p-0 border-0 bg-background/90 rounded-full">
                                    <FolderPlus className="h-3 w-3 m-auto" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {folders.map((f) => (
                                      <SelectItem key={f.id} value={f.id}>
                                        <span className="flex items-center gap-2">
                                          <span className="h-2 w-2 rounded-full inline-block" style={{ background: f.color }} />
                                          {f.name}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── WORLDS SECTION ── */}
              {worlds.length > 0 && (
                <div className="border-t border-border pt-10">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-[hsl(195,85%,60%)]" />
                      <h2 className="font-display text-2xl" style={{ color: "hsl(195,85%,60%)" }}>
                        Światy
                      </h2>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {worlds.length}
                      </span>
                    </div>
                    <Button asChild variant="outline" size="sm" className="font-mono uppercase text-xs">
                      <Link to="/tablica-swiata?tab=swiaty">
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Kreator Światów
                      </Link>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
                    {worlds.map((w) => (
                      <WorldCard
                        key={w.id}
                        world={w}
                        characters={db.characters}
                        onDelete={deleteWorld}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <footer className="container py-12 text-center font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
          <span className="inline-flex flex-col items-center gap-3">
            <span className="inline-flex items-center gap-3">
              <span className="h-px w-12 bg-border" />
              Lore Vault · Codex Terminal
              <span className="h-px w-12 bg-border" />
            </span>
            <AutosaveBadge />
          </span>
        </footer>
      </main>
    </div>
  );
};

export default Index;
