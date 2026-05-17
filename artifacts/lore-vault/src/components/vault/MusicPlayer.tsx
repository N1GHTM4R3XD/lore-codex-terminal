import { useState, useRef, useEffect, useCallback } from "react";
import {
  Music, Pause, Play, ChevronDown, ChevronUp,
  SkipForward, SkipBack, Plus, Trash2, Volume2, VolumeX, List, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { parseEmbed } from "@/lib/musicEmbed";

interface Props {
  url?: string;
  playlist?: string[];
  onPlaylistChange?: (urls: string[]) => void;
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
      .replace("controls=1", "controls=1&enablejsapi=1")
      + "&origin=" + encodeURIComponent(window.location.origin);
  }
  return info.embedUrl;
}

export const MusicPlayer = ({ url, playlist = [], onPlaylistChange, onPlayingChange }: Props) => {
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [volume, setVolume] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [addUrl, setAddUrl] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoStarted = useRef(false);

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

  const addTrack = () => {
    const trimmed = addUrl.trim();
    if (!trimmed || tracks.includes(trimmed)) return;
    const next = [...tracks, trimmed];
    setTracks(next);
    onPlaylistChange?.(next.slice(url ? 1 : 0));
    setAddUrl("");
  };

  const removeTrack = (i: number) => {
    const next = tracks.filter((_, idx) => idx !== i);
    setTracks(next);
    onPlaylistChange?.(next.slice(url ? 1 : 0));
    if (currentIdx >= next.length) setCurrentIdx(Math.max(0, next.length - 1));
  };

  if (!embedUrl || tracks.length === 0) return null;

  const shortUrl = (t: string) =>
    t.replace(/^https?:\/\/(www\.)?/, "").slice(0, 38);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {isPlaying && (
        <div className="vault-panel w-[320px] overflow-hidden animate-fade-in">
          {/* iframe – always rendered when playing, just hidden when minimized */}
          <div className={isMinimized ? "sr-only pointer-events-none" : ""}>
            <iframe
              key={`${currentIdx}::${currentUrl}`}
              ref={iframeRef}
              title="Odtwarzacz muzyki"
              src={embedUrl}
              allow="autoplay; encrypted-media"
              className="w-full h-[170px] border-0 rounded-t"
              onLoad={handleIframeLoad}
            />
          </div>

          {/* Controls */}
          <div className="p-2 space-y-2">
            {/* Track row */}
            <div className="flex items-center gap-1">
              {tracks.length > 1 && (
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={prev} aria-label="Poprzedni">
                  <SkipBack className="h-3 w-3" />
                </Button>
              )}

              <div className="flex-1 min-w-0 px-1">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[hsl(var(--rune))] truncate">
                  {info.label}{tracks.length > 1 ? ` · ${currentIdx + 1}/${tracks.length}` : ""}
                </p>
                <p className="font-mono text-[9px] text-muted-foreground truncate">
                  {shortUrl(currentUrl ?? "")}
                </p>
              </div>

              {tracks.length > 1 && (
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={next} aria-label="Następny">
                  <SkipForward className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Volume row */}
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
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="font-mono text-[9px] text-muted-foreground w-6 text-right shrink-0">
                {isMuted ? 0 : volume}
              </span>
            </div>

            {/* Playlist panel */}
            {showPlaylist && (
              <div className="space-y-1 border-t border-border/40 pt-2">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
                  Playlista
                </p>
                <div className="max-h-36 overflow-y-auto space-y-0.5 pr-1">
                  {tracks.map((t, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer transition-colors ${
                        i === currentIdx
                          ? "bg-[hsl(var(--rune)/0.15)] text-[hsl(var(--rune))]"
                          : "hover:bg-muted/40 text-muted-foreground"
                      }`}
                      onClick={() => goTo(i)}
                    >
                      <Music className="h-2.5 w-2.5 shrink-0" />
                      <span className="flex-1 font-mono text-[9px] truncate">{shortUrl(t)}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeTrack(i); }}
                        className="opacity-40 hover:opacity-100 transition-opacity"
                        aria-label="Usuń utwór"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add track */}
                <div className="flex gap-1 pt-1">
                  <Input
                    value={addUrl}
                    onChange={(e) => setAddUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTrack()}
                    placeholder="Dodaj URL YouTube / SC…"
                    className="h-7 text-[10px] font-mono flex-1"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 shrink-0"
                    onClick={addTrack}
                    aria-label="Dodaj"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Button row */}
      <div className="flex items-center gap-1.5">
        {isPlaying && (
          <>
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9"
              onClick={() => { setShowPlaylist(v => !v); if (isMinimized) setIsMinimized(false); }}
              aria-label="Playlista"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9"
              onClick={() => setIsMinimized(v => !v)}
              aria-label={isMinimized ? "Pokaż wideo" : "Minimalizuj"}
            >
              {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </>
        )}
        <Button
          className="pixel-btn"
          onClick={() => {
            if (!isPlaying) { setIsPlaying(true); setIsMinimized(false); }
            else setIsPlaying(false);
          }}
          aria-label={isPlaying ? "Zatrzymaj" : "Odtwórz muzykę"}
        >
          {isPlaying ? <><Pause className="h-3 w-3 mr-1.5" />Pauza</> : <><Music className="h-3 w-3 mr-1.5" />Muzyka</>}
        </Button>
      </div>
    </div>
  );
};
