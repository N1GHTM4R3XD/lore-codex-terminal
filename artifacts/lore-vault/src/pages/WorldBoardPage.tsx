import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, LayoutDashboard, Globe, Plus, Pencil, Trash2,
  Check, X, Link2, User,
} from "lucide-react";
import { useVaultDB } from "@/hooks/useVaultDB";
import { ParticleCanvas } from "@/components/vault/ParticleCanvas";
import { WhiteboardCanvas } from "@/components/vault/WhiteboardCanvas";
import { SettingsModal } from "@/components/vault/SettingsModal";
import { WorldCreatorTab } from "@/components/vault/WorldCreatorTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Whiteboard, Connection, ConnectionNodeType, Character, World } from "@/lib/vault-types";
import { cn } from "@/lib/utils";

type MainTab = "tablica" | "swiaty" | "powiazania";

/* ── connection graph ────────────────────────────────────────── */
const CONNECTION_COLORS = ["#cf9d7b", "#8fc4d8", "#cfa8e0", "#a8d8a0", "#e89a9a", "#f7d774"];

function GraphView({ characters, worlds, connections, onDeleteConnection }: {
  characters: Character[];
  worlds: World[];
  connections: Connection[];
  onDeleteConnection: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const allNodes = [
    ...characters.map((c) => ({ id: c.id, type: "character" as ConnectionNodeType, name: c.name, avatar: c.avatar })),
    ...worlds.map((w) => ({ id: w.id, type: "world" as ConnectionNodeType, name: w.name })),
  ];

  if (allNodes.length === 0) {
    return (
      <div className="vault-panel p-8 text-center text-muted-foreground italic text-sm">
        Brak postaci ani światów do wyświetlenia.
      </div>
    );
  }

  const W = 760;
  const H = characters.length > 0 && worlds.length > 0 ? 320 : 200;
  const CHAR_Y = worlds.length > 0 ? 80 : H / 2;
  const WORLD_Y = characters.length > 0 ? H - 80 : H / 2;
  const R = 30;

  const charPos = characters.map((c, i) => ({
    ...c, type: "character" as ConnectionNodeType,
    x: characters.length === 1 ? W / 2 : (i + 1) * (W / (characters.length + 1)),
    y: CHAR_Y,
  }));
  const worldPos = worlds.map((w, i) => ({
    ...w, type: "world" as ConnectionNodeType,
    x: worlds.length === 1 ? W / 2 : (i + 1) * (W / (worlds.length + 1)),
    y: WORLD_Y,
  }));
  const allPos = [...charPos, ...worldPos];
  const getPos = (id: string) => allPos.find((n) => n.id === id);

  return (
    <div className="vault-panel p-4 overflow-x-auto">
      <div className="flex items-center gap-4 mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-[hsl(var(--rune))]" />Postać
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block border border-[hsl(195,85%,60%)] rotate-45" style={{ width: 10, height: 10 }} />Świat
        </span>
        <span className="ml-auto opacity-50">Kliknij połączenie, aby usunąć</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 400, height: H }} aria-label="Graf połączeń">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(35,75%,70%)" opacity="0.7" />
          </marker>
        </defs>

        {connections.map((conn) => {
          const from = getPos(conn.fromId);
          const to = getPos(conn.toId);
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          const isHov = hovered === conn.id;
          const color = conn.color ?? "hsl(35,75%,70%)";
          return (
            <g key={conn.id}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={color} strokeWidth={isHov ? 2.5 : 1.5} strokeDasharray="5,3"
                opacity={isHov ? 0.9 : 0.6} markerEnd="url(#arrow)" className="transition-all duration-150" />
              <text x={mx} y={my - 6} textAnchor="middle" fontSize="10"
                fontFamily="JetBrains Mono, monospace" fill={color} opacity="0.85">
                {conn.label}
              </text>
              <circle cx={mx} cy={my} r="10" fill="transparent" style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(conn.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => { if (confirm(`Usunąć połączenie „${conn.label}"?`)) onDeleteConnection(conn.id); }} />
              {isHov && (
                <g>
                  <circle cx={mx} cy={my} r="8" fill="hsl(0,60%,45%)" opacity="0.85" />
                  <text x={mx} y={my + 3.5} textAnchor="middle" fontSize="10" fill="white" style={{ pointerEvents: "none" }}>✕</text>
                </g>
              )}
            </g>
          );
        })}

        {charPos.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={R} fill="hsl(28,14%,10%)" stroke="hsl(var(--rune))" strokeWidth="1.5" />
            {n.avatar ? (
              <image href={n.avatar} x={n.x - R + 2} y={n.y - R + 2}
                width={R * 2 - 4} height={R * 2 - 4}
                clipPath={`circle(${R - 2}px at ${R - 2}px ${R - 2}px)`}
                preserveAspectRatio="xMidYMid slice" />
            ) : (
              <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="18" fill="hsl(var(--rune))" opacity="0.5">✦</text>
            )}
            <text x={n.x} y={n.y + R + 14} textAnchor="middle" fontSize="10"
              fontFamily="JetBrains Mono, monospace" fill="hsl(var(--foreground))" opacity="0.85">
              {n.name.length > 14 ? n.name.slice(0, 12) + "…" : n.name}
            </text>
          </g>
        ))}

        {worldPos.map((n) => {
          const s = 28;
          return (
            <g key={n.id}>
              <rect x={n.x - s / 2} y={n.y - s / 2} width={s} height={s}
                transform={`rotate(45, ${n.x}, ${n.y})`} fill="hsl(28,14%,10%)"
                stroke="hsl(195,85%,60%)" strokeWidth="1.5" />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="14" fill="hsl(195,85%,60%)">◈</text>
              <text x={n.x} y={n.y + s + 14} textAnchor="middle" fontSize="10"
                fontFamily="JetBrains Mono, monospace" fill="hsl(195,85%,60%)" opacity="0.85">
                {n.name.length > 14 ? n.name.slice(0, 12) + "…" : n.name}
              </text>
            </g>
          );
        })}
      </svg>

      {connections.length === 0 && (
        <p className="text-center text-[11px] font-mono uppercase tracking-widest text-muted-foreground mt-3 opacity-60">
          Brak połączeń — dodaj je poniżej
        </p>
      )}
    </div>
  );
}

