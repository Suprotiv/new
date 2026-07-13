"use client";

import { motion } from "framer-motion";

const FadeIn = ({ view = "-200px", yvalue = 20, duration = 0.4, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: yvalue }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration }}
      viewport={{ margin: `100% 0px ${view} 0px` }}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
