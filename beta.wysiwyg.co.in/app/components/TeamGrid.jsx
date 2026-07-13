"use client";

import { useEffect, useState } from "react";
import FadeIn from "./FadeIn";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

export default function TeamGrid({ playfairClassName }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`${baseUrl}/team`);
        const data = await res.json();
        setMembers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      }
    };

    if (baseUrl) fetchTeam();
  }, []);

  return (
    <section className="w-[80vw] max-w-[1100px] mx-auto pb-20">
      <div className="grid grid-cols-2 justify-between gap-x-8 gap-y-14 lg:grid-cols-3 md:gap-x-20 md:gap-y-24">
        {members.map((member) => (
          <FadeIn key={member.id}>
            <div className="group text-center">
              <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-[#e8e6df] sm:h-32 sm:w-32 md:h-40 md:w-40 lg:h-48 lg:w-48">
                {member.image ? (
                  <img
                    src={`${baseUrl}${member.image}`}
                    alt={member.name}
                    className="h-full w-full object-cover grayscale transition-[filter] duration-300 group-hover:grayscale-0"
                    loading="lazy"
                  />
                ) : null}
              </div>

              <p className="mt-4 text-[10px] leading-tight text-[#111010] sm:text-sm md:text-[19px]">
                {member.position}
              </p>
              <p
                className={`${playfairClassName} mt-1 text-[10px] italic leading-tight text-[#5a6b3e] sm:text-sm md:text-[19px]`}
              >
                {member.name}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