function AddConnectionForm({ characters, worlds, onAdd }: {
  characters: Character[];
  worlds: World[];
  onAdd: (c: Omit<Connection, "id">) => void;
}) {
  const [fromId, setFromId] = useState("");
  const [fromType, setFromType] = useState<ConnectionNodeType>("character");
  const [toId, setToId] = useState("");
  const [toType, setToType] = useState<ConnectionNodeType>("character");
  const [label, setLabel] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(CONNECTION_COLORS[0]);
  const [open, setOpen] = useState(false);

  const opts = (type: ConnectionNodeType) =>
    type === "character"
      ? characters.map((c) => ({ id: c.id, name: c.name }))
      : worlds.map((w) => ({ id: w.id, name: w.name }));

  const handleAdd = () => {
    if (!fromId || !toId || !label.trim()) return;
    onAdd({ fromId, fromType, toId, toType, label: label.trim(), description: desc.trim() || undefined, color });
    setLabel(""); setDesc(""); setFromId(""); setToId(""); setOpen(false);
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="font-mono uppercase text-xs" onClick={() => setOpen(true)}>
        <Link2 className="h-3.5 w-3.5 mr-1.5" />Nowe połączenie
      </Button>
    );
  }

  return (
    <div className="vault-panel p-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))]">Nowe połączenie</h4>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Od (typ)</Label>
          <Select value={fromType} onValueChange={(v) => { setFromType(v as ConnectionNodeType); setFromId(""); }}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="character">Postać</SelectItem>
              <SelectItem value="world">Świat</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fromId} onValueChange={setFromId}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Wybierz…" /></SelectTrigger>
            <SelectContent>
              {opts(fromType).map((n) => <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Do (typ)</Label>
          <Select value={toType} onValueChange={(v) => { setToType(v as ConnectionNodeType); setToId(""); }}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="character">Postać</SelectItem>
              <SelectItem value="world">Świat</SelectItem>
            </SelectContent>
          </Select>
          <Select value={toId} onValueChange={setToId}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Wybierz…" /></SelectTrigger>
            <SelectContent>
              {opts(toType).map((n) => <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Etykieta relacji</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)}
            placeholder="np. Sojusznik, Rywal…" className="mt-1 h-8 text-sm"
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }} />
        </div>
        <div>
          <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Opis (opcjonalnie)</Label>
          <Input value={desc} onChange={(e) => setDesc(e.target.value)}
            placeholder="Szczegóły relacji…" className="mt-1 h-8 text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Kolor</Label>
          <div className="flex gap-1.5 mt-1">
            {CONNECTION_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className="h-6 w-6 rounded-full border-2 transition-all"
                style={{ background: c, borderColor: color === c ? "white" : "transparent", boxShadow: color === c ? `0 0 6px ${c}` : "none" }} />
            ))}
          </div>
        </div>
        <Button onClick={handleAdd} disabled={!fromId || !toId || !label.trim()}
          className="pixel-btn ml-auto" size="sm">
          <Link2 className="h-3.5 w-3.5 mr-1.5" />Dodaj połączenie
        </Button>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
