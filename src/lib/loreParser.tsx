import { Fragment, ReactNode } from "react";
import { Entity } from "./vault-types";

/**
 * Lightweight markdown + [[WikiLink]] + entity highlighter.
 * Supports: **bold**, *italic*, > blockquote, # headings, `code`, [[link]], paragraphs.
 */

export function renderLore(
  text: string,
  entities: Entity[],
  onEntityClick?: (name: string) => void,
): ReactNode {
  if (!text) return null;
  const blocks = text.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("### ")) return <h3 key={i}>{renderInline(trimmed.slice(4), entities, onEntityClick)}</h3>;
    if (trimmed.startsWith("## ")) return <h2 key={i}>{renderInline(trimmed.slice(3), entities, onEntityClick)}</h2>;
    if (trimmed.startsWith("# ")) return <h1 key={i}>{renderInline(trimmed.slice(2), entities, onEntityClick)}</h1>;
    if (trimmed.startsWith("> ")) {
      return <blockquote key={i}>{renderInline(trimmed.replace(/^>\s?/gm, ""), entities, onEntityClick)}</blockquote>;
    }
    return <p key={i}>{renderInline(trimmed, entities, onEntityClick)}</p>;
  });
}

function renderInline(text: string, entities: Entity[], onEntityClick?: (n: string) => void): ReactNode {
  // tokenize: [[wiki]], **bold**, *italic*, `code`
  const re = /(\[\[[^\]]+\]\]|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(re).filter(Boolean);

  return parts.map((part, i) => {
    if (part.startsWith("[[") && part.endsWith("]]")) {
      const name = part.slice(2, -2);
      return (
        <span
          key={i}
          className="wiki-link"
          onClick={() => onEntityClick?.(name)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" ? onEntityClick?.(name) : null)}
        >
          {name}
        </span>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    return <Fragment key={i}>{highlightEntities(part, entities, onEntityClick)}</Fragment>;
  });
}

function highlightEntities(text: string, entities: Entity[], onEntityClick?: (n: string) => void): ReactNode {
  if (!entities.length) return text;
  const sorted = [...entities].sort((a, b) => b.name.length - a.name.length);
  const pattern = new RegExp(
    `(${sorted.map((e) => e.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g",
  );
  const parts = text.split(pattern);
  return parts.map((p, i) => {
    const ent = entities.find((e) => e.name === p);
    if (ent) {
      return (
        <span
          key={i}
          className="entity-highlight"
          title={`${ent.type} — ${ent.description}`}
          onClick={() => onEntityClick?.(ent.name)}
        >
          {p}
        </span>
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}

/** Auto-detect proper nouns (capitalized words, with apostrophes/hyphens) not yet in entity list. */
export function detectProperNouns(text: string, existing: string[]): string[] {
  // strip [[wiki]] tokens (they're already handled)
  const cleaned = text.replace(/\[\[[^\]]+\]\]/g, " ");
  const re = /\b([A-ZŻŹĆŁŚÓĄĘŃ][a-zżźćłśóąęń]+(?:[''-][A-ZŻŹĆŁŚÓĄĘŃ]?[a-zżźćłśóąęń]+)*(?:\s+[A-ZŻŹĆŁŚÓĄĘŃ][a-zżźćłśóąęń]+){0,2})\b/g;
  const found = new Set<string>();
  const existingLower = new Set(existing.map((s) => s.toLowerCase()));
  const stop = new Set([
    "Rozdział", "Pamięć", "Świt", "Powiadają", "Niebo", "Trzeciego",
  ]);
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned))) {
    const w = m[1].trim();
    if (w.length < 4) continue;
    if (stop.has(w)) continue;
    if (existingLower.has(w.toLowerCase())) continue;
    found.add(w);
  }
  return Array.from(found);
}
