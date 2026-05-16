import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutDashboard, Plus, Trash2, Image as ImageIcon, Pencil, Hand, Eraser, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BoardNote, BoardStroke, Whiteboard } from "@/lib/vault-types";
import { cn } from "@/lib/utils";

interface Props {
  board: Whiteboard;
  onChange: (next: Whiteboard) => void;
  title?: string;
  hideHeader?: boolean;
}

type Tool = "pan" | "draw" | "erase";

const STICKY_COLORS = ["#f7d774", "#e89a9a", "#a8d8a0", "#8fc4d8", "#cfa8e0", "#f0c89e"];

export const WhiteboardCanvas = ({ board, onChange, title = "Tablica", hideHeader }: Props) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pan");
  const [color, setColor] = useState("#e0b06a");
  const [size, setSize] = useState(3);
  const drawingRef = useRef<BoardStroke | null>(null);
  const draggingRef = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const [dims, setDims] = useState({ w: 1200, h: 800 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setDims({ w: el.clientWidth, h: Math.max(600, el.clientHeight) });
    });
    ro.observe(el);
    setDims({ w: el.clientWidth, h: Math.max(600, el.clientHeight) });
    return () => ro.disconnect();
  }, []);

  const fullRepaint = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = dims.w * dpr;
    c.height = dims.h * dpr;
    c.style.width = dims.w + "px";
    c.style.height = dims.h + "px";
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.clearRect(0, 0, dims.w, dims.h);
    [...board.strokes, drawingRef.current].forEach((s) => {
      if (!s || s.points.length < 2) return;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.size;
      ctx.beginPath();
      ctx.moveTo(s.points[0], s.points[1]);
      for (let i = 2; i < s.points.length; i += 2) ctx.lineTo(s.points[i], s.points[i + 1]);
      ctx.stroke();
    });
  }, [board.strokes, dims.w, dims.h]);

  useEffect(() => { fullRepaint(); }, [fullRepaint]);

  const localXY = (e: React.PointerEvent) => {
    const r = wrapRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (tool === "draw" || tool === "erase") {
      (e.target as Element).setPointerCapture?.(e.pointerId);
      const { x, y } = localXY(e);
      if (tool === "erase") {
        const next = board.strokes.filter((s) => !pointNearStroke(s, x, y, size * 6));
        if (next.length !== board.strokes.length) onChange({ ...board, strokes: next });
        return;
      }
      drawingRef.current = {
        id: crypto.randomUUID(),
        color,
        size,
        points: [x, y],
      };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const { x, y } = localXY(e);

    if (drawingRef.current) {
      const pts = drawingRef.current.points;
      const prevX = pts[pts.length - 2];
      const prevY = pts[pts.length - 1];
      drawingRef.current.points.push(x, y);

      const c = canvasRef.current;
      if (c && prevX !== undefined) {
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.strokeStyle = drawingRef.current.color;
          ctx.lineWidth = drawingRef.current.size;
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }
    }

    if (draggingRef.current) {
      const d = draggingRef.current;
      onChange({
        ...board,
        notes: board.notes.map((n) =>
          n.id === d.id ? { ...n, x: Math.max(0, x - d.ox), y: Math.max(0, y - d.oy) } : n
        ),
      });
    }
  };

  const onPointerUp = () => {
    if (drawingRef.current && drawingRef.current.points.length > 2) {
      onChange({ ...board, strokes: [...board.strokes, drawingRef.current] });
    }
    drawingRef.current = null;
    draggingRef.current = null;
  };

  const addNote = (extra?: Partial<BoardNote>) => {
    const note: BoardNote = {
      id: crypto.randomUUID(),
      x: 40 + Math.random() * 200,
      y: 40 + Math.random() * 200,
      w: 200,
      h: 160,
      rotate: (Math.random() - 0.5) * 8,
      color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)],
      text: "Nowa notatka…",
      ...extra,
    };
    onChange({ ...board, notes: [...board.notes, note] });
  };

  const addImage = () => {
    const url = prompt("URL obrazu (PNG/JPG/GIF):");
    if (!url) return;
    addNote({ imageUrl: url, text: "", w: 220, h: 220, color: "rgba(20,20,20,0.85)" });
  };

  const updateNote = (id: string, p: Partial<BoardNote>) =>
    onChange({ ...board, notes: board.notes.map((n) => (n.id === id ? { ...n, ...p } : n)) });
  const removeNote = (id: string) =>
    onChange({ ...board, notes: board.notes.filter((n) => n.id !== id) });

  const noteDown = (e: React.PointerEvent, n: BoardNote) => {
    if (tool !== "pan") return;
    e.stopPropagation();
    const { x, y } = localXY(e);
    draggingRef.current = { id: n.id, ox: x - n.x, oy: y - n.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const clearBoard = useCallback(() => {
    if (confirm("Wyczyścić całą tablicę?")) onChange({ notes: [], strokes: [] });
  }, [onChange]);

  return (
    <section className="space-y-4">
      {!hideHeader && (
        <header className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-display text-2xl flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-[hsl(var(--rune))]" />
            {title}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <ToolBar
              tool={tool}
              setTool={setTool}
              color={color}
              setColor={setColor}
              size={size}
              setSize={setSize}
              onAddNote={() => addNote()}
              onAddImage={addImage}
              onClear={clearBoard}
            />
          </div>
        </header>
      )}

      {hideHeader && (
        <div className="flex flex-wrap items-center gap-2">
          <ToolBar
            tool={tool}
            setTool={setTool}
            color={color}
            setColor={setColor}
            size={size}
            setSize={setSize}
            onAddNote={() => addNote()}
            onAddImage={addImage}
            onClear={clearBoard}
          />
        </div>
      )}

      <div
        ref={wrapRef}
        className="vault-panel relative w-full h-[65vh] overflow-hidden select-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border)/0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)/0.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          cursor: tool === "draw" ? "crosshair" : tool === "erase" ? "cell" : "default",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

        {board.notes.map((n) => (
          <article
            key={n.id}
            className="absolute group shadow-pixel"
            style={{
              left: n.x,
              top: n.y,
              width: n.w,
              minHeight: n.h,
              transform: `rotate(${n.rotate}deg)`,
              background: n.color,
              color: n.imageUrl ? "white" : "#1a1714",
              cursor: tool === "pan" ? "grab" : "default",
              zIndex: 10,
            }}
            onPointerDown={(e) => noteDown(e, n)}
          >
            {n.imageUrl && (
              <img src={n.imageUrl} alt="" className="w-full h-40 object-cover" loading="lazy" />
            )}
            <textarea
              value={n.text}
              onChange={(e) => updateNote(n.id, { text: e.target.value })}
              className="w-full bg-transparent border-0 focus:outline-none p-2 resize-none font-handwritten text-base"
              style={{ minHeight: 80 }}
              placeholder="Notatka…"
              onPointerDown={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => { e.stopPropagation(); removeNote(n.id); }}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] grid place-items-center opacity-0 group-hover:opacity-100 transition"
              aria-label="Usuń notatkę"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </article>
        ))}

        {board.notes.length === 0 && board.strokes.length === 0 && (
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground opacity-60">
              Pusta tablica — dodaj notatkę, narysuj lub wklej obraz
            </p>
          </div>
        )}
      </div>

      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
        <Save className="h-3 w-3" /> Autozapis · {board.notes.length} notatek · {board.strokes.length} szkiców
      </p>
    </section>
  );
};

