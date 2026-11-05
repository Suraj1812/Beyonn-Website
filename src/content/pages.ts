export type PageSection = {
  id?: string;
  eyebrow?: string;
  title: string;
  body?: string;
  points?: string[];
  image?: string;
  imageAlt?: string;
};

export type ContentPage = {
  eyebrow: string;
  title: string;
  description: string;
  photo?: string;
  photoAlt?: string;
  sections: PageSection[];
  cta?: { label: string; href: string };
};

export const pages: Record<string, ContentPage> = {
  "the-beyonn-system": {
    eyebrow: "The Beyonn Protocol",
    title: "One system. Your team. Every case, start to finish.",
    description: "A defined OSA + TMD workflow, team training, ready-made forms and clinical coaching connect every case from the first call to follow-up.",
    sections: [
      { eyebrow: "The gap", title: "Knowing how to treat isn't the hard part.", body: "Programs stall around the chair: medical documentation, insurance authorizations, billing, patient follow-up and a front desk never trained for medical workflows.", points: ["The medical paperwork", "The billing", "The one key employee who knows the process"] },
      { eyebrow: "The workflow", title: "Identify. Prepare. Treat. Manage.", body: "Your team runs every step. Beyonn equips each one with the Coaching Clinician Blueprint, forms, software and guidance.", points: ["Identify: spot the patients already in your practice with screening and scripts.", "Prepare: gather the sleep study, records and insurance approval.", "Treat: evaluate and deliver treatment with Dr. Willey's protocols behind you.", "Manage: follow each case through claims, visits and yearly check-ins."] },
      { eyebrow: "Clinical philosophy", title: "The airway and jaw belong in the same conversation.", body: "Beyonn's screening, exam and treatment workflow looks at OSA and TMD together, so neither condition is overlooked.", image: "/assets/people/patient-conversation.webp", imageAlt: "Clinician speaking with a patient" },
      { eyebrow: "Inside the system", title: "People, process and technology in one place.", body: "The Academy and 12-module Blueprint train the whole team. The Forms Center, coding kit, Golden Tracker, patient app and provider directory support the work around care. Coaching and case guidance connect it back to the clinic.", points: ["Clinical protocols and complex-case guidance", "Practice onboarding and staff training", "Medical documentation and billing support", "Patient education and practice marketing"] },
    ],
    cta: { label: "Discuss your practice", href: "/qualify" },
  },
  academy: {
    eyebrow: "Beyonn Academy",
    title: "Learn it. Run it. Get certified for it.",
    description: "Clinical learning, step-by-step team training and live coaching from Dr. Rodney Willey, designed for the whole practice.",
    photo: "/assets/people/clinic-team.webp",
    photoAlt: "Clinicians collaborating in a healthcare practice",
    sections: [
      { eyebrow: "More than a course", title: "Learning that reaches the front desk.", body: "Knowing OSA + TMD care is only half the job. The other half is calls, paperwork, billing and follow-up. Beyonn Academy teaches doctors and staff to run both sides together.", image: "/assets/site/platform-platform.png", imageAlt: "Beyonn LMS lesson: a video module with learning resources" },
      { eyebrow: "What's inside", title: "One learning system for your whole team.", points: ["Beyonn LMS: on-demand clinical videos, case studies, tests and progress tracking.", "Coaching Clinician Blueprint: 12 modules from first call to replacement planning.", "Forms Center: scripts, forms and templates for the patient journey.", "Monthly coaching and study club with Dr. Willey.", "Beyonn AI assistant for protocol and platform questions."] },
      { eyebrow: "The Blueprint", title: "Twelve modules. Four stages.", points: ["Identify — new patient calls, registration, no-show follow-up.", "Prepare — sleep studies, pre-service insurance work, medical necessity.", "Treat — check-in, exam documentation and treatment presentation.", "Manage — production, patient lifecycle and replacement appliances."] },
      { eyebrow: "Who learns", title: "A role for every person in the practice.", points: ["Doctors: clinical protocols and complex cases.", "Front desk: calls, registration and scheduling.", "Clinical team: records, impressions, delivery and follow-up.", "Billing team: medical insurance, necessity and claims."] },
    ],
    cta: { label: "Explore partnership", href: "/partner" },
  },
  partner: {
    eyebrow: "Become a Beyonn Network Partner",
    title: "Build an OSA + TMD program your practice can own.",
    description: "Train your team, connect your workflow and choose the level of operational support that fits your practice.",
    photo: "/assets/people/patient-handshake.webp",
    photoAlt: "Clinician greeting a patient",
    sections: [
      { eyebrow: "Who it's for", title: "Built for practitioners ready to act.", body: "Beyonn works with dental practitioners, ENTs and nurse practitioners who see snoring, clenching, jaw pain and failed night guards in their patients—and want their team involved in a lasting program.", image: "/assets/site/who-is-beyonn-for.png", imageAlt: "Dr. Rodney Willey reviewing a tablet with a team member" },
      { eyebrow: "What you get", title: "The clinical and operational pieces, connected.", points: ["Dr. Willey's OSA + TMD protocols and case guidance.", "12-module Coaching Clinician Blueprint and the Beyonn LMS.", "Forms, scripts, coding and documentation resources.", "Onboarding, coaching and study club.", "Golden Tracker, patient app and provider directory.", "Patient education and co-branded marketing resources."] },
      { eyebrow: "Support options", title: "A program shaped around your team.", body: "The current Beyonn site describes Done-for-You operational support and a PR & Marketing Suite. The new content brief also describes a team-run Done-By-You model. A Discovery Call clarifies which support and services are available for your practice.", points: ["Done-for-You: Beyonn's team helps carry operational work.", "Team-run: your team follows the Blueprint and uses Beyonn's tools and coaching.", "PR & Marketing Suite: patient education and practice growth assets."] },
      { eyebrow: "Your path", title: "From first conversation to a running program.", points: ["Attend a free workshop.", "Book a Discovery Call and review fit.", "Complete training and certification.", "Go live with team onboarding and ongoing coaching.", "Grow from Certified Provider to Advanced Provider and Centre of Excellence."] },
    ],
    cta: { label: "Schedule a Discovery Call", href: "/qualify" },
  },
  global: {
    eyebrow: "Beyonn Global",
    title: "The Beyonn program, beyond the United States.",
    description: "OSA + TMD training, protocols and technology for practices building better care across borders.",
    photo: "/assets/people/clinic-team.webp",
    photoAlt: "Healthcare team in a clinical practice",
    sections: [
      { eyebrow: "Why global", title: "The patients are everywhere.", body: "Practitioners worldwide see the same signs: snoring, clenching and night guards that did not solve the problem. Beyonn gives teams a repeatable system, adapted to their local care setting.", image: "/assets/site/platform-coaching.png", imageAlt: "Live online coaching session on the Beyonn platform" },
      { eyebrow: "Program", title: "A connected learning and care system.", points: ["Twelve-module Coaching Clinician Blueprint.", "Online Academy, clinical videos and Forms Center.", "Patient app and practice management tools.", "Remote coaching with Dr. Willey.", "Local adaptation of workflows, forms and patient materials."] },
      { eyebrow: "Getting started", title: "Explore availability in your country.", body: "Country availability, language support and local clinical rules vary. Tell the Beyonn team where you practice and they can discuss the current rollout and fit.", points: ["International workshop or introductory conversation.", "Discovery Call covering country, practice and goals.", "Local adaptation and team onboarding.", "Launch with ongoing training and coaching."] },
    ],
    cta: { label: "Ask about your country", href: "mailto:info@beyonn.com?subject=Beyonn%20Global%20interest" },
  },
  "dr-rodney-willey": {
    eyebrow: "Clinician · Educator · Founder",
    title: "Dr. Rodney Willey",
    description: "Nearly two decades focused on OSA and TMD. The clinical experience behind the Beyonn system.",
    photo: "/assets/people/rodney-hero.webp",
    photoAlt: "Dr. Rodney Willey",
    sections: [
      { eyebrow: "Clinical philosophy", title: "OSA and TMD are married.", body: "The airway, jaw, muscles, joints, bite, sleep, pain and function do not exist in isolation. Dr. Willey's work treats the person in the chair, with both conditions in view." },
      { eyebrow: "Experience", title: "The cases textbooks skip.", body: "His practice has included patients with complex histories, disability, chronic pain and previous unsuccessful care. Those cases shaped the protocols he teaches today.", points: ["More than 10,000 oral appliances delivered in the United States.", "Nearly two decades of practice devoted to OSA and TMD.", "Clinical guidance on difficult cases for partner practices."] },
      { eyebrow: "Why Beyonn", title: "Clinical knowledge needed an operating system.", body: "Dr. Willey met practitioners who had trained in OSA and TMD but struggled to start a working program. Beyonn shares the workflows, lessons and team training developed in his own practices.", image: "/assets/people/rodney-hero.webp", imageAlt: "Portrait of Dr. Rodney Willey" },
      { eyebrow: "His message", title: "Put the patient before the diagnosis.", body: "Don't treat an airway without understanding the joint. Don't treat the joint without understanding the airway. And never allow a diagnosis to become more important than the person sitting in front of you." },
    ],
    cta: { label: "Explore the system", href: "/the-beyonn-system" },
  },
  team: {
    eyebrow: "The Beyonn Team",
    title: "Meet the team behind your team.",
    description: "The clinicians, trainers and support specialists who help partner practices run OSA + TMD care with confidence.",
    photo: "/assets/people/clinic-team.webp",
    photoAlt: "Healthcare team working together",
    sections: [
      { eyebrow: "Our mission", title: "Define the future of OSA + TMD.", body: "Beyonn equips medical professionals with tools, training and support to create impact, reclaim time and build sustainable practices.", image: "/assets/people/clinic-team.webp", imageAlt: "Clinical team collaborating" },
      { eyebrow: "Values", title: "Bold vision. Excellence. Growth. Ownership. Compassion.", body: "Beyonn's six values spell its name: Bold Vision, Excellence Always, Yes to Growth, Ownership Mindset, Next-Level Compassion and No One Does It Better." },
    ],
    cta: { label: "Meet Dr. Willey", href: "/dr-rodney-willey" },
  },
  patients: {
    eyebrow: "For Patients",
    title: "Snoring, jaw pain, morning headaches?",
    description: "They may be connected. Learn the signs of sleep apnea and TMD, then find the right clinician to discuss your symptoms.",
    photo: "/assets/people/patient-conversation.webp",
    photoAlt: "Clinician speaking with a patient",
    sections: [
      { id: "symptoms", eyebrow: "Sleep", title: "Common sleep apnea symptoms.", body: "Obstructive sleep apnea happens when the airway narrows or closes during sleep. A physician can diagnose it after a sleep study.", points: ["Loud, frequent snoring or gasping during sleep.", "Waking tired after a full night in bed.", "Morning headaches or daytime sleepiness.", "Trouble concentrating or frequent nighttime bathroom visits."] },
      { eyebrow: "Jaw", title: "What TMD can feel like.", body: "Temporomandibular disorder affects the jaw joints and the muscles that move them.", points: ["Jaw pain or tenderness, especially in the morning.", "Clicking, popping or locking when opening or chewing.", "Clenching, grinding, worn teeth or persistent headaches.", "A night guard that has not solved the problem."] },
      { eyebrow: "The connection", title: "Your airway and jaw work as a team.", body: "Clenching and grinding at night can be connected with breathing problems during sleep. A Beyonn provider looks at both the airway and jaw rather than discussing each symptom separately.", image: "/assets/people/patient-conversation.webp", imageAlt: "Clinician discussing treatment with a patient" },
      { id: "treatment", eyebrow: "Care options", title: "Diagnosis first. Treatment built around you.", points: ["A physician diagnoses sleep apnea, often after a home sleep test.", "A custom oral appliance can be an option for some people who cannot tolerate CPAP.", "TMD care may involve appliances, muscle therapy or bite care.", "Your care team can review medical insurance benefits and treatment options."] },
      { eyebrow: "Your journey", title: "From first check to follow-up.", points: ["Speak to a provider about your symptoms and have an exam.", "Complete a sleep study if needed, interpreted by a physician.", "Review a treatment plan and receive a fitted appliance if appropriate.", "Return for adjustments, follow-up testing and regular check-ins."] },
    ],
    cta: { label: "Find a provider", href: "/patients/find-a-provider" },
  },
  "patients/find-a-provider": {
    eyebrow: "Find a Provider",
    title: "Find the right conversation near you.",
    description: "Beyonn Network Partners focus on the connection between breathing, sleep and the jaw.",
    sections: [
      { eyebrow: "Find care", title: "Ask Beyonn for a local referral.", body: "A public provider directory is not available on this site yet. The Beyonn team can help connect you with an appropriate provider. Share your city or ZIP code when you contact them; avoid sending detailed medical information by ordinary email.", points: ["Call 888-264-1981 for the quickest help.", "Email info@beyonn.com with your city or ZIP code.", "For urgent symptoms, contact your clinician or local emergency services."] },
    ],
    cta: { label: "Email for a referral", href: "mailto:info@beyonn.com?subject=Provider%20referral%20request" },
  },
  "patient-app": {
    eyebrow: "The Beyonn Patient App",
    title: "A companion for the full care journey.",
    description: "From the first sleep question to follow-up visits, the app is designed to keep patients informed and connected with a Beyonn practice.",
    sections: [
      { eyebrow: "For practices", title: "Turn patient interest into a real conversation.", body: "The app concept connects a sleep-risk check, education, appointment requests, reminders and treatment progress with the practice team.", points: ["Snore Score and sleep-risk questions.", "Provider discovery and exam booking.", "Preparation for visits and treatment education.", "Check-ins through the first weeks and beyond."] },
      { eyebrow: "For patients", title: "Understand each step before it happens.", points: ["Check symptoms and find a provider.", "Prepare for an exam and a possible sleep study.", "Understand treatment options and appliance care.", "Track visits and follow-up plans."] },
      { id: "download", eyebrow: "Availability", title: "Ask Beyonn about app access.", body: "Store links and a public launch date have not been confirmed. The app is an educational companion, not a diagnosis or a replacement for care from a qualified clinician." },
    ],
    cta: { label: "Find a provider", href: "/patients/find-a-provider" },
  },
  qualify: {
    eyebrow: "Discovery Call",
    title: "See if Beyonn fits your practice.",
    description: "One conversation about your patients, team, goals and the support you need to run OSA + TMD care.",
    sections: [
      { eyebrow: "What to expect", title: "A useful conversation, not a sales maze.", points: ["Tell the Beyonn team about your practice and team.", "Discuss the OSA + TMD patients you already see.", "Review training, systems and operational support options.", "Leave with a clear answer about next steps and fit."] },
      { id: "book", eyebrow: "Book now", title: "Use Beyonn's live scheduling page.", body: "Discovery Calls are currently scheduled through Beyonn's existing website. The booking page opens in a new tab." },
    ],
    cta: { label: "Open live booking", href: "https://www.beyonn.com/discovery-call" },
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
  portal: {
    eyebrow: "Patient access",
    title: "Welcome back.",
    description: "Access your care information through Beyonn's existing secure sign-in.",
    sections: [
      { eyebrow: "Secure access", title: "Continue to the current portal.", body: "Patient records and messages require an authenticated clinical system. This website does not collect or store protected health information. Use Beyonn's current sign-in to access your account, or call the team if you need help." },
    ],
    cta: { label: "Open secure sign-in", href: "https://www.beyonn.com/sign-in" },
  },
  "partner-login": {
    eyebrow: "Partner access",
    title: "Your partner tools are ready when you are.",
    description: "Open Beyonn's existing sign-in for training and practice tools.",
    sections: [
      { eyebrow: "Secure access", title: "Continue to the current platform.", body: "Partner training, case tools and operational records stay in Beyonn's existing platform. Contact the team if you need help with access." },
    ],
    cta: { label: "Open partner sign-in", href: "https://www.beyonn.com/sign-in" },
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
