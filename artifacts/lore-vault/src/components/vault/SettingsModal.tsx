import { useRef } from "react";
import { Settings as SettingsIcon, Download, Upload, RotateCcw, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Effect, VaultDB, DEFAULT_DB } from "@/lib/vault-types";
import { toast } from "@/hooks/use-toast";
import { useLang } from "@/hooks/useLang";
import { t, Lang } from "@/lib/i18n";

interface Props {
  db: VaultDB;
  setDb: (next: VaultDB) => void;
}

const EFFECT_KEYS: { id: Effect; key: Parameters<typeof t>[0] }[] = [
  { id: "embers", key: "effect.embers" },
  { id: "stars",  key: "effect.stars" },
  { id: "rain",   key: "effect.rain" },
  { id: "fire",   key: "effect.fire" },
  { id: "void",   key: "effect.void" },
  { id: "none",   key: "effect.none" },
];

const LANGS: { id: Lang; label: string }[] = [
  { id: "pl", label: "Polski" },
  { id: "en", label: "English" },
];

export const SettingsModal = ({ db, setDb }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { lang, setLang } = useLang();

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `lore-vault-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast({ title: t("settings.exportDone", lang), description: t("settings.exportDesc", lang) });
  };

  const importJSON = (file: File) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(String(r.result));
        const next: VaultDB = parsed?.characters
          ? { ...DEFAULT_DB, ...parsed }
          : { characters: [parsed], settings: DEFAULT_DB.settings };
        setDb(next);
        toast({ title: t("settings.importDone", lang), description: t("settings.importDesc", lang) });
      } catch {
        toast({ title: t("settings.importErr", lang), description: t("settings.importErrDesc", lang), variant: "destructive" });
      }
    };
    r.readAsText(file);
  };

  const reset = () => {
    if (confirm(t("settings.resetConfirm", lang))) setDb(DEFAULT_DB);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label={t("settings.title", lang)} className="border-[hsl(var(--border))]">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="vault-panel max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display rune-text text-2xl">{t("settings.title", lang)}</DialogTitle>
          <DialogDescription className="font-mono text-xs uppercase tracking-widest">
            {t("settings.subtitle", lang)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-2">
              {t("settings.effects", lang)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {EFFECT_KEYS.map((e) => (
                <Button
                  key={e.id}
                  variant={db.settings.effect === e.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDb({ ...db, settings: { ...db.settings, effect: e.id } })}
                  className="font-mono uppercase text-xs"
                >
                  {t(e.key, lang)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-2 flex items-center gap-1.5">
              <Globe className="h-3 w-3" />
              {t("settings.lang", lang)}
            </h3>
            <div className="flex gap-2">
              {LANGS.map((l) => (
                <Button
                  key={l.id}
                  variant={lang === l.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLang(l.id)}
                  className="font-mono uppercase text-xs"
                >
                  {l.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-2">
              {t("settings.data", lang)}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={exportJSON} className="font-mono uppercase text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" />{t("settings.export", lang)}
              </Button>
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="font-mono uppercase text-xs">
                <Upload className="h-3.5 w-3.5 mr-1.5" />{t("settings.import", lang)}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])}
              />
              <Button size="sm" variant="destructive" onClick={reset} className="font-mono uppercase text-xs">
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />{t("settings.reset", lang)}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
