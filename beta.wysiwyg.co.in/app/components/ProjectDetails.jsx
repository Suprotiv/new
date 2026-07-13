"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Lenis from "@studio-freight/lenis";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Caraousel from "./Caraousel";
import Image from "next/image";
export default function ProjectDetails() {
  const { scrollYProgress } = useScroll();
  const { project_id } = useParams();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState(null);

  // Fetch all projects and find the matching one
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/projects`
        );
        const data = res?.data || [];

        const found = data.find((p) => p.project_id?.toString() === project_id);

        setProject(found || null);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setProject(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [project_id]);

  // Enable smooth scrolling
  // useEffect(() => {
  //   const lenis = new Lenis();
  //   function raf(time) {
  //     lenis.raf(time);
  //     requestAnimationFrame(raf);
  //   }
  //   requestAnimationFrame(raf);
  // }, []);

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  if (isLoading) {
    return (
      <main className="h-screen flex bg-[#fefdf8] items-center justify-center text-gray-500">
        <p>Loading project...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="h-screen flex items-center justify-center text-red-500">
        <p>Project not found</p>
      </main>
    );
  }

  const { title, summary, meta } = project;
  const column1Images = project.images?.column1 || [];

  return (
    <main>
      {/* Background Parallax */}
      <motion.div
        className="aspect-[16/9] h-[45vh] md:h-[100vh]"
        style={{
          y: backgroundY,
          backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_URL}${project.mainImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "fixed",
          top: 0,
          left: 0,

          width: "100%",

          zIndex: -1,
        }}
      />

      {/* Hero */}
      <motion.div
        className="mainPage h-[45vh] md:h-[100vh]"
        style={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",

          flexDirection: "column",
        }}
      >
        <div
          className="relative bottom-0 flex items-end pb-5 left-0 w-full h-15 md:h-32 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
          }}
        >
          <ChevronDown
            size={50}
            strokeWidth={0.8}
            className="text-white z-20 animate-bounce mx-auto"
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="projects"
        style={{
          minHeight: "100vh",
          display: "flex flex-col",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <div className="max-w-[80vw] mx-auto py-8 md:py-20 grid grid-cols-1 md:grid-cols-5 gap-40 text-black">
          {/* Left: Q&A - span 2 */}
         

          {/* Right: Summary - span 3 */}
          <div className="col-span-1 md:col-span-5 text-base leading-relaxed text-gray-800">
            <h3 className="text-xl font-bold  text-left">{title}</h3>
            {summary?.split("\n\n").map((para, i) => (
              <p className="mb-4" key={i}>
                {para}
              </p>
            ))}

            <div className="mt-6 space-y-1 text-base">
              <p>
                <span className="font-bold">Collaterals</span>{" "}
                {meta?.services || "N/A"}
              </p>
             
              <p>
                <span className="font-bold">Industry</span>{" "}
                {meta?.sector || "N/A"}
              </p>
            </div>
          </div>
        </div>
        {project.images.slider1.length > 0 ? (
          <div className="bg-[#fefdf8] pb-8 md:pb-20">
            <Caraousel images={project.images.slider1} />
          </div>
        ) : null}

        {column1Images.length > 0 ? (
          <div className="col-span-1 max-w-[80vw] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 pb-8 md:pb-20">
            {column1Images.map((imgSrc, index) => {
              const shouldCenterLast =
                column1Images.length % 2 === 1 &&
                index === column1Images.length - 1;

              return (
                <Image
                  key={index}
                  src={`${process.env.NEXT_PUBLIC_BASE_URL}${imgSrc}`}
                  alt={`Project image ${index + 1}`}
                  width={800} // pixel value
                  height={450}
                  loading="lazy"
                  className={`w-full object-cover rounded-sm ${
                    shouldCenterLast ? "md:col-span-2 md:w-1/2 md:mx-auto" : ""
                  }`}
                />
              );
            })}
          </div>
        ) : null}
 {project.images.column2.length > 0 ? (
            <div className="col-span-1 max-w-[80vw] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 pb-8 md:pb-20">
            {project.images.column2.map((imgSrc, index) => (
              <Image
                key={index}
                src={`${process.env.NEXT_PUBLIC_BASE_URL}${imgSrc}`}
                alt={`Project image ${index + 1}`}
                width={800} // pixel value
                height={450}
                loading="lazy"
                className="w-full object-cover rounded-sm"
              />
            ))}
          </div>
        ) : null}
        {project.images.slider2.length > 0 ? (
          <div className="bg-[#fefdf8] pb-8 md:pb-20">
            <Caraousel images={project.images.slider2} />
          </div>
        ) : null}
       
      </motion.div>
    </main>
  );
}
