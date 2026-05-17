import { useRef, useState } from "react";
import { BookOpen, Eye, Pencil, Bold, Italic, Underline, Quote, Heading, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VaultState } from "@/lib/vault-types";
import { renderLore } from "@/lib/loreParser";
import { useLang } from "@/hooks/useLang";
import { t } from "@/lib/i18n";

interface Props {
  state: VaultState;
  update: (p: Partial<VaultState>) => void;
  onEntity: (name: string) => void;
}

interface ToolbarAction {
  icon: React.ReactNode;
  label: string;
  prefix: string;
  suffix: string;
  placeholder: string;
}

function wrapSelection(
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix: string,
  placeholder: string,
  onChange: (val: string) => void,
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  const selected = val.slice(start, end) || placeholder;
  const before = val.slice(0, start);
  const after = val.slice(end);
  const newVal = before + prefix + selected + suffix + after;
  onChange(newVal);

  // restore cursor after React re-render
  requestAnimationFrame(() => {
    textarea.focus();
    const newStart = start + prefix.length;
    const newEnd = newStart + selected.length;
    textarea.setSelectionRange(newStart, newEnd);
  });
}

export const LoreTab = ({ state, update, onEntity }: Props) => {
  const [mode, setMode] = useState<"read" | "edit">("read");
  const { lang } = useLang();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const actions: ToolbarAction[] = [
    { icon: <Bold className="h-3.5 w-3.5" />,      label: lang === "pl" ? "Pogrubienie" : "Bold",       prefix: "**", suffix: "**", placeholder: lang === "pl" ? "tekst" : "text" },
    { icon: <Italic className="h-3.5 w-3.5" />,    label: lang === "pl" ? "Kursywa" : "Italic",         prefix: "*",  suffix: "*",  placeholder: lang === "pl" ? "tekst" : "text" },
    { icon: <Underline className="h-3.5 w-3.5" />, label: lang === "pl" ? "Podkreślenie" : "Underline", prefix: "__", suffix: "__", placeholder: lang === "pl" ? "tekst" : "text" },
    { icon: <Quote className="h-3.5 w-3.5" />,     label: lang === "pl" ? "Cytat" : "Quote",            prefix: "> ", suffix: "",   placeholder: lang === "pl" ? "cytat" : "quote" },
    { icon: <Heading className="h-3.5 w-3.5" />,   label: lang === "pl" ? "Nagłówek" : "Heading",       prefix: "# ", suffix: "",   placeholder: lang === "pl" ? "nagłówek" : "heading" },
    { icon: <Link className="h-3.5 w-3.5" />,      label: "Wiki-link",                                  prefix: "[[", suffix: "]]", placeholder: lang === "pl" ? "Nazwa" : "Name" },
  ];

  const handleAction = (action: ToolbarAction) => {
    if (!textareaRef.current) return;
    wrapSelection(textareaRef.current, action.prefix, action.suffix, action.placeholder, (val) =>
      update({ lore: val }),
    );
  };

  return (
    <section className="vault-panel corner-frame p-6 md:p-10 min-h-[60vh]">
      <header className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[hsl(var(--rune))]" />
          {t("lore.title", lang)}
        </h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "read" ? "default" : "outline"}
            onClick={() => setMode("read")}
            className="font-mono uppercase text-xs"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />{t("lore.read", lang)}
          </Button>
          <Button
            size="sm"
            variant={mode === "edit" ? "default" : "outline"}
            onClick={() => setMode("edit")}
            className="font-mono uppercase text-xs"
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />{t("lore.edit", lang)}
          </Button>
        </div>
      </header>

      {mode === "read" ? (
        <article className="lore-prose font-body text-lg leading-relaxed max-w-3xl animate-fade-in">
          {state.lore.trim()
            ? renderLore(state.lore, state.entities, onEntity, lang)
            : <p className="text-muted-foreground italic">{t("lore.empty", lang)}</p>}
        </article>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1 flex-wrap p-1.5 rounded-md border border-border bg-muted/30 w-fit">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                title={action.label}
                aria-label={action.label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAction(action);
                }}
                className="h-7 w-7 flex items-center justify-center rounded hover:bg-background/80 hover:text-foreground text-muted-foreground transition-colors"
              >
                {action.icon}
              </button>
            ))}
          </div>
          <Textarea
            ref={textareaRef}
            value={state.lore}
            onChange={(e) => update({ lore: e.target.value })}
            placeholder={t("lore.placeholder", lang)}
            className="min-h-[55vh] font-body text-base leading-relaxed bg-background/40 resize-y"
          />
        </div>
      )}
    </section>
  );
};
