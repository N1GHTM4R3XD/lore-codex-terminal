import { useState } from "react";
import { Music, Pause, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseEmbed } from "@/lib/musicEmbed";

interface Props {
  url?: string;
}

export const MusicPlayer = ({ url }: Props) => {
  const info = parseEmbed(url);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);

  if (!info.embedUrl) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {playing && (
        <div className={`vault-panel p-2 ${open ? "w-[320px]" : "w-0 h-0 overflow-hidden p-0 border-0"}`}>
          <iframe
            title="Ambient muzyki karty"
            src={info.embedUrl}
            allow="autoplay; encrypted-media"
            className="w-full h-[170px] rounded border-0"
          />
        </div>
      )}
      <div className="flex items-center gap-1.5">
        {playing && (
          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Ukryj odtwarzacz" : "Pokaż odtwarzacz"}
            className="h-9 w-9"
          >
            {open ? <X className="h-4 w-4" /> : <Music className="h-4 w-4" />}
          </Button>
        )}
        <Button
          onClick={() => {
            setPlaying((v) => !v);
            setOpen(true);
          }}
          className="pixel-btn"
          aria-label={playing ? "Zatrzymaj muzykę" : "Odtwórz muzykę"}
        >
          {playing ? <Pause className="h-3 w-3 mr-1.5" /> : <Play className="h-3 w-3 mr-1.5" />}
          {playing ? "Pauza" : info.label}
        </Button>
      </div>
    </div>
  );
};
