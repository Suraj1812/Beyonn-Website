import { blueprintByStep } from "@/content/protocol";
import { workshopContent } from "@/content/workshop";
import type { FaqItem } from "@/components/ui/Faq";
import type { AppScreen } from "@/components/interactive/AppGet";
import { academyFaq, globalFaq, partnerFaq, patientFaq, systemFaq } from "@/content/faqs";

/** A button or link. `app` opens the Patient App flow (store on phones, QR on desktop). */
export type Action = { label: string; href?: string; app?: AppScreen; variant?: "dawn" | "light" | "ghost" | "ghost-light" | "dark" };

export type Card = { label?: string; title?: string; text?: string };

/** Interactive or data-driven blocks rendered by the page route. */
export type Widget = "airway-model" | "discovery-booking" | "founder-video" | "walkthrough-video" | "patient-video" | "patient-stories" | "patient-blogs" | "app-preview" | "workshop-preview" | "quick-check" | "team" | "ladder" | "testimonials" | "register-form" | "referral-form" | "app-download" | "countries" | "portal-signin" | "partner-signin";

export type PageSection = {
  id?: string;
  eyebrow?: string;
  title?: string;
  body?: string | string[];
  /** Numbered feature cards. */
  points?: string[];
  /** Plain check list. */
  list?: string[];
  image?: string;
  imageAlt?: string;
  cards?: Card[];
  /** Columns of short lists (fit / not a fit, what's included, swimlane, module groups). */
  columns?: { title: string; items: string[]; negative?: boolean }[];
  /** Comparison table. `compare` = two columns; `arrow` = feature → benefit rows; `matrix` = labelled rows. */
  table?: { head: string[]; rows: string[][]; variant?: "compare" | "arrow" | "matrix" };
  steps?: Card[];
  stats?: { value: string; label: string }[];
  quote?: { text: string; cite?: string };
  /** Large pull line. */
  pull?: string;
  /** A sub-block with a heading and a list, e.g. "Why it matters". */
  aside?: { title: string; items: string[]; nested?: { after: number; items: string[] } };
  callout?: { text: string; action: Action };
  /** Short line shown right after the body. */
  tagline?: string;
  /** Show the body after the list instead of before it. */
  bodyAfter?: boolean;
  /** Short bold lines shown after the section's main content. */
  lines?: string[];
  links?: Action[];
  faq?: FaqItem[];
  widget?: Widget;
  dark?: boolean;
};

export type ContentPage = {
  eyebrow?: string;
  title: string;
  /** Second headline under the H1 (Dr. Rodney Willey). */
  headline?: string;
  description: string;
  /** Line shown under the hero sub. */
  heroLine?: string;
  photo?: string;
  photoAlt?: string;
  seo?: { title: string; description: string; keywords?: string[] };
  actions?: Action[];
  sections: PageSection[];
  closing?: { id?: string; title: string; sub?: string; actions?: Action[]; signoff?: string; form?: "partner" };
  disclaimer?: string;
  /** Legacy single call to action (utility pages). */
  cta?: { label: string; href: string };
};

const book: Action = { label: "Book Your Discovery Call", href: "/qualify" };
const workshop: Action = { label: "Join a Workshop", href: "/workshop#register", variant: "ghost-light" };

const steps = {
  identify: ["Screens patients, takes new patient calls and books exams", "Screening tools, call scripts and checklists, the Patient App, Blueprint modules"],
  prepare: ["Registration, sleep study records, insurance verification and pre-service billing prep", "The Forms Center, Beyonn home sleep testing, the coding and documentation kit, the medical referral network kit, Blueprint modules"],
  treat: ["Exam, documentation, treatment plan presentation, ordering and delivering the Beyonn appliance", "Dr. Rodney Willey's protocols, presentation scripts, consent forms, case guidance, Blueprint modules"],
  manage: ["Claims, follow-up visits, no-shows, replacement appliances", "The Golden Tracker, a CRM with automated email, SMS and WhatsApp follow-up, the business dashboard, optional Billing Assist, Blueprint modules 3 and 10 to 12, ongoing coaching"],
};

