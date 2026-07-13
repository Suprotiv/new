"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { useEffect, useRef } from "react";
// For route change detection

export default function Projects() {
  const { scrollYProgress } = useScroll();
  const lenisRef = useRef(null);

  // useEffect(() => {
  //   const lenis = new Lenis();
  //   lenisRef.current = lenis;

  //   function raf(time) {
  //     lenis.raf(time);
  //     requestAnimationFrame(raf);
  //   }

  //   requestAnimationFrame(raf);

  //   // 🚨 Clean up on component unmount
  //   return () => {
  //     lenis.destroy();
  //     lenisRef.current = null;
  //   };
  // }, []);

  // 🔁 Optional: Also destroy on route change

  // Scroll-based transforms
  const backgroundY = useTransform(scrollYProgress, [0, 0.5], ["0%", "-100%"]);
  const mainPageY = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const projectY = useTransform(scrollYProgress, [0, 0.6], ["10%", "-10%"]);

  return (
    <main>
      <motion.div
        className="background"
        style={{
          y: backgroundY,
          backgroundImage: `url(/images/.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(50%)",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          zIndex: -1,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0)",
            zIndex: 1,
          }}
        />
      </motion.div>

      {/* MainPage Section */}
    </main>
  );
}
