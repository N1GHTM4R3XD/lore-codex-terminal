import { useState, useRef } from "react";
import { Pencil, Check, Image as ImageIcon, User, Upload, Link, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VaultState } from "@/lib/vault-types";

interface Props {
  state: VaultState;
  update: (patch: Partial<VaultState>) => void;
  musicPlaying?: boolean;
}

/** Reads a File and returns a data: URI string. */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Small image-picker panel used for avatar and background. */
function ImagePicker({
  label,
  current,
  onSave,
  onClose,
  aspectHint,
}: {
  label: string;
  current: string;
  onSave: (url: string) => void;
  onClose: () => void;
  aspectHint?: string;
}) {
  const [urlDraft, setUrlDraft] = useState(current);
  const [mode, setMode] = useState<"url" | "upload">("url");
  const fileRef = useRef<HTMLInputElement>(null);

  const commit = (val: string) => {
    if (val.trim()) { onSave(val.trim()); onClose(); }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    onSave(dataUrl);
    onClose();
  };

  return (
    <div className="absolute z-20 top-full mt-2 w-80 vault-panel p-4 animate-fade-in space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>

      {/* Mode toggle */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-widest border transition-colors ${
            mode === "url"
              ? "border-[hsl(var(--rune)/0.6)] bg-[hsl(var(--rune)/0.1)] text-[hsl(var(--rune))]"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link className="h-2.5 w-2.5" /> URL
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-widest border transition-colors ${
            mode === "upload"
              ? "border-[hsl(var(--rune)/0.6)] bg-[hsl(var(--rune)/0.1)] text-[hsl(var(--rune))]"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload className="h-2.5 w-2.5" /> Plik
        </button>
      </div>

      {mode === "url" ? (
        <>
          <Input
            autoFocus
            placeholder="Wklej URL (np. z Pinteresta)…"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit(urlDraft);
              if (e.key === "Escape") onClose();
            }}
            className="font-mono text-sm"
          />
          <p className="font-mono text-[9px] text-muted-foreground/60">
            Pinterest: prawy klik na obraz → Kopiuj adres obrazu
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => commit(urlDraft)} disabled={!urlDraft.trim()} className="font-mono uppercase text-xs">
              Zapisz
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="font-mono text-xs">
              Anuluj
            </Button>
          </div>
        </>
      ) : (
        <>
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-[hsl(var(--rune)/0.5)] hover:bg-[hsl(var(--rune)/0.04)] transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="font-mono text-xs text-muted-foreground">Kliknij, aby wybrać plik</p>
            {aspectHint && (
              <p className="font-mono text-[9px] text-muted-foreground/50 mt-1">{aspectHint}</p>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <Button size="sm" variant="ghost" onClick={onClose} className="font-mono text-xs w-full">
            Anuluj
          </Button>
        </>
      )}
    </div>
  );
}

export const Hero = ({ state, update, musicPlaying }: Props) => {
  const [editing, setEditing] = useState(false);
  const [avOpen, setAvOpen] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);

  return (
    <header className="relative isolate overflow-hidden">
      {/* background image */}
      {state.background && (
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center animate-fade-in"
          style={{
            backgroundImage: `url("${state.background}")`,
            opacity: (state.bgOpacity ?? 85) / 100,
          }}
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-hero" />
      <div className="absolute inset-0 -z-10 bg-grain opacity-30 mix-blend-overlay" />
      {/* vignette */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_50%,transparent_30%,hsl(var(--background))_100%)]" />

      <div className="container relative py-20 md:py-28 lg:py-36">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-[hsl(var(--rune))] font-mono animate-fade-in">
          <span className="h-px w-10 bg-[hsl(var(--rune))]" />
          Lore Vault // Karta Postaci
          <span className="h-px w-10 bg-[hsl(var(--rune))]" />
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-[auto,1fr] md:items-end">
          {/* Avatar */}
          <div className="relative group animate-scale-in">
            <div className="absolute -inset-2 bg-gradient-rune opacity-40 blur-xl rounded-full animate-rune-pulse" />
            <div className="relative h-40 w-40 md:h-48 md:w-48 rounded-full overflow-hidden border-2 border-[hsl(var(--rune))] shadow-rune corner-frame">
              {state.avatar ? (
                <img src={state.avatar} alt={state.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center bg-muted">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <button
              onClick={() => { setAvOpen((v) => !v); setBgOpen(false); }}
              className="absolute -bottom-2 -right-2 h-10 w-10 grid place-items-center rounded-full bg-card border border-border hover:border-[hsl(var(--rune))] transition"
              aria-label="Zmień awatar"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            {avOpen && (
              <ImagePicker
                label="Awatar postaci"
                current={state.avatar}
                onSave={(url) => update({ avatar: url })}
                onClose={() => setAvOpen(false)}
                aspectHint="Najlepiej kwadratowe zdjęcie (1:1)"
              />
            )}
          </div>

          {/* Name + tagline */}
          <div className="space-y-4 animate-fade-in">
            {editing ? (
              <>
                <Input
                  value={state.name}
                  onChange={(e) => update({ name: e.target.value })}
                  className="text-3xl md:text-5xl h-auto py-3 font-display bg-background/40"
                />
                <Input
                  value={state.tagline}
                  onChange={(e) => update({ tagline: e.target.value })}
                  className="font-body italic bg-background/40"
                />
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-display rune-text text-balance leading-tight">
                    {state.name}
                  </h1>
                  {musicPlaying && (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full vault-panel border border-[hsl(var(--rune)/0.4)] text-[hsl(var(--rune))] font-mono text-[9px] uppercase tracking-widest animate-fade-in"
                      aria-label="Muzyka gra"
                    >
                      <Music className="h-2.5 w-2.5 animate-pulse" />
                      Leci
                    </span>
                  )}
                </div>
                <p className="text-lg md:text-xl italic text-[hsl(var(--ink))] max-w-2xl text-balance font-body">
                  {state.tagline}
                </p>
              </>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing((v) => !v)}
                className="font-mono uppercase tracking-wider text-xs"
              >
                {editing ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Pencil className="h-3.5 w-3.5 mr-1.5" />}
                {editing ? "Zapisz" : "Edytuj kartę"}
              </Button>

              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setBgOpen((v) => !v); setAvOpen(false); }}
                  className="font-mono uppercase tracking-wider text-xs"
                >
                  <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                  Tło
                </Button>
                {bgOpen && (
                  <ImagePicker
                    label="Obraz tła hero"
                    current={state.background}
                    onSave={(url) => update({ background: url })}
                    onClose={() => setBgOpen(false)}
                    aspectHint="Najlepiej panoramiczne (16:9 lub szerzej)"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--rune)/0.6)] to-transparent" />
    </header>
  );
};
