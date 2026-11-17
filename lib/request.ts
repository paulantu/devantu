import { createHmac } from "node:crypto";

// Visitor IP, stored only as a hash.
export function getClient(h: Headers) {
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const ipHash = ip
    ? createHmac("sha256", process.env.BETTER_AUTH_SECRET ?? "")
        .update(ip)
        .digest("hex")
        .slice(0, 32)
    : "";
  return { ip, ipHash };
}