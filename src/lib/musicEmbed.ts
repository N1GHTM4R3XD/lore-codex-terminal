export type EmbedKind = "youtube" | "soundcloud" | null;

export interface EmbedInfo {
  kind: EmbedKind;
  embedUrl: string | null;
  label: string;
}

export function parseEmbed(url?: string): EmbedInfo {
  if (!url) return { kind: null, embedUrl: null, label: "" };
  const u = url.trim();

  // YouTube
  const yt =
    u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/) ||
    u.match(/^([A-Za-z0-9_-]{11})$/);
  if (yt) {
    const id = yt[1];
    return {
      kind: "youtube",
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=1&modestbranding=1`,
      label: "YouTube",
    };
  }

  // SoundCloud
  if (/soundcloud\.com\//.test(u)) {
    return {
      kind: "soundcloud",
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(
        u
      )}&auto_play=true&hide_related=true&show_comments=false&show_user=true&visual=false`,
      label: "SoundCloud",
    };
  }

  return { kind: null, embedUrl: null, label: "" };
}
