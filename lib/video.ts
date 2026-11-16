const ID = /^[\w-]{6,20}$/;

// Turns a YouTube or Vimeo link into a safe embed URL.
export function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const parts = u.pathname.split("/").filter(Boolean);
      const id =
        u.searchParams.get("v") ??
        (parts[0] === "embed" || parts[0] === "shorts" ? parts[1] : null);
      return id && ID.test(id)
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : null;
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}





export function getVideoInfo(url: string) {
  const embed = getEmbedUrl(url);
  if (!embed) return null;
  if (embed.includes("youtube-nocookie.com")) {
    const id = embed.split("/embed/")[1];
    return {
      provider: "youtube" as const,
      id,
      thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }
  return { provider: "vimeo" as const, id: embed.split("/video/")[1], thumb: "" };
}