import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Globe, Users, Plus } from "lucide-react";
import { useVaultDB } from "@/hooks/useVaultDB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Character, World } from "@/lib/vault-types";

const WorldPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { db, updateWorld, deleteWorld, addWorld } = useVaultDB();
  const worlds = db.worlds ?? [];
  const characters = db.characters ?? [];
  const world = worlds.find((w) => w.id === id);

  const worldCharacters = useMemo(
    () => characters.filter((c) => world?.characterIds.includes(c.id)),
    [characters, world?.characterIds],
  );

  if (!world) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="vault-panel p-8 max-w-md text-center">
          <p className="font-pixel text-xl text-[hsl(var(--rune))] mb-3">404</p>
          <h1 className="font-display text-2xl mb-2">Nie znaleziono świata</h1>
          <Button onClick={() => navigate("/")} className="pixel-btn">
            <ArrowLeft className="h-3 w-3 mr-1.5" /> Wróć
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed top-4 left-4 z-40">
        <Button asChild variant="outline" size="sm" className="font-mono uppercase tracking-wider text-xs">
          <Link to="/tablica-swiata">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Światy
          </Link>
        </Button>
      </div>
      <main className="container mx-auto px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Światy</p>
            {worlds.map((w) => (
              <button
                key={w.id}
                onClick={() => navigate(`/world/${w.id}`)}
                className={`w-full text-left vault-panel px-3 py-2 text-sm ${w.id === world.id ? "border-[hsl(var(--rune)/0.5)] text-[hsl(var(--rune))]" : "text-muted-foreground"}`}
              >
                {w.name}
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full font-mono uppercase text-xs"
              onClick={() => {
                const created = addWorld({ name: "Nowy świat", description: "", characterIds: [] });
                navigate(`/world/${created.id}`);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Nowy świat
            </Button>
          </aside>

          <section className="space-y-6">
            <div className="vault-panel overflow-hidden">
              <div className="aspect-[16/6] bg-muted">
                {world.imageUrl ? (
                  <img src={world.imageUrl} alt={world.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center bg-gradient-to-br from-[hsl(195,85%,8%)] to-[hsl(270,70%,7%)]">
                    <Globe className="h-12 w-12 text-[hsl(195,85%,40%)] opacity-40" />
                  </div>
                )}
              </div>
              <div className="p-5 space-y-4">
                <Input
                  value={world.name}
                  onChange={(e) => updateWorld(world.id, { name: e.target.value })}
                  className="font-display text-2xl h-11"
                />
                <Textarea
                  value={world.description}
                  onChange={(e) => updateWorld(world.id, { description: e.target.value })}
                  className="min-h-32"
                  placeholder="Opis świata…"
                />
                <Input
                  value={world.imageUrl ?? ""}
                  onChange={(e) => updateWorld(world.id, { imageUrl: e.target.value })}
                  placeholder="URL obrazu świata"
                  className="font-mono text-sm"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Usunąć świat „${world.name}”?`)) {
                      deleteWorld(world.id);
                      navigate("/tablica-swiata");
                    }
                  }}
                >
                  Usuń świat
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[hsl(var(--rune))] font-mono">
                <Users className="h-4 w-4" />
                Postacie ({worldCharacters.length})
              </div>
              {worldCharacters.length === 0 ? (
                <div className="vault-panel p-6 text-muted-foreground text-sm">Brak przypisanych postaci.</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {worldCharacters.map((c: Character) => (
                    <Link key={c.id} to={`/character/${c.id}`} className="vault-panel p-4 flex items-center gap-3 hover:border-[hsl(var(--rune)/0.5)]">
                      {c.avatar ? <img src={c.avatar} alt={c.name} className="h-12 w-12 rounded-full object-cover" /> : <div className="h-12 w-12 rounded-full bg-muted grid place-items-center"><Users className="h-5 w-5 text-muted-foreground" /></div>}
                      <div className="min-w-0">
                        <div className="font-display truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">{c.tagline}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default WorldPage;