import { useState } from "react";
import { Pencil, Check, Image as ImageIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VaultState } from "@/lib/vault-types";

interface Props {
  state: VaultState;
  update: (patch: Partial<VaultState>) => void;
}

export const Hero = ({ state, update }: Props) => {
  const [editing, setEditing] = useState(false);
  const [avOpen, setAvOpen] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);

  return (
    <header className="relative isolate overflow-hidden">
      {/* background image */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center animate-fade-in-slow"
        style={{ backgroundImage: `url("${state.background}")` }}
      />
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
              onClick={() => setAvOpen((v) => !v)}
              className="absolute -bottom-2 -right-2 h-10 w-10 grid place-items-center rounded-full bg-card border border-border hover:border-[hsl(var(--rune))] transition"
              aria-label="Zmień awatar"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            {avOpen && (
              <div className="absolute z-20 top-full mt-2 w-72 vault-panel p-3 animate-fade-in">
                <Input
                  placeholder="URL obrazu awatara"
                  defaultValue={state.avatar}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      update({ avatar: (e.target as HTMLInputElement).value });
                      setAvOpen(false);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2 font-mono">Wciśnij Enter, aby zapisać</p>
              </div>
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
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-display rune-text text-balance leading-tight">
                  {state.name}
                </h1>
                <p className="text-lg md:text-xl italic text-[hsl(var(--ink))] max-w-2xl text-balance">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBgOpen((v) => !v)}
                className="font-mono uppercase tracking-wider text-xs"
              >
                <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                Tło
              </Button>
            </div>
            {bgOpen && (
              <div className="vault-panel p-3 max-w-md animate-fade-in">
                <Input
                  placeholder="URL obrazu tła hero"
                  defaultValue={state.background}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      update({ background: (e.target as HTMLInputElement).value });
                      setBgOpen(false);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2 font-mono">Enter zapisuje</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--rune)/0.6)] to-transparent" />
    </header>
  );
};
