import { useState, useRef, useEffect, useCallback } from "react";
import { Music, Pause, Play, SkipForward, SkipBack, Volume2, VolumeX, ChevronUp, ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { parseEmbed } from "@/lib/musicEmbed";
import { cn } from "@/lib/utils";

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

/** Extract YouTube thumbnail from any YouTube URL. */
function getYtThumb(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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
  const [expanded, setExpanded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoStarted = useRef(false);

  // Simulated progress (YouTube iframe doesn't expose real time easily)
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const progressInterval = useRef<number>(0);

  // Sync tracks when props change
  useEffect(() => {
    setTracks(buildTracks());
  }, [buildTracks]);

  const currentUrl = tracks[currentIdx] ?? null;
  const embedUrl = buildEmbedUrl(currentUrl);
  const info = currentUrl ? parseEmbed(currentUrl) : { label: "", kind: null as "youtube" | "soundcloud" | null };
  const thumb = currentUrl ? getYtThumb(currentUrl) : null;

  // Auto-start on first mount
  useEffect(() => {
    if (!autoStarted.current && tracks.length > 0 && embedUrl) {
      autoStarted.current = true;
      setIsPlaying(true);
    }
  }, [tracks.length, embedUrl]);

  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  // Simulated progress ticker
  useEffect(() => {
    if (!isPlaying) {
      clearInterval(progressInterval.current);
      return;
    }
    progressInterval.current = window.setInterval(() => {
      progressRef.current += 1;
      setProgress(progressRef.current);
    }, 1000);
    return () => clearInterval(progressInterval.current);
  }, [isPlaying]);

  // Reset progress on track change
  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
  }, [currentIdx]);

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

  const DURATION = 180; // 3:00 placeholder
  const pct = Math.min((progress / DURATION) * 100, 100);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* ── Hidden iframe ── */}
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

      {/* ── Collapsed pill ── */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className={cn(
            "flex items-center gap-2.5 px-3.5 py-2 rounded-full",
            "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
            "shadow-[0_4px_20px_rgba(0,0,0,0.45)]",
            "hover:shadow-[0_6px_28px_rgba(0,0,0,0.55)] transition-shadow"
          )}
        >
          {/* Mini thumb */}
          <div className="h-7 w-7 rounded-full overflow-hidden bg-muted shrink-0 grid place-items-center">
            {thumb ? (
              <img src={thumb} alt="" className="h-full w-full object-cover" />
            ) : (
              <Music className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>

          <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[130px]">
            {info.label || "Muzyka"}
          </span>

          <div className="h-6 w-6 grid place-items-center rounded-full bg-[hsl(var(--rune)/0.12)] text-[hsl(var(--rune))]">
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </div>

          <ChevronUp className="h-3 w-3 text-muted-foreground" />
        </button>
      )}

      {/* ── Expanded card ── */}
      {expanded && (
        <div
          className={cn(
            "w-[320px] rounded-2xl p-4 space-y-3.5",
            "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
            "shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              Odtwarzacz
            </span>
            <button
              onClick={() => setExpanded(false)}
              className="h-6 w-6 grid place-items-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Track row: thumb + info */}
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0 shadow-md">
              {thumb ? (
                <img src={thumb} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center">
                  <Music className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-display text-[hsl(var(--rune))] truncate leading-tight">
                {info.label || "Bez tytułu"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {info.kind === "youtube" ? "YouTube" : info.kind === "soundcloud" ? "SoundCloud" : "Link zewnętrzny"}
                {tracks.length > 1 && ` · ${currentIdx + 1} / ${tracks.length}`}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="h-1 bg-[hsl(var(--muted))] rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                const x = e.clientX - rect.left;
                const newPct = x / rect.width;
                progressRef.current = Math.round(newPct * DURATION);
                setProgress(progressRef.current);
              }}
            >
              <div
                className="h-full bg-[hsl(var(--rune))] rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between font-mono text-[9px] text-muted-foreground">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(DURATION)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {tracks.length > 1 && (
              <button
                onClick={prev}
                aria-label="Poprzedni"
                className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-foreground transition-colors rounded-full"
              >
                <SkipBack className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setIsPlaying((v) => !v)}
              aria-label={isPlaying ? "Pauza" : "Odtwórz"}
              className={cn(
                "h-11 w-11 grid place-items-center rounded-full",
                "bg-[hsl(var(--rune))] text-[hsl(var(--background))]",
                "hover:brightness-110 transition-all active:scale-95"
              )}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
            </button>

            {tracks.length > 1 && (
              <button
                onClick={next}
                aria-label="Następny"
                className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-foreground transition-colors rounded-full"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2.5 pt-0.5">
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
    </div>
  );
};
