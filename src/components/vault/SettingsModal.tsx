import { useRef } from "react";
import { Settings as SettingsIcon, Download, Upload, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Effect, Palette, VaultState, DEFAULT_STATE } from "@/lib/vault-types";
import { toast } from "@/hooks/use-toast";

interface Props {
  state: VaultState;
  setState: (s: VaultState) => void;
}

const PALETTES: { id: Palette; label: string; swatch: string }[] = [
  { id: "abyss",   label: "Otchłań",  swatch: "linear-gradient(135deg,hsl(195,85%,60%),hsl(270,70%,65%))" },
  { id: "crimson", label: "Karmin",   swatch: "linear-gradient(135deg,hsl(0,75%,55%),hsl(20,80%,55%))" },
  { id: "arcane",  label: "Arkana",   swatch: "linear-gradient(135deg,hsl(280,80%,65%),hsl(200,90%,60%))" },
  { id: "ember",   label: "Żar",      swatch: "linear-gradient(135deg,hsl(30,95%,55%),hsl(0,80%,55%))" },
  { id: "verdant", label: "Zieleń",   swatch: "linear-gradient(135deg,hsl(145,70%,50%),hsl(90,60%,55%))" },
];

const EFFECTS: { id: Effect; label: string }[] = [
  { id: "stars", label: "Gwiazdy" },
  { id: "rain",  label: "Deszcz" },
  { id: "fire",  label: "Ogień" },
  { id: "void",  label: "Pustka" },
  { id: "none",  label: "Brak" },
];

export const SettingsModal = ({ state, setState }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `lore-vault-${state.name.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast({ title: "Wyeksportowano", description: "Plik JSON zapisany." });
  };

  const importJSON = (file: File) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(String(r.result));
        setState({ ...DEFAULT_STATE, ...parsed });
        toast({ title: "Zaimportowano", description: "Karta postaci została wczytana." });
      } catch {
        toast({ title: "Błąd importu", description: "Nieprawidłowy plik JSON.", variant: "destructive" });
      }
    };
    r.readAsText(file);
  };

  const reset = () => {
    if (confirm("Przywrócić domyślną kartę? Wszystkie zmiany zostaną utracone.")) {
      setState(DEFAULT_STATE);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Ustawienia" className="border-[hsl(var(--border))]">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="vault-panel max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display rune-text text-2xl">Ustawienia Vault</DialogTitle>
          <DialogDescription className="font-mono text-xs uppercase tracking-widest">
            Personalizuj kodeks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-2">Paleta</h3>
            <div className="grid grid-cols-5 gap-2">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setState({ ...state, palette: p.id })}
                  className={`group relative aspect-square rounded border-2 transition ${
                    state.palette === p.id ? "border-[hsl(var(--rune))] shadow-rune" : "border-border hover:border-[hsl(var(--rune)/0.5)]"
                  }`}
                  style={{ background: p.swatch }}
                  aria-label={p.label}
                >
                  <span className="absolute inset-x-0 -bottom-5 text-[10px] font-mono uppercase tracking-wider text-center text-muted-foreground">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-2">Efekty atmosferyczne</h3>
            <div className="flex flex-wrap gap-2">
              {EFFECTS.map((e) => (
                <Button
                  key={e.id}
                  variant={state.effect === e.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setState({ ...state, effect: e.id })}
                  className="font-mono uppercase text-xs"
                >
                  {e.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-2">Dane</h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={exportJSON} className="font-mono uppercase text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" />Eksport JSON
              </Button>
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="font-mono uppercase text-xs">
                <Upload className="h-3.5 w-3.5 mr-1.5" />Import JSON
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])}
              />
              <Button size="sm" variant="destructive" onClick={reset} className="font-mono uppercase text-xs">
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Reset
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
