import { Suspense } from "react";
import { getPageSections } from "@/lib/sections";
import { buildSchema, sectionDefs } from "@/lib/sections/registry";
import { blockComponents } from "./blocks";

export async function PageSections({
  pageKey,
  empty,
}: {
  pageKey: string;
  empty?: React.ReactNode;
}) {
  const rows = await getPageSections(pageKey);
  if (rows.length === 0) return <>{empty ?? null}</>;

  return (
    <>
      {rows.map((row) => {
        const def = sectionDefs[row.type];
        const Block = blockComponents[row.type];
        if (!def || !Block) return null;
        const parsed = buildSchema(def.fields).safeParse({
          ...def.defaults,
          ...row.config,
        });
        if (!parsed.success) return null;
        return (
          <Suspense key={row.id} fallback={null}>
            <Block data={parsed.data as Record<string, unknown>} />
          </Suspense>
        );
      })}
    </>
  );
}