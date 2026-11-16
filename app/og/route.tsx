import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/settings";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { general } = await getSiteSettings();

  const custom = (searchParams.get("title") ?? "").trim().slice(0, 90);
  const headline = custom || general.name;
  const sub = custom ? general.name : general.title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0f1923",
          color: "#f4f6f8",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, color: "#ff6b57" }}>
          {general.name}.
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: custom ? 68 : 96,
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            {headline}
          </div>
          <div style={{ display: "flex", fontSize: 36, color: "#8a97a8", marginTop: 24 }}>
            {sub}
          </div>
        </div>
        <div style={{ display: "flex", width: 140, height: 10, background: "#ff6b57" }} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}