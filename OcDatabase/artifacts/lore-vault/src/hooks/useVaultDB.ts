import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { Character, DEFAULT_DB, VaultDB, newCharacter, migrateDB, Whiteboard, CustomPalette, World, Connection, Folder, NamedWhiteboard, StickerPack, CustomFont } from "@/lib/vault-types";
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

  const addStickerPack = (p: StickerPack) =>
    setDb({ ...db, settings: { ...db.settings, stickerPacks: [...(db.settings.stickerPacks ?? []), p] } });

  const removeStickerPack = (id: string) =>
    setDb({ ...db, settings: { ...db.settings, stickerPacks: (db.settings.stickerPacks ?? []).filter((p) => p.id !== id) } });

  const addCustomFont = (f: CustomFont) =>
    setDb({ ...db, settings: { ...db.settings, customFonts: [...(db.settings.customFonts ?? []), f] } });

  const removeCustomFont = (id: string) =>
    setDb({ ...db, settings: { ...db.settings, customFonts: (db.settings.customFonts ?? []).filter((f) => f.id !== id) } });

  const addWorld = (w: Omit<World, "id">): World => {
    const created: World = { ...w, id: `world_${Date.now().toString(36)}` };
    setDb({ ...db, worlds: [...(db.worlds ?? []), created] });
    return created;
  };

  const updateWorld = (id: string, patch: Partial<World>) =>
    setDb({ ...db, worlds: (db.worlds ?? []).map((w) => (w.id === id ? { ...w, ...patch } : w)) });

  const deleteWorld = (id: string) =>
    setDb({
      ...db,
      worlds: (db.worlds ?? []).filter((w) => w.id !== id),
      connections: (db.connections ?? []).filter((c) => c.fromId !== id && c.toId !== id),
    });

  const addConnection = (c: Omit<Connection, "id">): Connection => {
    const created: Connection = { ...c, id: `conn_${Date.now().toString(36)}` };
    setDb({ ...db, connections: [...(db.connections ?? []), created] });
    return created;
  };

  const deleteConnection = (id: string) =>
    setDb({ ...db, connections: (db.connections ?? []).filter((c) => c.id !== id) });

  const addFolder = (name: string, color = "#cf9d7b"): Folder => {
    const created: Folder = { id: `folder_${Date.now().toString(36)}`, name, color, characterIds: [] };
    setDb({ ...db, folders: [...(db.folders ?? []), created] });
    return created;
  };

  const updateFolder = (id: string, patch: Partial<Folder>) =>
    setDb({ ...db, folders: (db.folders ?? []).map((f) => (f.id === id ? { ...f, ...patch } : f)) });

  const deleteFolder = (id: string) =>
    setDb({ ...db, folders: (db.folders ?? []).filter((f) => f.id !== id) });

  const toggleCharInFolder = (folderId: string, charId: string) => {
    const folder = (db.folders ?? []).find((f) => f.id === folderId);
    if (!folder) return;
    const charIds = folder.characterIds.includes(charId)
      ? folder.characterIds.filter((id) => id !== charId)
      : [...folder.characterIds, charId];
    updateFolder(folderId, { characterIds: charIds });
  };

  const addNamedBoard = (name: string, category?: string): NamedWhiteboard => {
    const created: NamedWhiteboard = {
      id: `board_${Date.now().toString(36)}`,
      name,
      category,
      board: { notes: [], strokes: [] },
    };
    setDb({ ...db, namedBoards: [...(db.namedBoards ?? []), created] });
    return created;
  };

  const updateNamedBoard = (id: string, patch: Partial<NamedWhiteboard>) =>
    setDb({ ...db, namedBoards: (db.namedBoards ?? []).map((b) => (b.id === id ? { ...b, ...patch } : b)) });

  const setNamedBoardContent = (id: string, board: Whiteboard) =>
    updateNamedBoard(id, { board });

  const deleteNamedBoard = (id: string) =>
    setDb({ ...db, namedBoards: (db.namedBoards ?? []).filter((b) => b.id !== id) });

  return {
    db,
    updateCharacter,
    addCharacter,
    deleteCharacter,
    setSettings,
    setWorldBoard,
    addCustomPalette,
    removeCustomPalette,
    addStickerPack,
    removeStickerPack,
    addCustomFont,
    removeCustomFont,
    addWorld,
    updateWorld,
    deleteWorld,
    addConnection,
    deleteConnection,
    addFolder,
    updateFolder,
    deleteFolder,
    toggleCharInFolder,
    addNamedBoard,
    updateNamedBoard,
    setNamedBoardContent,
    deleteNamedBoard,
    setDb,
  };
}
