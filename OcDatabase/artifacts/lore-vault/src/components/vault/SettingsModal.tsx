import { useRef } from "react";
import { Settings as SettingsIcon, Download, Upload, RotateCcw, Globe, HelpCircle, HardDrive, ShieldCheck, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

function getStorageSize(): string {
  try {
    const raw = localStorage.getItem("lore-vault:db:v3") ?? "";
    const bytes = new Blob([raw]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  } catch {
    return "?";
  }
}

function DataGuide({ lang }: { lang: Lang }) {
  const isPl = lang === "pl";
  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-green-400 mb-1">
            {isPl ? "Autozapis lokalny" : "Local autosave"}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {isPl
              ? "Wszystkie dane Vault są zapisywane natychmiast w pamięci przeglądarki (localStorage) po każdej zmianie. Dane nigdy nie opuszczają Twojego urządzenia."
              : "All Vault data is saved immediately in your browser's localStorage after every change. Data never leaves your device."}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-amber-400 mb-1">
            {isPl ? "Ważne!" : "Important!"}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {isPl
              ? "Wyczyszczenie danych przeglądarki (cache, pliki cookie, localStorage) usunie też Vault. Regularnie eksportuj kopię zapasową klikając Eksport JSON."
              : "Clearing browser data (cache, cookies, localStorage) will also delete the Vault. Regularly export a backup by clicking Export JSON."}
          </p>
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <p className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-2 flex items-center gap-1.5">
          <Download className="h-3 w-3" />
          {isPl ? "Eksport JSON" : "Export JSON"}
        </p>
        <p className="text-muted-foreground leading-relaxed mb-2">
          {isPl
            ? "Pobiera plik .json z pełną zawartością Vault. Zachowaj go jako kopię zapasową lub przenieś na inne urządzenie."
            : "Downloads a .json file with the full Vault contents. Keep it as a backup or transfer to another device."}
        </p>
        <p className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-2 flex items-center gap-1.5 mt-3">
          <Upload className="h-3 w-3" />
          {isPl ? "Import JSON" : "Import JSON"}
        </p>
        <p className="text-muted-foreground leading-relaxed">
          {isPl
            ? "Wczytuje plik .json i zastępuje obecne dane Vault. Przed importem zrób eksport — ta operacja jest nieodwracalna."
            : "Loads a .json file and replaces the current Vault data. Export first — this operation cannot be undone."}
        </p>
      </div>

      <div className="border-t border-border pt-3">
        <p className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))] mb-2">
          {isPl ? "Struktura pliku JSON" : "JSON file structure"}
        </p>
        <pre className="text-[11px] font-mono text-muted-foreground bg-background/60 rounded p-3 overflow-x-auto border border-border leading-relaxed">
{`{
  "characters": [       // ${isPl ? "lista postaci" : "character list"}
    {
      "id": "...",
      "name": "...",
      "lore": "...",
      "entities": [],   // ${isPl ? "encyklopedia" : "encyclopedia"}
      "journal": [],
      "palette": "...",
      "font": "...",
      ...
    }
  ],
  "worldBoard": {...},  // ${isPl ? "główna tablica" : "main board"}
  "namedBoards": [],    // ${isPl ? "tablice własne" : "custom boards"}
  "folders": [],        // ${isPl ? "foldery postaci" : "character folders"}
  "worlds": [],         // ${isPl ? "światy" : "worlds"}
  "connections": [],    // ${isPl ? "połączenia" : "connections"}
  "settings": {
    "effect": "embers",
    ...
  }
}`}
        </pre>
      </div>
    </div>
  );
}

export const SettingsModal = ({ db, setDb }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { lang, setLang } = useLang();
  const storageSize = getStorageSize();

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
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--rune))]">
                {t("settings.data", lang)}
              </h3>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="h-4 w-4 rounded-full flex items-center justify-center text-muted-foreground hover:text-[hsl(var(--rune))] transition-colors"
                    aria-label={lang === "pl" ? "Pomoc — format i zapis danych" : "Help — data format and storage"}
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="start"
                  className="vault-panel w-[480px] max-h-[70vh] overflow-y-auto p-5"
                >
                  <DataGuide lang={lang} />
                </PopoverContent>
              </Popover>

              <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                <HardDrive className="h-3 w-3" />
                {storageSize}
                <span className="opacity-60">· localStorage</span>
              </span>
            </div>

            <div className="mb-3 flex items-center gap-1.5 text-[10px] font-mono text-green-400 uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              {lang === "pl" ? "Autozapis aktywny · dane na Twoim urządzeniu" : "Autosave active · data on your device"}
            </div>

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
