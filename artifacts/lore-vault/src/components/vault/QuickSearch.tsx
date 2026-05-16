import { useState, useEffect, useRef } from "react";
import { Search, X, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Character } from "@/lib/vault-types";
import { Input } from "@/components/ui/input";

interface Props {
  characters: Character[];
  currentId: string;
}

export const QuickSearch = ({ characters, currentId }: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
    else setQuery("");
  }, [open]);

  const filtered = characters
    .filter(
      (c) =>
        c.id !== currentId &&
        (c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.tagline.toLowerCase().includes(query.toLowerCase())),
    )
    .slice(0, 9);

  const go = (id: string) => {
    navigate(`/character/${id}`);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-8 grid place-items-center rounded border border-border bg-background/80 text-muted-foreground hover:text-[hsl(var(--rune))] hover:border-[hsl(var(--rune)/0.5)] transition"
        title="Szukaj postaci (Ctrl+K)"
        aria-label="Szukaj postaci"
      >
        <Search className="h-3.5 w-3.5" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="fixed top-14 right-4 z-[9999] w-72 vault-panel shadow-vault animate-fade-in overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Szukaj postaci…"
                className="h-7 border-0 bg-transparent px-0 text-sm focus-visible:ring-0 font-mono"
              />
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground flex-shrink-0 transition-colors"
                aria-label="Zamknij"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-6 font-mono">
                {query ? "Brak wyników" : "Wpisz imię postaci…"}
              </p>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => go(c.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[hsl(var(--rune)/0.08)] transition-colors text-left"
                  >
                    {c.avatar ? (
                      <img
                        src={c.avatar}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-border"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0 grid place-items-center border border-border">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm leading-snug truncate">
                        {c.name}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground truncate">
                        {c.tagline}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Hint */}
            <div className="px-3 py-1.5 border-t border-border flex items-center gap-1.5">
              <kbd className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-border bg-muted text-muted-foreground">
                Ctrl+K
              </kbd>
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                otwiera / zamyka
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
};
