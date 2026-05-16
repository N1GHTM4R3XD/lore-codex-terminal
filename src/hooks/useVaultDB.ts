import { useLocalStorage } from "./useLocalStorage";
import { Character, DEFAULT_DB, VaultDB, newCharacter } from "@/lib/vault-types";

export function useVaultDB() {
  const [db, setDb] = useLocalStorage<VaultDB>("lore-vault:db:v2", DEFAULT_DB);

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

  const replaceDB = (next: VaultDB) => setDb(next);

  return { db, updateCharacter, addCharacter, deleteCharacter, setSettings, replaceDB, setDb };
}