const WorldBoardPage = () => {
  const {
    db, setWorldBoard, setDb,
    addWorld, updateWorld, deleteWorld, addConnection, deleteConnection,
    addNamedBoard, updateNamedBoard, setNamedBoardContent, deleteNamedBoard,
  } = useVaultDB();

  const [searchParams] = useSearchParams();
  const [mainTab, setMainTab] = useState<MainTab>(
    searchParams.get("tab") === "swiaty" ? "swiaty"
    : searchParams.get("tab") === "powiazania" ? "powiazania"
    : "tablica",
  );
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  const namedBoards = db.namedBoards ?? [];
  const connections = db.connections ?? [];

  const currentBoard: Whiteboard =
    selectedBoardId
      ? (namedBoards.find((b) => b.id === selectedBoardId)?.board ?? { notes: [], strokes: [] })
      : db.worldBoard;

  const currentBoardTitle =
    selectedBoardId
      ? (namedBoards.find((b) => b.id === selectedBoardId)?.name ?? "Tablica")
      : "Tablica Świata";

  const handleBoardChange = (next: Whiteboard) => {
    if (selectedBoardId) setNamedBoardContent(selectedBoardId, next);
    else setWorldBoard(next);
  };

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) return;
    const board = addNamedBoard(newBoardName.trim());
    setSelectedBoardId(board.id);
    setNewBoardName("");
    setCreatingBoard(false);
  };

  const startRename = (id: string, name: string) => { setRenamingId(id); setRenameValue(name); };
  const commitRename = () => {
    if (renamingId && renameValue.trim()) updateNamedBoard(renamingId, { name: renameValue.trim() });
    setRenamingId(null);
  };

  const TABS: { id: MainTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "tablica",    label: "Tablice",        icon: LayoutDashboard },
    { id: "swiaty",     label: "Kreator Światów", icon: Globe, count: db.worlds?.length },
    { id: "powiazania", label: "Powiązania",      icon: Link2, count: connections.length },
  ];

  return (
    <div className="relative min-h-screen">
      <ParticleCanvas effect={db.settings.effect} />
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <SettingsModal db={db} setDb={setDb} />
      </div>
      <div className="fixed top-4 left-4 z-40">
        <Button asChild variant="outline" size="sm" className="font-mono uppercase tracking-wider text-xs">
          <Link to="/" aria-label="Wróć"><ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Vault</Link>
        </Button>
      </div>

      <main className="relative z-10 container pt-16 pb-20">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-[hsl(var(--rune))] font-pixel mb-3">
          <span className="h-px w-10 bg-[hsl(var(--rune))]" />Świat<span className="h-px w-10 bg-[hsl(var(--rune))]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display rune-text leading-tight mb-6">Tablica Świata</h1>

        {/* Tab bar */}
        <div className="flex items-center gap-1 mb-8 border-b border-border">
          {TABS.map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => setMainTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest border-b-2 -mb-px transition-colors",
                mainTab === id
                  ? id === "powiazania"
                    ? "border-[hsl(195,85%,60%)] text-[hsl(195,85%,60%)]"
                    : "border-[hsl(var(--rune))] text-[hsl(var(--rune))]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {count !== undefined && count > 0 && (
                <span className={cn(
                  "inline-flex items-center justify-center h-4 w-4 rounded-full text-[9px] font-bold",
                  mainTab === id ? "bg-current text-background opacity-80" : "bg-muted text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tablica tab ── */}
        {mainTab === "tablica" && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <nav className="flex-shrink-0 w-48 space-y-1" aria-label="Tablice">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Tablice</p>
                <button onClick={() => setSelectedBoardId(null)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded text-sm font-mono flex items-center gap-2 transition-colors",
                    selectedBoardId === null
                      ? "bg-[hsl(var(--rune)/0.15)] text-[hsl(var(--rune))] border border-[hsl(var(--rune)/0.4)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                  )}>
                  <LayoutDashboard className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">Tablica Świata</span>
                </button>

                {namedBoards.map((board) => (
                  <div key={board.id} className="group/item relative">
                    {renamingId === board.id ? (
                      <div className="flex items-center gap-1 px-1">
                        <Input autoFocus value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="h-7 text-xs px-2 flex-1"
                          onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }} />
                        <button onClick={commitRename} className="text-green-400 hover:text-green-300"><Check className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setRenamingId(null)} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setSelectedBoardId(board.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded text-sm font-mono flex items-center gap-2 transition-colors pr-14",
                          selectedBoardId === board.id
                            ? "bg-[hsl(var(--rune)/0.15)] text-[hsl(var(--rune))] border border-[hsl(var(--rune)/0.4)]"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                        )}>
                        <LayoutDashboard className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{board.name}</span>
                      </button>
                    )}
                    {renamingId !== board.id && (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); startRename(board.id, board.name); }}
                          className="h-6 w-6 grid place-items-center text-muted-foreground hover:text-foreground rounded"><Pencil className="h-3 w-3" /></button>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Usunąć tablicę „${board.name}"?`)) {
                            if (selectedBoardId === board.id) setSelectedBoardId(null);
                            deleteNamedBoard(board.id);
                          }
                        }} className="h-6 w-6 grid place-items-center text-muted-foreground hover:text-destructive rounded"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    )}
                  </div>
                ))}

                {creatingBoard ? (
                  <div className="flex items-center gap-1 px-1 pt-1">
                    <Input autoFocus value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      placeholder="Nazwa tablicy…" className="h-7 text-xs px-2 flex-1"
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateBoard(); if (e.key === "Escape") setCreatingBoard(false); }} />
                    <button onClick={handleCreateBoard} className="text-green-400 hover:text-green-300"><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setCreatingBoard(false)} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ) : (
                  <button onClick={() => setCreatingBoard(true)}
                    className="w-full text-left px-3 py-2 rounded text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-2 border border-dashed border-border hover:border-[hsl(var(--rune)/0.5)] transition-colors">
                    <Plus className="h-3 w-3" />Nowa tablica
                  </button>
                )}
              </nav>

              <div className="flex-1 min-w-0">
                <WhiteboardCanvas key={selectedBoardId ?? "world"} board={currentBoard}
                  onChange={handleBoardChange} title={currentBoardTitle} />
              </div>
            </div>
          </div>
        )}

        {/* ── Światy tab ── */}
        {mainTab === "swiaty" && (
          <div>
            <p className="text-muted-foreground italic mb-6 max-w-2xl text-sm">
              Buduj fikcyjne światy, przypisuj do nich postacie i otwieraj ich pełne karty, aby pisać kroniki i encyklopedie.
            </p>
            <WorldCreatorTab
              worlds={db.worlds ?? []}
              characters={db.characters}
              addWorld={addWorld}
              updateWorld={updateWorld}
              deleteWorld={deleteWorld}
            />
          </div>
        )}

        {/* ── Powiązania tab ── */}
        {mainTab === "powiazania" && (
          <div className="space-y-8">
            <div>
              <p className="text-muted-foreground italic mb-4 max-w-2xl text-sm">
                Twórz sieć relacji między postaciami i światami — sojusze, rywalizacje, zamieszkanie, pokrewieństwo i cokolwiek innego.
              </p>
              <GraphView
                characters={db.characters}
                worlds={db.worlds ?? []}
                connections={connections}
                onDeleteConnection={deleteConnection}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[hsl(var(--rune))] font-mono mb-2">
                <Link2 className="h-4 w-4" />Połączenia
                <span className="text-muted-foreground">({connections.length})</span>
              </div>

              <AddConnectionForm characters={db.characters} worlds={db.worlds ?? []} onAdd={addConnection} />

              {connections.length > 0 && (
                <div className="space-y-2 mt-4">
                  {connections.map((conn) => {
                    const fromName =
                      conn.fromType === "character"
                        ? db.characters.find((c) => c.id === conn.fromId)?.name
                        : (db.worlds ?? []).find((w) => w.id === conn.fromId)?.name;
                    const toName =
                      conn.toType === "character"
                        ? db.characters.find((c) => c.id === conn.toId)?.name
                        : (db.worlds ?? []).find((w) => w.id === conn.toId)?.name;

                    return (
                      <div key={conn.id} className="vault-panel px-3 py-2 space-y-1 group">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                            style={{ background: conn.color ?? "hsl(35,75%,70%)", boxShadow: `0 0 5px ${conn.color ?? "hsl(35,75%,70%)"}` }} />
                          <span className="font-mono text-[11px] text-muted-foreground truncate">{fromName ?? conn.fromId}</span>
                          <span className="font-mono text-[10px] text-[hsl(var(--rune))] flex-shrink-0">—{conn.label}→</span>
                          <span className="font-mono text-[11px] text-muted-foreground truncate">{toName ?? conn.toId}</span>
                          <button onClick={() => deleteConnection(conn.id)}
                            className="ml-auto text-muted-foreground hover:text-destructive flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {conn.description && (
                          <p className="font-mono text-[10px] text-muted-foreground pl-5 opacity-70">{conn.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorldBoardPage;
