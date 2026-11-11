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
    doctor: "https://www.linkedin.com/in/dr-rodney-willey-246a42381",
  },
  /** Confirmed patient app destinations; iOS remains empty until supplied. */
  app: {
    appStore: process.env.NEXT_PUBLIC_APP_STORE_URL ?? "",
    googlePlay: process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL || "https://play.google.com/store/apps/details?id=com.beyonn.app",
  },
} as const;

export type NavLink = { label: string; href: string; description?: string };
export type NavGroup = { label: string; links: NavLink[]; footer?: NavLink };

export const primaryNav: (NavGroup | NavLink)[] = [
  {
    label: "About Us",
    links: [
      { label: "The Beyonn Protocol", href: "/the-beyonn-system" },
      { label: "Dr. Rodney Willey", href: "/dr-rodney-willey" },
      { label: "Meet the Team", href: "/team" },
      { label: "Beyonn Academy", href: "/academy" },
    ],
  },
  {
    label: "For Practitioners",
    links: [
      { label: "Partner With Us", href: "/partner" },
      { label: "Beyonn Global", href: "/global" },
    ],
  },
  {
    label: "For Patients",
    links: [
      { label: "Sleep Apnea Symptoms", href: "/patients#symptoms" },
      { label: "TMD explained", href: "/patients#tmd" },
      { label: "Beyonn Patient App", href: "/patient-app" },
      { label: "Find a Provider", href: "/patients/find-a-provider" },
    ],
  },
  { label: "Resources", href: "/resources" },
];

export const signInNav: NavLink[] = [
  { label: "Patient Portal", href: "/portal" },
  { label: "Partner Login", href: "/partner-login" },
];

/** Footer columns, as listed in the content doc. */
export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "For Practitioners",
    links: [
      { label: "The Beyonn System", href: "/the-beyonn-system" },
      { label: "Partner With Us", href: "/partner" },
      { label: "Beyonn Global", href: "/global" },
      { label: "Partner Login", href: "/partner-login" },
    ],
  },
  {
    title: "For Patients",
    links: [
      { label: "Sleep Apnea Symptoms", href: "/patients#symptoms" },
      { label: "TMD explained", href: "/patients#tmd" },
      { label: "Beyonn Patient App", href: "/patient-app" },
      { label: "Find a Provider", href: "/patients/find-a-provider" },
      { label: "Patient Portal", href: "/portal" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Dr. Rodney Willey", href: "/dr-rodney-willey" },
      { label: "Meet the Team", href: "/team" },
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
