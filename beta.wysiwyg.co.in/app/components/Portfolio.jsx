"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // ✅ Axios for API requests
import Image from "next/image";

import { motion } from "framer-motion";

import FadeIn from "./FadeIn";

const Portfolio = ({ category }) => {
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log("Base URL:", process.env.NEXT_PUBLIC_BASE_URL);
  // Should log: "Base URL: http://localhost:4000"
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/projects`
        );

        setProjects(res?.data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects =
    category === "all"
      ? projects
      : projects.filter((proj) => proj.category?.includes(category));

  return (
    <div
      className="flex w-[80vw] bg-[#fefdf8] relative z-20  justify-between  min-h-screen scrollbar-hide "
    >
   
      <div className="py-10 w-full min-h-screen ">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading projects...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4  gap-6 justify-between ">
            {filteredProjects?.map((item, index) => (
              <FadeIn
                key={index}
                view="-100px"
                duration={0.4 + (index % 3) * 0.1}
                yvalue={20 + (index % 3) * 12}
              >
                <motion.div
                  className="relative group overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/projects/${item.project_id}`)}
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_URL}${item.mainImage}`}
                    alt={item.title}
                    height={720}
                    width={1280}
                    loading="lazy"
                    className="w-full h-[260px]  object-cover transition-transform  duration-300 group-hover:scale-105"
                  />
                </motion.div>
                <p className="pt-4 font-medium text-xl"> {item.title}</p>
                <p className="text-sm text-gray-500">{item.meta.services}</p>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
