import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const Card = ({ image, hoverImage, name }) => {
  return (
    <motion.div
      className="relative  overflow-hidden h-[100px] min-w-[100px]  2xl:h-[120px]  2xl:min-w-[120px] flex justify-center items-center group   hover:cursor-pointer transition-all duration-500"
      key={image}
    >
      {/* Hover overlay */}
      {/* <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="absolute left-0 top-0 bottom-0 right-0 z-10 flex justify-center items-center rounded-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute bg-black pointer-events-none rounded-sm opacity-50 h-full w-full" />
            <motion.h1
              className="bg-white font-semibold text-sm z-10 px-3  rounded-full flex items-center gap-[0.5ch] hover:opacity-75"
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              exit={{ y: 10 }}
            >
              <span className="text-center">{name}</span>
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence> */}
      <div className="h-full w-full blur-load">
        <div className="h-[80%] w-[80%] relative inner-div">
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain opacity-100 group-hover:opacity-0 transition-opacity duration-300"
          />
          {hoverImage ? (
            <img
              src={hoverImage}
              alt={name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
