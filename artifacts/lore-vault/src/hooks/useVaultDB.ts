import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { Character, DEFAULT_DB, VaultDB, newCharacter, migrateDB, Whiteboard, CustomPalette } from "@/lib/vault-types";
import { applyCustomPaletteStyles } from "@/lib/paletteUtils";

export function useVaultDB() {
  const [raw, setRaw] = useLocalStorage<VaultDB>("lore-vault:db:v3", DEFAULT_DB);
  const db = migrateDB(raw);
  const setDb = (next: VaultDB) => setRaw(next);

  useEffect(() => {
    applyCustomPaletteStyles(db.settings.customPalettes ?? []);
  }, [db.settings.customPalettes]);

  const updateCharacter = (id: string, patch: Partial<Character>) =>
    setDb({
      ...db,
      characters: db.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });

  const addCharacter = (c?: Partial<Character>): Character => {
    const created = { ...newCharacter(), ...c };
    setDb({ ...db, characters: [created, ...db.characters] });
    return created;
  };

  const deleteCharacter = (id: string) =>
    setDb({ ...db, characters: db.characters.filter((c) => c.id !== id) });

  const setSettings = (patch: Partial<VaultDB["settings"]>) =>
    setDb({ ...db, settings: { ...db.settings, ...patch } });

  const setWorldBoard = (next: Whiteboard) => setDb({ ...db, worldBoard: next });

  const addCustomPalette = (p: CustomPalette) =>
    setDb({ ...db, settings: { ...db.settings, customPalettes: [...db.settings.customPalettes, p] } });

  const removeCustomPalette = (id: string) =>
    setDb({
      ...db,
      settings: {
        ...db.settings,
        customPalettes: db.settings.customPalettes.filter((p) => p.id !== id),
      },
    });

  return {
    db,
    updateCharacter,
    addCharacter,
    deleteCharacter,
    setSettings,
    setWorldBoard,
    addCustomPalette,
    removeCustomPalette,
    setDb,
  };
}
