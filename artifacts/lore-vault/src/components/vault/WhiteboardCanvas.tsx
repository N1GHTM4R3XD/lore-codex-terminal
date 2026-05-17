import { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, Plus, Trash2, Image as ImageIcon,
  Pencil, Hand, Eraser, Save, ZoomIn, ZoomOut,
  Undo2, Redo2, Palette, Maximize2, Minimize2, PenTool,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BoardNote, BoardStroke, BrushType, BgPattern, Whiteboard } from "@/lib/vault-types";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────── */
type Tool = "pan" | "draw" | "erase";
interface Viewport { x: number; y: number; scale: number; }

/* ─── Constants ──────────────────────────────────────────────── */
const GRID = 32;
const MIN_SCALE = 0.08;
const MAX_SCALE = 12;
const STICKY_COLORS = ["#f7d774", "#e89a9a", "#a8d8a0", "#8fc4d8", "#cfa8e0", "#f0c89e"];

/* ─── Pure helpers ───────────────────────────────────────────── */
function pressureFactor(p: number, brush: BrushType): number {
  const n = p <= 0 ? 0.5 : p;
  switch (brush) {
    case "ink":    return 0.15 + n * 1.7;
    case "pen":    return 0.55 + n * 0.7;
    case "pencil": return 0.35 + n * 1.0;
    case "marker": return 1;
  }
}

function brushAlpha(brush: BrushType): number {
  switch (brush) {
    case "marker": return 0.42;
    case "pencil": return 0.62;
    default:       return 1;
  }
}

