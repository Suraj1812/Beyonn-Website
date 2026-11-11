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

const quote = "Don't treat an airway without understanding the joint. Don't treat the joint without understanding the airway.";
const cite = "Dr. Rodney Willey, DDS, D.ACSDD, D.ASBA";
const book: Action = { label: "Book Your Discovery Call", href: "/qualify" };
const workshop: Action = { label: "Join a Workshop", href: "/workshop#register", variant: "ghost-light" };

const steps = {
  identify: ["Screens patients, takes new patient calls and books exams", "Screening tools, call scripts and checklists, the Patient App, Blueprint modules"],
  prepare: ["Registration, sleep study records, insurance verification and pre-service billing prep", "The Forms Center, Beyonn home sleep testing, the coding and documentation kit, the medical referral network kit, Blueprint modules"],
  treat: ["Exam, documentation, treatment plan presentation, ordering and delivering the Beyonn appliance", "Dr. Rodney Willey's protocols, presentation scripts, consent forms, case guidance, Blueprint modules"],
  manage: ["Claims, follow-up visits, no-shows, replacement appliances", "The Golden Tracker, a CRM with automated email, SMS and WhatsApp follow-up, the business dashboard, optional Billing Assist, Blueprint modules 3 and 10 to 12, ongoing coaching"],
};
const stepHead = ["Your team does", "Beyonn equips them with"];

