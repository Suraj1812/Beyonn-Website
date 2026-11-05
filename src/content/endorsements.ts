/**
 * Public clinician endorsements and portraits on beyonn.com. Names and
 * credentials are as published there; the one-line summaries are in our own words.
 */
export type Endorsement = { name: string; role: string; field: string; image: string; text: string };

export const endorsements: Endorsement[] = [
  { name: "Dr. Shaw", role: "ENT & Board Eligible Sleep Medicine Specialist", field: "ENT", image: "/assets/people/dr-shaw.webp", text: "Emphasizes comprehensive, collaborative care for airway disorders." },
  { name: "Dr. Dave Singh, D.M.D., Ph.D., D.D.Sc.", role: "Adjunct Professor, Sleep Medicine, Stanford University", field: "Sleep medicine", image: "/assets/people/dave-singh.webp", text: "Recognizes Dr. Willey's depth in airway, breathing and orofacial pain." },
  { name: "Haramandeep Singh", role: "CEO & Board Certified Sleep Physician, iSleep Physicians", field: "Sleep medicine", image: "/assets/people/haramandeep.webp", text: "Has collaborated with Dr. Willey on complex OSA and craniofacial cases." },
  { name: "Dr. Bryan Kalish, D.D.S., M.S.", role: "Dentist", field: "Dentistry", image: "/assets/people/bryan-kalish.webp", text: "Describes Dr. Willey's patient-centered approach to OSA and TMD care." },
  { name: "Ryan T. Funk, MD, FACS", role: "Otolaryngologist, Head and Neck Surgeon", field: "ENT", image: "/assets/people/ryan.webp", text: "Recalls Dr. Willey's thoughtful TMD teaching during residency." },
  { name: "Ramon Irizarry, BSNE, FNC", role: "President, Lifeline Wellness Institute", field: "Wellness", image: "/assets/people/ramon.webp", text: "Has worked with Dr. Willey and values his expertise across both conditions." },
  { name: "Caitlin M. Pribble, PT, DPT", role: "Doctor of Physical Therapy", field: "Physical therapy", image: "/assets/people/dr-pebble.webp", text: "Highlights Dr. Willey's contribution to TMD treatment education." },
  { name: "David Gergen", role: "CEO, American Sleep and Breathing Academy", field: "Education", image: "/assets/people/dave-gergen.webp", text: "Credits Dr. Willey with helping advance dental sleep medicine." },
  { name: "Nicole", role: "Nurse Practitioner", field: "Nursing", image: "/assets/people/nicole-np.webp", text: "Describes learning from Dr. Willey while caring for patients more deeply." },
  { name: "Brockton Willey", role: "Doctor of Dental Surgery", field: "Dentistry", image: "/assets/people/brock-willey.webp", text: "Speaks to Dr. Willey's dedication and long-term vision for the field." },
  { name: "Dr. Fayeza Fayez", role: "Clinician", field: "Clinical care", image: "/assets/people/fayeza-fayez.webp", text: "Recalls the kindness and support she experienced in Dr. Willey's care." },
  { name: "Brenda", role: "Nurse Practitioner", field: "Nursing", image: "/assets/people/brenda-np.webp", text: "Describes Dr. Willey's compassionate leadership and patient care." },
];
