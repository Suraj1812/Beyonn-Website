/**
 * Site-wide configuration and navigation.
 * Public values and destinations shared across the website.
 */

export const site = {
  name: "Beyonn",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://beyonn.com",
  email: "info@beyonn.com",
  phone: "888-264-1981",
  phoneHref: "tel:+18882641981",
  tagline: "Beyond Training. Beyond Billing. Beyond the Appliance.",
  line: "You're the operator. Beyonn is the operating system.",
  linkedin: {
    beyonn: "https://www.linkedin.com/company/beyonn",
    doctor: "https://www.linkedin.com/search/results/people/?keywords=Rodney%20Willey%20DDS",
  },
  /** Patient app store links. Leave empty until the app is live (CONFIRM launch date). */
  app: {
    appStore: process.env.NEXT_PUBLIC_APP_STORE_URL ?? "",
    googlePlay: process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL ?? "",
  },
} as const;

export type NavLink = { label: string; href: string; description?: string };
export type NavGroup = { label: string; links: NavLink[]; footer?: NavLink };

export const primaryNav: (NavGroup | NavLink)[] = [
  {
    label: "The Program",
    links: [
      { label: "The Beyonn Protocol", href: "/the-beyonn-system", description: "Identify, Prepare, Treat, Manage. Run by your team." },
      { label: "Beyonn Academy", href: "/academy", description: "The Coaching Clinician Blueprint, LMS and live coaching." },
      { label: "Beyonn Patient App", href: "/patient-app", description: "From the Snore Score to the yearly visit." },
      { label: "Beyonn Global", href: "/global", description: "The program, beyond the United States." },
    ],
    footer: { label: "Become a Beyonn Network Partner", href: "/partner" },
  },
  {
    label: "About",
    links: [
      { label: "Dr. Rodney Willey", href: "/dr-rodney-willey", description: "The clinician behind Beyonn" },
      { label: "Meet the Team", href: "/team", description: "The team behind your team" },
      { label: "Free Workshop", href: "/#workshop", description: "One live hour with Dr. Willey" },
      { label: "Contact", href: "/contact", description: "info@beyonn.com · 888-264-1981" },
    ],
  },
  { label: "Partner With Us", href: "/partner" },
  {
    label: "For Patients",
    links: [
      { label: "Symptoms & 2-minute check", href: "/patients", description: "Snoring, jaw pain, morning headaches" },
      { label: "Find a Provider", href: "/patients/find-a-provider", description: "Search by ZIP code or city" },
      { label: "Beyonn Patient App", href: "/patient-app#download", description: "Snore Score and Sleep Score" },
    ],
  },
  { label: "Resources", href: "/resources" },
];

export const signInNav: NavLink[] = [
  { label: "Patient Portal", href: "/portal", description: "Treatment, forms and messages" },
  { label: "Partner Login", href: "/partner-login", description: "Training, Golden Tracker, cases" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "For Practitioners",
    links: [
      { label: "The Beyonn System", href: "/the-beyonn-system" },
      { label: "Partner With Us", href: "/partner" },
      { label: "Beyonn Academy", href: "/academy" },
      { label: "Beyonn Global", href: "/global" },
      { label: "Workshops & Events", href: "/#workshop" },
      { label: "Partner Login", href: "/partner-login" },
    ],
  },
  {
    title: "For Patients",
    links: [
      { label: "Sleep Apnea Symptoms", href: "/patients#symptoms" },
      { label: "TMD Treatment", href: "/patients#treatment" },
      { label: "Find a Provider", href: "/patients/find-a-provider" },
      { label: "Patient App", href: "/patient-app" },
      { label: "Patient Portal", href: "/portal" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Dr. Rodney Willey", href: "/dr-rodney-willey" },
      { label: "Meet the Team", href: "/team" },
      { label: "Resources", href: "/resources" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export const legalNav: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "HIPAA Notice of Privacy Practices", href: "/hipaa" },
  { label: "Accessibility", href: "/accessibility" },
];

export const isGroup = (item: NavGroup | NavLink): item is NavGroup => "links" in item;

/** Routes where the persistent CTA switches to the patient version. */
export const isPatientRoute = (path: string) => path.startsWith("/patients") || path === "/portal";