export const pages: Record<string, ContentPage> = {
  "the-beyonn-system": {
    eyebrow: "The Beyonn Protocol™",
    title: "One system. Your team. Every case, start to finish.",
    description: "Training, workflows, technology and coaching to run OSA + TMD care, from the first call to reimbursement.",
    seo: {
      title: "How the Beyonn System Works | OSA + TMD Program Your Team Runs",
      description: "See how Beyonn trains and equips your team to take every OSA + TMD case from the first call to reimbursement.",
      keywords: ["dental sleep medicine practice implementation", "management of TMD", "TMD in dentistry", "dental TMD"],
    },
    actions: [{ ...book, variant: "dawn" }],
    sections: [
      { id: "walkthrough", eyebrow: "See the system in action", title: "A walkthrough with Dr. Rodney Willey", widget: "walkthrough-video" },
      {
        eyebrow: "Why most OSA + TMD programs stall",
        title: "Knowing how to treat isn't the hard part.",
        body: [
          "Clinical knowledge needs trained staff, clear documentation, billing and follow-up.",
          "Beyonn connects that work into one workflow.",
        ],
        cards: [
          { title: "The medical paperwork.", text: "Dental teams are rarely trained for medical documentation and authorizations." },
          { title: "The billing.", text: "Medical claims work differently from dental, and one rejected claim kills momentum." },
          { title: "The one key employee.", text: "When the one person who understood the process leaves, so does the program." },
        ],
        lines: ["Beyonn trains your whole team to clear all three, and keeps the system in place when people change."],
      },
      {
        id: "identify",
        eyebrow: "Step 1 — Identify",
        title: "Discover the opportunity already inside your practice.",
        body: "Use STOP-Bang screening, chair-side scripts and the Patient App to identify patients and book exams.",
        list: [steps.identify[1]],
      },
      {
        id: "prepare",
        eyebrow: "Step 2 — Prepare",
        title: "Your team prepares every case, step by step.",
        body: "Gather physician-interpreted sleep studies, coordinate referrals, verify insurance and prepare the case records.",
        list: [steps.prepare[1]],
      },
      {
        id: "treat",
        eyebrow: "Step 3 — Treat",
        title: "Your doctor remains the doctor.",
        body: "You evaluate and treat. Your team presents the plan, with Beyonn scripts and coaching for complex cases.",
        list: [steps.treat[1]],
      },
      {
        id: "manage",
        eyebrow: "Step 4 — Manage",
        title: "Treatment isn't the end of the workflow.",
        body: "Track billing, follow-up visits and replacement appliances in the Golden Tracker.",
        list: [steps.manage[1]],
      },
      {
        title: "Find the right support for your team.",
        links: [{ label: "Explore partnership and support", href: "/partner" }, { label: "See the training curriculum", href: "/academy#blueprint" }],
      },
      { id: "faq", title: "FAQ", faq: systemFaq },
    ],
    closing: {
      title: "Your patients. Your practice. Your team. Our system.",
      sub: "See how the Beyonn System would run with your team, in one conversation.",
      actions: [{ ...book, variant: "dawn" }, { label: "Join a Workshop", href: "/workshop#register", variant: "ghost-light" }],
      signoff: "BEYONN™ · Beyond Training. Beyond Billing. Beyond the Appliance.",
    },
  },

  "dr-rodney-willey": {
    eyebrow: "Clinician · Educator · OSA + TMD Pioneer",
    title: "Dr. Rodney Willey, DDS, D.ACSDD, D.ASBA",
    headline: "Clinical experience. Practical teaching.",
    description: "Nearly 20 years focused on OSA and TMD care.",
    photo: "/assets/people/rodney-hero.webp",
    photoAlt: "Dr. Rodney Willey",
    seo: {
      title: "Dr. Rodney Willey, DDS, D.ACSDD, D.ASBA | OSA + TMD Clinician | Beyonn",
      description: "Nearly two decades treating only OSA and TMD, with more than 10,000 oral appliances delivered. Meet the clinician behind Beyonn.",
      keywords: ["Dr. Rodney Willey", "Dr. Rodney Willey sleep apnea", "Dr. Rodney Willey dental sleep medicine"],
    },
    sections: [
      { id: "founder-story", eyebrow: "The founder’s story", title: "Why Dr. Willey started Beyonn", body: "A conversation with Dr. Willey about the vision behind Beyonn. Founder-story video coming soon.", links: [{ label: "Watch his program introduction", href: "/#doctor" }] },


      {
        id: "experience",
        eyebrow: "Professional background",
        title: "Credentials & clinical experience",
        body: "DDS, D.ACSDD, D.ASBA · Founder & Clinical Lead",
        stats: [
          { value: "10,000+", label: "Oral appliances delivered in the United States" },
          { value: "~20 years", label: "Of practice limited to OSA and TMD" },
          { value: "2 conditions", label: "Airway and jaw care considered together" },
          { value: "Complex cases", label: "Complex sleep challenges and previous treatment difficulties" },
        ],
      },
      {
        eyebrow: "Clinical philosophy",
        title: "OSA and TMD are married.",
        body: [
          "His approach considers breathing, sleep and jaw function together, with the patient at the centre.",
        ],
      },
      {
        eyebrow: "The cases textbooks skip",
        title: "Experience for complex cases.",
        body: "Complex cases shaped his approach to care.",
        cards: [
          { title: "The patient who didn't respond as expected." },
          { title: "The patient whose jaw couldn't tolerate a conventional approach." },
          { title: "The patient with multiple diagnoses and a complicated medical history." },
          { title: "The patient who needed a different approach to communication, comfort and care." },
          { title: "The patient who had already been told, \"There is nothing more we can do.\"" },
        ],
        lines: ["For that last patient, experience can change the conversation."],
      },
      {
        eyebrow: "Why he built Beyonn",
        title: "Diplomas on the wall. No patients in the chair.",
        body: [
          "He built Beyonn to help trained clinicians put their knowledge into practice.",
          "His clinical workflows now support practice teams through training, tools and coaching.",
        ],
        links: [{ label: "See how the Beyonn System works", href: "/the-beyonn-system" }, { label: "Read clinician endorsements", href: "/#stories" }],
      },
    ],
    closing: {
      title: "Learn from the clinician who's done it 10,000 times.",
      actions: [{ label: "Join a Workshop", href: "/workshop#register", variant: "dawn" }, { ...book, variant: "ghost-light" }],
    },
  },

  team: {
    eyebrow: "The Beyonn Team",
    title: "Meet the team behind your team.",
    description: "Meet the people who train, onboard and support your practice.",
    photo: "/assets/people/clinic-team.webp",
    photoAlt: "The Beyonn team working together in a clinic",
    seo: {
      title: "Meet the Beyonn Team | Dental Sleep Medicine Support Team",
      description: "Meet the Beyonn team: the clinicians, trainers and onboarding specialists who equip partner practices to run their own OSA + TMD programs.",
      keywords: ["Beyonn team", "dental sleep medicine support team", "dental sleep medicine training", "sleep apnea training for dentists"],
    },
    sections: [
      {
        eyebrow: "Our mission",
        title: "We're here to define the future of OSA + TMD.",
        body: "Equip practices to deliver OSA + TMD care with confidence.",
      },
      {
        eyebrow: "Our values",
        title: "Our values",
        cards: [
          { label: "B", title: "Bold Vision", text: "Think boldly. Create lasting impact." },
          { label: "E", title: "Excellence Always", text: "Care about every detail." },
          { label: "Y", title: "Yes to Growth", text: "Keep learning and improving." },
          { label: "O", title: "Ownership Mindset", text: "Take responsibility. Act with integrity." },
          { label: "N", title: "Next-Level Compassion", text: "Listen well. Treat people with dignity." },
          { label: "N", title: "No One Does It Better", text: "Keep raising the standard." },
        ],
      },
      { eyebrow: "Our team", title: "The people behind your team.", widget: "team" },
    ],
    closing: { title: "Want this team behind your practice?", actions: [{ ...book, variant: "dawn" }] },
  },

  academy: {
    eyebrow: "Beyonn Academy",
    title: "Learn it. Run it. Get certified for it.",
    description: "Clinical training, practical workflows and live coaching for your whole OSA + TMD team.",
    photo: "/assets/people/team-training.webp",
    photoAlt: "Dr. Rodney Willey teaching a practice team during an in-person training session",
    seo: {
      title: "Beyonn Academy | OSA + TMD Training for Dentists and Their Teams",
      description: "Beyonn Academy trains your whole team to treat Obstructive Sleep Apnea and Temporomandibular Joint Disorder: on-demand learning, the Coaching Clinician Blueprint, certification and live coaching with Dr. Rodney Willey.",
      keywords: ["sleep apnea training for dentists", "TMD training for dentists", "oral appliance therapy training", "dental sleep medicine training", "dental sleep medicine courses"],
    },
    actions: [{ ...book, variant: "dawn" }, workshop],
    sections: [
      {
        eyebrow: "More than a course",
        title: "Put your training into practice.",
        body: "Learn the clinical care and the daily work around it: patient calls, documentation, billing and follow-up.",
      },
      {
        eyebrow: "What's inside",
        title: "What's inside",
        cards: [
          { title: "Beyonn LMS", text: "Clinical videos, case studies, tests and team progress in one place." },
          { title: "The Coaching Clinician Blueprint", text: "12 modules covering the complete practice workflow." },
          { title: "The Forms Center", text: "Ready-made forms, scripts and templates for every step, from the first call to the yearly visit." },
          { title: "Live coaching", text: "Monthly coaching, study club and peer support." },
          { title: "Beyonn AI assistant", text: "24/7 help with protocols, billing and the platform." },
        ],
      },
      {
        id: "blueprint",
        eyebrow: "The Coaching Clinician Blueprint",
        title: "12 modules. Every step your team takes.",
        columns: blueprintByStep.map(({ step, modules }) => ({
          title: step,
          items: modules.map(([number, name]) => `${number} ${name}`),
        })),
        lines: ["Built so a new hire can learn the system in the same way as the team member they replace."],
      },
      {
        eyebrow: "Who it's for",
        title: "Who it's for",
        cards: [
          { title: "Doctors", text: "OSA + TMD clinical protocols, exams, treatment planning and complex-case guidance." },
          { title: "Front desk", text: "New patient calls, registration, scheduling and no-show follow-up." },
          { title: "Clinical team", text: "Check-in, records, impressions, delivery and follow-up visits." },
          { title: "Billing team", text: "Medical insurance, pre-service prep, medical necessity and claims." },
        ],
      },
      { id: "certification", eyebrow: "Get certified", title: "Your path from learning to leading.", widget: "ladder", dark: true },
      {
        eyebrow: "Learn from the clinician who built it",
        lines: ["Every lesson comes from nearly 20 years treating only OSA + TMD, and more than 10,000 oral appliances delivered."],
        links: [{ label: "Meet Dr. Rodney Willey", href: "/dr-rodney-willey" }],
      },
      { id: "faq", title: "FAQ", faq: academyFaq },
    ],
    closing: {
      title: "Put your team’s training to work.",
      actions: [{ ...book, variant: "dawn" }, workshop],
    },
  },

  global: {
    eyebrow: "Beyonn Global",
    title: "The Beyonn program, worldwide.",
    description: "Dr. Rodney Willey's OSA + TMD protocols, training and technology for practices outside the US.",
    photo: "/assets/people/front-desk-team.webp",
    photoAlt: "Beyonn practice team coordinating patient calls at the front desk",
    seo: {
      title: "Beyonn Global | OSA + TMD Program for Practices Worldwide",
      description: "Beyonn Global brings Dr. Rodney Willey's OSA + TMD protocols, training and technology to dental practices outside the United States.",
      keywords: ["dental sleep medicine", "sleep apnea training for dentists", "TMD training for dentists"],
    },
    actions: [{ label: "Register Your Interest", href: "#register", variant: "dawn" }, { label: "Join a Workshop", href: "/workshop#register", variant: "ghost-light" }],
    sections: [
      {
        eyebrow: "Why Beyonn Global",
        title: "A connected program. Adapted locally.",
        body: "Bring OSA + TMD care into your practice with workflows adapted to local regulations, payment models and language.",
        links: [{ label: "Explore the core partner program", href: "/partner" }],
      },
      {
        eyebrow: "How it works",
        title: "How it works",
        steps: [
          { title: "Explore the workshop.", text: "See the upcoming session times and choose a session that works for you." },
          { title: "Book a Discovery Call.", text: "We look at your practice, country and goals." },
          { title: "Adapt.", text: "We align the program with your local regulations, payment models and language." },
          { title: "Launch.", text: "Your team goes live, with Beyonn's training, technology and coaching behind you." },
        ],
      },
      { eyebrow: "Where Beyonn Global is open", title: "Where Beyonn Global is open", widget: "countries" },
      { id: "register", eyebrow: "Register your interest", title: "Register your interest", widget: "register-form" },
      { id: "faq", title: "Quick answers", faq: globalFaq },
    ],
  },

  partner: {
    eyebrow: "Become a Beyonn Network Partner",
    title: "Build your OSA + TMD service line.",
    description: "Train your team, connect your workflows and get ongoing clinical and operational support.",
    photo: "/assets/people/practice-support.webp",
    photoAlt: "A Beyonn team member supporting patients by phone",
    seo: {
      title: "Sleep Apnea Training for Dentists and Their Teams | Become a Beyonn Partner",
      description: "More than sleep apnea and TMD training for dentists. Become a Beyonn Network Partner and get the team training, workflows, technology and coaching to run an OSA + TMD treatment program.",
      keywords: ["sleep apnea training for dentists", "TMD training for dentists", "oral appliance therapy training", "dental sleep medicine practice support"],
    },
    actions: [{ label: "Book Your Discovery Call", href: "/qualify", variant: "dawn" }, workshop],
    sections: [
      {
        eyebrow: "Is this you?",
        title: "Built for practitioners ready to treat OSA + TMD.",
        columns: [
          { title: "A great fit if you…", items: ["Are a dental practitioner, nurse practitioner or ENT", "See snoring, clenching or failed night guards every week", "Have trained in OSA or TMD but never built the program", "Have a team ready to learn and own a new service line"] },
          { title: "Probably not a fit if you…", items: ["Want to outsource clinical care itself", "Aren't ready to involve your team"], negative: true },
        ],
      },
      {
        eyebrow: "What you get",
        title: "Everything your team needs to run the program.",
        cards: [
          { title: "Training + Blueprint", text: "12 modules, clinical videos, case studies and ready-made forms for your whole team." },
          { title: "Coaching + onboarding", text: "Monthly coaching, study club, complex-case guidance and training for new hires." },
          { title: "Connected technology", text: "Patient App, Academy, Admin Panel, case tracking and 24/7 AI assistance." },
          { title: "Testing + treatment", text: "STOP-Bang screening, physician-read home sleep tests and the Beyonn appliance." },
          { title: "Billing + referrals", text: "Coding tools, documentation, payer guidance, optional Billing Assist and medical referral resources." },
          { title: "Practice growth", text: "Patient campaigns, co-branded marketing, directory listings and financing options." },
        ],
      },
      {
        eyebrow: "Support levels",
        title: "Support levels",
        table: {
          head: ["", "OSA + TMD Done By You", "PR & Marketing Suite"],
          rows: [
            ["What it is", "Your own team runs the program, trained and coached by Beyonn", "Patient education and practice growth resources"],
            ["Includes", "The Coaching Clinician Blueprint (12 modules), Forms Center, onboarding, coaching, Beyonn tech systems", "Patient education workbook, yearly marketing kit"],
            ["Best for", "Practices ready to build an OSA + TMD treatment program their team owns", "Practices ready to grow patient demand"],
          ],
          variant: "matrix",
        },
      },
      {
        eyebrow: "Your path to partnership",
        title: "Your path to partnership",
        steps: [
          { title: "Attend a free workshop with Dr. Rodney Willey." },
          { title: "Book a Discovery Call to see if your practice is a fit." },
          { title: "Get certified as a Beyonn Certified Provider." },
          { title: "Go live as a Beyonn Network Partner, listed in our provider directory." },
          { title: "Grow to Advanced Provider, then Centre of Excellence, with higher placement in patient routing at each tier." },
        ],
      },
      { id: "faq", title: "FAQ", faq: partnerFaq },
    ],
    closing: { id: "book", title: "See if Beyonn fits your practice.", actions: [{ ...book, variant: "dawn" }, { label: "Read clinician endorsements", href: "/#stories", variant: "ghost-light" }] },
  },

  patients: {
    title: "Snoring, jaw pain, morning headaches? They may be connected.",
    description: "Sleep apnea and TMD often show up together. Understanding the signs is the first step to sleeping, breathing and feeling better.",
    photo: "/assets/people/patient-conversation.webp",
    photoAlt: "Clinician speaking with a patient",
    seo: {
      title: "Sleep Apnea Symptoms & TMD Treatment | Find a Beyonn Provider",
      description: "Snoring, jaw pain or morning headaches? Learn the sleep apnea symptoms and TMD signs to watch for, your OSA treatment options, and how to find a provider near you.",
      keywords: ["sleep apnea symptoms", "OSA treatment", "OSA therapy", "medical treatment for sleep apnea", "TMD treatment", "TM joint treatment", "temporomandibular dysfunction treatment", "TMD temporomandibular disorder", "TMD relief", "treating TMD jaw pain", "TMD teeth pain", "sleep apnea doctor", "OSA specialist", "OSA clinic", "TMD dentist"],
    },
    actions: [{ label: "Find a Provider Near You", href: "/patients/find-a-provider", variant: "dawn" }, { label: "Get My Snore Score", app: "snore-score", variant: "ghost-light" }],
    sections: [
      {
        id: "symptoms",
        eyebrow: "Sleep apnea symptoms to watch for",
        title: "Common sleep apnea symptoms",
        list: [
          "Loud, frequent snoring",
          "Pauses in breathing or gasping during sleep, often noticed by a partner",
          "Waking up tired after a full night in bed",
          "Morning headaches",
          "Daytime sleepiness or trouble concentrating",
          "Waking often to use the bathroom at night",
        ],
        bodyAfter: true,
        body: "Obstructive sleep apnea (OSA) happens when the airway narrows or closes during sleep. Many people live with it for years without knowing.",
        aside: {
          title: "Why it matters",
          items: [
            "Sleep apnea is more than snoring.",
            "Left untreated, it's linked to:",
            "About 80% of people with sleep apnea don't know they have it.",
            "The good news: it's very treatable. A simple screening, an exam and the right care can help you sleep, breathe and feel better.",
          ],
          nested: { after: 1, items: ["high blood pressure", "heart problems", "stroke", "diabetes", "weight gain", "low mood and memory problems", "drowsy driving"] },
        },
        callout: { text: "Not sure? Get your Snore Score in the Beyonn Patient App.", action: { label: "Get My Snore Score", app: "snore-score" } },
      },
      {
        id: "tmd",
        eyebrow: "TMD signs",
        title: "What is TMD (temporomandibular disorder)?",
        body: "TMD affects the jaw joints (the TM joints) and the muscles that move them.",
        list: [
          "Jaw pain or tenderness, especially in the morning",
          "Clicking, popping or locking of the jaw",
          "TMD teeth pain, worn teeth, or clenching and grinding",
          "Headaches, earaches or neck pain",
          "A night guard that hasn't solved the problem",
        ],
      },
      { id: "quick-check", title: "Quick check: could it be sleep apnea or TMD?", widget: "quick-check" },
      {
        id: "connected",
        eyebrow: "Why they're connected",
        title: "Your airway and your jaw work as a team.",
        body: "Clenching and grinding at night can be the body's way of keeping the airway open. Treating only the jaw, or only the airway, can leave half the problem behind. Beyonn providers look at both.",
        image: "/assets/people/clinical-review.webp",
        imageAlt: "Dr. Rodney Willey and a clinician reviewing information together in the clinic",
      },
      {
        id: "treatment",
        eyebrow: "Your treatment options",
        title: "OSA treatment and TMD treatment, made simple.",
        cards: [
          { title: "Diagnosis first.", text: "Sleep apnea is diagnosed by a physician, usually after a sleep study. Many Beyonn providers can arrange a home sleep test, read by a physician, so you can sleep in your own bed." },
          { title: "Oral appliance therapy.", text: "A custom-fitted device worn at night that helps keep the airway open. It's a common OSA therapy for people who can't tolerate CPAP." },
          { title: "TMD relief.", text: "Temporomandibular dysfunction treatment may include appliances, muscle therapy and bite care, planned around your airway." },
          { title: "Understanding coverage.", text: "Medical treatment for sleep apnea is often covered by medical insurance, not dental. Your provider's team checks your benefits for you." },
        ],
      },
      { id: "how-it-works", eyebrow: "Oral appliance therapy", title: "How an oral appliance helps", widget: "airway-model" },
      {
        id: "journey",
        eyebrow: "Your journey with a Beyonn dentist",
        title: "Your journey with a Beyonn dentist",
        steps: [
          { title: "Check", text: "Take the free Snore Score in the Beyonn Patient App. It takes about a minute." },
          { title: "Consultation", text: "Meet your Beyonn dentist for a conversation and an exam of your airway and jaw." },
          { title: "Sleep test", text: "A sleep test, often done at home in your own bed, read by a physician." },
          { title: "Custom appliance", text: "A comfortable oral appliance, made to fit your mouth, worn while you sleep." },
          { title: "Adjustments", text: "Small, simple adjustments over the first weeks until it feels right and works well." },
          { title: "Follow-up sleep test", text: "A second sleep test to confirm your treatment is working, then regular check-ins." },
        ],
      },
      {
        id: "find-a-provider",
        callout: { text: "Ready to find care near you?", action: { label: "Find a Provider", href: "/patients/find-a-provider#referral" } },
      },
      { title: "OSA and TMD, explained", widget: "patient-video" },
      { title: "Care, in her own words", widget: "patient-stories" },
      { title: "Understand your sleep and jaw health", widget: "patient-blogs" },
      { id: "faq", title: "Patient FAQ", faq: patientFaq },
    ],
    disclaimer: "This page is for general education and is not medical advice. Always speak with a qualified provider about your symptoms.",
  },

  "patients/find-a-provider": {
    title: "Find an OSA & TMD Specialist Near You",
    description: "The Beyonn team connects you with the nearest OSA specialist or OSA clinic.",
    seo: {
      title: "Find a Sleep Apnea Doctor or TMD Dentist Near You | Beyonn",
      description: "Find a sleep apnea doctor or TMD dentist near you. Request a referral and the Beyonn team connects you with the nearest OSA specialist or OSA clinic.",
      keywords: ["sleep apnea doctor", "OSA specialist", "OSA clinic", "TMD dentist"],
    },
    actions: [{ label: "Request a Referral", href: "#referral", variant: "dawn" }],
    sections: [{ id: "referral", eyebrow: "Find a Beyonn provider", title: "Request a Referral", widget: "referral-form" }],
    disclaimer: "This page is for general education and is not medical advice. Always speak with a qualified provider about your symptoms.",
  },

  "patient-app": {
    eyebrow: "The Beyonn Patient App · The patient's companion for living well",
    title: "Your care journey, in one app.",
    description: "Check sleep scores, prepare for an exam and follow your treatment progress.",
    seo: {
      title: "Beyonn Patient App | Snore Score, Sleep Score, Exam Booking & Treatment Tracking",
      description: "The Beyonn Patient App takes patients from a Snore Score to a booked exam, a fitted appliance and a yearly visit, with the practice's team and the Beyonn system behind every step.",
      keywords: ["oral appliance therapy", "sleep apnea symptoms", "OSA therapy", "TMD treatment"],
    },
    actions: [{ label: "Download the App", href: "#download", variant: "dawn" }, { label: "Explore the Screens", href: "#screens", variant: "ghost-light" }],
    sections: [
      { id: "screens", title: "A closer look at the app", widget: "app-preview", links: [{ label: "Take the awareness check", href: "/patients#quick-check" }] },

      {
        id: "practice",
        eyebrow: "Your care companion",
        title: "Stay ready for your next step.",
        cards: [
          { title: "Learn", text: "Read about your exam, sleep health and appliance care." },
          { title: "Prepare", text: "Keep appointment details and visit reminders close at hand." },
          { title: "Follow through", text: "See where you are in your care journey and what comes next." },
        ],
      },
      {
        id: "journey",
        title: "Support between visits.",
        body: "Your provider guides your treatment. The app helps you keep track between appointments.",
        links: [{ label: "Understand the treatment journey", href: "/patients#journey" }],
      },
      {
        eyebrow: "Safe and simple",
        title: "Safe and simple",
        list: [
          "The app never diagnoses. Your provider and a sleep doctor do.",
          "The app never takes a payment.",
          "Built to HIPAA Security Rule standards, with every consent in your account.",
          "Help from Beyonn's clinical team, available in English and Spanish.",
        ],
      },
      { id: "download", eyebrow: "Download", title: "Get the Beyonn Patient App.", widget: "app-download" },
    ],
  },

  portal: {
    title: "Welcome back.",
    description: "Sign in to see your treatment progress, forms and messages from your care team.",
    seo: { title: "Patient Portal | Beyonn", description: "Sign in to see your treatment progress, forms and messages from your care team." },
    sections: [{ id: "sign-in", widget: "portal-signin" }],
  },

  "partner-login": {
    title: "Partner sign-in",
    description: "Access your training library, Golden Tracker and case updates.",
    seo: { title: "Partner Sign-In | Beyonn", description: "Access your training library, Golden Tracker and case updates." },
    sections: [{ id: "sign-in", widget: "partner-signin" }],
  },

  workshop: {
    eyebrow: "Free live workshop",
    title: workshopContent.title,
    description: workshopContent.subhead,
    actions: [{ label: "Join a Workshop", href: "#register", variant: "dawn" }],
    sections: [
      { title: "Built for your whole practice", body: "For dentists, ENTs, nurse practitioners and the teams who support them.", cards: [
        { title: "Recognise the patients", text: "Explore the connection between sleep, the airway and jaw symptoms." },
        { title: "Connect the workflow", text: "See how screening, testing, treatment and follow-up fit together." },
        { title: "Understand practice growth", text: "Explore medical billing, patient education and the operational work behind a new service line." },
      ] },
      { title: "What You’ll Walk Away With", cards: workshopContent.takeaways.map((item) => ({ ...item })) },
      { id: "register", title: "Choose your session", widget: "workshop-preview" },
    ],
  },

  qualify: {
    eyebrow: "Discovery Call",
    title: "See if Beyonn fits your practice.",
    description: "Discuss your practice, goals and the support you need.",
    actions: [{ label: "Book a Discovery Call", href: "#book", variant: "dawn" }],
    sections: [
      { eyebrow: "What to expect", title: "A useful conversation, not a sales maze.", points: ["Tell the Beyonn team about your practice and team.", "Discuss the OSA + TMD patients you already see.", "Review training, systems and operational support options.", "Leave with a clear answer about next steps and fit."] },
      { id: "book", title: "Schedule a Discovery Call", widget: "discovery-booking" },
    ],
  },
  contact: {
    eyebrow: "Contact Beyonn",
    title: "Start a conversation.",
    description: "Questions about partnership, patients, the Academy or international availability? Reach the Beyonn team directly.",
    sections: [
      { eyebrow: "Get in touch", title: "The team is one call away.", points: ["Call 888-264-1981.", "Email info@beyonn.com.", "For partnership, schedule a Discovery Call.", "For a patient referral, tell the team your city or ZIP code."] },
    ],
    cta: { label: "Email Beyonn", href: "mailto:info@beyonn.com" },
  },
  privacy: {
    eyebrow: "Privacy",
    title: "Your privacy matters.",
    description: "How to contact Beyonn about personal information and website use.",
    sections: [
      { title: "Website information", body: "This website is an informational presentation. Contact Beyonn directly for the current, approved privacy policy governing its services and platform. Do not send medical details through ordinary email." },
      { title: "Contact", body: "For privacy questions, email info@beyonn.com or call 888-264-1981." },
    ],
  },
  terms: {
    eyebrow: "Terms",
    title: "Website terms.",
    description: "General information about use of this informational website.",
    sections: [
      { title: "Information only", body: "The content on this website is for general education and does not replace clinical, legal or billing advice. Program details and availability should be confirmed with Beyonn. For current service terms, contact Beyonn directly." },
    ],
  },
  hipaa: {
    eyebrow: "Health information",
    title: "Notice of privacy practices.",
    description: "Protected health information belongs in a secure clinical system.",
    sections: [
      { title: "Request the official notice", body: "Beyonn's approved HIPAA Notice of Privacy Practices should be obtained directly from its care team or secure portal. This informational website does not collect medical records. Please do not include medical details in ordinary email." },
    ],
  },
  accessibility: {
    eyebrow: "Accessibility",
    title: "A website for everyone.",
    description: "Beyonn aims to make its information available across devices and input methods.",
    sections: [
      { title: "Need assistance?", body: "If you have trouble using any part of this site, call 888-264-1981 or email info@beyonn.com. Include the page and the issue so the team can help." },
    ],
  },
};
