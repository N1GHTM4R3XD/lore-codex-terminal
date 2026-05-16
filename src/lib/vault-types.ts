export type Palette = "abyss" | "crimson" | "arcane" | "ember" | "verdant";
export type Effect = "rain" | "fire" | "stars" | "void" | "none";

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  body: string;
}

export interface Entity {
  id: string;
  name: string;
  type: string; // np. Postać, Miejsce, Artefakt
  description: string;
}

export interface MoodImage {
  id: string;
  url: string;
  caption?: string;
}

export interface VaultState {
  name: string;
  tagline: string;
  avatar: string;
  background: string;
  lore: string;
  manuscript: string;
  journal: JournalEntry[];
  entities: Entity[];
  moodboard: MoodImage[];
  palette: Palette;
  effect: Effect;
}

export const DEFAULT_STATE: VaultState = {
  name: "Vael'thorin Półcień",
  tagline: "Strażnik Zerwanej Pieczęci · Wędrowiec między Eonami",
  avatar:
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80&auto=format&fit=crop",
  background:
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=2000&q=80&auto=format&fit=crop",
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
  palette: "abyss",
  effect: "stars",
};
