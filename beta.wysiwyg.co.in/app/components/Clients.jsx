"use client";

import React, { useEffect, useState } from "react";
import { motion, animate, useMotionValue } from "framer-motion";
import useMeasure from "react-use-measure";
import Card from "./Cards";
import Link from "next/link";
import EditableText from "./EditableText";

const Clients = ({ direction = "left" }) => {
  const FAST_DURATION = 100;
  const SLOW_DURATION = 100;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const [clients, setClients] = useState([]);
  const [duration, setDuration] = useState(FAST_DURATION);
  const [mustFinish, setMustFinish] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [ref, { width }] = useMeasure();
  const xTranslation = useMotionValue(0);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch(`${baseUrl}/clients`);
        const data = await res.json();
        setClients(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      }
    };

    if (baseUrl) fetchClients();
  }, [baseUrl]);

  useEffect(() => {
    let controls;
    const finalPosition =
      direction === "left" ? -width / 2 - 19 : width / 2 + 19;

    if (mustFinish) {
      controls = animate(xTranslation, [xTranslation.get(), finalPosition], {
        ease: "linear",
        duration:
          duration *
          (1 - Math.abs(xTranslation.get()) / Math.abs(finalPosition)),
        onComplete: () => {
          setMustFinish(false);
          setRerender(!rerender);
        },
      });
    } else {
      controls = animate(xTranslation, [0, finalPosition], {
        ease: "linear",
        duration: duration,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0,
      });
    }

    return () => controls?.stop?.();
  }, [rerender, xTranslation, duration, width, direction]);

  return (
    <div className="bg-[#111010] ">
      {/* Top Line */}
      <div className="animate-fadeInSlow">
        <div className="w-full  h-px bg-gray-500 opacity-40 z-0" />
        <div className=" max-w-[80vw] mx-auto">
          {/* Content Section */}
          <div className="py-8  lg:flex justify-between items-center gap-10">
            {/* Left Text */}
            <div className="text-white max-w-md flex-shrink-0 z-20 mb-12 md:mb-2">
              <h2 className="text-md md:text-lg text-gray-200 font-medium mb-2">
                <EditableText
                  keyName="home.clients.intro"
                  fallback={`At Wysiwyg, we design with heart, mind and a bit of madness.\nBecause when you’re creating something unforgettable, playing it safe isn’t part of the script.\nAs already successfully implemented by 250+ partners:`}
                  multiline
                />
              </h2>
              {/* <p className="text-gray-200 text-sm md:text-base">
                As already successfully implemented by 250+ partners:
              </p> */}
            </div>

            {/* Scrolling Clients */}
            <div
              className="relative h-[150px] overflow-x-hidden items-center w-full max-w-full"
              onMouseEnter={() => {
                setMustFinish(true);
                setDuration(SLOW_DURATION);
              }}
              onMouseLeave={() => {
                setMustFinish(true);
                setDuration(FAST_DURATION);
              }}
            >
              <motion.div
                className="absolute left-0 top-1/5 flex gap-8 md:gap-10 items-center"
                style={{ x: xTranslation }}
                ref={ref}
              >
                {[...clients, ...clients].map((item, idx) => {
                  const content = (
                    <Card
                      image={`${baseUrl}${item.bwImage}`}
                      hoverImage={item.colorImage ? `${baseUrl}${item.colorImage}` : null}
                      name={item.name}
                    />
                  );

                  return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                  >
                    {item.link ? (
                      <Link href={item.link}>{content}</Link>
                    ) : item.name ? (
                      <Link href={`search?q=${item.name}`}>{content}</Link>
                    ) : (
                      content
                    )}
                  </motion.div>
                  );
                })}
              </motion.div>

              {/* Fade Overlay */}
              <div className="absolute inset-0 z-10 w-full pointer-events-none bg-[linear-gradient(to_right,_#111010_0%,_rgba(17,16,16,0.45)_15%,_rgba(17,16,16,0)_60%,_rgba(17,16,16,0.45)_85%,_#111010_100%)]" />
            </div>
          </div>

          {/* Bottom Line */}
        </div>
        <div className="w-full h-px bg-gray-500 opacity-40" />
      </div>
    </div>
  );
};

export default Clients;