export const pages: Record<string, ContentPage> = {
  "the-beyonn-system": {
    eyebrow: "The Beyonn Protocol™",
    title: "One system. Your team. Every case, start to finish.",
    description: "Most programs hand you knowledge and leave you to build the rest. Beyonn hands your team the rest: a defined workflow, step-by-step training, ready-made forms, the technology, and coaching that carry each OSA + TMD case from the first call to reimbursement.",
    seo: {
      title: "How the Beyonn System Works | OSA + TMD Program Your Team Runs",
      description: "See how Beyonn trains and equips your team to take every OSA + TMD case from the first call to reimbursement.",
      keywords: ["dental sleep medicine practice implementation", "management of TMD", "TMD in dentistry", "dental TMD"],
    },
    actions: [{ ...book, variant: "dawn" }],
    sections: [
      {
        eyebrow: "Why most OSA + TMD programs stall",
        title: "Knowing how to treat isn't the hard part.",
        body: [
          "Most practitioners who add OSA + TMD already have the clinical knowledge. What stops them is everything around the chair: medical documentation, insurance authorizations, billing codes, patient follow-up, and a front desk that was never trained for medical workflows.",
          "So the course certificate goes on the wall, a few cases start, and the program quietly stalls.",
        ],
        cards: [
          { title: "The medical paperwork.", text: "Dental teams are rarely trained for medical documentation and authorizations." },
          { title: "The billing.", text: "Medical claims work differently from dental, and one rejected claim kills momentum." },
          { title: "The one key employee.", text: "When the one person who understood the process leaves, so does the program." },
        ],
        lines: ["Beyonn trains your whole team to clear all three, and keeps the system in place when people change."],
      },
      {
        eyebrow: "At a glance",
        title: "Your team runs every step. Beyonn equips every step.",
        table: {
          head: ["", "Identify", "Prepare", "Treat", "Manage"],
          rows: [
            [stepHead[0], steps.identify[0], steps.prepare[0], steps.treat[0], steps.manage[0]],
            [stepHead[1], steps.identify[1], steps.prepare[1], steps.treat[1], steps.manage[1]],
          ],
          variant: "matrix",
        },
        lines: ["Beyonn never takes the work out of your practice. It gives your team the training, tools and coaching to do each step well."],
      },
      {
        id: "identify",
        eyebrow: "Step 1 — Identify",
        title: "Discover the opportunity already inside your practice.",
        body: "Patients who snore, clench, wake with headaches or have worn out their night guards are already on your schedule. Your team spots them with STOP-Bang screening and Beyonn's chair-side scripts, and the Beyonn Patient App lets patients check their Snore Score and book an exam. Beyonn's patient-awareness campaigns send more patients your way.",
        tagline: "Beyonn provides the structure. Your team starts the conversation.",
        table: { head: stepHead, rows: [steps.identify], variant: "compare" },
        image: "/assets/people/patient-conversation.webp",
        imageAlt: "Clinician speaking with a patient about their symptoms",
      },
      {
        id: "prepare",
        eyebrow: "Step 2 — Prepare",
        title: "Your team prepares every case, step by step.",
        body: "Your team orders a Beyonn home sleep test (interpreted by a physician) or gathers existing sleep studies, coordinates with the patient's physician using the referral network kit, verifies insurance and prepares the medical documentation, exactly as the Coaching Clinician Blueprint teaches.",
        tagline: "Ready-made forms. Clear steps. No guesswork.",
        table: { head: stepHead, rows: [steps.prepare], variant: "compare" },
      },
      {
        id: "treat",
        eyebrow: "Step 3 — Treat",
        title: "Your doctor remains the doctor.",
        body: "You perform the evaluation and deliver treatment. Your team presents the treatment plan using Beyonn's scripts. You don't need to know everything on day one: guidance on complex cases is part of your coaching.",
        tagline: "You provide clinical expertise. Beyonn provides the system around it.",
        table: { head: stepHead, rows: [steps.treat], variant: "compare" },
        image: "/assets/site/never-lose-a-yes.jpg",
        imageAlt: "Dr. Rodney Willey greeting a patient in a consultation room",
      },
      {
        id: "manage",
        eyebrow: "Step 4 — Manage",
        title: "Treatment isn't the end of the workflow.",
        body: "Your team follows each case through billing, follow-up visits and replacement appliances. The Golden Tracker shows where every case stands, so nothing stalls between \"yes\" and treatment. Partners who update it daily see the strongest results: it's the single most predictive habit in the program.",
        tagline: "From identification to reimbursement, the case stays connected.",
        table: { head: stepHead, rows: [steps.manage], variant: "compare" },
      },
      {
        eyebrow: "Why OSA and TMD are treated together",
        title: "OSA and TMD are married. The system treats them that way.",
        body: [
          "The airway, the jaw, the muscles, the joint, the bite, sleep and pain don't work in isolation. Treat the airway without the joint, or the joint without the airway, and part of the patient's problem goes unseen. Treated separately, they relapse. Treated together, they resolve.",
          "Every Beyonn protocol, script and workflow is built around both conditions from the first screening onward.",
        ],
        quote: { text: quote, cite },
      },
      {
        eyebrow: "What's included",
        title: "People. Process. Technology. Marketing. In one system.",
        body: "Software alone doesn't solve it. Training alone doesn't solve it. Marketing alone doesn't fill the chair. Beyonn brings all four together, so your team can run the program with confidence and patients can find you.",
        columns: [
          { title: "People", items: ["Dr. Rodney Willey: monthly coaching and study club", "Onboarding and support team to set you up and help you go live", "Guidance on complex cases, plus the Beyonn AI assistant around the clock", "Medical referral network kit"] },
          { title: "Process", items: ["The Beyonn Protocol: Identify, Prepare, Treat, Manage", "12 training modules", "Clinical protocols for OSA + TMD together", "The Forms Center, scripts and templates", "Coding and documentation kit"] },
          { title: "Technology", items: ["Beyonn Patient App", "Beyonn Academy, including the Beyonn LMS", "Beyonn Admin Panel: business dashboard, CRM and Golden Tracker", "Clinical video and case-study library", "Beyonn home sleep testing and the Beyonn appliance"] },
          { title: "Marketing & PR Suite", items: ["National patient-awareness campaigns that send patients to Beyonn providers", "Co-branded local marketing kits for your practice", "A listing in the Beyonn provider directory, with patients routed to you", "Patient education workbook"] },
        ],
        lines: ["Built so the program keeps running when a key employee leaves.", "You're the operator. Beyonn is the operating system."],
      },
      {
        eyebrow: "Why it works when courses don't",
        title: "Others sell information. Beyonn builds capability.",
        table: {
          head: ["A course gives you", "Beyonn gives your team"],
          rows: [
            ["Knowledge and a certificate", "A working program and the training to run it"],
            ["A binder and a video library", "A step-by-step Blueprint, ready-made forms and coaching"],
            ["A front desk guessing at medical workflows", "A front desk trained in every medical workflow"],
            ["A program that depends on one employee", "Standardized training any new hire can follow"],
            ["Theory designed in a classroom", "A system grown from Dr. Rodney Willey's 10,000+ appliances"],
          ],
          variant: "compare",
        },
        lines: ["You keep the program, the patients and the know-how. Beyonn makes sure your team can run it."],
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
    headline: "He doesn't teach from what he's read. He teaches from what he's done.",
    description: "For nearly two decades his practice has been devoted only to obstructive sleep apnea and temporomandibular disorders, one patient at a time.",
    photo: "/assets/people/rodney-hero.webp",
    photoAlt: "Dr. Rodney Willey",
    seo: {
      title: "Dr. Rodney Willey, DDS, D.ACSDD, D.ASBA | OSA + TMD Clinician | Beyonn",
      description: "Nearly two decades treating only OSA and TMD, with more than 10,000 oral appliances delivered. Meet the clinician behind Beyonn.",
      keywords: ["Dr. Rodney Willey", "Dr. Rodney Willey sleep apnea", "Dr. Rodney Willey dental sleep medicine"],
    },
    sections: [
      { eyebrow: "The founder’s story", title: "Why Dr. Willey started Beyonn", links: [{ label: "Watch the Beyonn introduction", href: "/team#about-beyonn" }] },
      { eyebrow: "Qualifications and experience", title: "The experience behind the approach", cards: [
        { title: "Clinical qualifications", text: "DDS, D.ACSDD, D.ASBA" },
        { title: "Dedicated practice", text: "Nearly 20 years focused on OSA and TMD care." },
        { title: "Experience in the chair", text: "More than 10,000 oral appliances delivered." },
      ] },

      {
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
          "At the centre of Dr. Rodney Willey's work is a principle earned in the chair: the airway, jaw, muscles, joints, bite, sleep, pain and function don't exist on their own. Treat the airway without understanding the temporomandibular system, or treat TMD without considering breathing and sleep, and a critical part of the patient's condition goes unrecognized.",
          "That principle shapes every Beyonn protocol.",
        ],
      },
      {
        eyebrow: "The cases textbooks skip",
        title: "When the textbook case becomes the complicated case, experience matters.",
        body: "Dr. Rodney Willey has treated patients whose histories go far beyond straightforward OSA or TMD. These are the patients who shaped his approach.",
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
        eyebrow: "The educator",
        title: "More than 10,000 opportunities to learn.",
        body: [
          "Every appliance was a chance to observe, adjust, troubleshoot and learn: why patients respond differently, why similar cases end differently, and where treatment can break down. He learned from the successful cases, and even more from the difficult ones.",
          "His teaching bridges the gap between clinical knowledge and clinical reality. It moves practitioners past \"What does the literature say?\" to the question that matters on Monday morning:",
        ],
        pull: "“What happens when this patient is sitting in my chair?”",
      },
      {
        eyebrow: "Why he built Beyonn",
        title: "Diplomas on the wall. No patients in the chair.",
        body: [
          "Again and again, Dr. Rodney Willey met practitioners who had trained in OSA and TMD and held the diplomas to prove it, yet had no traction in their practices. The knowledge was there. The infrastructure wasn't.",
          "Today he runs practices devoted only to OSA and TMD. Beyonn shares the systems, protocols and lessons from that high-volume care, and trains practice teams to run them in their own practices.",
        ],
        links: [{ label: "See how the Beyonn System works", href: "/the-beyonn-system" }],
        image: "/assets/site/never-lose-a-yes.jpg",
        imageAlt: "Dr. Rodney Willey with a patient in his practice",
      },
      {
        eyebrow: "His message to clinicians",
        dark: true,
        lines: ["Don't treat an airway without understanding the joint.", "Don't treat the joint without understanding the airway.", "And never allow a diagnosis to become more important than the person sitting in front of you."],
        body: "The measure of clinical knowledge isn't how well it's presented from a stage. It's how it changes a patient's life.",
      },
      { title: "From fellow clinicians", widget: "testimonials" },
    ],
    closing: {
      title: "Learn from the clinician who's done it 10,000 times.",
      actions: [{ label: "Join a Workshop", href: "/workshop#register", variant: "dawn" }, { ...book, variant: "ghost-light" }],
    },
  },

  team: {
    eyebrow: "The Beyonn Team",
    title: "Meet the team behind your team.",
    description: "Your team runs your OSA + TMD program. These are the people who train them, set them up and coach them until it runs with confidence.",
    photo: "/assets/people/clinic-team.webp",
    photoAlt: "The Beyonn team working together in a clinic",
    seo: {
      title: "Meet the Beyonn Team | Dental Sleep Medicine Support Team",
      description: "Meet the Beyonn team: the clinicians, trainers and onboarding specialists who equip partner practices to run their own OSA + TMD programs.",
      keywords: ["Beyonn team", "dental sleep medicine support team", "dental sleep medicine training", "sleep apnea training for dentists"],
    },
    sections: [
      { id: "about-beyonn", eyebrow: "About Beyonn", title: "Discover Beyonn", widget: "walkthrough-video" },
      {
        eyebrow: "Our mission",
        title: "We're here to define the future of OSA + TMD.",
        body: "Beyonn equips medical professionals with the tools, training and support to create real impact, reclaim time and freedom for their families, and build sustainable profit.",
      },
      {
        eyebrow: "Our values",
        title: "Our values",
        cards: [
          { label: "B", title: "Bold Vision", text: "We think boldly and lead with purpose, bringing innovation and lasting impact to providers, their teams and the profession." },
          { label: "E", title: "Excellence Always", text: "We pursue excellence in every detail, from clinical training to communication." },
          { label: "Y", title: "Yes to Growth", text: "We welcome learning, feedback and change, and keep striving to improve." },
          { label: "O", title: "Ownership Mindset", text: "We take full responsibility for our actions, outcomes and culture, with integrity and high standards." },
          { label: "N", title: "Next-Level Compassion", text: "We care deeply about people, listen well, serve fully and treat everyone with dignity." },
          { label: "N", title: "No One Does It Better", text: "We go beyond the standard to define the future of OSA + TMD." },
        ],
      },
      { eyebrow: "Our team", title: "The people behind your team.", widget: "team" },
    ],
    closing: { title: "Want this team behind your practice?", actions: [{ ...book, variant: "dawn" }] },
  },

  academy: {
    eyebrow: "Beyonn Academy",
    title: "Learn it. Run it. Get certified for it.",
    description: "Beyonn Academy trains your whole team, not just the doctor, to treat Obstructive Sleep Apnea and Temporomandibular Joint Disorder. Clinical learning, step-by-step team training and live coaching from Dr. Rodney Willey, in one place.",
    photo: "/assets/people/clinic-team.webp",
    photoAlt: "A practice team learning together",
    seo: {
      title: "Beyonn Academy | OSA + TMD Training for Dentists and Their Teams",
      description: "Beyonn Academy trains your whole team to treat Obstructive Sleep Apnea and Temporomandibular Joint Disorder: on-demand learning, the Coaching Clinician Blueprint, certification and live coaching with Dr. Rodney Willey.",
      keywords: ["sleep apnea training for dentists", "TMD training for dentists", "oral appliance therapy training", "dental sleep medicine training", "dental sleep medicine courses"],
    },
    actions: [{ ...book, variant: "dawn" }, workshop],
    sections: [
      {
        eyebrow: "More than a course",
        title: "Most courses end with a certificate. Ours ends with a program that runs.",
        body: "Knowing how to treat OSA + TMD is only half the job. The other half is the calls, the paperwork, the billing and the follow-up. Beyonn Academy teaches both, so what your team learns on Monday is in use by Friday.",
      },
      {
        eyebrow: "What's inside",
        title: "What's inside",
        cards: [
          { title: "Beyonn LMS", text: "One login for your whole team. On-demand clinical library, videos, case studies, short tests and proof of completion. Track each team member's progress." },
          { title: "The Coaching Clinician Blueprint", text: "12 step-by-step modules that train your team to run every part of the program." },
          { title: "The Forms Center", text: "Ready-made forms, scripts and templates for every step, from the first call to the yearly visit." },
          { title: "Live coaching", text: "Monthly study club and office hours with Dr. Rodney Willey, plus a peer community of Beyonn providers." },
          { title: "Beyonn AI assistant", text: "Answers your team's questions on protocols, billing and the platform around the clock, trained on Dr. Rodney Willey's content." },
        ],
      },
      {
        eyebrow: "The Coaching Clinician Blueprint",
        title: "12 modules. Every step your team takes.",
        columns: [
          { title: "Identify", items: ["101 New Patient Calls", "102 Registering a New Patient", "103 No-Show and Tickler Policy"] },
          { title: "Prepare", items: ["104 Understanding Sleep Studies (AHI and RDI)", "105 Pre-Service and Insurance Billing Prep", "109 Understanding Medical Necessity"] },
          { title: "Treat", items: ["106 New Patient Check-In", "107 New Patient Interview and Exam Documentation", "108 Treatment Planning, Preparation and Presentation"] },
          { title: "Manage", items: ["110 Production Planning", "111 Patient Lifecycle", "112 Replacement Appliance Planning"] },
        ],
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
      { eyebrow: "Get certified", title: "Your path from learning to leading.", widget: "ladder", dark: true },
      {
        eyebrow: "Learn from the clinician who built it",
        quote: { text: quote, cite },
        lines: ["Every lesson comes from nearly 20 years treating only OSA + TMD, and more than 10,000 oral appliances delivered."],
        links: [{ label: "Meet Dr. Rodney Willey", href: "/dr-rodney-willey" }],
      },
      { id: "faq", title: "FAQ", faq: academyFaq },
    ],
    closing: {
      title: "Your team can run an OSA + TMD program. Beyonn Academy shows them how.",
      actions: [{ ...book, variant: "dawn" }, workshop],
    },
  },

  global: {
    eyebrow: "Beyonn Global",
    title: "The Beyonn program, now beyond the United States.",
    description: "Obstructive Sleep Apnea and Temporomandibular Joint Disorder go unrecognized in dental chairs everywhere. Beyonn Global brings Dr. Rodney Willey's protocols, training and technology to practitioners around the world.",
    photo: "/assets/people/clinic-team.webp",
    photoAlt: "A dental practice team",
    seo: {
      title: "Beyonn Global | OSA + TMD Program for Practices Worldwide",
      description: "Beyonn Global brings Dr. Rodney Willey's OSA + TMD protocols, training and technology to dental practices outside the United States.",
      keywords: ["dental sleep medicine", "sleep apnea training for dentists", "TMD training for dentists"],
    },
    actions: [{ label: "Register Your Interest", href: "#register", variant: "dawn" }, { label: "Join an International Workshop", href: "/workshop#register", variant: "ghost-light" }],
    sections: [
      {
        eyebrow: "Why Beyonn Global",
        title: "Every country has the patients. Now every country can have the program.",
        body: "Practitioners worldwide see the same patients: snorers, clenchers, failed night guards. And many face the same problem: trained in OSA and TMD, but without a system to run it. Beyonn Global gives them that system, adapted to how care works in their country.",
      },
      {
        eyebrow: "What international partners get",
        title: "What international partners get",
        cards: [
          { title: "The Coaching Clinician Blueprint", text: "12 training modules that teach your team to run the program." },
          { title: "Beyonn Academy, including the Beyonn LMS", text: "All training, clinical videos and the Forms Center, online and on demand." },
          { title: "Beyonn Patient App and Admin Panel", text: "The same operating system US partners use, including the business dashboard, CRM and Beyonn AI assistant." },
          { title: "Coaching with Dr. Rodney Willey", text: "Monthly expert coaching and study club, online." },
          { title: "Local adaptation", text: "Workflows, forms and patient materials adjusted for your country's regulations and payment models." },
        ],
      },
      {
        eyebrow: "How it works",
        title: "How it works",
        steps: [
          { title: "Join an international workshop.", text: "Live sessions scheduled for time zones outside the US." },
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
    title: "The Fastest Way to Launch a Medically Billable OSA + TMD Service Line",
    description: "Team training, connected workflows and ongoing clinical and operational support, so your practice grows from day one.",
    heroLine: "You run the practice. Beyonn powers the program.",
    photo: "/assets/people/patient-handshake.webp",
    photoAlt: "Clinician greeting a patient",
    seo: {
      title: "Sleep Apnea Training for Dentists and Their Teams | Become a Beyonn Partner",
      description: "More than sleep apnea and TMD training for dentists. Become a Beyonn Network Partner and get the team training, workflows, technology and coaching to run an OSA + TMD treatment program.",
      keywords: ["sleep apnea training for dentists", "TMD training for dentists", "oral appliance therapy training", "dental sleep medicine practice support"],
    },
    actions: [{ label: "Book Your Discovery Call", href: "#book", variant: "dawn" }, workshop],
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
          { title: "Sleep Apnea + TMD Training", text: "On-demand protocols, clinical videos, case studies and oral appliance therapy training for dentists and staff." },
          { title: "The Coaching Clinician Blueprint", text: "Convert more consultations into treatment. 12 modules plus templates for patient calls, case prep, presentation and follow-up." },
          { title: "Ongoing Support", text: "Never face a complex case alone. Monthly coaching, study club and treatment-planning help." },
          { title: "Staff Onboarding System", text: "Train new hires fast. Online, on-site or hybrid, built to survive turnover." },
          { title: "Beyonn Technology System", text: "Run your whole program in one place. Training, patient communication and case tracking via the Patient App, Academy and Admin Panel." },
          { title: "Beyonn AI Assistant", text: "24/7 answers on protocols, billing and the platform, trained on Dr. Rodney Willey’s content." },
          { title: "Coding + Documentation Kit", text: "Get paid for your care. CPT/ICD-10 crosswalks, medical-necessity letters, appeal templates and payer rules. Optional Billing Assist." },
          { title: "Sleep Testing + the Beyonn Appliance", text: "Screen, test and treat in one platform. STOP-Bang, physician-read home sleep tests and the Beyonn appliance." },
          { title: "Medical Referral Network Kit", text: "Build referral pipelines with sleep physicians, ENTs, cardiologists and primary care." },
          { title: "Patients Sent Your Way", text: "Fill your schedule with national campaigns, co-branded local kits and a provider directory listing." },
          { title: "Financing", text: "Make yes easier. Practice and patient financing, covered on your Discovery Call." },
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
      { eyebrow: "What partners say", title: "What partners say", widget: "testimonials" },
      { id: "faq", title: "FAQ", faq: partnerFaq },
    ],
    closing: { id: "book", title: "One conversation. A clear answer on fit.", form: "partner" },
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
        image: "/assets/people/clinic-team.webp",
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
        eyebrow: "Find a Beyonn provider",
        title: "Find an OSA & TMD Specialist Near You",
        body: "The Beyonn team connects you with the nearest OSA specialist or OSA clinic.",
        widget: "referral-form",
      },
      { title: "OSA and TMD, explained", widget: "patient-video" },
      { title: "Patient experiences", widget: "patient-stories" },
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
    title: "From the first question to the yearly visit, in your patient's pocket.",
    description: "The app helps patients check their Snore Score and Sleep Score, book an exam at a Beyonn practice, get ready for it, and keep wearing their appliance. It's built around two goals: every visitor books an exam, and every patient stays on treatment.",
    seo: {
      title: "Beyonn Patient App | Snore Score, Sleep Score, Exam Booking & Treatment Tracking",
      description: "The Beyonn Patient App takes patients from a Snore Score to a booked exam, a fitted appliance and a yearly visit, with the practice's team and the Beyonn system behind every step.",
      keywords: ["oral appliance therapy", "sleep apnea symptoms", "OSA therapy", "TMD treatment"],
    },
    actions: [{ label: "See What It Does for Your Practice", href: "#practice", variant: "dawn" }, { label: "Download the App", href: "#download", variant: "ghost-light" }],
    sections: [
      { title: "A closer look at the app", widget: "app-preview" },
      { id: "quick-check", title: "Start with an awareness check", widget: "quick-check" },

      {
        id: "practice",
        eyebrow: "What it does for your practice",
        title: "It solves your biggest gap: finding patients.",
        table: {
          head: ["Feature", "What it means for your practice"],
          rows: [
            ["OSA + TMD pre-assessments, Snore Score and a quick sleep-risk check", "Patients recognise their own risk, so more of them raise their hand"],
            ["Sleep data from wearables: rings, watches, Apple Health and Google Health", "Objective data starts the conversation and proves improvement"],
            ["Connects patients to the nearest Beyonn Network Partner", "Warm, pre-screened patients arrive at your practice"],
            ["A QR code at your front desk; patients pick a real time from your open slots", "Patients book from your chair, with less phone tag for your team"],
            ["Reminders and a visit explained by Dr. Rodney Willey", "Fewer no-shows"],
            ["Education, reminders and the treatment journey, with a daily check-in through the first weeks", "Better appliance use, fewer drop-outs, happier patients"],
            ["A referral engine: patients share the app with family and friends", "More patients, referred by people who've already benefited"],
            ["Visits and case status appear in your Beyonn Admin Panel", "You see every patient in one place"],
          ],
          variant: "arrow",
        },
      },
      {
        id: "journey",
        eyebrow: "The patient's journey",
        title: "Every step, explained before it happens.",
        steps: [
          { title: "Get your Snore Score.", text: "Dr. Rodney Willey's own questions, with a view from the person who shares your room." },
          { title: "Book an exam near you.", text: "Pick a real time at a Beyonn practice. The practice calls to confirm." },
          { title: "Get ready.", text: "Dr. Rodney Willey explains the visit, what to bring and what happens next." },
          { title: "Exam day and your plan.", text: "Your exam at the practice, then your treatment plan explained by your provider's team." },
          { title: "Sleep study and insurance approval.", text: "Done at home or in a lab, read by a board-certified sleep doctor. Your provider's team handles the insurance approval." },
          { title: "Your appliance.", text: "Fitting, a simple daily adjustment, and daily care." },
          { title: "The first weeks.", text: "One quick question each morning to keep you on track." },
          { title: "Progress and the long run.", text: "Your Sleep Score over time (connect a wearable if you have one), your visits and the yearly check." },
        ],
        aside: {
          title: "More paths",
          items: [
            "For TMD: a daily log and a weekly jaw check, without a sleep study when TMD is the only concern.",
            "For the person who shares your room: a brief check-in about snoring. The check-in link will be available when the app launches.",
            "For family and friends: patients who are sleeping better can share the app in a tap, so the people they care about can check their own Snore Score.",
          ],
        },
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
      { id: "download", eyebrow: "Download", title: "Better sleep and an easier jaw, starting with an exam near you.", widget: "app-download", dark: true },
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
    description: "One conversation about your patients, team, goals and the support you need to run OSA + TMD care.",
    actions: [{ label: "Book a Discovery Call", href: "#book", variant: "dawn" }],
    sections: [
      { eyebrow: "What to expect", title: "A useful conversation, not a sales maze.", points: ["Tell the Beyonn team about your practice and team.", "Discuss the OSA + TMD patients you already see.", "Review training, systems and operational support options.", "Leave with a clear answer about next steps and fit."] },
      { id: "book", eyebrow: "Book now", title: "Schedule a Discovery Call", widget: "discovery-booking" },
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