function drawStrokeOnCtx(
  ctx: CanvasRenderingContext2D,
  s: BoardStroke,
  vp: Viewport,
) {
  const pts = s.points;
  if (pts.length < 4) return;
  const brush: BrushType = (s.brushType as BrushType) ?? "pen";
  const alpha = brushAlpha(brush);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = s.color;
  ctx.globalAlpha = alpha;

  const prs = s.pressure;

  if (prs && prs.length > 1) {
    const count = Math.floor(pts.length / 2) - 1;
    for (let i = 0; i < count; i++) {
      const p0 = prs[i] ?? 0.5;
      const p1 = prs[i + 1] ?? p0;
      const w = s.size * ((pressureFactor(p0, brush) + pressureFactor(p1, brush)) / 2) * vp.scale;
      ctx.lineWidth = Math.max(0.5, w);
      ctx.beginPath();
      ctx.moveTo(pts[i * 2] * vp.scale + vp.x, pts[i * 2 + 1] * vp.scale + vp.y);
      ctx.lineTo(pts[(i + 1) * 2] * vp.scale + vp.x, pts[(i + 1) * 2 + 1] * vp.scale + vp.y);
      ctx.stroke();
    }
  } else {
    ctx.lineWidth = Math.max(0.5, s.size * vp.scale);
    ctx.beginPath();
    ctx.moveTo(pts[0] * vp.scale + vp.x, pts[1] * vp.scale + vp.y);
    for (let i = 2; i < pts.length; i += 2) {
      ctx.lineTo(pts[i] * vp.scale + vp.x, pts[i + 1] * vp.scale + vp.y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function eraseAtPoint(
  strokes: BoardStroke[],
  bx: number, by: number, r: number,
): BoardStroke[] {
  const r2 = r * r;
  const result: BoardStroke[] = [];

  for (const s of strokes) {
    const n = Math.floor(s.points.length / 2);
    const keep: boolean[] = [];
    for (let i = 0; i < n; i++) {
      const dx = s.points[i * 2] - bx;
      const dy = s.points[i * 2 + 1] - by;
      keep.push(dx * dx + dy * dy > r2);
    }

    if (keep.every(Boolean)) { result.push(s); continue; }
    if (!keep.some(Boolean)) { continue; }

    let seg: number[] = [];
    let segPr: number[] = [];
    for (let i = 0; i < n; i++) {
      if (keep[i]) {
        seg.push(s.points[i * 2], s.points[i * 2 + 1]);
        if (s.pressure) segPr.push(s.pressure[i]);
      } else {
        if (seg.length >= 4) {
          result.push({ ...s, id: crypto.randomUUID(), points: seg, pressure: segPr.length ? segPr : undefined });
        }
        seg = []; segPr = [];
      }
    }
    if (seg.length >= 4) {
      result.push({ ...s, id: crypto.randomUUID(), points: seg, pressure: segPr.length ? segPr : undefined });
    }
  }
  return result;
}

function bgStyle(color: string, pattern: BgPattern, patColor: string, vp: Viewport): React.CSSProperties {
  const gx = GRID * vp.scale;
  const ox = ((vp.x % gx) + gx) % gx;
  const oy = ((vp.y % gx) + gx) % gx;
  const base: React.CSSProperties = { backgroundColor: color };
  if (pattern === "none") return base;
  if (pattern === "grid") return {
    ...base,
    backgroundImage: `linear-gradient(${patColor} 1px,transparent 1px),linear-gradient(90deg,${patColor} 1px,transparent 1px)`,
    backgroundSize: `${gx}px ${gx}px`,
    backgroundPosition: `${ox}px ${oy}px`,
  };
  if (pattern === "lines") return {
    ...base,
    backgroundImage: `linear-gradient(${patColor} 1px,transparent 1px)`,
    backgroundSize: `${gx}px ${gx}px`,
    backgroundPosition: `${ox}px ${oy}px`,
  };
  if (pattern === "dots") return {
    ...base,
    backgroundImage: `radial-gradient(circle,${patColor} 1.5px,transparent 1.5px)`,
    backgroundSize: `${gx}px ${gx}px`,
    backgroundPosition: `${ox}px ${oy}px`,
  };
  return base;
}

/* ─── Main Component ─────────────────────────────────────────── */
interface Props {
  board: Whiteboard;
  onChange: (next: Whiteboard) => void;
  title?: string;
  hideHeader?: boolean;
}

export const WhiteboardCanvas = ({ board, onChange, title = "Tablica", hideHeader }: Props) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<Tool>("pan");
  const [brushType, setBrushType] = useState<BrushType>("pen");
  const [color, setColor] = useState("#e0b06a");
  const [size, setSize] = useState(4);
  const [eraserSize, setEraserSize] = useState(24);

  const [vp, setVp] = useState<Viewport>({ x: 0, y: 0, scale: 1 });

  const [showBg, setShowBg] = useState(false);
  const [bgColor, setBgColor] = useState(board.bgColor ?? "#0f0d0a");
  const [bgPat, setBgPat] = useState<BgPattern>(board.bgPattern ?? "grid");
  const [bgPatColor, setBgPatColor] = useState(board.bgPatternColor ?? "rgba(255,255,255,0.08)");

  const [undoStack, setUndoStack] = useState<Whiteboard[]>([]);
  const [redoStack, setRedoStack] = useState<Whiteboard[]>([]);

  /* new: fullscreen & stylus-only mode */
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stylusOnly, setStylusOnly] = useState(false);

  const drawingRef = useRef<{ stroke: BoardStroke; pressures: number[] } | null>(null);
  const panRef = useRef<{ sx0: number; sy0: number; vx0: number; vy0: number } | null>(null);
  const eraserWorkRef = useRef<BoardStroke[]>([]);
  const isErasingRef = useRef(false);
  const dragNoteRef = useRef<{ id: string; ox: number; oy: number } | null>(null);

  const vpRef = useRef(vp);
  useEffect(() => { vpRef.current = vp; }, [vp]);

  /* lock body scroll in fullscreen on mobile */
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isFullscreen]);

  /* ── undo helpers ───────────────────────────────────────────── */
  const pushUndo = useCallback((prev: Whiteboard) => {
    setUndoStack(s => [...s.slice(-39), prev]);
    setRedoStack([]);
  }, []);

  const undo = useCallback(() => {
    if (!undoStack.length) return;
    setRedoStack(r => [...r, board]);
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(s => s.slice(0, -1));
    onChange(prev);
  }, [undoStack, board, onChange]);

  const redo = useCallback(() => {
    if (!redoStack.length) return;
    setUndoStack(s => [...s, board]);
    const next = redoStack[redoStack.length - 1];
    setRedoStack(r => r.slice(0, -1));
    onChange(next);
  }, [redoStack, board, onChange]);

  /* ── canvas repaint ─────────────────────────────────────────── */
  const repaint = useCallback(() => {
    const wrap = wrapRef.current;
    const c = canvasRef.current;
    if (!wrap || !c) return;
    const W = wrap.clientWidth, H = wrap.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    c.width = W * dpr; c.height = H * dpr;
    c.style.width = W + "px"; c.style.height = H + "px";
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    const strokes = isErasingRef.current ? eraserWorkRef.current : board.strokes;
    strokes.forEach(s => drawStrokeOnCtx(ctx, s, vpRef.current));
    if (drawingRef.current) {
      drawStrokeOnCtx(ctx, { ...drawingRef.current.stroke, pressure: drawingRef.current.pressures }, vpRef.current);
    }
  }, [board.strokes]);

  useEffect(() => { repaint(); }, [repaint]);

  /* ── keyboard: undo/redo & ESC fullscreen ───────────────────── */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); redo(); }
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [undo, redo, isFullscreen]);

  /* ── wheel zoom ─────────────────────────────────────────────── */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY > 0 ? 0.92 : 1.09;
      setVp(v => {
        const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
        const ratio = ns / v.scale;
        return { scale: ns, x: mx - ratio * (mx - v.x), y: my - ratio * (my - v.y) };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /* ── pinch-to-zoom on touch ──────────────────────────────────── */
  const pinchRef = useRef<{ dist: number; mx: number; my: number } | null>(null);
  const activeTouches = useRef<Map<number, { x: number; y: number }>>(new Map());

  const zoomAt = (factor: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const cx = el.clientWidth / 2, cy = el.clientHeight / 2;
    setVp(v => {
      const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
      const r = ns / v.scale;
      return { scale: ns, x: cx - r * (cx - v.x), y: cy - r * (cy - v.y) };
    });
  };

  /* ── coord helpers ──────────────────────────────────────────── */
  const localXY = (e: React.PointerEvent) => {
    const r = wrapRef.current!.getBoundingClientRect();
    return { sx: e.clientX - r.left, sy: e.clientY - r.top };
  };

  const toBoard = (sx: number, sy: number, v: Viewport): [number, number] => [
    (sx - v.x) / v.scale,
    (sy - v.y) / v.scale,
  ];

  /**
   * Resolve the effective tool for this pointer event.
   * In stylus-only mode: touch always pans, stylus uses selected tool.
   */
  const effectiveTool = (e: React.PointerEvent): Tool => {
    if (stylusOnly && e.pointerType === "touch") return "pan";
    return tool;
  };

  /* ── pointer events ─────────────────────────────────────────── */
  const onPointerDown = (e: React.PointerEvent) => {
    activeTouches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    /* Two-finger pinch detection */
    if (activeTouches.current.size === 2 && e.pointerType === "touch") {
      const pts = [...activeTouches.current.values()];
      const dx = pts[1].x - pts[0].x;
      const dy = pts[1].y - pts[0].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mx = (pts[0].x + pts[1].x) / 2 - wrapRef.current!.getBoundingClientRect().left;
      const my = (pts[0].y + pts[1].y) / 2 - wrapRef.current!.getBoundingClientRect().top;
      pinchRef.current = { dist, mx, my };
      drawingRef.current = null;
      panRef.current = null;
      return;
    }

    const { sx, sy } = localXY(e);
    const v = vpRef.current;
    const eTool = effectiveTool(e);

    if (eTool === "pan") {
      panRef.current = { sx0: sx, sy0: sy, vx0: v.x, vy0: v.y };
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      return;
    }

    if (eTool === "draw") {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      const [bx, by] = toBoard(sx, sy, v);
      const p = e.pressure <= 0 ? 0.5 : e.pressure;
      drawingRef.current = {
        stroke: { id: crypto.randomUUID(), color, size, brushType, points: [bx, by] },
        pressures: [p],
      };
      return;
    }

    if (eTool === "erase") {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      isErasingRef.current = true;
      eraserWorkRef.current = [...board.strokes];
      const [bx, by] = toBoard(sx, sy, v);
      const r = (eraserSize / 2) / v.scale;
      eraserWorkRef.current = eraseAtPoint(eraserWorkRef.current, bx, by, r);
      repaint();
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    activeTouches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    /* Handle pinch zoom */
    if (pinchRef.current && activeTouches.current.size === 2) {
      const pts = [...activeTouches.current.values()];
      const dx = pts[1].x - pts[0].x;
      const dy = pts[1].y - pts[0].y;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      const factor = newDist / pinchRef.current.dist;
      const { mx, my } = pinchRef.current;
      setVp(v => {
        const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
        const r = ns / v.scale;
        return { scale: ns, x: mx - r * (mx - v.x), y: my - r * (my - v.y) };
      });
      pinchRef.current = { dist: newDist, mx, my };
      return;
    }

    const { sx, sy } = localXY(e);
    const v = vpRef.current;

    if (dragNoteRef.current) {
      const d = dragNoteRef.current;
      const nbx = (sx - d.ox - v.x) / v.scale;
      const nby = (sy - d.oy - v.y) / v.scale;
      onChange({ ...board, notes: board.notes.map(n => n.id === d.id ? { ...n, x: nbx, y: nby } : n) });
      return;
    }

    if (panRef.current) {
      const p = panRef.current;
      setVp(v => ({ ...v, x: p.vx0 + (sx - p.sx0), y: p.vy0 + (sy - p.sy0) }));
      return;
    }

    if (drawingRef.current) {
      const [bx, by] = toBoard(sx, sy, v);
      const pts = drawingRef.current.stroke.points;
      const prevBx = pts[pts.length - 2];
      const prevBy = pts[pts.length - 1];
      const dx = bx - prevBx, dy = by - prevBy;
      if (dx * dx + dy * dy < 0.3) return;
      const p = e.pressure <= 0 ? 0.5 : e.pressure;
      drawingRef.current.stroke.points.push(bx, by);
      drawingRef.current.pressures.push(p);
      repaint();
      return;
    }

    if (isErasingRef.current) {
      const [bx, by] = toBoard(sx, sy, v);
      const r = (eraserSize / 2) / v.scale;
      eraserWorkRef.current = eraseAtPoint(eraserWorkRef.current, bx, by, r);
      repaint();
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    activeTouches.current.delete(e.pointerId);
    if (activeTouches.current.size < 2) pinchRef.current = null;

    panRef.current = null;
    dragNoteRef.current = null;

    if (drawingRef.current) {
      const { stroke, pressures } = drawingRef.current;
      if (stroke.points.length >= 4) {
        pushUndo(board);
        onChange({ ...board, strokes: [...board.strokes, { ...stroke, pressure: pressures }] });
      }
      drawingRef.current = null;
      repaint();
    }

    if (isErasingRef.current) {
      isErasingRef.current = false;
      const next = eraserWorkRef.current;
      if (next.length !== board.strokes.length || JSON.stringify(next) !== JSON.stringify(board.strokes)) {
        pushUndo(board);
        onChange({ ...board, strokes: next });
      }
      eraserWorkRef.current = [];
      repaint();
    }
  };

  const onPointerLeave = (e: React.PointerEvent) => {
    activeTouches.current.delete(e.pointerId);
    onPointerUp(e);
  };

  /* ── note helpers ───────────────────────────────────────────── */
  const noteDown = (e: React.PointerEvent, n: BoardNote) => {
    if (tool !== "pan") return;
    e.stopPropagation();
    const { sx, sy } = localXY(e);
    const v = vpRef.current;
    dragNoteRef.current = {
      id: n.id,
      ox: sx - n.x * v.scale - v.x,
      oy: sy - n.y * v.scale - v.y,
    };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const addNote = (extra?: Partial<BoardNote>) => {
    const v = vpRef.current;
    const el = wrapRef.current;
    const [bx, by] = toBoard((el?.clientWidth ?? 600) / 2, (el?.clientHeight ?? 400) / 2, v);
    const note: BoardNote = {
      id: crypto.randomUUID(),
      x: bx - 100 + Math.random() * 60,
      y: by - 80 + Math.random() * 40,
      w: 200, h: 160,
      rotate: (Math.random() - 0.5) * 8,
      color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)],
      text: "Nowa notatka…",
      ...extra,
    };
    pushUndo(board);
    onChange({ ...board, notes: [...board.notes, note] });
  };

  const addImage = () => {
    const url = prompt("URL obrazu (PNG/JPG/GIF):");
    if (!url) return;
    addNote({ imageUrl: url, text: "", w: 220, h: 220, color: "rgba(20,20,20,0.85)" });
  };

  const removeNote = (id: string) => {
    pushUndo(board);
    onChange({ ...board, notes: board.notes.filter(n => n.id !== id) });
  };

  const updateNote = (id: string, p: Partial<BoardNote>) =>
    onChange({ ...board, notes: board.notes.map(n => n.id === id ? { ...n, ...p } : n) });

  /* ── background persist ─────────────────────────────────────── */
  const applyBg = (patch: { bgColor?: string; bgPattern?: BgPattern; bgPatternColor?: string }) => {
    const next = {
      bgColor: patch.bgColor ?? bgColor,
      bgPattern: patch.bgPattern ?? bgPat,
      bgPatternColor: patch.bgPatternColor ?? bgPatColor,
    };
    if (patch.bgColor !== undefined) setBgColor(patch.bgColor);
    if (patch.bgPattern !== undefined) setBgPat(patch.bgPattern);
    if (patch.bgPatternColor !== undefined) setBgPatColor(patch.bgPatternColor);
    onChange({ ...board, ...next });
  };

  /* ── cursor ─────────────────────────────────────────────────── */
  const cursor = tool === "draw" ? "crosshair" : tool === "erase" ? "cell" : panRef.current ? "grabbing" : "grab";

  /* ── toolbar (shared between normal and fullscreen) ─────────── */
  const toolbar = (
    <div className="flex items-center flex-wrap gap-2 px-2 py-1.5">
      {!hideHeader && !isFullscreen && (
        <h2 className="font-display text-2xl flex items-center gap-2 mr-auto">
          <LayoutDashboard className="h-5 w-5 text-[hsl(var(--rune))]" />
          {title}
        </h2>
      )}

      {/* Tool picker */}
      <div className="vault-panel rounded-full p-1 flex gap-0.5">
        {([
          { id: "pan" as Tool, icon: Hand, label: "Przesuwaj (palec)" },
          { id: "draw" as Tool, icon: Pencil, label: "Rysuj" },
          { id: "erase" as Tool, icon: Eraser, label: "Gumka" },
        ] as const).map(({ id, icon: Icon, label }) => (
          <button
            key={id} onClick={() => setTool(id)} title={label} aria-pressed={tool === id}
            className={cn("h-8 w-8 grid place-items-center rounded-full transition",
              tool === id ? "bg-[hsl(var(--rune))] text-[hsl(var(--primary-foreground))]" : "text-muted-foreground hover:text-[hsl(var(--rune))]")}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* Stylus-only toggle */}
      <button
        onClick={() => setStylusOnly(v => !v)}
        title={stylusOnly ? "Tryb rysika: Rysik rysuje, palec przesuwa" : "Tryb rysika wyłączony — włącz, by palec zawsze przesuwał"}
        aria-pressed={stylusOnly}
        className={cn(
          "h-8 px-2.5 flex items-center gap-1.5 rounded-full border font-mono text-[10px] uppercase tracking-wider transition",
          stylusOnly
            ? "border-[hsl(var(--rune)/0.7)] bg-[hsl(var(--rune)/0.15)] text-[hsl(var(--rune))]"
            : "border-border text-muted-foreground hover:text-foreground"
        )}
      >
        <PenTool className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Rysik</span>
      </button>

      {/* Draw options */}
      {tool === "draw" && (
        <div className="vault-panel rounded-full px-3 py-1 flex items-center gap-1.5 flex-wrap">
          {(["pen", "marker", "pencil", "ink"] as BrushType[]).map(b => (
            <button key={b} onClick={() => setBrushType(b)} title={b}
              className={cn("font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full transition",
                brushType === b ? "bg-[hsl(var(--rune)/0.25)] text-[hsl(var(--rune))]" : "text-muted-foreground hover:text-foreground")}
            >{b}</button>
          ))}
          <div className="w-px h-4 bg-border mx-0.5" />
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="h-7 w-7 rounded-full border border-border bg-transparent cursor-pointer" title="Kolor" />
          <Input type="number" min={1} max={60} value={size}
            onChange={e => setSize(Math.max(1, +e.target.value || 1))}
            className="w-12 font-mono text-xs h-7 px-2" title="Grubość" />
        </div>
      )}

      {/* Eraser size */}
      {tool === "erase" && (
        <div className="vault-panel rounded-full px-3 py-1 flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Promień:</span>
          <Input type="number" min={4} max={200} value={eraserSize}
            onChange={e => setEraserSize(Math.max(4, +e.target.value || 4))}
            className="w-14 font-mono text-xs h-7 px-2" title="Promień gumki (px ekranu)" />
        </div>
      )}

      {/* Zoom */}
      <div className="vault-panel rounded-full p-1 flex gap-0.5 items-center">
        <button onClick={() => zoomAt(0.8)} title="Oddal"
          className="h-7 w-7 grid place-items-center rounded-full text-muted-foreground hover:text-foreground transition">
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => setVp({ x: 0, y: 0, scale: 1 })} title="Resetuj widok"
          className="font-mono text-[10px] px-2 text-muted-foreground hover:text-foreground transition min-w-[3rem] text-center">
          {Math.round(vp.scale * 100)}%
        </button>
        <button onClick={() => zoomAt(1.25)} title="Przybliż"
          className="h-7 w-7 grid place-items-center rounded-full text-muted-foreground hover:text-foreground transition">
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Undo / Redo */}
      <div className="vault-panel rounded-full p-1 flex gap-0.5">
        <button onClick={undo} disabled={!undoStack.length} title="Cofnij (Ctrl+Z)"
          className="h-7 w-7 grid place-items-center rounded-full text-muted-foreground hover:text-foreground transition disabled:opacity-25">
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={redo} disabled={!redoStack.length} title="Przywróć (Ctrl+Y)"
          className="h-7 w-7 grid place-items-center rounded-full text-muted-foreground hover:text-foreground transition disabled:opacity-25">
          <Redo2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Add note / image */}
      <Button size="sm" variant="outline" onClick={() => addNote()} className="font-mono uppercase text-xs">
        <Plus className="h-3.5 w-3.5 mr-1" />Notatka
      </Button>
      <Button size="sm" variant="outline" onClick={addImage} className="font-mono uppercase text-xs">
        <ImageIcon className="h-3.5 w-3.5 mr-1" />Obraz
      </Button>

      {/* Background */}
      <button onClick={() => setShowBg(v => !v)} title="Ustawienia tła"
        className={cn("h-8 w-8 grid place-items-center rounded-full border transition",
          showBg ? "border-[hsl(var(--rune)/0.5)] bg-[hsl(var(--rune)/0.12)] text-[hsl(var(--rune))]" : "border-border text-muted-foreground hover:text-foreground")}>
        <Palette className="h-3.5 w-3.5" />
      </button>

      {/* Fullscreen toggle */}
      <button
        onClick={() => setIsFullscreen(v => !v)}
        title={isFullscreen ? "Wyjdź z pełnego ekranu (Esc)" : "Pełny ekran"}
        className="h-8 w-8 grid place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-[hsl(var(--rune)/0.5)] transition"
      >
        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
      </button>

      {/* Clear */}
      <Button size="sm" variant="destructive" onClick={() => {
        if (confirm("Wyczyścić całą tablicę?")) { pushUndo(board); onChange({ ...board, notes: [], strokes: [] }); }
      }} className="font-mono uppercase text-xs">
        <Trash2 className="h-3.5 w-3.5 mr-1" />Wyczyść
      </Button>
    </div>
  );

  /* ── canvas area ─────────────────────────────────────────────── */
  const canvasArea = (
    <>
      {showBg && (
        <div className="vault-panel p-4 flex flex-wrap items-center gap-4 animate-fade-in mx-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Kolor tła:</span>
            <input type="color" value={bgColor} onChange={e => applyBg({ bgColor: e.target.value })}
              className="h-7 w-7 rounded border border-border cursor-pointer" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Wzór:</span>
            {(["none", "grid", "lines", "dots"] as BgPattern[]).map(p => (
              <button key={p} onClick={() => applyBg({ bgPattern: p })}
                className={cn("font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded border transition",
                  bgPat === p ? "border-[hsl(var(--rune)/0.6)] bg-[hsl(var(--rune)/0.12)] text-[hsl(var(--rune))]" : "border-border text-muted-foreground hover:text-foreground")}>
                {p === "none" ? "Brak" : p === "grid" ? "Kratka" : p === "lines" ? "Linie" : "Kropki"}
              </button>
            ))}
          </div>
          {bgPat !== "none" && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Kolor wzoru:</span>
              <input type="color"
                value={bgPatColor.startsWith("rgba") || bgPatColor.startsWith("rgb") ? "#888888" : bgPatColor}
                onChange={e => applyBg({ bgPatternColor: e.target.value + "55" })}
                className="h-7 w-7 rounded border border-border cursor-pointer" />
            </div>
          )}
        </div>
      )}

      {/* stylus-only hint */}
      {stylusOnly && tool !== "pan" && (
        <div className="mx-2 px-3 py-1.5 vault-panel rounded-full flex items-center gap-2 animate-fade-in">
          <PenTool className="h-3 w-3 text-[hsl(var(--rune))] shrink-0" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Tryb rysika: palec = przesuwa, rysik = rysuje
          </span>
        </div>
      )}

      <div
        ref={wrapRef}
        className={cn(
          "vault-panel relative overflow-hidden select-none",
          isFullscreen ? "flex-1 min-h-0 mx-2 mb-2 rounded-lg" : "w-full h-[65vh]"
        )}
        style={{
          ...bgStyle(bgColor, bgPat, bgPatColor, vp),
          cursor,
          touchAction: "none",   /* ← prevents page scroll while drawing/panning */
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onPointerCancel={onPointerLeave}
      >
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

        {board.notes.map(n => (
          <article
            key={n.id}
            className="absolute group shadow-pixel"
            style={{
              left: n.x * vp.scale + vp.x,
              top: n.y * vp.scale + vp.y,
              width: n.w * vp.scale,
              minHeight: n.h * vp.scale,
              transform: `rotate(${n.rotate}deg)`,
              background: n.color,
              color: n.imageUrl ? "white" : "#1a1714",
              cursor: tool === "pan" ? "grab" : "default",
              zIndex: 10,
              fontSize: Math.max(10, 14 * vp.scale) + "px",
            }}
            onPointerDown={e => noteDown(e, n)}
          >
            {n.imageUrl && (
              <img src={n.imageUrl} alt="" className="w-full object-cover"
                style={{ height: Math.max(40, 150 * vp.scale) }} loading="lazy" />
            )}
            <textarea
              value={n.text}
              onChange={e => updateNote(n.id, { text: e.target.value })}
              className="w-full bg-transparent border-0 focus:outline-none p-2 resize-none font-handwritten"
              style={{ minHeight: Math.max(40, 80 * vp.scale), fontSize: "inherit" }}
              placeholder="Notatka…"
              onPointerDown={e => e.stopPropagation()}
            />
            <button
              onClick={e => { e.stopPropagation(); removeNote(n.id); }}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] grid place-items-center opacity-0 group-hover:opacity-100 transition"
              aria-label="Usuń notatkę"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </article>
        ))}

        {board.notes.length === 0 && board.strokes.length === 0 && (
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground opacity-40 text-center px-4">
              Pusta tablica · scroll/szczypanie = zoom · przeciągnij = przesuń
            </p>
          </div>
        )}
      </div>

      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 flex-wrap px-2 pb-1">
        <Save className="h-3 w-3" />
        Autozapis · {board.notes.length} notatek · {board.strokes.length} szkiców
        {undoStack.length > 0 && <span className="opacity-50">· undo: {undoStack.length}</span>}
        <span className="opacity-40">· {Math.round(vp.scale * 100)}% zoom</span>
        {stylusOnly && <span className="text-[hsl(var(--rune))] opacity-80">· ✦ tryb rysika</span>}
      </p>
    </>
  );

  /* ─────────────────────────────────────────── render ─── */
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[hsl(var(--background))]">
        <div className="shrink-0 border-b border-border/40 bg-[hsl(var(--card)/0.95)] backdrop-blur-sm">
          {toolbar}
        </div>
        {canvasArea}
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center flex-wrap gap-2">
        {toolbar}
      </div>
      {canvasArea}
    </section>
  );
};
