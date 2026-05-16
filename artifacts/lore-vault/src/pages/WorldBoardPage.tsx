import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, Globe, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { useVaultDB } from "@/hooks/useVaultDB";
import { ParticleCanvas } from "@/components/vault/ParticleCanvas";
import { WhiteboardCanvas } from "@/components/vault/WhiteboardCanvas";
import { SettingsModal } from "@/components/vault/SettingsModal";
import { WorldCreatorTab } from "@/components/vault/WorldCreatorTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Whiteboard } from "@/lib/vault-types";
import { cn } from "@/lib/utils";

type MainTab = "tablica" | "swiaty";

const WorldBoardPage = () => {
  const {
    db, setWorldBoard, setDb,
    addWorld, updateWorld, deleteWorld, addConnection, deleteConnection,
    addNamedBoard, updateNamedBoard, setNamedBoardContent, deleteNamedBoard,
  } = useVaultDB();

  const [searchParams] = useSearchParams();
  const [mainTab, setMainTab] = useState<MainTab>(
    searchParams.get("tab") === "swiaty" ? "swiaty" : "tablica",
  );
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  const namedBoards = db.namedBoards ?? [];

  const currentBoard: Whiteboard =
    selectedBoardId
      ? (namedBoards.find((b) => b.id === selectedBoardId)?.board ?? { notes: [], strokes: [] })
      : db.worldBoard;

  const currentBoardTitle =
    selectedBoardId
      ? (namedBoards.find((b) => b.id === selectedBoardId)?.name ?? "Tablica")
      : "Tablica Świata";

  const handleBoardChange = (next: Whiteboard) => {
    if (selectedBoardId) {
      setNamedBoardContent(selectedBoardId, next);
    } else {
      setWorldBoard(next);
    }
  };

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) return;
    const board = addNamedBoard(newBoardName.trim());
    setSelectedBoardId(board.id);
    setNewBoardName("");
    setCreatingBoard(false);
  };

  const startRename = (id: string, name: string) => {
    setRenamingId(id);
    setRenameValue(name);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      updateNamedBoard(renamingId, { name: renameValue.trim() });
    }
    setRenamingId(null);
  };

  return (
    <div className="relative min-h-screen">
      <ParticleCanvas effect={db.settings.effect} />

      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <SettingsModal db={db} setDb={setDb} />
      </div>
      <div className="fixed top-4 left-4 z-40">
        <Button asChild variant="outline" size="sm" className="font-mono uppercase tracking-wider text-xs">
          <Link to="/" aria-label="Wróć">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Vault
          </Link>
        </Button>
      </div>

      <main className="relative z-10 container pt-16 pb-20">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-[hsl(var(--rune))] font-pixel mb-3">
          <span className="h-px w-10 bg-[hsl(var(--rune))]" />
          Świat
          <span className="h-px w-10 bg-[hsl(var(--rune))]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display rune-text leading-tight mb-6">
          Tablica Świata
        </h1>

        <div className="flex items-center gap-1 mb-8 border-b border-border">
          <button
            onClick={() => setMainTab("tablica")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest border-b-2 -mb-px transition-colors",
              mainTab === "tablica"
                ? "border-[hsl(var(--rune))] text-[hsl(var(--rune))]"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Tablice
          </button>
          <button
            onClick={() => setMainTab("swiaty")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest border-b-2 -mb-px transition-colors",
              mainTab === "swiaty"
                ? "border-[hsl(195,85%,60%)] text-[hsl(195,85%,60%)]"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Globe className="h-3.5 w-3.5" />
            Kreator Światów
            {db.worlds?.length > 0 && (
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[hsl(195,85%,60%)] text-[9px] text-black font-bold">
                {db.worlds.length}
              </span>
            )}
          </button>
        </div>

        {mainTab === "tablica" && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <nav className="flex-shrink-0 w-48 space-y-1" aria-label="Tablice">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Tablice</p>

                <button
                  onClick={() => setSelectedBoardId(null)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded text-sm font-mono flex items-center gap-2 transition-colors",
                    selectedBoardId === null
                      ? "bg-[hsl(var(--rune)/0.15)] text-[hsl(var(--rune))] border border-[hsl(var(--rune)/0.4)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                  )}
                >
                  <LayoutDashboard className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">Tablica Świata</span>
                </button>

                {namedBoards.map((board) => (
                  <div key={board.id} className="group/item relative">
                    {renamingId === board.id ? (
                      <div className="flex items-center gap-1 px-1">
                        <Input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="h-7 text-xs px-2 flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                        />
                        <button onClick={commitRename} className="text-green-400 hover:text-green-300">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setRenamingId(null)} className="text-muted-foreground hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedBoardId(board.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded text-sm font-mono flex items-center gap-2 transition-colors pr-14",
                          selectedBoardId === board.id
                            ? "bg-[hsl(var(--rune)/0.15)] text-[hsl(var(--rune))] border border-[hsl(var(--rune)/0.4)]"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                        )}
                      >
                        <LayoutDashboard className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{board.name}</span>
                      </button>
                    )}
                    {renamingId !== board.id && (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); startRename(board.id, board.name); }}
                          className="h-6 w-6 grid place-items-center text-muted-foreground hover:text-foreground rounded"
                          aria-label="Zmień nazwę"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Usunąć tablicę „${board.name}"?`)) {
                              if (selectedBoardId === board.id) setSelectedBoardId(null);
                              deleteNamedBoard(board.id);
                            }
                          }}
                          className="h-6 w-6 grid place-items-center text-muted-foreground hover:text-destructive rounded"
                          aria-label="Usuń tablicę"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {creatingBoard ? (
                  <div className="flex items-center gap-1 px-1 pt-1">
                    <Input
                      autoFocus
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      placeholder="Nazwa tablicy…"
                      className="h-7 text-xs px-2 flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateBoard();
                        if (e.key === "Escape") setCreatingBoard(false);
                      }}
                    />
                    <button onClick={handleCreateBoard} className="text-green-400 hover:text-green-300">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setCreatingBoard(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setCreatingBoard(true)}
                    className="w-full text-left px-3 py-2 rounded text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-2 border border-dashed border-border hover:border-[hsl(var(--rune)/0.5)] transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Nowa tablica
                  </button>
                )}
              </nav>

              <div className="flex-1 min-w-0">
                <WhiteboardCanvas
                  key={selectedBoardId ?? "world"}
                  board={currentBoard}
                  onChange={handleBoardChange}
                  title={currentBoardTitle}
                />
              </div>
            </div>
          </div>
        )}

        {mainTab === "swiaty" && (
          <div>
            <p className="text-muted-foreground italic mb-6 max-w-2xl text-sm">
              Buduj fikcyjne światy, przypisuj do nich postacie i twórz sieć połączeń między nimi.
            </p>
            <WorldCreatorTab
              worlds={db.worlds ?? []}
              connections={db.connections ?? []}
              characters={db.characters}
              addWorld={addWorld}
              updateWorld={updateWorld}
              deleteWorld={deleteWorld}
              addConnection={addConnection}
              deleteConnection={deleteConnection}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default WorldBoardPage;
