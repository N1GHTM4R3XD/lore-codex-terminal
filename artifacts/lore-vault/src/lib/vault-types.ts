export type Palette = string; // built-in id or custom id starting with "custom_"

export type Effect = "rain" | "fire" | "stars" | "void" | "embers" | "none"
  | "lightning" | "confetti" | "ocean";

/** Per-character ambient effect shown as full-page particles on the character page. */
export type CardAnimation =
  | "none" | "rain" | "fire" | "stars" | "embers" | "void"
  | "leaves" | "fog" | "bubbles" | "snow"
  | "lightning" | "confetti" | "ocean";

export type FrameStyle =
  | "pixel" | "ornament" | "neon" | "parchment" | "none" | "arcane" | "gothic" | "circuit" | "minimal"
  | "chain" | "flame" | "ice" | "vines" | "crown" | "diamond" | "shadow" | "tapestry";

export type AvatarBorderStyle =
  | "rune" | "double" | "glow" | "pixel" | "none" | "thin" | "ornate"
  | "chain" | "flame" | "ice" | "crown" | "starburst" | "feather" | "diamond" | "thorn" | "aura";

/** Font is now a free-form Google Font family name. */
export type FontTheme = string;

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  body: string;
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface MoodImage {
  id: string;
  url: string;
  caption?: string;
}

export interface GalleryImage {
  id: string;
  url: string;         // HTTP URL or data: URI (file upload)
  title?: string;      // optional caption shown on hover
  category?: string;   // optional tag: "ref" | "illo" | "sketch" | custom
}

/** A simple whiteboard note (sticky). */
export interface BoardNote {
  id: string;
  x: number; // px relative to board
  y: number;
  w: number;
  h: number;
  rotate: number;
  color: string; // hsl(...) or hex
  text: string;
  font?: string;
  imageUrl?: string;
}

export type BrushType = "pen" | "marker" | "pencil" | "ink";
export type BgPattern = "none" | "grid" | "lines" | "dots";

/** A free-hand stroke on the whiteboard sketch layer. */
export interface BoardStroke {
  id: string;
  color: string;
  size: number;
  /** flattened [x0,y0,x1,y1,...] in board coords */
  points: number[];
  /** One pressure value (0–1) per point pair. Optional — only from stylus. */
  pressure?: number[];
  brushType?: BrushType;
}

/** A single placed sticker on a whiteboard. */
export interface Sticker {
  id: string;
  src: string;      // emoji char (1-2 chars) or data: / https: URL
  x: number;        // board-space px
  y: number;
  size: number;     // board-space px (square)
  rotate: number;   // degrees
}

/** A named pack of custom (uploaded) sticker images. */
export interface StickerPack {
  id: string;
  name: string;
  images: { id: string; src: string }[];
}

export interface Whiteboard {
  notes: BoardNote[];
  strokes: BoardStroke[];
  stickers?: Sticker[];
  bgColor?: string;
  bgPattern?: BgPattern;
  bgPatternColor?: string;
}

/** A single named chapter inside a character's manuscript. */
export interface ManuscriptChapter {
  id: string;
  name: string;
  content: string;
}

/** Per-character display fonts. Each is a Google Font family name. */
export interface CardFonts {
  display: string;  // headings / name
  body: string;     // paragraphs
  mono: string;     // labels / chips
}

/** A user-uploaded font file (TTF/WOFF2) loaded as data: URL. */
export interface CustomFont {
  id: string;
  name: string;
  src: string;   // data: URL
}

/** A user-defined palette. Stored as 3–6 colors -> turned into CSS vars. */
export interface CustomPalette {
  id: string;         // "custom_xxx"
  label: string;
  background: string; // hex — required
  foreground: string; // hex — required
  primary: string;    // hex — required
  card?: string;      // auto-derived from background if absent
  accent?: string;    // auto-derived from primary if absent
  rune?: string;      // auto-derived toward gold from primary if absent
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  characterIds: string[];
  collapsed?: boolean;
}

export interface NamedWhiteboard {
  id: string;
  name: string;
  category?: string;
  board: Whiteboard;
}

export type ConnectionNodeType = "character" | "world";

export interface Connection {
  id: string;
  fromId: string;
  fromType: ConnectionNodeType;
  toId: string;
  toType: ConnectionNodeType;
  label: string;
  description?: string;
  color?: string;
}

export interface WorldHistoryEntry {
  id: string;
  era: string;     // e.g. "Era Pierwszego Ognia"
  title: string;
  body: string;
}

export interface World {
  id: string;
  name: string;
  description: string;
  characterIds: string[];
  imageUrl?: string;
  palette?: Palette;
  lore?: string;
  entities?: Entity[];
  moodboard?: MoodImage[];
  history?: WorldHistoryEntry[];
  whiteboard?: Whiteboard;
  musicUrl?: string;
}

