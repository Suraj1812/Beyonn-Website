/** Verbatim excerpts from Beyonn's published endorsements. */
export const endorsementSource = "https://www.beyonn.com/platforms/done-by-you";

export type Endorsement = {
  name: string;
  role: string;
  practice?: string;
  location?: string;
  field: string;
  image: string;
  text: string;
};

export const endorsements: Endorsement[] = [
  { name: "Dr. Bryan Kalish, D.D.S., M.S.", role: "Dental Director", practice: "Koala Center for Sleep and TMJ Disorders", location: "El Paso, TX", field: "Dentistry", image: "/assets/people/bryan-kalish.webp", text: "both inspiring and transformative for our practice" },
  { name: "Haramandeep Singh", role: "CEO & Board Certified Sleep Physician", practice: "iSleep Physicians", field: "Sleep medicine", image: "/assets/people/haramandeep.webp", text: "working closely with Dr. Rod Willey on numerous complex cases" },
  { name: "Brenda", role: "Nurse Practitioner", field: "Nursing", image: "/assets/people/brenda-np.webp", text: "a truly rewarding and enriching experience" },
  { name: "Dr. Shaw", role: "ENT & Board Eligible Sleep Medicine Specialist", field: "ENT", image: "/assets/people/dr-shaw.webp", text: "the critical importance of comprehensive and collaborative care" },
  { name: "Dr. Dave Singh, D.M.D., Ph.D., D.D.Sc.", role: "Adjunct Professor, Sleep Medicine", practice: "Stanford University", field: "Sleep medicine", image: "/assets/people/dave-singh.webp", text: "I can confidently say that Dr. Willey stands at the top" },
  { name: "Ryan T. Funk, MD, FACS", role: "Otolaryngologist, Head and Neck Surgeon", field: "ENT", image: "/assets/people/ryan.webp", text: "his experience and thoughtful approach to patient care were evident" },
  { name: "Ramon Irizarry, BSNE, FNC", role: "President", practice: "Lifeline Wellness Institute", field: "Wellness", image: "/assets/people/ramon.webp", text: "Dr. Rod Willey is an exceptional colleague" },
  { name: "Caitlin M. Pribble, PT, DPT", role: "Doctor of Physical Therapy", field: "Physical therapy", image: "/assets/people/dr-pebble.webp", text: "a leader in the community and a trail blazer for temporomandibular joint treatment" },
  { name: "David Gergen", role: "CEO", practice: "American Sleep and Breathing Academy", field: "Sleep medicine", image: "/assets/people/dave-gergen.webp", text: "His contributions were instrumental in propelling dental sleep into the spotlight" },
  { name: "Nicole", role: "Nurse Practitioner", field: "Nursing", image: "/assets/people/nicole-np.webp", text: "the privilege of working alongside Dr. Willey and learning under his guidance" },
  { name: "Brockton Willey", role: "Doctor of Dental Surgery · Dr. Willey’s son", field: "Dentistry", image: "/assets/people/brock-willey.webp", text: "great admiration and deep respect" },
  { name: "Dr. Fayeza Fayez", role: "Clinician", field: "Personal experience", image: "/assets/people/fayeza-fayez.webp", text: "genuine kindness and support" },
];
