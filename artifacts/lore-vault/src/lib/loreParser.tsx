import { Fragment, ReactNode } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Entity } from "./vault-types";
import { Lang, t } from "./i18n";

/**
 * Lightweight markdown + [[WikiLink]] + entity highlighter.
 * Polish-inflection-aware: stems entity names so "cytadeli" matches entity "Cytadela".
 * Supports: **bold**, *italic*, > blockquote, # headings, `code`, [[link]], paragraphs.
 */

export function renderLore(
  text: string,
  entities: Entity[],
  onEntityClick?: (name: string) => void,
  lang: Lang = "pl",
): ReactNode {
  if (!text) return null;
  const blocks = text.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("### ")) return <h3 key={i}>{renderInline(trimmed.slice(4), entities, onEntityClick, lang)}</h3>;
    if (trimmed.startsWith("## "))  return <h2 key={i}>{renderInline(trimmed.slice(3), entities, onEntityClick, lang)}</h2>;
    if (trimmed.startsWith("# "))   return <h1 key={i}>{renderInline(trimmed.slice(2), entities, onEntityClick, lang)}</h1>;
    if (trimmed.startsWith("> "))   return <blockquote key={i}>{renderInline(trimmed.replace(/^>\s?/gm, ""), entities, onEntityClick, lang)}</blockquote>;
    return <p key={i}>{renderInline(trimmed, entities, onEntityClick, lang)}</p>;
  });
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  "Postać":    "hsl(28,50%,65%)",
  "Miejsce":   "hsl(195,85%,60%)",
  "Frakcja":   "hsl(280,80%,65%)",
  "Artefakt":  "hsl(45,90%,65%)",
  "Bóstwo":    "hsl(0,75%,60%)",
  "Rasa":      "hsl(145,70%,50%)",
  "Zdarzenie": "hsl(20,80%,60%)",
  "Inne":      "hsl(35,75%,70%)",
  "Nieznane":  "hsl(35,75%,70%)",
  // English equivalents
  "Character": "hsl(28,50%,65%)",
  "Place":     "hsl(195,85%,60%)",
  "Faction":   "hsl(280,80%,65%)",
  "Artifact":  "hsl(45,90%,65%)",
  "Deity":     "hsl(0,75%,60%)",
  "Race":      "hsl(145,70%,50%)",
  "Event":     "hsl(20,80%,60%)",
  "Other":     "hsl(35,75%,70%)",
  "Unknown":   "hsl(35,75%,70%)",
};

function entityColor(type: string) {
  return ENTITY_TYPE_COLORS[type] ?? "hsl(35,75%,70%)";
}

// Polish + English word character class for stem patterns
const PL_CHARS = "a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ0-9";

/**
 * Compute a stem for fuzzy inflection matching.
 * Names of 6+ chars: keep first (len-2) chars, minimum 5.
 */
function stemOf(name: string): string {
  if (name.length <= 5) return name;
  return name.slice(0, Math.max(5, name.length - 2));
}

/** Build a regex fragment for a single entity name (with Polish inflection tolerance). */
function entityPattern(name: string): string {
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (name.length <= 5) return esc(name);
  return esc(stemOf(name)) + `[${PL_CHARS}]*`;
}

/** Find which entity a matched token belongs to, using stem comparison. */
function matchEntity(token: string, entities: Entity[]): Entity | undefined {
  const low = token.toLowerCase();
  return entities.find((e) => {
    if (e.name.toLowerCase() === low) return true;
    if (e.name.length <= 5) return false;
    return low.startsWith(stemOf(e.name).toLowerCase());
  });
}

