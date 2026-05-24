import { useState, useRef } from "react";
import {
  GalleryHorizontalEnd, Plus, Trash2, Upload, X, ChevronLeft, ChevronRight, Tag, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VaultState, GalleryImage } from "@/lib/vault-types";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "ref",    label: "Reference Sheet" },
  { value: "illo",   label: "Ilustracja" },
  { value: "sketch", label: "Szkic" },
  { value: "outfit", label: "Strój" },
  { value: "other",  label: "Inne" },
];

interface Props {
  state: VaultState;
  update: (p: Partial<VaultState>) => void;
}

export const GalleryTab = ({ state, update }: Props) => {
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const gallery = state.gallery ?? [];

  const add = (url: string) => {
    if (!url.trim()) return;
    const img: GalleryImage = {
      id: crypto.randomUUID(),
      url: url.trim(),
      title: titleInput.trim() || undefined,
      category: categoryInput || undefined,
    };
    update({ gallery: [img, ...gallery] });
    setUrlInput("");
    setTitleInput("");
    setCategoryInput("");
    setAddOpen(false);
  };

  /** Resize + compress an image before saving to localStorage. */
  async function compressFile(file: File, maxW = 1600, quality = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const ratio = Math.min(maxW / img.naturalWidth, 1);
          const w = Math.round(img.naturalWidth * ratio);
          const h = Math.round(img.naturalHeight * ratio);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = src;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressFile(file, 1600, 0.85);
      add(compressed);
    } catch {
      // Fallback: raw data URL if compression fails
      const reader = new FileReader();
      reader.onload = (ev) => add(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const remove = (id: string) => {
    const next = gallery.filter((g) => g.id !== id);
    update({ gallery: next });
    if (lightbox !== null) setLightbox(null);
  };

  const updateMeta = (id: string, patch: Partial<GalleryImage>) => {
    update({ gallery: gallery.map((g) => (g.id === id ? { ...g, ...patch } : g)) });
  };

  // Filter
  const filtered = filter === "all" ? gallery : gallery.filter((g) => g.category === filter);
  const categories = Array.from(new Set(gallery.map((g) => g.category).filter(Boolean))) as string[];

  // Lightbox nav
  const lbPrev = () => setLightbox((v) => (v === null || v === 0 ? filtered.length - 1 : v - 1));
  const lbNext = () => setLightbox((v) => (v === null ? 0 : (v + 1) % filtered.length));

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <GalleryHorizontalEnd className="h-5 w-5 text-[hsl(var(--rune))]" />
          Galeria
          <span className="font-mono text-[11px] text-muted-foreground ml-1">
            {gallery.length > 0 && `${gallery.length}`}
          </span>
        </h2>

        <div className="flex items-center gap-2">
          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border transition-colors",
                  filter === "all"
                    ? "border-[hsl(var(--rune)/0.6)] bg-[hsl(var(--rune)/0.1)] text-[hsl(var(--rune))]"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                Wszystkie
              </button>
              {categories.map((cat) => {
                const label = CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border transition-colors",
                      filter === cat
                        ? "border-[hsl(var(--rune)/0.6)] bg-[hsl(var(--rune)/0.1)] text-[hsl(var(--rune))]"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          <Button
            onClick={() => setAddOpen((v) => !v)}
            size="sm"
            className="font-mono uppercase text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Dodaj art
          </Button>
        </div>
      </header>

      {/* Add panel */}
      {addOpen && (
        <div className="vault-panel p-5 space-y-4 animate-fade-in">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Nowa ilustracja
          </p>

          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Wklej URL obrazu…"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add(urlInput)}
              className="flex-1 min-w-[200px] font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              className="font-mono text-xs uppercase gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              Plik
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Tytuł / opis (opcjonalnie)…"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="flex-1 min-w-[200px] font-mono text-sm"
            />
            <div className="flex items-center gap-1 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryInput((v) => (v === cat.value ? "" : cat.value))}
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-widest px-2.5 py-1.5 rounded border transition-colors",
                    categoryInput === cat.value
                      ? "border-[hsl(var(--rune)/0.6)] bg-[hsl(var(--rune)/0.15)] text-[hsl(var(--rune))]"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => add(urlInput)}
              disabled={!urlInput.trim()}
              className="font-mono uppercase text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Dodaj
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAddOpen(false)}
              className="font-mono text-xs"
            >
              Anuluj
            </Button>
          </div>
        </div>
      )}

      {/* Empty */}
      {gallery.length === 0 && (
        <div className="vault-panel p-14 text-center space-y-3">
          <GalleryHorizontalEnd className="h-10 w-10 mx-auto text-muted-foreground/30" />
          <p className="font-display text-xl text-muted-foreground">
            Bank artu jest pusty
          </p>
          <p className="text-sm text-muted-foreground opacity-70">
            Dodaj reference sheety, ilustracje i szkice — z opisem lub bez.
          </p>
          <Button
            onClick={() => setAddOpen(true)}
            variant="outline"
            size="sm"
            className="font-mono uppercase text-xs mt-2"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Dodaj pierwszą ilustrację
          </Button>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div
          className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-0"
          style={{ columnGap: "1rem" }}
        >
          {filtered.map((img, idx) => (
            <GalleryCard
              key={img.id}
              img={img}
              onOpen={() => setLightbox(idx)}
              onRemove={() => remove(img.id)}
              onUpdateMeta={(patch) => updateMeta(img.id, patch)}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <Lightbox
          img={filtered[lightbox]}
          onClose={() => setLightbox(null)}
          onPrev={filtered.length > 1 ? lbPrev : undefined}
          onNext={filtered.length > 1 ? lbNext : undefined}
          onRemove={() => remove(filtered[lightbox].id)}
          index={lightbox}
          total={filtered.length}
        />
      )}
    </section>
  );
};

/* ─── Gallery Card ─── */
interface CardProps {
  img: GalleryImage;
  onOpen: () => void;
  onRemove: () => void;
  onUpdateMeta: (p: Partial<GalleryImage>) => void;
}

const GalleryCard = ({ img, onOpen, onRemove, onUpdateMeta }: CardProps) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(img.title ?? "");

  const commitTitle = () => {
    onUpdateMeta({ title: titleDraft.trim() || undefined });
    setEditingTitle(false);
  };

  const catLabel = CATEGORIES.find((c) => c.value === img.category)?.label ?? img.category;

  return (
    <figure className="vault-panel group relative overflow-hidden mb-4 break-inside-avoid cursor-pointer animate-scale-in">
      {/* Image */}
      <div onClick={onOpen} className="w-full">
        <img
          src={img.url}
          alt={img.title ?? "Gallery image"}
          loading="lazy"
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03] block"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='%23333'%3E%3Crect width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' fill='%23666' font-size='14' text-anchor='middle' dy='.3em'%3EBłąd obrazu%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Category badge */}
      {img.category && (
        <span className="absolute top-2 left-2 font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 bg-background/80 border border-border text-muted-foreground flex items-center gap-1">
          <Tag className="h-2.5 w-2.5" />
          {catLabel}
        </span>
      )}

      {/* Controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="h-6 w-6 bg-background/90 border border-border rounded-full grid place-items-center hover:text-destructive transition-colors"
          aria-label="Usuń"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Title at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {editingTitle ? (
          <Input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") setEditingTitle(false);
            }}
            className="h-7 text-xs font-mono bg-background/90 border-border px-2"
            placeholder="Dodaj tytuł…"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setTitleDraft(img.title ?? ""); setEditingTitle(true); }}
            className="w-full text-left font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors truncate"
          >
            {img.title ? img.title : <span className="opacity-50 italic">Kliknij, aby dodać tytuł…</span>}
          </button>
        )}
      </div>
    </figure>
  );
};

/* ─── Lightbox ─── */
interface LightboxProps {
  img: GalleryImage;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onRemove: () => void;
  index: number;
  total: number;
}

const Lightbox = ({ img, onClose, onPrev, onNext, onRemove, index, total }: LightboxProps) => {
  const catLabel = CATEGORIES.find((c) => c.value === img.category)?.label ?? img.category;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div
        className="absolute top-4 right-4 flex items-center gap-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {!img.url.startsWith("data:") && (
          <a
            href={img.url}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 w-8 grid place-items-center rounded border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Otwórz oryginał"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        <button
          onClick={() => { if (confirm("Usunąć tę ilustrację?")) onRemove(); }}
          className="h-8 w-8 grid place-items-center rounded border border-border bg-background text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Usuń"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onClose}
          className="h-8 w-8 grid place-items-center rounded border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Zamknij"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Counter */}
      {total > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {index + 1} / {total}
        </div>
      )}

      {/* Prev / Next */}
      {onPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center rounded-full border border-border bg-background/80 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Poprzedni"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {onNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center rounded-full border border-border bg-background/80 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Następny"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Image */}
      <div
        className="max-w-[90vw] max-h-[80vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={img.url}
          alt={img.title ?? "Gallery image"}
          className="max-w-full max-h-[80vh] object-contain rounded shadow-vault"
        />
      </div>

      {/* Caption */}
      {(img.title || img.category) && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 vault-panel px-4 py-2"
          onClick={(e) => e.stopPropagation()}
        >
          {img.category && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-[hsl(var(--rune))] flex items-center gap-1">
              <Tag className="h-2.5 w-2.5" />
              {catLabel}
            </span>
          )}
          {img.title && (
            <span className="font-display text-sm">{img.title}</span>
          )}
        </div>
      )}
    </div>
  );
};
