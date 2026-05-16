import { useState, useRef, useCallback } from "react";
import { Plus, Trash2, Globe, Users, Link2, X, ChevronDown, ChevronUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { World, Connection, Character, ConnectionNodeType } from "@/lib/vault-types";

interface Props {
  worlds: World[];
  connections: Connection[];
  characters: Character[];
  addWorld: (w: Omit<World, "id">) => void;
  updateWorld: (id: string, patch: Partial<World>) => void;
  deleteWorld: (id: string) => void;
  addConnection: (c: Omit<Connection, "id">) => void;
  deleteConnection: (id: string) => void;
}

type NodeDef = { id: string; type: ConnectionNodeType; name: string; avatar?: string };

const CONNECTION_COLORS = [
  "#cf9d7b", "#8fc4d8", "#cfa8e0", "#a8d8a0", "#e89a9a", "#f7d774",
];

function GraphView({ characters, worlds, connections, onDeleteConnection }: {
  characters: Character[];
  worlds: World[];
  connections: Connection[];
  onDeleteConnection: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const allNodes: NodeDef[] = [
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
    ...c,
    type: "character" as ConnectionNodeType,
    x: characters.length === 1 ? W / 2 : (i + 1) * (W / (characters.length + 1)),
    y: CHAR_Y,
  }));
  const worldPos = worlds.map((w, i) => ({
    ...w,
    type: "world" as ConnectionNodeType,
    x: worlds.length === 1 ? W / 2 : (i + 1) * (W / (worlds.length + 1)),
    y: WORLD_Y,
  }));
  const allPos = [...charPos, ...worldPos];

  const getPos = (id: string) => allPos.find((n) => n.id === id);

  return (
    <div className="vault-panel p-4 overflow-x-auto">
      <div className="flex items-center gap-2 mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-[hsl(var(--rune))]" />
          Postać
        </span>
        <span className="inline-flex items-center gap-1.5 ml-3">
          <span className="h-3 w-3 border border-[hsl(195,85%,60%)] rotate-45 inline-block" style={{ width: 10, height: 10 }} />
          Świat
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 400, height: H }}
        aria-label="Graf połączeń"
      >
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
          const isHovered = hovered === conn.id;
          const color = conn.color ?? "hsl(35,75%,70%)";
          return (
            <g key={conn.id}>
              <line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={color}
                strokeWidth={isHovered ? 2.5 : 1.5}
                strokeDasharray="5,3"
                opacity={isHovered ? 0.9 : 0.6}
                markerEnd="url(#arrow)"
                className="transition-all duration-150"
              />
              <text
                x={mx} y={my - 6}
                textAnchor="middle"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fill={color}
                opacity="0.85"
              >
                {conn.label}
              </text>
              <circle
                cx={mx} cy={my}
                r="10"
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(conn.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => { if (confirm(`Usunąć połączenie „${conn.label}"?`)) onDeleteConnection(conn.id); }}
              />
              {isHovered && (
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
            <circle
              cx={n.x} cy={n.y} r={R}
              fill="hsl(28,14%,10%)"
              stroke="hsl(var(--rune))"
              strokeWidth="1.5"
            />
            {n.avatar ? (
              <image
                href={n.avatar}
                x={n.x - R + 2} y={n.y - R + 2}
                width={R * 2 - 4} height={R * 2 - 4}
                clipPath={`circle(${R - 2}px at ${R - 2}px ${R - 2}px)`}
                preserveAspectRatio="xMidYMid slice"
              />
            ) : (
              <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="18" fill="hsl(var(--rune))" opacity="0.5">✦</text>
            )}
            <text
              x={n.x} y={n.y + R + 14}
              textAnchor="middle"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fill="hsl(var(--foreground))"
              opacity="0.85"
            >
              {n.name.length > 14 ? n.name.slice(0, 12) + "…" : n.name}
            </text>
          </g>
        ))}

        {worldPos.map((n) => {
          const s = 28;
          return (
            <g key={n.id}>
              <rect
                x={n.x - s / 2} y={n.y - s / 2}
                width={s} height={s}
                transform={`rotate(45, ${n.x}, ${n.y})`}
                fill="hsl(28,14%,10%)"
                stroke="hsl(195,85%,60%)"
                strokeWidth="1.5"
              />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="14" fill="hsl(195,85%,60%)">◈</text>
              <text
                x={n.x} y={n.y + s + 14}
                textAnchor="middle"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fill="hsl(195,85%,60%)"
                opacity="0.85"
              >
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

function WorldCard({ world, characters, onUpdate, onDelete, onToggleChar }: {
  world: World;
  characters: Character[];
  onUpdate: (patch: Partial<World>) => void;
  onDelete: () => void;
  onToggleChar: (charId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const linkedChars = characters.filter((c) => world.characterIds.includes(c.id));
  const unlinkedChars = characters.filter((c) => !world.characterIds.includes(c.id));

  return (
    <article className="vault-panel p-4 space-y-3">
      <header className="flex items-start gap-3">
        <Globe className="h-4 w-4 text-[hsl(195,85%,60%)] mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {editing ? (
            <Input
              autoFocus
              defaultValue={world.name}
              onBlur={(e) => { onUpdate({ name: e.target.value }); setEditing(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              className="font-display text-lg h-8 px-2"
            />
          ) : (
            <h3
              className="font-display text-lg leading-tight text-[hsl(var(--rune))] cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setEditing(true)}
            >
              {world.name || "Nowy świat"}
            </h3>
          )}
          <Textarea
            defaultValue={world.description}
            onBlur={(e) => onUpdate({ description: e.target.value })}
            placeholder="Opis świata…"
            className="mt-1.5 text-sm bg-transparent border-transparent hover:border-border focus:border-border transition-colors resize-none min-h-0"
            rows={2}
          />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            size="icon" variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="h-7 w-7 text-muted-foreground"
            aria-label="Rozwiń"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="icon" variant="ghost"
            onClick={() => { if (confirm(`Usunąć świat „${world.name}"?`)) onDelete(); }}
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            aria-label="Usuń świat"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 items-center">
        {linkedChars.length === 0 ? (
          <span className="text-[11px] font-mono text-muted-foreground italic">Brak postaci</span>
        ) : (
          linkedChars.map((c) => (
            <button
              key={c.id}
              onClick={() => onToggleChar(c.id)}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-background/60 border border-border text-[11px] font-mono hover:border-destructive/60 hover:text-destructive transition-colors group"
              title="Kliknij, aby odłączyć"
            >
              {c.avatar ? (
                <img src={c.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
              ) : (
                <User className="h-3 w-3" />
              )}
              {c.name}
              <X className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))
        )}
      </div>

      {expanded && unlinkedChars.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Dodaj postać:</p>
          <div className="flex flex-wrap gap-2">
            {unlinkedChars.map((c) => (
              <button
                key={c.id}
                onClick={() => onToggleChar(c.id)}
                className="flex items-center gap-1.5 px-2 py-1 rounded border border-dashed border-border text-[11px] font-mono hover:border-[hsl(var(--rune))] hover:text-[hsl(var(--rune))] transition-colors"
              >
                <Plus className="h-3 w-3" />
                {c.avatar ? (
                  <img src={c.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                ) : null}
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
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
  const [color, setColor] = useState(CONNECTION_COLORS[0]);
  const [open, setOpen] = useState(false);

  const nodeOptions = (type: ConnectionNodeType) =>
    type === "character"
      ? characters.map((c) => ({ id: c.id, name: c.name }))
      : worlds.map((w) => ({ id: w.id, name: w.name }));

  const handleAdd = () => {
    if (!fromId || !toId || !label.trim()) return;
    onAdd({ fromId, fromType, toId, toType, label: label.trim(), color });
    setLabel("");
    setFromId("");
    setToId("");
    setOpen(false);
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="font-mono uppercase text-xs" onClick={() => setOpen(true)}>
        <Link2 className="h-3.5 w-3.5 mr-1.5" />Nowe połączenie
      </Button>
    );
  }

  return (
    <div className="vault-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))]">Nowe połączenie</h4>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Od (typ)</Label>
          <Select value={fromType} onValueChange={(v) => { setFromType(v as ConnectionNodeType); setFromId(""); }}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="character">Postać</SelectItem>
              <SelectItem value="world">Świat</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fromId} onValueChange={setFromId}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Wybierz…" />
            </SelectTrigger>
            <SelectContent>
              {nodeOptions(fromType).map((n) => (
                <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Do (typ)</Label>
          <Select value={toType} onValueChange={(v) => { setToType(v as ConnectionNodeType); setToId(""); }}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="character">Postać</SelectItem>
              <SelectItem value="world">Świat</SelectItem>
            </SelectContent>
          </Select>
          <Select value={toId} onValueChange={setToId}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Wybierz…" />
            </SelectTrigger>
            <SelectContent>
              {nodeOptions(toType).map((n) => (
                <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Etykieta relacji</Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="np. Sojusznik, Rywal, Mieszkaniec…"
            className="mt-1 h-8 text-sm"
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          />
        </div>
        <div>
          <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Kolor</Label>
          <div className="flex gap-1.5 mt-1">
            {CONNECTION_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="h-6 w-6 rounded-full border-2 transition-all"
                style={{
                  background: c,
                  borderColor: color === c ? "white" : "transparent",
                  boxShadow: color === c ? `0 0 6px ${c}` : "none",
                }}
                aria-label={c}
              />
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={handleAdd}
        disabled={!fromId || !toId || !label.trim()}
        className="pixel-btn w-full"
        size="sm"
      >
        <Link2 className="h-3.5 w-3.5 mr-1.5" />Dodaj połączenie
      </Button>
    </div>
  );
}

export const WorldCreatorTab = ({
  worlds,
  connections,
  characters,
  addWorld,
  updateWorld,
  deleteWorld,
  addConnection,
  deleteConnection,
}: Props) => {
  const handleToggleChar = (worldId: string, charId: string, current: string[]) => {
    const next = current.includes(charId)
      ? current.filter((id) => id !== charId)
      : [...current, charId];
    updateWorld(worldId, { characterIds: next });
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[hsl(195,85%,60%)] font-mono">
            <Globe className="h-4 w-4" />
            Światy
            <span className="text-muted-foreground">({worlds.length})</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="font-mono uppercase text-xs"
            onClick={() => addWorld({ name: "Nowy świat", description: "", characterIds: [] })}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />Stwórz świat
          </Button>
        </div>

        {worlds.length === 0 ? (
          <div className="vault-panel p-10 text-center">
            <p className="font-pixel text-2xl text-[hsl(195,85%,60%)] mb-3">◈</p>
            <p className="font-display text-xl">Brak światów</p>
            <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
              Stwórz świat, aby grupować postacie i budować siatkę połączeń.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {worlds.map((w) => (
              <WorldCard
                key={w.id}
                world={w}
                characters={characters}
                onUpdate={(patch) => updateWorld(w.id, patch)}
                onDelete={() => deleteWorld(w.id)}
                onToggleChar={(charId) => handleToggleChar(w.id, charId, w.characterIds)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[hsl(var(--rune))] font-mono mb-4">
          <Link2 className="h-4 w-4" />
          Sieć połączeń
          <span className="text-muted-foreground">({connections.length})</span>
        </div>

        <GraphView
          characters={characters}
          worlds={worlds}
          connections={connections}
          onDeleteConnection={deleteConnection}
        />

        <div className="mt-4 space-y-3">
          <AddConnectionForm
            characters={characters}
            worlds={worlds}
            onAdd={addConnection}
          />

          {connections.length > 0 && (
            <div className="space-y-2">
              {connections.map((conn) => {
                const fromName =
                  conn.fromType === "character"
                    ? characters.find((c) => c.id === conn.fromId)?.name
                    : worlds.find((w) => w.id === conn.fromId)?.name;
                const toName =
                  conn.toType === "character"
                    ? characters.find((c) => c.id === conn.toId)?.name
                    : worlds.find((w) => w.id === conn.toId)?.name;

                return (
                  <div
                    key={conn.id}
                    className="flex items-center gap-3 vault-panel px-3 py-2 text-sm"
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                      style={{ background: conn.color ?? "hsl(35,75%,70%)", boxShadow: `0 0 5px ${conn.color ?? "hsl(35,75%,70%)"}` }}
                    />
                    <span className="font-mono text-[11px] text-muted-foreground truncate">{fromName ?? conn.fromId}</span>
                    <span className="font-mono text-[10px] text-[hsl(var(--rune))] flex-shrink-0">—{conn.label}→</span>
                    <span className="font-mono text-[11px] text-muted-foreground truncate">{toName ?? conn.toId}</span>
                    <button
                      onClick={() => deleteConnection(conn.id)}
                      className="ml-auto text-muted-foreground hover:text-destructive flex-shrink-0"
                      aria-label="Usuń połączenie"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
