import { useRef, useState } from "react";
import { LayoutPanelLeft, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VaultState, NamedWhiteboard, Whiteboard } from "@/lib/vault-types";
import { WhiteboardCanvas } from "@/components/vault/WhiteboardCanvas";
import { cn } from "@/lib/utils";

interface Props { state: VaultState; update: (p: Partial<VaultState>) => void }

const emptyBoard = (): Whiteboard => ({ notes: [], strokes: [] });

function makeBoard(name: string): NamedWhiteboard {
  return {
    id: `wb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    name,
    board: emptyBoard(),
  };
}

/** Derive the board list: fall back to legacy `whiteboard` if needed. */
function deriveBoards(state: VaultState): NamedWhiteboard[] {
  if (state.whiteboards && state.whiteboards.length > 0) return state.whiteboards;
  return [{ id: "wb_main", name: "Tablica główna", board: state.whiteboard ?? emptyBoard() }];
}

export const NamedWhiteboardsTab = ({ state, update }: Props) => {
  const boards = deriveBoards(state);
  const [activeId, setActiveId] = useState<string>(boards[0].id);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);

  const activeBoard = boards.find((b) => b.id === activeId) ?? boards[0];

  /* ── board mutations ── */
  const saveBoards = (next: NamedWhiteboard[]) => update({ whiteboards: next });

  const addBoard = () => {
    const b = makeBoard(`Tablica ${boards.length + 1}`);
    saveBoards([...boards, b]);
    setActiveId(b.id);
  };

  const deleteBoard = (id: string) => {
    if (boards.length <= 1) return;
    const target = boards.find((b) => b.id === id);
    if (!confirm(`Usunąć tablicę „${target?.name ?? id}"?`)) return;
    const next = boards.filter((b) => b.id !== id);
    saveBoards(next);
    if (activeId === id) setActiveId(next[next.length - 1].id);
  };

  const updateBoardContent = (id: string, board: Whiteboard) =>
    saveBoards(boards.map((b) => (b.id === id ? { ...b, board } : b)));

  const startRename = (b: NamedWhiteboard) => {
    setRenamingId(b.id);
    setRenameVal(b.name);
    setTimeout(() => renameRef.current?.select(), 0);
  };

  const commitRename = () => {
    if (!renamingId) return;
    const name = renameVal.trim() || "Tablica";
    saveBoards(boards.map((b) => (b.id === renamingId ? { ...b, name } : b)));
    setRenamingId(null);
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center gap-2">
        <LayoutPanelLeft className="h-5 w-5 text-[hsl(var(--rune))]" />
        <h2 className="font-display text-2xl">Tablice</h2>
      </header>

      {/* ── board tab strip ── */}
      <div className="flex items-stretch gap-1 overflow-x-auto border-b border-border">
        {boards.map((b) => {
          const isActive = b.id === activeId;
          const isRenaming = renamingId === b.id;
          return (
            <div
              key={b.id}
              className={cn(
                "group flex items-center gap-1 px-3 py-2 border-b-2 text-sm font-mono whitespace-nowrap cursor-pointer transition-colors select-none min-w-0 flex-shrink-0",
                isActive
                  ? "border-b-[hsl(var(--rune))] text-[hsl(var(--rune))] bg-[hsl(var(--rune)/0.05)]"
                  : "border-b-transparent text-muted-foreground hover:text-foreground hover:border-b-[hsl(var(--rune)/0.3)]"
              )}
              onClick={() => { if (!isRenaming) setActiveId(b.id); }}
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
                  <span className="truncate max-w-[120px]">{b.name}</span>
                  <span
                    className={cn("flex items-center gap-0.5 transition-opacity", isActive ? "opacity-60" : "opacity-0 group-hover:opacity-60")}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button title="Zmień nazwę" onClick={() => startRename(b)} className="hover:text-[hsl(var(--rune))] p-0.5">
                      <Pencil className="h-3 w-3" />
                    </button>
                    {boards.length > 1 && (
                      <button title="Usuń tablicę" onClick={() => deleteBoard(b.id)} className="hover:text-destructive p-0.5">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                </>
              )}
            </div>
          );
        })}

        {/* add board */}
        <button
          onClick={addBoard}
          title="Nowa tablica"
          className="flex items-center gap-1 px-3 py-2 border-b-2 border-b-transparent text-muted-foreground hover:text-[hsl(var(--rune))] hover:border-b-[hsl(var(--rune)/0.3)] font-mono text-xs transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Nowa
        </button>
      </div>

      {/* ── active whiteboard ── */}
      <WhiteboardCanvas
        key={activeBoard.id}
        board={activeBoard.board}
        onChange={(next) => updateBoardContent(activeBoard.id, next)}
        title={`${activeBoard.name} · ${state.name}`}
      />
    </section>
  );
};
