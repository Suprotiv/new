"use client";
import { Playfair_Display } from "next/font/google";
import EditableImage from "./EditableImage";
import EditableText from "./EditableText";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-playfair",
  display: "swap",
});

const HorizontalAwardSection = () => {
  return (
    <div className="bg-[#fefdf8] relative z-10">
      <AccoladesGrid />
    </div>
  );
};

const AccoladesGrid = () => {
  return (
    <section className="relative pb-10">
      <div className="flex items-center justify-center pt-10 pb-6 text-2xl md:text-4xl tracking-wide text-black">
        <EditableText
          as="p"
          keyName="home.accolades.heading"
          fallback="accolades"
          className={playfair.className}
        />
      </div>

      <div className="mx-auto grid max-w-[80vw] grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card card={card} key={card.id} />
        ))}
      </div>
    </section>
  );
};

const Card = ({ card }) => {
  return (
    <div className="group relative aspect-square w-full overflow-hidden rounded-md shadow-xl bg-neutral-800 border border-neutral-600/40 cursor-pointer">
      <EditableImage
        keyName={card.imageKey}
        fallback={card.url}
        alt={card.project}
        fill
        wrapperClassName="absolute inset-0"
        className="object-cover transition-opacity duration-300 ease-out opacity-100 group-hover:opacity-100"
        sizes="(max-width: 640px) 80vw, 25vw"
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-neutral-100 to-neutral-300 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-70" />

      <div
        className={`relative z-10 flex h-full flex-col justify-center gap-3 p-6 md:p-8 text-[#121212] opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 ${playfair.className}`}
      >
        <p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.2em] leading-snug">
          <EditableText keyName={card.categoryKey} fallback={card.category} />
        </p>
        <p
          className={`font-[var(--font-playfair)] italic text-sm md:text-base 2xl:text-lg leading-snug text-neutral-900`}
        >
          <EditableText keyName={card.awardKey} fallback={card.award} />
        </p>
        <div className="my-1 h-px w-full bg-neutral-800/25" />
        <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.12em]">
          <EditableText keyName={card.projectKey} fallback={card.project} />
        </p>
        <p className="text-[11px] md:text-xs leading-relaxed text-neutral-800/95">
          <EditableText
            keyName={card.descriptionKey}
            fallback={card.description}
            multiline
          />
        </p>
      </div>
    </div>
  );
};

export default HorizontalAwardSection;

const cards = [
  {
    id: 1,
    url: "/images/accolades/accolades-AMBUJA-UTALIKA.png",
    imageKey: "home.accolades.1.image",
    categoryKey: "home.accolades.1.category",
    awardKey: "home.accolades.1.award",
    projectKey: "home.accolades.1.project",
    descriptionKey: "home.accolades.1.description",
    category: "Best real estate construction",
    award: "eLets India Brand Summit & Awards 2024",
    project: "Ambuja Utalika",
    description:
      "A unanimous jury decision for the best launch campaign for ‘Utalika—Let this world be yours’.",
  },
  {
    id: 2,
    url: "/images/accolades/accolades-VENTURES-FASHION.png",
    imageKey: "home.accolades.2.image",
    categoryKey: "home.accolades.2.category",
    awardKey: "home.accolades.2.award",
    projectKey: "home.accolades.2.project",
    descriptionKey: "home.accolades.2.description",
    category: "Best fashion brochure",
    award: "Brochure Design that Works",
    project: "Ventures Fashion",
    description:
      "A compilation by Lisa L Cyr of some of the best brochures in the graphic design industry. It showcases the various textures and patterns in an interesting, tasteful way.",
  },
  {
    id: 3,
    url: "/images/accolades/accolades-ROTARY-CLUB-OF-CALCUTTA.png",
    imageKey: "home.accolades.3.image",
    categoryKey: "home.accolades.3.category",
    awardKey: "home.accolades.3.award",
    projectKey: "home.accolades.3.project",
    descriptionKey: "home.accolades.3.description",
    category: "Best newsletter",
    award: "2012–13",
    project: "Rotary Club of Calcutta",
    description:
      "Our exacting standards of copy, design and artwork were applied to create a finished product, month-after-month, that reflects the esteem and prestige of the Rotary Club.",
  },
  {
    id: 4,
    url: "/images/accolades/accolades-KYOORIUS.png",
    imageKey: "home.accolades.4.image",
    categoryKey: "home.accolades.4.category",
    awardKey: "home.accolades.4.award",
    projectKey: "home.accolades.4.project",
    descriptionKey: "home.accolades.4.description",
    category: "Showcase",
    award:
      "ITC Gold Flake, IFB Home Appliances and Mahadevi Birla World Academy",
    project: "Kyoorius",
    description:
      "Kyoorius is a design magazine that publishes an annual compilation of the best design work in India.",
  },
];
