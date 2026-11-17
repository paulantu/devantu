import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { CvEntry, getCvData } from "@/lib/cv";
import { formatRange, lines } from "@/lib/cv-schema";
import type { SiteSettings } from "@/lib/settings-schema";

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1f2b", lineHeight: 1.4 },
    name: { fontSize: 24, fontFamily: "Helvetica-Bold", lineHeight: 1.1, marginBottom: 8 },
  title: { fontSize: 12, color: "#d6402b", lineHeight: 1.2 },
  contact: { marginTop: 6, color: "#555555", fontSize: 9 },
  section: { marginTop: 16 },
  h2: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#d6402b",
    letterSpacing: 1,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e2e2",
    paddingBottom: 3,
    marginBottom: 8,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontFamily: "Helvetica-Bold" },
  muted: { color: "#666666" },
  entry: { marginBottom: 8 },
  bullet: { flexDirection: "row", marginTop: 2 },
  dot: { width: 10 },
  grow: { flex: 1 },
});

function Entries({ heading, items }: { heading: string; items: CvEntry[] }) {
  if (items.length === 0) return null;
  return (
    <View style={s.section}>
      <Text style={s.h2}>{heading}</Text>
      {items.map((e) => (
        <View key={e.id} style={s.entry} wrap={false}>
          <View style={s.row}>
            <Text style={s.bold}>{e.title}</Text>
            <Text style={s.muted}>{formatRange(e)}</Text>
          </View>
          {(e.organization || e.location) && (
            <Text style={s.muted}>
              {[e.organization, e.location].filter(Boolean).join(", ")}
            </Text>
          )}
          {lines(e.description).map((l, i) => (
            <View key={i} style={s.bullet}>
              <Text style={s.dot}>•</Text>
              <Text style={s.grow}>{l}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function CvDocument({
  settings,
  cv,
}: {
  settings: SiteSettings;
  cv: Awaited<ReturnType<typeof getCvData>>;
}) {
  const { general, contact, profile } = settings;
  const contactLine = [contact.email, contact.phone, contact.location]
    .filter(Boolean)
    .join("   |   ");

  const groups = new Map<string, string[]>();
  for (const sk of cv.skills) {
    const key = sk.organization || "Skills";
    groups.set(key, [...(groups.get(key) ?? []), sk.title]);
  }

  return (
    <Document title={`${general.name} - CV`} author={general.name}>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{general.name}</Text>
        <Text style={s.title}>{general.title}</Text>
        {contactLine && <Text style={s.contact}>{contactLine}</Text>}

        {profile.summary && (
          <View style={s.section}>
            <Text style={s.h2}>Profile</Text>
            <Text>{profile.summary}</Text>
          </View>
        )}

        <Entries heading="Experience" items={cv.experience} />
        <Entries heading="Education" items={cv.education} />

        {groups.size > 0 && (
          <View style={s.section}>
            <Text style={s.h2}>Skills</Text>
            {[...groups.entries()].map(([group, names]) => (
              <Text key={group} style={{ marginBottom: 3 }}>
                <Text style={s.bold}>{group}: </Text>
                {names.join(", ")}
              </Text>
            ))}
          </View>
        )}

        <Entries heading="Certifications" items={cv.certifications} />
        <Entries heading="Awards" items={cv.awards} />

        {cv.languages.length > 0 && (
          <View style={s.section}>
            <Text style={s.h2}>Languages</Text>
            <Text>
              {cv.languages
                .map((l) => (l.organization ? `${l.title} (${l.organization})` : l.title))
                .join(", ")}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}