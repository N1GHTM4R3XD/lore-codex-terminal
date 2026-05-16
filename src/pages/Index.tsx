import { Plus } from "lucide-react";
import { useVaultDB } from "@/hooks/useVaultDB";
import { ParticleCanvas } from "@/components/vault/ParticleCanvas";
import { CharacterCard } from "@/components/vault/CharacterCard";
import { SettingsModal } from "@/components/vault/SettingsModal";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { db, addCharacter, deleteCharacter, setDb } = useVaultDB();
  const navigate = useNavigate();

  // Restore global pixel-dark on the dashboard regardless of last visited card.
  useEffect(() => {
    document.documentElement.dataset.palette = "pixel-dark";
  }, []);

  return (
    <div className="relative min-h-screen">
      <ParticleCanvas effect={db.settings.effect} />

      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <SettingsModal db={db} setDb={setDb} />
      </div>

      <main className="relative z-10">
        {/* Header */}
        <header className="container pt-16 pb-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-[hsl(var(--rune))] font-pixel animate-fade-in">
            <span className="h-px w-10 bg-[hsl(var(--rune))]" />
            Lore Vault
            <span className="h-px w-10 bg-[hsl(var(--rune))]" />
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-display rune-text leading-tight">
            Archiwum Postaci
          </h1>
          <p className="mt-3 max-w-2xl text-lg italic text-muted-foreground">
            Mroczny kodeks twoich bohaterów. Każda karta to własny świat — paleta, ramka,
            animacje i muzyka w tle.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                const c = addCharacter();
                navigate(`/character/${c.id}`);
              }}
              className="pixel-btn"
              aria-label="Dodaj nową kartę postaci"
            >
              <Plus className="h-3 w-3 mr-1.5" /> Nowa karta
            </Button>
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {db.characters.length}{" "}
              {db.characters.length === 1 ? "postać" : db.characters.length < 5 ? "postacie" : "postaci"}
            </span>
          </div>
        </header>

        {/* Grid */}
        <section className="container pb-20">
          {db.characters.length === 0 ? (
            <div className="vault-panel p-12 text-center max-w-lg mx-auto">
              <p className="font-pixel text-2xl text-[hsl(var(--rune))] mb-4">✦</p>
              <p className="font-display text-2xl">Vault jest pusty</p>
              <p className="text-muted-foreground mt-2">
                Stwórz pierwszą kartę, aby rozpocząć kronikę.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
              {db.characters.map((c) => (
                <CharacterCard key={c.id} character={c} onDelete={deleteCharacter} />
              ))}
            </div>
          )}
        </section>

        <footer className="container py-12 text-center font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
          <span className="inline-flex items-center gap-3">
            <span className="h-px w-12 bg-border" />
            Lore Vault · Codex Terminal
            <span className="h-px w-12 bg-border" />
          </span>
        </footer>
      </main>
    </div>
  );
};

export default Index;
