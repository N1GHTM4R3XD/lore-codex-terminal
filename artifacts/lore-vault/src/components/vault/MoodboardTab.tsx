import { useState, useRef } from "react";
import { Plus, Trash2, ImagePlus, Upload, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VaultState } from "@/lib/vault-types";

interface Props { state: VaultState; update: (p: Partial<VaultState>) => void }

export const MoodboardTab = ({ state, update }: Props) => {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"url" | "upload">("url");
  const fileRef = useRef<HTMLInputElement>(null);

  const addUrl = () => {
    if (!url.trim()) return;
    update({ moodboard: [{ id: crypto.randomUUID(), url: url.trim() }, ...state.moodboard] });
    setUrl("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        update({ moodboard: [{ id: crypto.randomUUID(), url: dataUrl }, ...state.moodboard] });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const remove = (id: string) => update({ moodboard: state.moodboard.filter((m) => m.id !== id) });

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <ImagePlus className="h-5 w-5 text-[hsl(var(--rune))]" />
          Moodboard
          {state.moodboard.length > 0 && (
            <span className="font-mono text-[11px] text-muted-foreground ml-1">{state.moodboard.length}</span>
          )}
        </h2>
      </header>

      {/* Add row */}
      <div className="vault-panel p-4 space-y-3">
        {/* Mode toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode("url")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-widest border transition-colors ${
              mode === "url"
                ? "border-[hsl(var(--rune)/0.6)] bg-[hsl(var(--rune)/0.1)] text-[hsl(var(--rune))]"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link className="h-3 w-3" /> URL
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-widest border transition-colors ${
              mode === "upload"
                ? "border-[hsl(var(--rune)/0.6)] bg-[hsl(var(--rune)/0.1)] text-[hsl(var(--rune))]"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="h-3 w-3" /> Plik
          </button>
        </div>

        {mode === "url" ? (
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Wklej URL obrazu (Pinterest: prawy klik → Kopiuj adres obrazu)…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addUrl()}
              className="flex-1 min-w-[240px] font-mono text-sm"
            />
            <Button onClick={addUrl} disabled={!url.trim()} className="font-mono uppercase text-xs">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Dodaj
            </Button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-[hsl(var(--rune)/0.5)] hover:bg-[hsl(var(--rune)/0.04)] transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="font-mono text-sm text-muted-foreground">
              Kliknij, aby wybrać obrazy
            </p>
            <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
              PNG, JPG, WEBP — wiele plików jednocześnie
            </p>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {state.moodboard.length === 0 ? (
        <p className="italic text-muted-foreground text-center py-12 font-mono text-sm">
          Brak obrazów w tablicy nastrojów.
        </p>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {state.moodboard.map((m) => (
            <figure
              key={m.id}
              className="vault-panel corner-frame group relative overflow-hidden aspect-[4/5] animate-scale-in"
            >
              <img
                src={m.url}
                alt={m.caption || "Moodboard"}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
              <button
                onClick={() => remove(m.id)}
                className="absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full bg-background/70 backdrop-blur border border-border opacity-0 group-hover:opacity-100 transition hover:text-destructive"
                aria-label="Usuń obraz"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
};
