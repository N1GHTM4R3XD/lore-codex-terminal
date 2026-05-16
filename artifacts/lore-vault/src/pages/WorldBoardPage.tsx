import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, Globe } from "lucide-react";
import { useVaultDB } from "@/hooks/useVaultDB";
import { ParticleCanvas } from "@/components/vault/ParticleCanvas";
import { WhiteboardCanvas } from "@/components/vault/WhiteboardCanvas";
import { SettingsModal } from "@/components/vault/SettingsModal";
import { WorldCreatorTab } from "@/components/vault/WorldCreatorTab";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "tablica" | "swiaty";

const WorldBoardPage = () => {
  const {
    db,
    setWorldBoard,
    setDb,
    addWorld,
    updateWorld,
    deleteWorld,
    addConnection,
    deleteConnection,
  } = useVaultDB();
  const [tab, setTab] = useState<Tab>("tablica");

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

      <main className="relative z-10 container pt-16 pb-20">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-[hsl(var(--rune))] font-pixel mb-3">
          <span className="h-px w-10 bg-[hsl(var(--rune))]" />
          Świat
          <span className="h-px w-10 bg-[hsl(var(--rune))]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display rune-text leading-tight mb-6">
          Tablica Świata
        </h1>

        <div className="flex items-center gap-1 mb-8 border-b border-border">
          <button
            onClick={() => setTab("tablica")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest border-b-2 -mb-px transition-colors",
              tab === "tablica"
                ? "border-[hsl(var(--rune))] text-[hsl(var(--rune))]"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Tablica
          </button>
          <button
            onClick={() => setTab("swiaty")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest border-b-2 -mb-px transition-colors",
              tab === "swiaty"
                ? "border-[hsl(195,85%,60%)] text-[hsl(195,85%,60%)]"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Globe className="h-3.5 w-3.5" />
            Kreator Światów
            {db.worlds?.length > 0 && (
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[hsl(195,85%,60%)] text-[9px] text-black font-bold">
                {db.worlds.length}
              </span>
            )}
          </button>
        </div>

        {tab === "tablica" && (
          <div>
            <p className="text-muted-foreground italic mb-6 max-w-2xl text-sm">
              Szkice mapy, relacje, motywy, frakcje. Twórz notatki, rysuj odręcznie, wklejaj obrazy.
            </p>
            <WhiteboardCanvas
              board={db.worldBoard}
              onChange={setWorldBoard}
              title="Tablica Świata"
            />
          </div>
        )}

        {tab === "swiaty" && (
          <div>
            <p className="text-muted-foreground italic mb-6 max-w-2xl text-sm">
              Buduj fikcyjne światy, przypisuj do nich postacie i twórz sieć połączeń między nimi.
            </p>
            <WorldCreatorTab
              worlds={db.worlds ?? []}
              connections={db.connections ?? []}
              characters={db.characters}
              addWorld={addWorld}
              updateWorld={updateWorld}
              deleteWorld={deleteWorld}
              addConnection={addConnection}
              deleteConnection={deleteConnection}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default WorldBoardPage;
