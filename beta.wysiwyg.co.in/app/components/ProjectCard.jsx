"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";

// GalleryCard Component
const GalleryCard = ({ item }) => {
  return (
    <div className="bg-[#1c1c1c] rounded-md  text-white transition-transform hover:scale-105 duration-500 hover:z-10 relative cursor-pointer">
      {/* Thumbnail */}
      <div className="relative w-full h-40">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Metadata */}
    </div>
  );
};

const ProjectCard = ({ project, onClose }) => {
  const gallaryList = [
    {
      image: "/images/anjika1.jpg",
      title: "The Queen's Gambit",
      badge: "Limited Series",
      rating: "A",
      format: "HD",
      year: 2020,
      duration: null,
      description:
        "Winner of 11 Emmys, this smart drama chronicles the rise of a chess prodigy and her struggle with addiction.",
    },
    {
      image: "/images/anjika2.jpg",
      title: "Secret City",
      badge: "2 Seasons",
      rating: "A",
      format: "HD",
      year: 2016,
      duration: null,
      description:
        "A relentless muckraker pushes for the truth behind a massive political conspiracy in Australia.",
    },
    {
      image: "/images/anjika3.jpg",
      title: "Secret City",
      badge: "2 Seasons",
      rating: "A",
      format: "HD",
      year: 2016,
      duration: null,
      description:
        "A relentless muckraker pushes for the truth behind a massive political conspiracy in Australia.",
    },
    {
      image: "/images/anjika4.jpg",
      title: "Secret City",
      badge: "2 Seasons",
      rating: "A",
      format: "HD",
      year: 2016,
      duration: null,
      description:
        "A relentless muckraker pushes for the truth behind a massive political conspiracy in Australia.",
    },
    {
      image: "/images/anjika5.jpg",
      title: "Secret City",
      badge: "2 Seasons",
      rating: "A",
      format: "HD",
      year: 2016,
      duration: null,
      description:
        "A relentless muckraker pushes for the truth behind a massive political conspiracy in Australia.",
    },
    // Add more items if needed
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="relative w-full max-w-4xl h-[90vh] bg-black text-white   shadow-lg flex flex-col  overflow-y-auto"
    >
      {/* Top: Background with blur */}
      <div className="relative h-[420px] shrink-0">
        <img
          src={project.image}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        <button onClick={onClose} className="absolute  top-4 right-4  ">
          <X className="text-white bg-[#141414] rounded-full fixed" />
        </button>
        <div className="absolute bottom-0 p-6">
          <h1 className="text-5xl font-bold tracking-wide">{project.title}</h1>
        </div>
      </div>

      {/* Scrollable content */}
      <div className=" p-6 bg-[#141414] space-y-6">
        <p className="text-lg text-white/60">{project.description}</p>

        <div className="border-t border-white/10 pt-4">
          <h2 className="text-lg font-semibold mb-4">Gallary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {gallaryList.map((item, idx) => (
              <GalleryCard key={idx} item={item} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
