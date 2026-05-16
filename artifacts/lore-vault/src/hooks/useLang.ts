import { useState, useEffect, useCallback } from "react";
import { Lang } from "@/lib/i18n";

const KEY = "lore-vault:lang";

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() =>
    (localStorage.getItem(KEY) as Lang) ?? "pl"
  );

  const setLang = useCallback((next: Lang) => {
    localStorage.setItem(KEY, next);
    setLangState(next);
    window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: next }));
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) setLangState(e.newValue as Lang);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return { lang, setLang };
}
