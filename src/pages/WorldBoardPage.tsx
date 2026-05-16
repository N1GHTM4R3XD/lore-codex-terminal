import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useVaultDB } from "@/hooks/useVaultDB";
import { ParticleCanvas } from "@/components/vault/ParticleCanvas";
import { WhiteboardCanvas } from "@/components/vault/WhiteboardCanvas";
import { SettingsModal } from "@/components/vault/SettingsModal";
import { Button } from "@/components/ui/button";

const WorldBoardPage = () => {
  const { db, setWorldBoard, setDb } = useVaultDB();

  return (
    <div className="relative min-h-screen">
      <ParticleCanvas effect={db.settings.effect} />

      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <SettingsModal db={db} setDb={setDb} />
      </div>
      <div className="fixed top-4 left-4 z-40">
        <Button asChild variant="outline" size="sm" className="font-mono uppercase tracking-wider text-xs">
          <Link to="/" aria-label="Wróć">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Vault
          </Link>
        </Button>
      </div>

      <main className="relative z-10 container pt-16 pb-16">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-[hsl(var(--rune))] font-pixel mb-3">
          <span className="h-px w-10 bg-[hsl(var(--rune))]" />
          Świat
          <span className="h-px w-10 bg-[hsl(var(--rune))]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display rune-text leading-tight mb-2">
          Tablica Świata
        </h1>
        <p className="text-muted-foreground italic mb-6 max-w-2xl">
          Szkice mapy, relacje, motywy, frakcje. Twórz notatki, rysuj odręcznie, wklejaj obrazy.
        </p>

        <WhiteboardCanvas
          board={db.worldBoard}
          onChange={setWorldBoard}
          title="Tablica Świata"
        />
      </main>
    </div>
  );
};

export default WorldBoardPage;
