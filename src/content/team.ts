/** Team cards in the approved order. A card without a role shows the name only. */
export const team: { name: string; role?: string; image: string; href?: { label: string; url: string } }[] = [
  { name: "Dr. Rodney Willey, DDS, D.ACSDD, D.ASBA", role: "Founder & Clinical Lead", image: "/assets/team/rod.webp", href: { label: "Meet Dr. Rodney Willey", url: "/dr-rodney-willey" } },
  { name: "Donna Willey", image: "/assets/team/donna.webp" },
  { name: "Cassie McIntosh", image: "/assets/team/cassie.webp" },
  { name: "Jessica Mahrt", role: "Provider Onboarding & System Implementation", image: "/assets/team/jessica.webp" },
  { name: "Karen Mahoney", role: "Clinical & Operational Support", image: "/assets/team/karen.webp" },
];
