export const MESSAGE_STATUSES = ["new", "read", "replied", "archived"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

// Only real Calendly links are embedded.
export function getCalendlyUrl(raw: string) {
  try {
    const u = new URL(raw);
    const ok =
      u.protocol === "https:" &&
      (u.hostname === "calendly.com" || u.hostname.endsWith(".calendly.com"));
    return ok ? u.toString() : null;
  } catch {
    return null;
  }
}

export function getMapPoint(lat: string, lng: string) {
  let a = lat.trim();
  let b = lng.trim();
  if (a.includes(",")) [a, b] = a.split(",").map((s) => s.trim());
  if (!a || !b) return null;
  const la = Number(a);
  const lo = Number(b);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return null;
  if (la < -90 || la > 90 || lo < -180 || lo > 180) return null;
  return { lat: la, lng: lo };
}