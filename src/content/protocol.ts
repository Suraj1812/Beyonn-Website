export const protocolSteps = [
  {
    key: "identify",
    name: "Identify",
    short: "Your team spots the right patients with STOP-Bang screening, chair-side scripts and the Beyonn Patient App's Snore Score.",
    teamDoes: "Screens patients, takes new patient calls and books exams",
    beyonnGives: "Screening tools, call scripts and checklists, the Patient App, Blueprint modules",
  },
  {
    key: "prepare",
    name: "Prepare",
    short: "Your team orders a Beyonn home sleep test, gathers records and gets insurance approval, using Beyonn forms and the coding kit.",
    teamDoes: "Registration, sleep study records, insurance verification and pre-service billing prep",
    beyonnGives: "The Forms Center, Beyonn home sleep testing, the coding and documentation kit, the medical referral network kit, Blueprint modules",
  },
  {
    key: "treat",
    name: "Treat",
    short: "You treat, with Dr. Rodney Willey's protocols and case support behind you.",
    teamDoes: "Exam, documentation, treatment plan presentation, ordering and delivering the Beyonn appliance",
    beyonnGives: "Dr. Rodney Willey's protocols, presentation scripts, consent forms, case guidance, Blueprint modules",
  },
  {
    key: "manage",
    name: "Manage",
    short: "Your team follows every case to payment and the yearly check in the Golden Tracker, so no “yes” is ever lost.",
    teamDoes: "Claims, follow-up visits, no-shows, replacement appliances",
    beyonnGives: "The Golden Tracker, a CRM with automated email, SMS and WhatsApp follow-up, the business dashboard, optional Billing Assist, Blueprint modules 3 and 10 to 12, ongoing coaching",
  },
] as const;

export const blueprintModules = [
  "New patient calls",
  "Registering a new patient",
  "No-shows and follow-up",
  "Understanding sleep studies (AHI and RDI)",
  "Pre-service and insurance billing prep",
  "New patient check-in",
  "Interview and exam documentation",
  "Treatment planning and presentation",
  "Understanding medical necessity",
  "Production planning",
  "The patient lifecycle, from consent to delivery and follow-up",
  "Replacement appliance planning",
];

/** Academy view: modules grouped by protocol step, with catalogue numbers. */
export const blueprintByStep = [
  { step: "Identify", modules: [["101", "New Patient Calls"], ["102", "Registering a New Patient"], ["103", "No-Show and Tickler Policy"]] },
  { step: "Prepare", modules: [["104", "Understanding Sleep Studies (AHI and RDI)"], ["105", "Pre-Service and Insurance Billing Prep"], ["109", "Understanding Medical Necessity"]] },
  { step: "Treat", modules: [["106", "New Patient Check-In"], ["107", "New Patient Interview and Exam Documentation"], ["108", "Treatment Planning, Preparation and Presentation"]] },
  { step: "Manage", modules: [["110", "Production Planning"], ["111", "Patient Lifecycle"], ["112", "Replacement Appliance Planning"]] },
] as const;
