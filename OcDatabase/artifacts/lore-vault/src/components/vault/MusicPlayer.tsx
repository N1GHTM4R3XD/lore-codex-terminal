import { useState, useRef, useEffect, useCallback } from "react";
import { Music, Pause, Play, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { parseEmbed } from "@/lib/musicEmbed";

interface Props {
  url?: string;
  playlist?: string[];
  onPlayingChange?: (playing: boolean) => void;
}

function sendYTCommand(iframe: HTMLIFrameElement | null, func: string, args: unknown[] = []) {
  if (!iframe?.contentWindow) return;
  iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func, args }), "*");
}

function buildEmbedUrl(rawUrl: string | null | undefined) {
  if (!rawUrl) return null;
  const info = parseEmbed(rawUrl);
  if (!info.embedUrl) return null;
  if (info.kind === "youtube") {
    return info.embedUrl
      .replace("controls=1", "controls=0&enablejsapi=1")
      + "&origin=" + encodeURIComponent(window.location.origin);
  }
  return info.embedUrl;
}

export const MusicPlayer = ({ url, playlist = [], onPlayingChange }: Props) => {
  const buildTracks = useCallback(() => {
    const base: string[] = [];
    if (url) base.push(url);
    for (const t of playlist) {
      if (!base.includes(t)) base.push(t);
    }
    return base;
  }, [url, playlist]);

  const [tracks, setTracks] = useState<string[]>(() => buildTracks());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoStarted = useRef(false);

  // Sync tracks when props change
  useEffect(() => {
    setTracks(buildTracks());
  }, [buildTracks]);

  const currentUrl = tracks[currentIdx] ?? null;
  const embedUrl = buildEmbedUrl(currentUrl);
  const info = currentUrl ? parseEmbed(currentUrl) : { label: "", kind: null };

  useEffect(() => {
    if (!autoStarted.current && tracks.length > 0 && embedUrl) {
      autoStarted.current = true;
      setIsPlaying(true);
    }
  }, [tracks.length, embedUrl]);

  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  const applyVolume = useCallback((vol: number, muted: boolean) => {
    if (muted || vol === 0) {
      sendYTCommand(iframeRef.current, "mute");
    } else {
      sendYTCommand(iframeRef.current, "unMute");
      sendYTCommand(iframeRef.current, "setVolume", [vol]);
    }
  }, []);

  const handleIframeLoad = useCallback(() => {
    setTimeout(() => applyVolume(volume, isMuted), 600);
  }, [volume, isMuted, applyVolume]);

  const handleVolumeChange = (val: number[]) => {
    const v = val[0];
    setVolume(v);
    const muted = v === 0;
    setIsMuted(muted);
    applyVolume(v, muted);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    applyVolume(volume, next);
  };

  const goTo = (idx: number) => setCurrentIdx(idx);
  const next = () => goTo((currentIdx + 1) % tracks.length);
  const prev = () => goTo((currentIdx - 1 + tracks.length) % tracks.length);

  if (!embedUrl || tracks.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-1.5 group/player">
      {/* Hidden iframe — audio only, never shown */}
      {isPlaying && (
        <div className="sr-only pointer-events-none" aria-hidden>
          <iframe
            key={`${currentIdx}::${currentUrl}`}
            ref={iframeRef}
            title="Odtwarzacz muzyki"
            src={embedUrl}
            allow="autoplay; encrypted-media"
            className="w-1 h-1"
            onLoad={handleIframeLoad}
          />
        </div>
      )}

      {/* Volume — only visible on hover */}
      {isPlaying && (
        <div className="vault-panel px-3 py-2 w-48 opacity-0 group-hover/player:opacity-100 transition-opacity duration-200 pointer-events-none group-hover/player:pointer-events-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label={isMuted ? "Wyłącz wyciszenie" : "Wycisz"}
            >
              {isMuted || volume === 0
                ? <VolumeX className="h-3.5 w-3.5" />
                : <Volume2 className="h-3.5 w-3.5" />}
            </button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              min={0} max={100} step={1}
              className="flex-1"
            />
            <span className="font-mono text-[9px] text-muted-foreground w-5 text-right shrink-0">
              {isMuted ? 0 : volume}
            </span>
          </div>
        </div>
      )}

      {/* Compact control pill */}
      <div className="vault-panel flex items-center gap-0.5 px-2 py-1.5">
        {/* Prev */}
        {isPlaying && tracks.length > 1 && (
          <button onClick={prev} aria-label="Poprzedni"
            className="h-6 w-6 grid place-items-center text-muted-foreground hover:text-foreground transition-colors rounded">
            <SkipBack className="h-3 w-3" />
          </button>
        )}

        {/* Play / Pause */}
        <button
          onClick={() => setIsPlaying(v => !v)}
          aria-label={isPlaying ? "Pauza" : "Odtwórz muzykę"}
          className="h-7 w-7 grid place-items-center rounded-full bg-[hsl(var(--rune)/0.15)] hover:bg-[hsl(var(--rune)/0.25)] text-[hsl(var(--rune))] transition-colors"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Music className="h-3.5 w-3.5" />}
        </button>

        {/* Track label — only when playing */}
        {isPlaying && (
          <span className="font-mono text-[9px] text-muted-foreground truncate max-w-[120px] px-1.5">
            {info.label}{tracks.length > 1 ? ` ${currentIdx + 1}/${tracks.length}` : ""}
          </span>
        )}

        {/* Next */}
        {isPlaying && tracks.length > 1 && (
          <button onClick={next} aria-label="Następny"
            className="h-6 w-6 grid place-items-center text-muted-foreground hover:text-foreground transition-colors rounded">
            <SkipForward className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
};
