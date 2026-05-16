import { useRef } from "react";
import { Settings as SettingsIcon, Download, Upload, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Effect, VaultDB, DEFAULT_DB } from "@/lib/vault-types";
import { toast } from "@/hooks/use-toast";

interface Props {
  db: VaultDB;
  setDb: (next: VaultDB) => void;
}

const EFFECTS: { id: Effect; label: string }[] = [
  { id: "embers", label: "Żar" },
  { id: "stars",  label: "Gwiazdy" },
  { id: "rain",   label: "Deszcz" },
  { id: "fire",   label: "Ogień" },
  { id: "void",   label: "Pustka" },
  { id: "none",   label: "Brak" },
];

export const SettingsModal = ({ db, setDb }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `lore-vault-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast({ title: "Wyeksportowano", description: "Plik JSON zapisany." });
  };

  const importJSON = (file: File) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(String(r.result));
        const next: VaultDB = parsed?.characters
          ? { ...DEFAULT_DB, ...parsed }
          : { characters: [parsed], settings: DEFAULT_DB.settings };
        setDb(next);
        toast({ title: "Zaimportowano", description: "Vault został wczytany." });
      } catch {
        toast({ title: "Błąd importu", description: "Nieprawidłowy plik JSON.", variant: "destructive" });
      }
    };
    r.readAsText(file);
  };

  const reset = () => {
    if (confirm("Przywrócić domyślny vault? Wszystkie karty zostaną utracone.")) {
      setDb(DEFAULT_DB);
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
            Globalne efekty i dane
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-2">
              Efekty atmosferyczne (globalne)
            </h3>
            <div className="flex flex-wrap gap-2">
              {EFFECTS.map((e) => (
                <Button
                  key={e.id}
                  variant={db.settings.effect === e.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDb({ ...db, settings: { ...db.settings, effect: e.id } })}
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
