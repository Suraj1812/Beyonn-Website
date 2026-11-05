import { PageHero } from "@/components/sections/PageHero";
import { endorsements } from "@/content/endorsements";
import { EndorsementCard } from "@/components/sections/EndorsementCard";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Clinical Endorsements | Beyonn", description: "Meet the clinicians and collaborators who have spoken about Dr. Rodney Willey's work in OSA and TMD care.", path: "/endorsements", kicker: "Clinical endorsements" });

export default function EndorsementsPage() {
  return <>
    <PageHero eyebrow="Clinical Endorsements" title="Real people. Clinical perspective." sub="Clinicians and collaborators have shared their experience of Dr. Willey's approach to airway, sleep and jaw care." />
    <section className="container-x section-y">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {endorsements.map((person, i) => (
          <div key={person.name} data-aos="fade-up" data-aos-delay={(i % 3) * 80}>
            <EndorsementCard person={person} index={i} />
          </div>
        ))}
      </div>
      <p data-aos="fade-up" className="mt-8 text-sm text-muted">These are brief editorial summaries. <a className="underline" href="https://www.beyonn.com/" target="_blank" rel="noopener">Read the original endorsements on Beyonn.com</a>.</p>
    </section>
  </>;
}
