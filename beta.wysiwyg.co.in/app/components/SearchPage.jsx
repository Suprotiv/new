"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import Image from "next/image";
import Link from "next/link";
import FadeIn from "./FadeIn";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [projectResults, setProjectResults] = useState([]);
  const [projects, setProjects] = useState([]);
  const [hovered, setHovered] = useState(null);

  // 🔁 Fetch projects
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/projects`);
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    }

    fetchData();
  }, []);

  const combinedData = useMemo(() => projects, [projects]);

  const fuse = useMemo(() => {
    return new Fuse(combinedData, {
      keys: ["title", "projectDescription", "tags", "category"],
      threshold: 0.3,
      includeScore: true,
    });
  }, [combinedData]);

  useEffect(() => {
    if (query.trim() === "") {
      setProjectResults([]);
    } else {
      const searchResults = fuse.search(query).map((res) => res.item);
      setProjectResults(searchResults);
    }
  }, [query, fuse]);

  return (
    <div className="bg-[#fefdf8] min-h-screen">
      <div className="min-h-screen w-[80vw] max-w-[80vw] mx-auto py-10 pt-[14vh] text-[#111010] animate-fadeIn">
        <h1 className="text-2xl md:text-4xl tracking-tight mb-10">
          <span className={`${playfair.className} font-[var(--font-playfair)] italic `}>
            Search results for :
          </span>{" "}
          <span className="font-medium">{query}</span>
        </h1>

        {projectResults.length > 0 && (
          <>
            <h2 className="text-xl md:text-2xl font-medium mb-6">Projects</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 justify-between">
              {projectResults.map((project, index) => (
                <FadeIn
                  key={project.project_id ?? index}
                  view="-100px"
                  duration={0.4 + (index % 3) * 0.1}
                  yvalue={20 + (index % 3) * 12}
                >
                  <motion.div
                    className="relative group overflow-hidden cursor-pointer"
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => router.push(`/projects/${project.project_id}`)}
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BASE_URL}${project.mainImage}`}
                      alt={project.title}
                      height={720}
                      width={1280}
                      loading="lazy"
                      className="w-full h-[260px] object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <AnimatePresence mode="wait">
                      {hovered === index && (
                        <motion.div
                          key={`overlay-${index}`}
                          initial={{ opacity: 0, y: 40 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            transition: {
                              duration: 0.3,
                              ease: "easeOut",
                              when: "beforeChildren",
                              staggerChildren: 0.1,
                            },
                          }}
                          exit={{ opacity: 0, y: 40 }}
                          className="absolute inset-0 bg-black/60 flex flex-col justify-center p-4 pointer-events-none"
                        >
                          <motion.p
                            key={`desc-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              transition: { duration: 0.3 },
                            }}
                            exit={{ opacity: 0, y: 10 }}
                            className="text-sm text-gray-200 mt-1"
                          >
                            {project.projectDescription}
                          </motion.p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <p className="pt-4 font-medium text-xl">{project.title}</p>
                  <p className="text-sm text-gray-500">
                    {project?.meta?.services}
                  </p>
                </FadeIn>
              ))}
            </div>
          </>
        )}

        {projectResults.length === 0 &&
          query.trim() !== "" && (
            <p className="text-gray-500 text-center mt-20">No results found.</p>
          )}
      </div>
    </div>
  );
}
