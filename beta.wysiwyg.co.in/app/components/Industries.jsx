"use client";

import EditableImage from "./EditableImage";
import EditableText from "./EditableText";

/** Native pixel ratio of `/images/work/work-*.jpg` (all three assets match). */
const WORK_IMAGE_ASPECT_CLASS = "aspect-[1324/1334]";

const panels = [
  {
    caption: "SnoBite | Packaging",
    captionKey: "home.work.panel1.caption",
    image: "/images/work/work-SnoBite.jpg",
    imageKey: "home.work.panel1.image",
    alt: "SnoBite freeze dried fruit packaging",
    href: "",
  },
  {
    caption: "ITC Hotels | Poster",
    captionKey: "home.work.panel2.caption",
    image: "/images/work/work-ITC-Hotel.jpg",
    imageKey: "home.work.panel2.image",
    alt: "ITC Hotels Eden Pavilion poster",
    href: "projects/itchotels",
  },
  {
    caption: "VION | Packaging",
    captionKey: "home.work.panel3.caption",
    image: "/images/work/work-VION.jpg",
    imageKey: "home.work.panel3.image",
    alt: "VION lithium-ion battery packaging",
    href: "",
  },
];

export default function Industries() {
  return (
    <section className="relative z-10 flex w-full flex-col ">
      <div className="flex w-full flex-col md:flex-row md:items-stretch">
        {panels.map((panel) => (
          <a
            key={panel.caption}
            href={panel.href}
            className={`group relative isolate w-full flex-1 cursor-pointer overflow-hidden border-0 bg-[#111010] p-0 text-left text-neutral-50 outline-none ring-0 transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111010] [-webkit-tap-highlight-color:transparent] ${WORK_IMAGE_ASPECT_CLASS}`}
            aria-label={`View work: ${panel.caption}`}
          >
            {/* Inner clip prevents 1px “white hairline” when the scaled image misses the box edge */}
            <div className="absolute inset-0 overflow-hidden">
              <EditableImage
                keyName={panel.imageKey}
                fallback={panel.image}
                alt={panel.alt}
                fill
                wrapperClassName="h-full w-full"
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 ease-out will-change-transform transform-gpu group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
            <p className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent px-4 py-6 text-center text-sm font-medium leading-snug text-neutral-50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] md:hidden">
              <EditableText keyName={panel.captionKey} fallback={panel.caption} />
            </p>
          </a>
        ))}
      </div>

      <footer className="hidden grid-cols-1 divide-y divide-white/10 bg-[#111010]  text-neutral-50 md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
        {panels.map((panel) => (
          <div
            key={`cap-${panel.caption}`}
            className="px-6 py-5 text-center text-xs font-medium leading-snug text-neutral-50/90 md:py-6 md:text-sm"
          >
            <EditableText keyName={panel.captionKey} fallback={panel.caption} />
          </div>
        ))}
      </footer>
    </section>
  );
}
