export type Palette =
  | "pixel-dark"
  | "abyss"
  | "crimson"
  | "arcane"
  | "ember"
  | "verdant"
  | "cozy-forest"
  | "pastel-dream";

export type Effect = "rain" | "fire" | "stars" | "void" | "embers" | "none";

export type CardAnimation =
  | "none"
  | "float"
  | "glow"
  | "shake"
  | "sparkle"
  | "pixel-twinkle";

export type FrameStyle = "pixel" | "ornament" | "neon" | "parchment" | "none";

export type FontTheme = "pixel" | "gothic" | "serif" | "handwritten";

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

/**
 * A single character card. Holds all narrative + visual customization.
 * VaultState is kept as an alias so existing tab components keep working.
 */
export interface Character {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  background: string;
  lore: string;
  manuscript: string;
  journal: JournalEntry[];
  entities: Entity[];
  moodboard: MoodImage[];

  // Per-card customization
  palette: Palette;
  animation: CardAnimation;
  frame: FrameStyle;
  font: FontTheme;
  musicUrl?: string;
}

export type VaultState = Character;

export interface VaultDB {
  characters: Character[];
  settings: {
    effect: Effect;
  };
}

const makeChar = (over: Partial<Character>): Character => ({
  id: over.id ?? `char_${Math.random().toString(36).slice(2, 9)}`,
  name: "Bez imienia",
  tagline: "Nowa karta postaci",
  avatar: "",
  background: "",
  lore: "",
  manuscript: "",
  journal: [],
  entities: [],
  moodboard: [],
  palette: "pixel-dark",
  animation: "float",
  frame: "pixel",
  font: "pixel",
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
  animation: "float",
  frame: "pixel",
  font: "pixel",
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
  animation: "sparkle",
  frame: "ornament",
  font: "serif",
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
  settings: { effect: "embers" },
};

export const DEFAULT_STATE: Character = sampleA;

export const newCharacter = (): Character =>
  makeChar({
    id: `char_${Date.now().toString(36)}`,
    name: "Nowa postać",
    tagline: "Edytuj kartę, aby rozpocząć historię.",
  });