function EntityToken({
  label,
  entity,
  variant,
  onClick,
  lang = "pl",
}: {
  label: string;
  entity?: Entity;
  variant: "wiki" | "highlight";
  onClick?: () => void;
  lang?: Lang;
}) {
  const cls = variant === "wiki" ? "wiki-link" : "entity-highlight";
  const trigger = (
    <span
      className={cls}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" ? onClick?.() : null)}
    >
      {label}
    </span>
  );
  if (!entity) return trigger;

  const color = entityColor(entity.type);

  return (
    <HoverCard openDelay={100} closeDelay={80}>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        className="vault-panel w-76 p-0 overflow-hidden border-[hsl(var(--border))]"
        style={{ boxShadow: `0 0 0 1px ${color}40, var(--shadow-vault)` }}
      >
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border" style={{ borderBottomColor: `${color}40` }}>
          <span className="inline-flex h-2 w-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
          <p className="font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color }}>
            {entity.type}
          </p>
        </div>
        <div className="px-4 pt-3 pb-1">
          <h4 className="font-display text-[1.1rem] leading-tight" style={{ color }}>
            {entity.name}
          </h4>
        </div>
        <div className="px-4 pb-3">
          <p className="text-sm italic text-muted-foreground leading-relaxed">
            {entity.description || t("hover.noDesc", lang)}
          </p>
        </div>
        {onClick && (
          <div className="px-4 pb-3 pt-0">
            <button
              onClick={onClick}
              className="text-[9px] font-mono uppercase tracking-[0.18em] opacity-60 hover:opacity-100 transition-opacity"
              style={{ color }}
            >
              {t("hover.open", lang)}
            </button>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

function renderInline(
  text: string,
  entities: Entity[],
  onEntityClick: ((n: string) => void) | undefined,
  lang: Lang,
): ReactNode {
  const re = /(\[\[[^\]]+\]\]|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(re).filter(Boolean);

  return parts.map((part, i) => {
    if (part.startsWith("[[") && part.endsWith("]]")) {
      const name = part.slice(2, -2);
      // Fuzzy match: find entity whose stem matches the wiki link text
      const ent = entities.find((e) => {
        if (e.name.toLowerCase() === name.toLowerCase()) return true;
        if (e.name.length <= 5 || name.length <= 5) return false;
        // Check if link text starts with entity stem, or entity name starts with link stem
        return (
          name.toLowerCase().startsWith(stemOf(e.name).toLowerCase()) ||
          e.name.toLowerCase().startsWith(stemOf(name).toLowerCase())
        );
      });
      return (
        <EntityToken
          key={i}
          label={name}
          entity={ent}
          variant="wiki"
          onClick={() => onEntityClick?.(ent?.name ?? name)}
          lang={lang}
        />
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))   return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))   return <code key={i}>{part.slice(1, -1)}</code>;
    return <Fragment key={i}>{highlightEntities(part, entities, onEntityClick, lang)}</Fragment>;
  });
}

function highlightEntities(
  text: string,
  entities: Entity[],
  onEntityClick: ((n: string) => void) | undefined,
  lang: Lang,
): ReactNode {
  if (!entities.length) return text;
  const sorted = [...entities].sort((a, b) => b.name.length - a.name.length);

  const pattern = new RegExp(
    `(${sorted.map((e) => entityPattern(e.name)).join("|")})`,
    "gi",
  );

  const parts = text.split(pattern);
  return parts.map((p, i) => {
    const ent = matchEntity(p, entities);
    if (ent) {
      return (
        <EntityToken
          key={i}
          label={p}
          entity={ent}
          variant="highlight"
          onClick={() => onEntityClick?.(ent.name)}
          lang={lang}
        />
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}

// Comprehensive stop-word list: sentence starters + common words in Polish & English
const STOP_WORDS = new Set([
  // Polish – very common / sentence-starter
  "Ale", "Albo", "Bo", "Bądź", "Był", "Była", "Było", "Byli",
  "Choć", "Chociaż", "Co", "Czy", "Czemu", "Dlaczego", "Dlatego",
  "Dorastał", "Dopóki", "Gdy", "Gdzie", "I", "Ich", "Jego", "Jej",
  "Jednak", "Jako", "Jeszcze", "Jest", "Jak", "Już", "Każdego",
  "Kiedy", "Który", "Która", "Które", "Lecz", "Lub", "Mimo",
  "Na", "Nad", "Natomiast", "Nie", "No", "Od", "Oraz",
  "Po", "Pod", "Ponieważ", "Potem", "Przed", "Przez", "Przy",
  "Rozdział", "Skoro", "Skąd", "Ta", "Ten", "To", "Tej", "Tego",
  "Temu", "Tam", "Tu", "Tutaj", "Tak", "Tylko",
  "W", "Właśnie", "Wobec", "Więc", "Za", "Zanim", "Zatem", "Ze",
  "Już", "Wtedy", "Stamtąd", "Dookoła", "Wokół",
  // ordinals / numbers written out
  "Drugiego", "Trzeciego", "Czwartego", "Piątego", "Szóstego",
  "Pierwszego", "Ostatniego",
  // English sentence starters
  "A", "And", "As", "At", "But", "By", "For", "From",
  "He", "Her", "His", "If", "In", "Into", "It", "Its",
  "Not", "Of", "On", "Or", "Our", "Out",
  "She", "So", "The", "Their", "They", "This", "That", "These", "Those",
  "To", "Up", "Was", "We", "Were", "When", "Where", "Which", "Who",
  "With", "Yet", "You", "Your",
]);

/**
 * Auto-detect proper nouns not yet in entity list.
 *
 * Strategy:
 *  1. Extract all [[WikiLink]] names first (user-tagged → always proper nouns).
 *  2. Scan plain text for mid-sentence capitalised words, skipping:
 *     - The first word of every sentence/paragraph.
 *     - Common stop words.
 *     - Words already in the entity list (fuzzy via stem).
 */
export function detectProperNouns(text: string, existing: string[]): string[] {
  const existingLow = new Set(existing.map((e) => e.toLowerCase()));
  const existingStems = new Set(existing.map((e) => stemOf(e).toLowerCase()));
  const found = new Set<string>();

  const isKnown = (name: string) => {
    const low = name.toLowerCase();
    return existingLow.has(low) || existingStems.has(stemOf(name).toLowerCase());
  };

  // PASS 1 — extract [[WikiLink]] names explicitly typed by user
  text.replace(/\[\[([^\]]+)\]\]/g, (_, name: string) => {
    const n = name.trim();
    if (n.length >= 2 && !isKnown(n)) found.add(n);
    return "";
  });

  // PASS 2 — strip markdown / wiki markup, then scan for mid-sentence capitals
  const clean = text
    .replace(/\[\[[^\]]+\]\]/g, " ")           // remove wiki links
    .replace(/\*\*?([^*]+)\*\*?/g, "$1")       // un-bold / un-italic
    .replace(/`[^`]+`/g, " ")                   // remove code
    .replace(/^#+\s*/gm, "")                    // remove heading markers
    .replace(/^>\s*/gm, "");                    // remove blockquote markers

  // Split into paragraph-lines, then into sentence fragments
  for (const line of clean.split(/\n+/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Rough sentence split: break on ". ", "! ", "? " followed by uppercase
    // Keep the splitting point so we don't confuse sentence starts
    const fragments = trimmed.split(/(?<=[.!?])\s+(?=[A-ZŻŹĆŁŚÓĄĘŃ])/);

    for (const frag of fragments) {
      // Tokenise — split on whitespace and strip leading/trailing punctuation
      const rawWords = frag.trim().split(/\s+/);
      // Skip index 0: it is the first word of a sentence (capitalised by grammar rule)
      for (let i = 1; i < rawWords.length; i++) {
        const stripped = rawWords[i]
          .replace(/^[^\p{L}\p{N}]*/u, "")
          .replace(/[^\p{L}\p{N}]*$/u, "")
          .trim();

        if (!stripped || stripped.length < 2) continue;
        // Must start with an uppercase letter (Polish or Latin)
        if (!/^[A-ZŻŹĆŁŚÓĄĘŃ]/.test(stripped)) continue;
        // Skip stop words
        if (STOP_WORDS.has(stripped)) continue;
        // Skip already-known entities
        if (isKnown(stripped)) continue;

        found.add(stripped);
      }
    }
  }

  return Array.from(found);
}