/**
 * A single character card. Holds all narrative + visual customization.
 */
export interface Character {
  id: string;
  name: string;
  tagline: string;
  quote?: string;
  avatar: string;
  background: string;
  lore: string;
  manuscript: string;
  journal: JournalEntry[];
  entities: Entity[];
  moodboard: MoodImage[];
  gallery: GalleryImage[];
  whiteboard: Whiteboard;

  // Per-card customization
  palette: Palette;
  animation: CardAnimation;
  frame: FrameStyle;
  avatarBorder?: AvatarBorderStyle;
  bgOpacity?: number;           // 0–100, how visible background image is; default 65
  manuscriptChapters?: ManuscriptChapter[];   // named chapters; falls back to `manuscript`
  whiteboards?: NamedWhiteboard[];            // named boards; falls back to `whiteboard`
  /** Back-compat: legacy single font theme. Used as display if `fonts` missing. */
  font: FontTheme;
  fonts?: CardFonts;
  musicUrl?: string;
  musicPlaylist?: string[];
}

export type VaultState = Character;

export interface VaultDB {
  characters: Character[];
  worldBoard: Whiteboard;
  worlds: World[];
  connections: Connection[];
  folders: Folder[];
  namedBoards: NamedWhiteboard[];
  settings: {
    effect: Effect;
    customPalettes: CustomPalette[];
    stickerPacks: StickerPack[];
    customFonts: CustomFont[];
  };
}

const emptyBoard = (): Whiteboard => ({ notes: [], strokes: [] });

const makeChar = (over: Partial<Character>): Character => ({
  id: over.id ?? `char_${Math.random().toString(36).slice(2, 9)}`,
  name: "Bez imienia",
  tagline: "Nowa karta postaci",
  quote: over.quote ?? "",
  avatar: "",
  background: "",
  lore: "",
  manuscript: "",
  journal: [],
  entities: [],
  moodboard: [],
  gallery: [],
  whiteboard: emptyBoard(),
  palette: "pixel-dark",
  animation: "none",
  frame: "pixel",
  font: "Pixelify Sans",
  fonts: { display: "Pixelify Sans", body: "Cormorant Garamond", mono: "JetBrains Mono" },
  ...over,
});

