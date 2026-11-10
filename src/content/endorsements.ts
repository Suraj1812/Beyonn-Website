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
];
