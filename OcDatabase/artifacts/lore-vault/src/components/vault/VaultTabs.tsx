import { BookOpen, ScrollText, Feather, ImagePlus, Library, LayoutDashboard, GalleryHorizontalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/hooks/useLang";
import { t } from "@/lib/i18n";

export type TabId = "lore" | "journal" | "manuscript" | "moodboard" | "gallery" | "encyclopedia" | "whiteboard";

const TAB_IDS: { id: TabId; key: Parameters<typeof t>[0]; icon: typeof BookOpen }[] = [
  { id: "lore",         key: "tab.lore",         icon: BookOpen },
  { id: "journal",      key: "tab.journal",       icon: ScrollText },
  { id: "manuscript",   key: "tab.manuscript",    icon: Feather },
  { id: "moodboard",    key: "tab.moodboard",     icon: ImagePlus },
  { id: "gallery",      key: "tab.gallery",       icon: GalleryHorizontalEnd },
  { id: "whiteboard",   key: "tab.whiteboard",    icon: LayoutDashboard },
  { id: "encyclopedia", key: "tab.encyclopedia",  icon: Library },
];

interface Props { value: TabId; onChange: (v: TabId) => void; }

export const VaultTabs = ({ value, onChange }: Props) => {
  const { lang } = useLang();
  return (
    <nav
      className="sticky top-3 z-30 mx-auto mb-8 vault-panel rounded-full px-2 py-2 flex gap-1 overflow-x-auto max-w-fit"
      aria-label={lang === "pl" ? "Sekcje kodeksu" : "Codex sections"}
    >
      {TAB_IDS.map((tab) => {
        const Icon = tab.icon;
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-full font-mono uppercase tracking-wider text-xs transition-all whitespace-nowrap",
              active
                ? "bg-gradient-rune text-[hsl(var(--primary-foreground))] shadow-rune"
                : "text-muted-foreground hover:text-[hsl(var(--rune))]",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-3.5 w-3.5" />
            {t(tab.key, lang)}
          </button>
        );
      })}
    </nav>
  );
};
