"use client";

import { animate, useInView } from "framer-motion";
import React, { useEffect, useRef } from "react";

export default function Counter({ from = 0, to, duration = 1 }) {
  const nodeRef = useRef();
  const inViewRef = useRef(null);

  const isInView = useInView(inViewRef, {
    once: true,
    margin: "-100px 0px",
  });

  useEffect(() => {
    const node = nodeRef.current;
    if (!isInView || !node) return;

    const controls = animate(from, to, {
      duration,
      onUpdate(value) {
        node.textContent = Math.floor(value).toLocaleString("en-US");
      },
    });

    return () => controls.stop();
  }, [from, to, duration, isInView]);

  return (
    <span
      ref={(el) => {
        nodeRef.current = el;
        inViewRef.current = el;
      }}
    />
  );
}
