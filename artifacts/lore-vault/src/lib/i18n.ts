export type Lang = "pl" | "en";

const T = {
  // Tabs
  "tab.lore":         { pl: "Lore",        en: "Lore" },
  "tab.journal":      { pl: "Dziennik",    en: "Journal" },
  "tab.manuscript":   { pl: "Manuskrypt",  en: "Manuscript" },
  "tab.moodboard":    { pl: "Moodboard",   en: "Moodboard" },
  "tab.whiteboard":   { pl: "Tablica",     en: "Board" },
  "tab.encyclopedia": { pl: "Encyklopedia",en: "Encyclopedia" },
  "tab.gallery":      { pl: "Galeria",     en: "Gallery" },

  // LoreTab
  "lore.title":       { pl: "Kodeks Lore",  en: "Lore Codex" },
  "lore.read":        { pl: "Czytaj",        en: "Read" },
  "lore.edit":        { pl: "Edytuj",        en: "Edit" },
  "lore.empty":       { pl: "Pusty pergamin. Przejdź do trybu edycji.", en: "Empty parchment. Switch to edit mode." },
  "lore.placeholder": { pl: "Spisuj lore… Używaj [[Wiki Linków]], **pogrubienia**, *kursywy*, > cytatów, # nagłówków.", en: "Write lore… Use [[Wiki Links]], **bold**, *italic*, > quotes, # headings." },
  "lore.autodetect":  { pl: "Auto-wykrycie", en: "Auto-detect" },
  "lore.noNouns":     { pl: "Brak nowych rzeczowników własnych.", en: "No new proper nouns detected." },
  "lore.addToEnc":    { pl: "Dodaj do Encyklopedii", en: "Add to Encyclopedia" },
  "lore.syntax":      { pl: "Składnia",      en: "Syntax" },
  "lore.wikilink":    { pl: "wiki-link",     en: "wiki-link" },
  "lore.bold":        { pl: "pogrubienie",   en: "bold" },
  "lore.italic":      { pl: "kursywa",       en: "italic" },
  "lore.quote":       { pl: "blokowy cytat", en: "block quote" },
  "lore.heading":     { pl: "nagłówek",      en: "heading" },
  "lore.autoType":    { pl: "Nieznane",      en: "Unknown" },
  "lore.autoDesc":    { pl: "Auto-wykryty rzeczownik własny. Uzupełnij opis w Encyklopedii.", en: "Auto-detected proper noun. Add a description in the Encyclopedia." },
  "lore.autoToast":   { pl: "Dodano do Encyklopedii", en: "Added to Encyclopedia" },
  "lore.autoToastDesc":{ pl: "nowych haseł", en: "new entries" },

  // Encyclopedia
  "enc.title":        { pl: "Encyklopedia",  en: "Encyclopedia" },
  "enc.search":       { pl: "Szukaj…",       en: "Search…" },
  "enc.name":         { pl: "Nazwa",          en: "Name" },
  "enc.type":         { pl: "Typ",            en: "Type" },
  "enc.desc":         { pl: "Opis",           en: "Description" },
  "enc.add":          { pl: "Dodaj",          en: "Add" },
  "enc.empty":        { pl: "Brak haseł.",    en: "No entries." },
  "enc.noDesc":       { pl: "Brak opisu.",    en: "No description." },
  "enc.remove":       { pl: "Usuń hasło",     en: "Remove entry" },

  // Entity types (for select dropdown)
  "type.person":      { pl: "Postać",    en: "Character" },
  "type.place":       { pl: "Miejsce",   en: "Place" },
  "type.faction":     { pl: "Frakcja",   en: "Faction" },
  "type.artifact":    { pl: "Artefakt",  en: "Artifact" },
  "type.deity":       { pl: "Bóstwo",    en: "Deity" },
  "type.race":        { pl: "Rasa",      en: "Race" },
  "type.event":       { pl: "Zdarzenie", en: "Event" },
  "type.other":       { pl: "Inne",      en: "Other" },

  // Hover card (loreParser)
  "hover.noDesc":     { pl: "Brak opisu — uzupełnij w Encyklopedii.", en: "No description — add it in the Encyclopedia." },
  "hover.open":       { pl: "→ otwórz w encyklopedii", en: "→ open in encyclopedia" },

  // Index
  "index.title":      { pl: "Archiwum Postaci", en: "Character Archive" },
  "index.subtitle":   { pl: "Mroczny kodeks twoich bohaterów. Każda karta to własny świat — paleta, ramka, animacje, fonty i muzyka.", en: "Dark codex of your heroes. Each card is its own world — palette, frame, animations, fonts and music." },
  "index.newCard":    { pl: "Nowa karta",     en: "New card" },
  "index.newFolder":  { pl: "Nowy folder",    en: "New folder" },
  "index.worldBoard": { pl: "Tablica Świata", en: "World Board" },
  "index.empty":      { pl: "Vault jest pusty", en: "Vault is empty" },
  "index.emptyDesc":  { pl: "Stwórz pierwszą kartę, aby rozpocząć kronikę.", en: "Create your first card to begin the chronicle." },
  "index.noFolder":   { pl: "Bez folderu",    en: "Unfiled" },
  "index.create":     { pl: "Utwórz",         en: "Create" },
  "index.addChar":    { pl: "Dodaj postać",   en: "Add character" },
  "index.folderName": { pl: "Nazwa folderu…", en: "Folder name…" },
  "index.cancel":     { pl: "Anuluj",         en: "Cancel" },
  "index.removeFolder":{ pl: "Wyjmij z folderu", en: "Remove from folder" },
  "index.noCharsInFolder": { pl: "Brak postaci w tym folderze", en: "No characters in this folder" },

  // WorldBoard
  "world.title":      { pl: "Tablica Świata", en: "World Board" },
  "world.boards":     { pl: "Tablice",        en: "Boards" },
  "world.creator":    { pl: "Kreator Światów",en: "World Creator" },
  "world.newBoard":   { pl: "Nowa tablica",   en: "New board" },
  "world.boardPlaceholder": { pl: "Nazwa tablicy…", en: "Board name…" },
  "world.defaultBoard":{ pl: "Tablica Świata",en: "World Board" },
  "world.vault":      { pl: "Vault",          en: "Vault" },

  // Whiteboard
  "board.empty":      { pl: "Pusta tablica — dodaj notatkę, narysuj lub wklej obraz", en: "Empty board — add a note, draw, or paste an image" },
  "board.autosave":   { pl: "Autozapis",  en: "Autosave" },
  "board.notes":      { pl: "notatek",    en: "notes" },
  "board.sketches":   { pl: "szkiców",    en: "sketches" },
  "board.note":       { pl: "Notatka",    en: "Note" },
  "board.image":      { pl: "Obraz",      en: "Image" },
  "board.clear":      { pl: "Wyczyść",    en: "Clear" },
  "board.pan":        { pl: "Przesuwaj",  en: "Pan" },
  "board.draw":       { pl: "Rysuj",      en: "Draw" },
  "board.erase":      { pl: "Wymaż",      en: "Erase" },
  "board.newNote":    { pl: "Nowa notatka…", en: "New note…" },
  "board.notePlaceholder":{ pl: "Notatka…", en: "Note…" },
  "board.confirmClear": { pl: "Wyczyścić całą tablicę?", en: "Clear the entire board?" },
  "board.imageUrl":   { pl: "URL obrazu (PNG/JPG/GIF):", en: "Image URL (PNG/JPG/GIF):" },
  "board.removeNote": { pl: "Usuń notatkę", en: "Remove note" },

  // Settings
  "settings.title":   { pl: "Ustawienia Vault", en: "Vault Settings" },
  "settings.subtitle":{ pl: "Globalne efekty i dane", en: "Global effects and data" },
  "settings.effects": { pl: "Efekty atmosferyczne (globalne)", en: "Atmospheric effects (global)" },
  "settings.lang":    { pl: "Język interfejsu", en: "Interface language" },
  "settings.data":    { pl: "Dane",         en: "Data" },
  "settings.export":  { pl: "Eksport JSON", en: "Export JSON" },
  "settings.import":  { pl: "Import JSON",  en: "Import JSON" },
  "settings.reset":   { pl: "Reset",        en: "Reset" },
  "settings.resetConfirm": { pl: "Przywrócić domyślny vault? Wszystkie karty zostaną utracone.", en: "Restore default vault? All cards will be lost." },
  "settings.exportDone": { pl: "Wyeksportowano", en: "Exported" },
  "settings.exportDesc": { pl: "Plik JSON zapisany.", en: "JSON file saved." },
  "settings.importDone": { pl: "Zaimportowano", en: "Imported" },
  "settings.importDesc": { pl: "Vault został wczytany.", en: "Vault loaded." },
  "settings.importErr": { pl: "Błąd importu", en: "Import error" },
  "settings.importErrDesc": { pl: "Nieprawidłowy plik JSON.", en: "Invalid JSON file." },

  // Effects
  "effect.embers":    { pl: "Żar",     en: "Embers" },
  "effect.stars":     { pl: "Gwiazdy", en: "Stars" },
  "effect.rain":      { pl: "Deszcz",  en: "Rain" },
  "effect.fire":      { pl: "Ogień",   en: "Fire" },
  "effect.void":      { pl: "Pustka",  en: "Void" },
  "effect.none":      { pl: "Brak",    en: "None" },

  // CharacterPage
  "char.notFound":    { pl: "Nie znaleziono karty",     en: "Card not found" },
  "char.notFoundDesc":{ pl: "Ta postać nie istnieje lub została usunięta.", en: "This character doesn't exist or was deleted." },
  "char.back":        { pl: "Wróć do Vault", en: "Back to Vault" },
  "char.save":        { pl: "Zapisano",      en: "Saved" },
  "char.delete":      { pl: "Usuń postać",   en: "Delete character" },
  "char.deleteConfirm":{ pl: "Usunąć tę kartę?", en: "Delete this card?" },
} as const;

export type TranslationKey = keyof typeof T;

export function t(key: TranslationKey, lang: Lang): string {
  const entry = T[key];
  if (!entry) return key;
  return entry[lang] ?? entry.pl ?? key;
}

export const ENTITY_TYPES = (lang: Lang): { value: string; label: string }[] => [
  { value: t("type.person",   lang), label: t("type.person",   lang) },
  { value: t("type.place",    lang), label: t("type.place",    lang) },
  { value: t("type.faction",  lang), label: t("type.faction",  lang) },
  { value: t("type.artifact", lang), label: t("type.artifact", lang) },
  { value: t("type.deity",    lang), label: t("type.deity",    lang) },
  { value: t("type.race",     lang), label: t("type.race",     lang) },
  { value: t("type.event",    lang), label: t("type.event",    lang) },
  { value: t("type.other",    lang), label: t("type.other",    lang) },
];
