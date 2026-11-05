/**
 * Blogs and resources (home §12). Topics come from the content doc; body copy is
 * drawn from the doc's own positions. CONFIRM: clinician review before launch.
 */
export type Article = {
  slug: string;
  title: string;
  audience: "practitioners" | "patients";
  excerpt: string;
  minutes: number;
  keywords: string[];
  body: { h?: string; p: string[]; list?: string[] }[];
};

export const articles: Article[] = [
  {
    slug: "why-osa-and-tmd-should-be-treated-together",
    title: "Why OSA and TMD should be treated together",
    audience: "practitioners",
    excerpt: "The airway, the jaw, the muscles, the joint, the bite, sleep and pain don't work in isolation. Treated separately, they relapse. Treated together, they resolve.",
    minutes: 5,
    keywords: ["dental sleep medicine", "management of TMD", "TMD in dentistry"],
    body: [
      {
        p: [
          "Obstructive Sleep Apnea and Temporomandibular Joint Disorder are usually taught as two subjects, referred to two specialists and documented in two different charts. In the patient, they are rarely that separate.",
          "Clenching and grinding at night can be the body's way of keeping a collapsing airway open. A jaw that is repositioned to open the airway changes the load on the joint and the muscles. Treat one without understanding the other, and part of the patient's problem goes unseen.",
        ],
      },
      {
        h: "Where single-condition care breaks down",
        p: ["Practitioners who treat only one side of the problem tend to see the same patterns:"],
        list: [
          "A night guard that protects the teeth but doesn't settle the headaches, because the clenching was airway-driven.",
          "An oral appliance that opens the airway but aggravates an unstable joint, so the patient stops wearing it.",
          "A patient who is told their scans look fine, while they still wake exhausted with a sore jaw.",
        ],
      },
      {
        h: "What treating them together looks like",
        p: [
          "It starts at the first screening. STOP-Bang screening and questions about snoring, daytime tiredness and morning headaches sit next to questions about jaw pain, clicking, locking and failed night guards. The exam looks at the airway and the temporomandibular system in the same visit.",
          "Treatment planning considers both. Appliance design, adjustments and follow-up are judged against airway outcomes and joint comfort, and a follow-up sleep test confirms the airway result.",
          "As Dr. Rodney Willey puts it: “Don't treat an airway without understanding the joint. Don't treat the joint without understanding the airway.”",
        ],
      },
      {
        h: "Building it into your practice",
        p: [
          "Every Beyonn protocol, script and workflow is built around both conditions from the first screening onward, so your team doesn't have to remember to connect them: the forms already do.",
        ],
      },
    ],
  },
  {
    slug: "sleep-apnea-training-for-dentists-what-most-courses-leave-out",
    title: "Sleep apnea training for dentists: what most courses leave out",
    audience: "practitioners",
    excerpt: "Knowing how to treat isn't the hard part. What stops most programs is everything around the chair.",
    minutes: 6,
    keywords: ["sleep apnea training for dentists", "sleep apnea courses for dentists", "dental sleep medicine training"],
    body: [
      {
        p: [
          "Most sleep apnea courses for dentists do what they promise: they teach the clinical knowledge. Many practitioners finish them able to screen, read a sleep study and fit an oral appliance.",
          "And yet a familiar pattern follows. The certificate goes on the wall, a few cases start, and the program quietly stalls.",
        ],
      },
      {
        h: "The three stall points",
        p: ["In our experience, programs rarely stop for clinical reasons. They stop at one of three places:"],
        list: [
          "The medical paperwork. Dental teams are rarely trained for medical documentation and authorizations.",
          "The billing. Medical claims work differently from dental, and one rejected claim kills momentum.",
          "The one key employee. When the one person who understood the process leaves, so does the program.",
        ],
      },
      {
        h: "What to look for in training",
        p: ["If you're comparing programs, ask whether the training covers the whole team, not just the doctor:"],
        list: [
          "Front desk: new patient calls, registration, scheduling and no-show follow-up.",
          "Clinical team: check-in, records, impressions, delivery and follow-up visits.",
          "Billing team: medical insurance, pre-service prep, medical necessity and claims.",
          "A way for new hires to learn the system the same way as the person they replace.",
        ],
      },
      {
        h: "Information versus capability",
        p: [
          "A course gives you knowledge and a certificate. A program gives your team the step-by-step training, ready-made forms and coaching to run every case from the first call to reimbursement.",
          "That difference is why Beyonn trains your whole team through the twelve modules of the Coaching Clinician Blueprint, and keeps coaching until the program runs on its own.",
        ],
      },
    ],
  },
  {
    slug: "how-medical-billing-for-oral-appliance-therapy-works",
    title: "How medical billing for oral appliance therapy works",
    audience: "practitioners",
    excerpt: "OSA care is billed to medical insurance, not dental. Here is the workflow your team needs, in plain steps.",
    minutes: 6,
    keywords: ["oral appliance therapy training", "dental sleep medicine practice support"],
    body: [
      {
        p: [
          "Oral appliance therapy for obstructive sleep apnea is generally billed to the patient's medical insurance. For a dental team used to dental benefits, that is the single biggest change, and the most common reason programs stall.",
        ],
      },
      {
        h: "The workflow, step by step",
        p: ["A predictable medical billing process usually follows the same sequence:"],
        list: [
          "Registration: collecting medical insurance details, not just dental, at the first contact.",
          "Sleep study records: a diagnosis from a physician, often after a home sleep test interpreted by a physician.",
          "Pre-service verification: checking benefits and prior-authorization requirements before treatment.",
          "Medical necessity: documenting why treatment is needed, with letters that match payer rules.",
          "Coding: using the right CPT and ICD-10 codes for the diagnosis and the device.",
          "Claims and follow-up: submitting, tracking and, when needed, appealing.",
        ],
      },
      {
        h: "Where teams get stuck",
        p: [
          "Missing documentation, mismatched codes and authorizations that lapse before delivery are the usual culprits. Each is preventable with a checklist and a template for the step.",
        ],
      },
      {
        h: "How Beyonn equips your team",
        p: [
          "The Blueprint trains your team in pre-service billing prep, medical necessity and claims, step by step. The coding and documentation kit provides CPT/ICD-10 crosswalks, medical-necessity letters, appeal templates and a payer rules library. The claim dashboard shows where every claim stands, and optional Billing Assist is there if you'd like a hand.",
          "This article is general information, not billing or legal advice. Payer rules vary; always confirm requirements with each payer.",
        ],
      },
    ],
  },
  {
    slug: "what-is-obstructive-sleep-apnea",
    title: "What is obstructive sleep apnea?",
    audience: "patients",
    excerpt: "OSA happens when the airway narrows or closes during sleep. Many people live with it for years without knowing.",
    minutes: 4,
    keywords: ["sleep apnea symptoms", "OSA treatment", "OSA therapy"],
    body: [
      {
        p: [
          "Obstructive sleep apnea (OSA) happens when the airway narrows or closes during sleep. Breathing becomes shallow or stops for a moment, the brain briefly wakes you to reopen it, and the cycle repeats, often many times an hour.",
          "Most people don't remember waking. They just feel tired, no matter how long they were in bed. About 80% of people with sleep apnea don't know they have it.",
        ],
      },
      {
        h: "Common signs",
        p: [],
        list: [
          "Loud, frequent snoring",
          "Pauses in breathing or gasping during sleep, often noticed by a partner",
          "Waking up tired after a full night in bed",
          "Morning headaches",
          "Daytime sleepiness or trouble concentrating",
          "Waking often to use the bathroom at night",
        ],
      },
      {
        h: "Why it matters",
        p: [
          "Sleep apnea is more than snoring. Left untreated, it's linked to high blood pressure, heart problems, stroke, diabetes, weight gain, low mood and memory problems, and drowsy driving.",
        ],
      },
      {
        h: "The good news",
        p: [
          "It's very treatable. A simple screening, an exam and the right care can help you sleep, breathe and feel better. Sleep apnea is diagnosed by a physician, usually after a sleep study, and many Beyonn providers can arrange a home sleep test so you can sleep in your own bed.",
          "This article is for general education and is not medical advice. Always speak with a qualified provider about your symptoms.",
        ],
      },
    ],
  },
  {
    slug: "tmj-vs-tmd-whats-the-difference",
    title: "TMJ vs. TMD: what's the difference?",
    audience: "patients",
    excerpt: "TMJ is the joint. TMD is the problem. Here's what the terms mean, and the signs worth getting checked.",
    minutes: 3,
    keywords: ["TMD temporomandibular disorder", "TM joint treatment", "TMD relief"],
    body: [
      {
        p: [
          "You'll hear both terms, often used as if they mean the same thing. They don't, quite.",
          "TMJ stands for the temporomandibular joint: the joint on each side of your face, just in front of your ear, that lets your jaw open, close and move side to side. Everyone has two.",
          "TMD stands for temporomandibular disorder: problems with those joints and the muscles that move them.",
        ],
      },
      {
        h: "Signs of TMD",
        p: [],
        list: [
          "Jaw pain or tenderness, especially in the morning",
          "Clicking, popping or locking of the jaw",
          "Teeth pain, worn teeth, or clenching and grinding",
          "Headaches, earaches or neck pain",
          "A night guard that hasn't solved the problem",
        ],
      },
      {
        h: "The sleep connection",
        p: [
          "Clenching and grinding at night can be the body's way of keeping the airway open. That's why Beyonn providers look at your jaw and your airway together, rather than treating one and missing the other.",
          "Many people find TMD relief through non-surgical care, which may include appliances, muscle therapy and bite care. Your provider will explain your options.",
          "This article is for general education and is not medical advice.",
        ],
      },
    ],
  },
  {
    slug: "how-an-oral-appliance-works",
    title: "How an oral appliance works",
    audience: "patients",
    excerpt: "A custom-fitted device worn at night that helps keep the airway open. A common option for people who can't tolerate CPAP.",
    minutes: 4,
    keywords: ["oral appliance therapy", "OSA therapy", "CPAP alternative"],
    body: [
      {
        p: [
          "An oral appliance is a custom-fitted device, a little like a sports mouthguard, that you wear while you sleep. It gently holds your lower jaw slightly forward, which helps keep the airway open.",
          "For many people it's an alternative to CPAP, especially those who tried CPAP and couldn't stick with it. Your provider and physician will decide what's right for you.",
        ],
      },
      {
        h: "Your journey, step by step",
        p: [],
        list: [
          "Check: take the free Snore Score in the Beyonn Patient App. It takes about a minute.",
          "Consultation: an exam of your airway and your jaw.",
          "Sleep test: often done at home in your own bed, read by a physician.",
          "Custom appliance: made to fit your mouth, worn while you sleep.",
          "Adjustments: small, simple adjustments over the first weeks until it feels right and works well.",
          "Follow-up sleep test: to confirm your treatment is working, then regular check-ins.",
        ],
      },
      {
        h: "Insurance",
        p: [
          "Medical treatment for sleep apnea is often covered by medical insurance, not dental. Your provider's team checks your benefits for you, and many providers offer patient financing.",
          "This article is for general education and is not medical advice.",
        ],
      },
    ],
  },
];

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);