function ToolBar({
  tool, setTool, color, setColor, size, setSize,
  onAddNote, onAddImage, onClear,
}: {
  tool: Tool; setTool: (t: Tool) => void;
  color: string; setColor: (c: string) => void;
  size: number; setSize: (s: number) => void;
  onAddNote: () => void; onAddImage: () => void; onClear: () => void;
}) {
  return (
    <>
      <div className="vault-panel rounded-full p-1 flex">
        {([
          { id: "pan", icon: Hand, label: "Przesuwaj" },
          { id: "draw", icon: Pencil, label: "Rysuj" },
          { id: "erase", icon: Eraser, label: "Wymaż" },
        ] as { id: Tool; icon: typeof Hand; label: string }[]).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTool(id)}
            title={label}
            aria-pressed={tool === id}
            className={cn(
              "h-8 w-8 grid place-items-center rounded-full transition",
              tool === id ? "bg-[hsl(var(--rune))] text-[hsl(var(--primary-foreground))]" : "text-muted-foreground hover:text-[hsl(var(--rune))]",
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      {tool === "draw" && (
        <div className="flex items-center gap-1">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-8 rounded border border-border bg-transparent cursor-pointer" title="Kolor" />
          <Input type="number" min={1} max={20} value={size} onChange={(e) => setSize(+e.target.value || 1)} className="w-14 font-mono text-xs" title="Grubość" />
        </div>
      )}
      <Button size="sm" variant="outline" onClick={onAddNote} className="font-mono uppercase text-xs">
        <Plus className="h-3.5 w-3.5 mr-1" />Notatka
      </Button>
      <Button size="sm" variant="outline" onClick={onAddImage} className="font-mono uppercase text-xs">
        <ImageIcon className="h-3.5 w-3.5 mr-1" />Obraz
      </Button>
      <Button size="sm" variant="destructive" onClick={onClear} className="font-mono uppercase text-xs">
        <Trash2 className="h-3.5 w-3.5 mr-1" />Wyczyść
      </Button>
    </>
  );
}

function pointNearStroke(s: BoardStroke, x: number, y: number, r: number): boolean {
  for (let i = 0; i < s.points.length; i += 2) {
    const dx = s.points[i] - x;
    const dy = s.points[i + 1] - y;
    if (dx * dx + dy * dy <= r * r) return true;
  }
  return false;
}
