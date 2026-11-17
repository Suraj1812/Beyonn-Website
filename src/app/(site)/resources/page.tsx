import { PublishedMetadataBoundary } from "@/components/control/PublishedShell";
import ResourcesContent from "@/components/control/ResourcesContent";
import { getPublished } from "@/lib/cms/server/content";
import { pageMeta } from "@/lib/seo";
import { connection } from "next/server";

const originalMetadata = pageMeta({
  title: "Resources | Beyonn",
  description:
    "Practical guides to OSA, TMD, oral appliance therapy, team training and medical billing.",
  path: "/resources",
  kicker: "Beyonn Resources",
});

export default function ResourcesPage() {
  return (
    <>
      <ResourcesContent />
      <PublishedMetadataBoundary />
    </>
  );
}

export async function generateMetadata() {
  await connection();
  const d = await getPublished();
  const seo = d.seo["/resources"];
  return seo?.title || seo?.description
    ? pageMeta({
        title: seo.title || "Resources | Beyonn",
        description: seo.description || String(originalMetadata.description),
        path: "/resources",
      })
    : originalMetadata;
}
