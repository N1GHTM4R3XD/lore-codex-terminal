import { useState } from "react";
import { X, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Character } from "@/lib/vault-types";

const RELATIONSHIP_PRESETS = [
  "Sojusznik", "Rywal", "Mentor", "Uczeń", "Przyjaciel",
  "Wróg", "Miłość", "Współpracownik", "Brat", "Siostra",
  "Rodzic", "Dziecko", "Mistrz", "Sługa", "Neutralny",
];

const CONNECTION_COLORS = ["#cf9d7b", "#8fc4d8", "#cfa8e0", "#a8d8a0", "#e89a9a", "#f7d774"];

interface Props {
  fromId: string;
  toId: string;
  characters: Character[];
  onSave: (label: string, desc: string, color: string) => void;
  onClose: () => void;
}

export const ConnectionDialog = ({ fromId, toId, characters, onSave, onClose }: Props) => {
  const [label, setLabel] = useState("Sojusznik");
  const [customLabel, setCustomLabel] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(CONNECTION_COLORS[0]);
  const [mode, setMode] = useState<"preset" | "custom">("preset");

  const from = characters.find((c) => c.id === fromId);
  const to = characters.find((c) => c.id === toId);

  const handleSave = () => {
    const finalLabel = mode === "preset" ? label : customLabel.trim() || label;
    if (!finalLabel) return;
    onSave(finalLabel, desc.trim(), color);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="vault-panel w-full max-w-md mx-4 p-6 space-y-5 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[hsl(var(--rune))] font-mono">
            <Link2 className="h-4 w-4" />
            Nowe powiązanie
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Characters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 text-center p-2 rounded border border-border bg-card/50">
            <p className="text-sm font-medium truncate">{from?.name || "???"}</p>
            <p className="text-[10px] text-muted-foreground">Od</p>
          </div>
          <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 text-center p-2 rounded border border-border bg-card/50">
            <p className="text-sm font-medium truncate">{to?.name || "???"}</p>
            <p className="text-[10px] text-muted-foreground">Do</p>
          </div>
        </div>

        {/* Type selector */}
        <div className="space-y-2">
          <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Typ relacji
          </Label>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setMode("preset")}
              className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border transition ${
                mode === "preset" ? "border-[hsl(var(--rune))] text-[hsl(var(--rune))]" : "border-border text-muted-foreground"
              }`}
            >
              Preset
            </button>
            <button
              onClick={() => setMode("custom")}
              className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border transition ${
                mode === "custom" ? "border-[hsl(var(--rune))] text-[hsl(var(--rune))]" : "border-border text-muted-foreground"
              }`}
            >
              Własny
            </button>
          </div>

          {mode === "preset" ? (
            <div className="flex flex-wrap gap-1.5">
              {RELATIONSHIP_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setLabel(p)}
                  className={`px-2 py-1 rounded text-[11px] border transition ${
                    label === p
                      ? "border-[hsl(var(--rune))] text-[hsl(var(--rune))] bg-[hsl(var(--rune))/0.1]"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          ) : (
            <Input
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Np. Przysięga krwi, Przymierze..."
              className="h-8 text-sm"
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            />
          )}
        </div>

        {/* Description */}
        <div>
          <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Opis (opcjonalnie)
          </Label>
          <Input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Szczegóły relacji..."
            className="mt-1 h-8 text-sm"
          />
        </div>

        {/* Color */}
        <div>
          <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Kolor
          </Label>
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
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="font-mono uppercase text-xs">
            Anuluj
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={mode === "custom" ? !customLabel.trim() : false}
            className="pixel-btn font-mono uppercase text-xs"
          >
            <Link2 className="h-3.5 w-3.5 mr-1.5" />
            Utwórz
          </Button>
        </div>
      </div>
    </div>
  );
};
