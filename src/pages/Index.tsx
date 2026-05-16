import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DEFAULT_STATE, VaultState } from "@/lib/vault-types";
import { ParticleCanvas } from "@/components/vault/ParticleCanvas";
import { Hero } from "@/components/vault/Hero";
import { VaultTabs, TabId } from "@/components/vault/VaultTabs";
import { LoreTab } from "@/components/vault/LoreTab";
import { JournalTab } from "@/components/vault/JournalTab";
import { ManuscriptTab } from "@/components/vault/ManuscriptTab";
import { MoodboardTab } from "@/components/vault/MoodboardTab";
import { EncyclopediaTab } from "@/components/vault/EncyclopediaTab";
import { SettingsModal } from "@/components/vault/SettingsModal";
import { Check, Save } from "lucide-react";

const Index = () => {
  const [state, setState] = useLocalStorage<VaultState>("lore-vault:v1", DEFAULT_STATE);
  const [tab, setTab] = useState<TabId>("lore");
  const [focusEntity, setFocusEntity] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const update = (patch: Partial<VaultState>) => setState({ ...state, ...patch });

  // Apply palette to <html>
  useEffect(() => {
    document.documentElement.dataset.palette = state.palette;
  }, [state.palette]);

  // Autosave indicator
  useEffect(() => {
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 1200);
    return () => clearTimeout(t);
  }, [state]);

  const onEntity = (name: string) => {
    setFocusEntity(name);
    setTab("encyclopedia");
    setTimeout(() => setFocusEntity(null), 2500);
  };

  return (
    <div className="relative min-h-screen">
      <ParticleCanvas effect={state.effect} />

      {/* Top action bar */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full vault-panel font-mono text-[10px] uppercase tracking-widest transition-opacity ${
            savedFlash ? "opacity-100" : "opacity-50"
          }`}
          aria-live="polite"
        >
          {savedFlash ? <Save className="h-3 w-3 text-[hsl(var(--rune))]" /> : <Check className="h-3 w-3 text-[hsl(var(--rune))]" />}
          {savedFlash ? "Zapisuję..." : "Zapisano"}
        </div>
        <SettingsModal state={state} setState={setState} />
      </div>

      <main className="relative z-10">
        <Hero state={state} update={update} />

        <div className="container py-10">
          <div className="flex justify-center">
            <VaultTabs value={tab} onChange={setTab} />
          </div>

          <div key={tab} className="animate-fade-in">
            {tab === "lore" && <LoreTab state={state} update={update} onEntity={onEntity} />}
            {tab === "journal" && <JournalTab state={state} update={update} />}
            {tab === "manuscript" && <ManuscriptTab state={state} update={update} />}
            {tab === "moodboard" && <MoodboardTab state={state} update={update} />}
            {tab === "encyclopedia" && <EncyclopediaTab state={state} update={update} focusName={focusEntity} />}
          </div>
        </div>

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
