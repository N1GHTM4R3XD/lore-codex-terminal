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

/** Auto-detect proper nouns (capitalized words) not yet in entity list. */
export function detectProperNouns(text: string, existing: string[]): string[] {
  const cleaned = text.replace(/\[\[[^\]]+\]\]/g, " ");
  const re = /\b([A-ZŻŹĆŁŚÓĄĘŃ][a-zżźćłśóąęń]+(?:[''-][A-ZŻŹĆŁŚÓĄĘŃ]?[a-zżźćłśóąęń]+)*(?:\s+[A-ZŻŹĆŁŚÓĄĘŃ][a-zżźćłśóąęń]+){0,2})\b/g;
  const found = new Set<string>();
  const existingStems = new Set(existing.map((s) => stemOf(s).toLowerCase()));
  const stop = new Set(["Rozdział", "Pamięć", "Świt", "Powiadają", "Niebo", "Trzeciego"]);
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned))) {
    const w = m[1].trim();
    if (w.length < 4) continue;
    if (stop.has(w)) continue;
    // Skip if any existing entity shares the same stem
    if (existingStems.has(stemOf(w).toLowerCase())) continue;
    found.add(w);
  }
  return Array.from(found);
}