const sampleA: Character = makeChar({
  id: "char_vael",
  name: "Vael'thorin Półcień",
  tagline: "Strażnik Zerwanej Pieczęci · Wędrowiec między Eonami",
  avatar:
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80&auto=format&fit=crop",
  background:
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=2000&q=80&auto=format&fit=crop",
  palette: "pixel-dark",
  animation: "rain",
  frame: "pixel",
  font: "Pixelify Sans",
  fonts: { display: "Pixelify Sans", body: "Cormorant Garamond", mono: "JetBrains Mono" },
  lore: `[[Vael'thorin]] narodził się w cieniu [[Czarnej Cytadeli]], gdy bliźniacze księżyce stanęły w koniunkcji nad [[Morzem Popiołu]].

Dorastał wśród mnichów zakonu **Zerwanej Pieczęci**, ucząc się czytać runy wyryte w samym tkaninie rzeczywistości. Powiadają, że w jego oczach wciąż tli się odprysk *Pierwszego Światła* — relikt, którego nawet [[Inkwizycja Eonu]] nie ośmiela się tknąć.

> "Pamięć jest ostrzem ostrzejszym od wszelkich kling. Pamiętaj — albo zostaniesz zapomniany."
> — Mistrz Orelian, ostatnie słowa

Gdy [[Czarna Cytadela]] runęła, Vael'thorin ruszył na północ, w głąb [[Pustkowi Ehr-Vahn]], niosąc ze sobą jedynie [[Astrolabium Półcienia]] i obietnicę zemsty.`,
  manuscript: `Rozdział I — Przebudzenie

Świt nie nadszedł tego dnia. Niebo nad Czarną Cytadelą pozostało koloru zakrzepłej krwi, a powietrze drżało, jakby świat wstrzymał oddech...`,
  journal: [
    {
      id: "j1",
      date: new Date().toISOString().slice(0, 10),
      title: "Wpis z Pustkowi",
      body: "Trzeciego dnia marszu astrolabium drgnęło po raz pierwszy. Coś mnie obserwuje spomiędzy wydm popiołu.",
    },
  ],
  entities: [
    { id: "e1", name: "Vael'thorin", type: "Postać", description: "Strażnik Zerwanej Pieczęci, ostatni z linii Półcienia." },
    { id: "e2", name: "Czarna Cytadela", type: "Miejsce", description: "Forteca zakonu, wzniesiona z obsydianu i pamięci." },
    { id: "e3", name: "Morze Popiołu", type: "Miejsce", description: "Wyschnięty ocean, w którym śpią martwe konstelacje." },
    { id: "e4", name: "Inkwizycja Eonu", type: "Frakcja", description: "Strażnicy dogmatu, łowcy heretyckich relikwii." },
    { id: "e5", name: "Pustkowia Ehr-Vahn", type: "Miejsce", description: "Spalona kraina, gdzie czas płynie wstecz." },
    { id: "e6", name: "Astrolabium Półcienia", type: "Artefakt", description: "Instrument wskazujący kierunki niemożliwe." },
  ],
  moodboard: [
    { id: "m1", url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=900&q=80" },
    { id: "m2", url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=900&q=80" },
    { id: "m3", url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=900&q=80" },
  ],
  musicUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
});

const sampleB: Character = makeChar({
  id: "char_lyra",
  name: "Lyra z Mglistego Gaju",
  tagline: "Zielarka · Tkaczka snów · Strażniczka kotów",
  avatar:
    "https://images.unsplash.com/photo-1492288991661-058aa541ff43?w=600&q=80&auto=format&fit=crop",
  background:
    "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=2000&q=80&auto=format&fit=crop",
  palette: "cozy-forest",
  animation: "leaves",
  frame: "ornament",
  font: "Cormorant Garamond",
  fonts: { display: "Cormorant Garamond", body: "Lora", mono: "JetBrains Mono" },
  lore: `Lyra mieszka w drewnianej chacie na skraju [[Mglistego Gaju]], otoczona przez siedem kotów i niezliczone słoiki suszonych ziół.

Każdego ranka warzy napar z **majowej rosy** i czyta listy od [[Wędrownego Listonosza]], który zawsze pachnie deszczem.`,
  manuscript: "",
  journal: [],
  entities: [
    { id: "le1", name: "Mglisty Gaj", type: "Miejsce", description: "Las, w którym drzewa pamiętają imiona." },
    { id: "le2", name: "Wędrowny Listonosz", type: "Postać", description: "Przynosi listy z miejsc, których jeszcze nie ma." },
  ],
  moodboard: [
    { id: "lm1", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80" },
    { id: "lm2", url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=900&q=80" },
  ],
  musicUrl: "https://www.youtube.com/watch?v=DWcJFNfaw9c",
});

export const DEFAULT_DB: VaultDB = {
  characters: [sampleA, sampleB],
  worldBoard: emptyBoard(),
  worlds: [],
  connections: [],
  folders: [],
  namedBoards: [],
  settings: { effect: "embers", customPalettes: [], stickerPacks: [], customFonts: [] },
};

export const DEFAULT_STATE: Character = sampleA;

export const newCharacter = (): Character =>
  makeChar({
    id: `char_${Date.now().toString(36)}`,
    name: "Nowa postać",
    tagline: "Edytuj kartę, aby rozpocząć historię.",
  });

/** Migration helper for old persisted DBs. */
const ANIM_MIGRATE: Record<string, CardAnimation> = {
  float: "none", glow: "stars", shake: "void", sparkle: "embers",
  "pixel-twinkle": "stars", tilt: "none", breathe: "fog",
  leaves: "leaves", "rain-card": "rain", fog: "fog",
  bubbles: "bubbles", waves: "rain", "stars-card": "stars",
};

export function migrateDB(db: any): VaultDB {
  if (!db || typeof db !== "object") return DEFAULT_DB;
  const characters = (db.characters ?? []).map((c: any) => ({
    ...c,
    gallery: c.gallery ?? [],
    whiteboard: c.whiteboard ?? emptyBoard(),
    animation: ANIM_MIGRATE[c.animation as string] ?? (c.animation as CardAnimation) ?? "none",
    fonts:
      c.fonts ??
      {
        display:
          c.font === "pixel" ? "Pixelify Sans" :
          c.font === "gothic" ? "Cinzel" :
          c.font === "serif" ? "Cormorant Garamond" :
          c.font === "handwritten" ? "Caveat" :
          (typeof c.font === "string" && c.font) || "Pixelify Sans",
        body: "Cormorant Garamond",
        mono: "JetBrains Mono",
      },
  }));
  const worlds: World[] = (db.worlds ?? []).map((w: any) => ({
    ...w,
    lore: w.lore ?? "",
    entities: w.entities ?? [],
    moodboard: w.moodboard ?? [],
    history: w.history ?? [],
    whiteboard: w.whiteboard ?? emptyBoard(),
    musicUrl: w.musicUrl ?? "",
  }));

  return {
    characters,
    worldBoard: db.worldBoard ?? emptyBoard(),
    worlds,
    connections: db.connections ?? [],
    folders: db.folders ?? [],
    namedBoards: db.namedBoards ?? [],
    settings: {
      effect: db.settings?.effect ?? "embers",
      customPalettes: db.settings?.customPalettes ?? [],
      stickerPacks: db.settings?.stickerPacks ?? [],
      customFonts: db.settings?.customFonts ?? [],
    },
  };
}
