import { connection } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCvData } from "@/lib/cv";
import { getSiteSettings } from "@/lib/settings";
import { CvDocument } from "@/lib/cv-pdf";

export async function GET() {
  await connection();
  const [settings, cv] = await Promise.all([getSiteSettings(), getCvData()]);
  const buffer = await renderToBuffer(<CvDocument settings={settings} cv={cv} />);

  const filename = `${settings.general.name.replace(/[^a-z0-9]+/gi, "-")}-CV.pdf`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}