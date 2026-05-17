import { useEffect, useState, CSSProperties } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Save } from "lucide-react";
import { useVaultDB } from "@/hooks/useVaultDB";
import { Character } from "@/lib/vault-types";
import { ParticleCanvas } from "@/components/vault/ParticleCanvas";
import { Hero } from "@/components/vault/Hero";
import { TabId, VaultTabs } from "@/components/vault/VaultTabs";
import { LoreTab } from "@/components/vault/LoreTab";
import { JournalTab } from "@/components/vault/JournalTab";
import { ManuscriptTab } from "@/components/vault/ManuscriptTab";
import { MoodboardTab } from "@/components/vault/MoodboardTab";
import { EncyclopediaTab } from "@/components/vault/EncyclopediaTab";
import { GalleryTab } from "@/components/vault/GalleryTab";
import { NamedWhiteboardsTab } from "@/components/vault/NamedWhiteboardsTab";
import { SettingsModal } from "@/components/vault/SettingsModal";
import { CardCustomizer } from "@/components/vault/CardCustomizer";
import { MusicPlayer } from "@/components/vault/MusicPlayer";
import { QuickSearch } from "@/components/vault/QuickSearch";
import { Button } from "@/components/ui/button";
import { fontFamilyStack, loadFonts } from "@/lib/fontLoader";

const CharacterPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { db, updateCharacter, setDb, addCustomPalette, removeCustomPalette, addStickerPack, removeStickerPack } = useVaultDB();
  const character = db.characters.find((c) => c.id === id);

  const [tab, setTab] = useState<TabId>("lore");
  const [focusEntity, setFocusEntity] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  // Per-card palette on document root so global components (modals, popovers) follow.
  useEffect(() => {
    if (character) document.documentElement.dataset.palette = character.palette;
    return () => { document.documentElement.dataset.palette = "pixel-dark"; };
  }, [character?.palette]);

  // Load all character fonts dynamically.
  useEffect(() => {
    if (!character) return;
    const f = character.fonts ?? { display: character.font, body: "Cormorant Garamond", mono: "JetBrains Mono" };
    loadFonts([f.display, f.body, f.mono]);
  }, [character?.fonts?.display, character?.fonts?.body, character?.fonts?.mono]);

  // Autosave flash
  useEffect(() => {
    if (!character) return;
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 1200);
    return () => clearTimeout(t);
  }, [character]);

  if (!character) {
    return (
      <div className="min-h-screen grid place-items-center text-center p-8">
        <div className="vault-panel p-10 max-w-md">
          <p className="font-pixel text-xl text-[hsl(var(--rune))] mb-3">404</p>
          <h1 className="font-display text-2xl mb-2">Nie znaleziono karty</h1>
          <p className="text-muted-foreground mb-6">Ta postać nie istnieje lub została usunięta.</p>
          <Button onClick={() => navigate("/")} className="pixel-btn">
            <ArrowLeft className="h-3 w-3 mr-1.5" /> Wróć do Vault
          </Button>
        </div>
      </div>
    );
  }

  const update = (patch: Partial<Character>) => updateCharacter(character.id, patch);

  const onEntity = (name: string) => {
    setFocusEntity(name);
    setTab("encyclopedia");
    setTimeout(() => setFocusEntity(null), 2500);
  };

  const f = character.fonts ?? { display: character.font, body: "Cormorant Garamond", mono: "JetBrains Mono" };
  const fontStyle: CSSProperties = {
    ["--font-display" as any]: fontFamilyStack(f.display),
    ["--font-body" as any]: fontFamilyStack(f.body),
    ["--font-mono" as any]: fontFamilyStack(f.mono),
  };

  return (
    <div
      className="relative min-h-screen lv-card-scope"
      data-card-font="custom"
      style={fontStyle}
    >
      <ParticleCanvas effect={db.settings.effect} />
      {character.animation !== "none" && (
        <ParticleCanvas effect={character.animation} characterLayer />
      )}

      {/* Top action bar */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <div
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full vault-panel font-mono text-[10px] uppercase tracking-widest transition-opacity ${
            savedFlash ? "opacity-100" : "opacity-50"
          }`}
          aria-live="polite"
        >
          {savedFlash ? <Save className="h-3 w-3 text-[hsl(var(--rune))]" /> : <Check className="h-3 w-3 text-[hsl(var(--rune))]" />}
          {savedFlash ? "Zapisuję..." : "Zapisano"}
        </div>
        <QuickSearch characters={db.characters} currentId={id!} />
        <CardCustomizer
          character={character}
          update={update}
          customPalettes={db.settings.customPalettes}
          addCustomPalette={addCustomPalette}
          removeCustomPalette={removeCustomPalette}
        />
        <SettingsModal db={db} setDb={setDb} />
      </div>

      <div className="fixed top-4 left-4 z-40">
        <Button asChild variant="outline" size="sm" className="font-mono uppercase tracking-wider text-xs">
          <Link to="/" aria-label="Wróć do listy postaci">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Vault
          </Link>
        </Button>
      </div>

      <main className="relative z-10">
        <Hero state={character} update={update} musicPlaying={musicPlaying} />

        <div className="container py-10">
          <div className="flex justify-center">
            <VaultTabs value={tab} onChange={setTab} />
          </div>

          <div key={tab} className="animate-fade-in">
            {tab === "lore" && <LoreTab state={character} update={update} onEntity={onEntity} />}
            {tab === "journal" && <JournalTab state={character} update={update} />}
            {tab === "manuscript" && <ManuscriptTab state={character} update={update} />}
            {tab === "moodboard" && <MoodboardTab state={character} update={update} />}
            {tab === "gallery" && <GalleryTab state={character} update={update} />}
            {tab === "whiteboard" && (
              <NamedWhiteboardsTab
                state={character}
                update={update}
                stickerPacks={db.settings.stickerPacks}
                onAddStickerPack={addStickerPack}
                onRemoveStickerPack={removeStickerPack}
              />
            )}
            {tab === "encyclopedia" && (
              <EncyclopediaTab state={character} update={update} focusName={focusEntity} />
            )}
          </div>
        </div>

        <footer className="container py-12 text-center font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
          <span className="inline-flex items-center gap-3">
            <span className="h-px w-12 bg-border" />
            {character.name}
            <span className="h-px w-12 bg-border" />
          </span>
        </footer>
      </main>

      <MusicPlayer
        url={character.musicUrl}
        playlist={character.musicPlaylist ?? []}
        onPlaylistChange={(urls) => update({ musicPlaylist: urls })}
        onPlayingChange={setMusicPlaying}
      />
    </div>
  );
};

export default CharacterPage;
