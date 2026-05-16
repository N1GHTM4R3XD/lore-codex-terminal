import { BookOpen, ScrollText, Feather, ImagePlus, Library, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabId = "lore" | "journal" | "manuscript" | "moodboard" | "encyclopedia" | "whiteboard";

const TABS: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: "lore", label: "Lore", icon: BookOpen },
  { id: "journal", label: "Dziennik", icon: ScrollText },
  { id: "manuscript", label: "Manuskrypt", icon: Feather },
  { id: "moodboard", label: "Moodboard", icon: ImagePlus },
  { id: "whiteboard", label: "Tablica", icon: LayoutDashboard },
  { id: "encyclopedia", label: "Encyklopedia", icon: Library },
];

interface Props { value: TabId; onChange: (v: TabId) => void; }

export const VaultTabs = ({ value, onChange }: Props) => {
  return (
    <nav
      className="sticky top-3 z-30 mx-auto mb-8 vault-panel rounded-full px-2 py-2 flex gap-1 overflow-x-auto max-w-fit"
      aria-label="Sekcje kodeksu"
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-full font-mono uppercase tracking-wider text-xs transition-all whitespace-nowrap",
              active
                ? "bg-gradient-rune text-[hsl(var(--primary-foreground))] shadow-rune"
                : "text-muted-foreground hover:text-[hsl(var(--rune))]",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        );
      })}
    </nav>
  );
};
