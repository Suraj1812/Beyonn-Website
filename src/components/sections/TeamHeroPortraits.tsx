import { Localized } from "@/components/i18n/Localized";
import Image from "next/image";

// An editorial arrangement of supplied individual portraits, not a group photograph.
const portraits = [
  { name: "Donna Willey", image: "donna", position: "left-[-1%]", layer: "z-[1]" },
  { name: "Cassie McIntosh", image: "cassie", position: "left-[17%]", layer: "z-[2]" },
  { name: "Jessica Mahrt", image: "jessica", position: "right-[17%]", layer: "z-[2]" },
  { name: "Karen Mahoney", image: "karen", position: "right-[-1%]", layer: "z-[1]" },
];

export function TeamHeroPortraits() {
  return <Localized>{(
    <figure aria-label="Portraits of the Beyonn team" className="relative mx-auto w-full max-w-[42rem]">
      <div className="relative aspect-[2/1] overflow-hidden rounded-[var(--radius-panel)] bg-[#a7dfd2]">
        {portraits.map(({ name, image, position, layer }) => (
          <div key={image} className={`absolute bottom-0 h-[85%] w-[30%] ${position} ${layer}`}>
            <Image src={`/assets/team/${image}.webp`} alt={name} fill priority sizes="(min-width: 1024px) 15vw, 28vw" className="origin-bottom scale-[1.2] object-contain object-bottom" />
          </div>
        ))}
        <div className="absolute bottom-0 left-[32%] z-[3] h-[96%] w-[36%]">
          <Image src="/assets/team/rod.webp" alt="Dr. Rodney Willey" fill priority sizes="(min-width: 1024px) 18vw, 34vw" className="origin-bottom scale-[1.2] object-contain object-bottom" />
        </div>
      </div>
      <figcaption className="mt-3 text-xs leading-relaxed text-paper/70 sm:text-sm">
        Donna Willey · Cassie McIntosh · Dr. Rodney Willey · Jessica Mahrt · Karen Mahoney
      </figcaption>
    </figure>
  )}</Localized>;
}
