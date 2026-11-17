import { PublishedMetadataBoundary } from "@/components/control/PublishedShell";
import { getPublished } from "@/lib/cms/server/content";
import { connection } from "next/server";
import HomeContent from "@/components/control/HomeContent";
import { pageMeta } from "@/lib/seo";
const originalMetadata = pageMeta({
  title: "Dental Sleep Medicine Program for Your Team | OSA + TMD | Beyonn",
  description:
    "Add Obstructive Sleep Apnea and Temporomandibular Joint Disorder treatment to your practice. Beyonn trains your team, gives you the systems and coaches you until it runs.",
  path: "/",
  keywords: [
    "dental sleep medicine",
    "sleep apnea training for dentists",
    "TMD training for dentists",
    "sleep apnea courses for dentists",
    "oral appliance therapy",
    "OSA and TMD program",
  ],
  kicker: "The OSA + TMD program your team can run",
});

export default function HomePage() {
  return (
    <>
      <HomeContent />
      <PublishedMetadataBoundary />
    </>
  );
}

export async function generateMetadata() {
  await connection();
  const document = await getPublished();
  const seo = document.seo["/"];
  return seo?.title || seo?.description
    ? pageMeta({
        title: seo.title || String(originalMetadata.title),
        description: seo.description || String(originalMetadata.description),
        path: "/",
      })
    : originalMetadata;
}
