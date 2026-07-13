"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const projects = [
  {
    title: "AI Art Generator",
    description:
      "At Wysiwyg, we don’t just design—we disrupt. Creativity isn’t a box to fit into; it’s a wall to break through. We chase the spark, ride the chaos and craft designs that don’t just sit there—they shout",
    image: "/images/project1.jpg",
  },
  {
    title: "Portfolio Website",
    description:
      "Design isn’t mainstream. It’s got character. It grabs attention, spins it around, and leaves a mark. If you want quiet, you’re in the wrong place.",
    image: "/images/project2.jpg",
  },
  {
    title: "Weather App",
    description:
      "Colours aren’t curated—they explode. Palettes are for painters; we mix shades with attitude. Bold? Always. Basic? Never.",
    image: "/images/project3.jpg",
  },
];

export default function ParallaxProjects() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <section ref={ref} className="relative pt-40  text-black bg-[#fefdf8]">
      <div className="max-w-6xl mx-auto space-y-40 px-4">
        {projects.map((project, index) => {
          const isEven = index % 2 === 0;

          // Parallax transforms
          const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "-90%"]);
          const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);

          return (
            <div
              key={index}
              className={`relative flex flex-col md:flex-row ${
                isEven ? "" : " md:flex-row-reverse"
              } gap-12 items-center justify-center`}
            >
              <motion.div className="w-full md:w-1/2" style={{ y: imageY }}>
                <Image
                  src={project.image}
                  alt={project.title}
                  width={400}
                  height={400}
                  className=" shadow-lg object-cover w-full h-auto"
                />
              </motion.div>

              <motion.div className="w-full   md:w-1/2" style={{ y: textY }}>
                <p className="text-2xl text-gray-800 italic">
                  {project.description}
                </p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
