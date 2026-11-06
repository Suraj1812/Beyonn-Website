import type { FaqItem } from "@/components/ui/Faq";

/*
 * Questions whose answers the doc marks "(Answer from Beyonn)" are intentionally
 * left out until Beyonn supplies them: new equipment/software, time to first
 * patient, scope of practice by state, CE credits, and supported languages.
 */

export const practitionerQuickAnswers: FaqItem[] = [
  { q: "Who is Beyonn for?", a: "Dental practitioners, ENTs and nurse practitioners who want to treat OSA + TMD." },
  { q: "What does my team do, and what does Beyonn do?", a: "Your team runs the program. Beyonn trains them, gives you the systems and coaches you until it runs." },
  { q: "Do I need sleep medicine experience?", a: "No. Training and case support are built in." },
  { q: "Do I stay in charge of clinical decisions?", a: "Always. You evaluate, diagnose within your scope and treat. Beyonn supports the system around you." },
  { q: "Do I need to hire new staff?", a: "Beyonn trains the team you have. Your Discovery Call will look at whether your practice needs anything more." },
  { q: "Can my team really handle insurance?", a: "Yes. The coding and documentation kit, payer rules library and claim dashboard guide every claim. If you'd like a hand, optional Billing Assist is there as a safety net." },
  { q: "Will Beyonn help me find patients?", a: "Yes. National awareness campaigns, the Patient App and the provider directory all route patients to Beyonn providers." },
  { q: "What if we get stuck at 9 pm?", a: "The Beyonn AI assistant answers questions on protocols, billing and the platform around the clock." },
  { q: "How do I know if my practice qualifies?", a: "Take the 2-minute check, then book a Discovery Call. We'll tell you honestly whether it's a fit." },
  { q: "What does it cost?", a: "Every practice is different. Your Discovery Call walks through the investment for yours." },
];

export const patientQuickAnswers: FaqItem[] = [
  { q: "Is my snoring a problem?", a: "Not always, but loud, frequent snoring is one of the most common signs of Obstructive Sleep Apnea. Get your Snore Score in the Beyonn Patient App to find out more." },
  { q: "Can jaw pain, clenching or headaches be connected to my sleep?", a: "Often, yes. Clenching at night can be the body's way of keeping the airway open. Beyonn providers look at your jaw and your airway together." },
  { q: "Do I need a sleep study?", a: "Usually. A physician diagnoses sleep apnea, and many Beyonn providers can arrange a home sleep test so you can sleep in your own bed." },
  { q: "Is there an alternative to CPAP?", a: "For many people, yes. A custom oral appliance worn at night can keep the airway open. Your provider and physician will decide what's right for you." },
  { q: "Will my insurance cover it?", a: "Treatment for sleep apnea is often covered by medical insurance, not dental. Your provider's team checks your plan for you." },
  { q: "Are payment plans available?", a: "Many Beyonn providers offer patient financing. Ask your provider's team." },
  { q: "How do I find a Beyonn provider near me?", a: "Search by ZIP code or city, or download the Beyonn Patient App to book an exam." },
];

export const systemFaq: FaqItem[] = [
  { q: "Do I need sleep medicine experience to start?", a: "No. Training covers doctor and staff, and guidance on complex cases is part of your coaching." },
  { q: "Who handles insurance and billing?", a: "Your team does, trained step by step through the Blueprint's billing and medical necessity modules and backed by the coding and documentation kit. Optional Billing Assist is there as a safety net." },
  { q: "Does my team need to learn medical workflows?", a: "Yes, and Beyonn teaches them one step at a time, with a form or script for each." },
  { q: "Do I stay in control of clinical decisions?", a: "Yes. You evaluate, diagnose within your scope and treat." },
  { q: "What happens if a key staff member leaves?", a: "New hires learn through the same Blueprint and Beyonn LMS, so the program keeps running." },
];

export const academyFaq: FaqItem[] = [
  { q: "Is Beyonn Academy only for doctors?", a: "No. It trains the whole team: doctor, front desk, clinical team and billing." },
  { q: "Do I need sleep medicine experience?", a: "No. The Academy starts from the basics and builds up." },
  { q: "Is it online?", a: "Yes. The LMS and Blueprint are on demand, and coaching is live online." },
  { q: "What happens when a team member leaves?", a: "New hires learn through the same LMS and Blueprint, so the program keeps running." },
  { q: "Is the Academy available on its own?", a: "It's part of becoming a Beyonn Network Partner. Your Discovery Call covers the details." },
];

export const globalFaq: FaqItem[] = [
  { q: "Is Beyonn available in my country?", a: "See the list above, or register your interest and we'll tell you." },
  { q: "Is the training online?", a: "Yes. The Beyonn LMS, the Blueprint and coaching are all online." },
  { q: "Can my team be trained remotely?", a: "Yes. Onboarding, the Blueprint, the Beyonn LMS and coaching all work online." },
];

export const partnerFaq: FaqItem[] = [
  { q: "What does it cost?", a: "Every practice is different. Your Discovery Call walks through the investment for yours." },
  { q: "Will my team actually adopt it?", a: "Scripts, training and on-demand onboarding are built for real teams and real turnover." },
  {
    q: "How does medical billing work?",
    a: "OSA + TMD care is billed to medical insurance. The Blueprint trains your team in pre-service billing prep, medical necessity and claims, step by step, and the coding and documentation kit gives them the codes, letters and appeal templates. Optional Billing Assist is there if you want extra help.",
  },
  { q: "Is financing available?", a: "Yes. Practice and patient financing options are available; your Discovery Call covers them." },
  { q: "What are the certification tiers?", a: "Certified Provider, Advanced Provider and Centre of Excellence. Each tier unlocks more advanced cases and higher placement when patients search for a provider." },
];

export const patientFaq: FaqItem[] = [
  { q: "Is snoring always sleep apnea?", a: "No, but loud, frequent snoring is one of the most common sleep apnea symptoms and is worth checking." },
  { q: "Do I need a sleep study?", a: "Usually, yes. A physician diagnoses sleep apnea. Your provider can often arrange a home sleep test, so you don't need a night in a lab." },
  { q: "Will insurance cover it?", a: "Medical treatment for sleep apnea is often covered by medical insurance. Your provider's team will check your plan." },
  { q: "Are payment plans available?", a: "Many Beyonn providers offer patient financing. Ask your provider's team." },
  { q: "What's a Snore Score?", a: "A quick check in the Beyonn Patient App that shows how your snoring may be affecting your sleep. It isn't a diagnosis, but it's a good reason to book an exam." },
  { q: "Is an oral appliance an alternative to CPAP?", a: "For many patients, yes. Your provider and physician will decide what's right for you." },
  { q: "Can TMJ pain be treated without surgery?", a: "Many people find TMD relief through non-surgical care. Your provider will explain your options." },
];
