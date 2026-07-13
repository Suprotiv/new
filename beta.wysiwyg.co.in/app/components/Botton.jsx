"use client";

import React, { useRef, useEffect, useState } from "react";

const Botton = ({ value, size, color }) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseOver = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);

  return (
    <div
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      className={`relative md:top-0 overflow-hidden  cursor-pointer ${
        size === "md"
          ? "text-xl text-center h-[28px] w-[160px]"
          : size === "lg"
          ? `text-md h-[3vh] w-[15vw]  text-center`
          : `text-lg h-[5vh] lg:h-[6.5vh] w-[25vh] lg:w-[33vh]  rounded-md border border-spacing-1`
      } font-bold inline-block`} // Adjust to fit the text size
    >
      {/* Original Text */}
      {size === "md" ? (
        <>
          <span
            className={`absolute left-0 h-full ${color} inline-block transition-transform text-center justify-center 
        ${hovered ? `-translate-y-full ` : "translate-y-0 "} duration-300`}
          >
            {value}
          </span>

          {/* Copy of Text Entering from Bottom */}
          <span
            className={`absolute left-0  inline-block transition-transform text-center justify-center ${color} duration-300 ${
              hovered ? "translate-y-0" : "translate-y-full"
            }`}
          >
            /wizz-I-wig/
          </span>
        </>
      ) : size === "lg" ? (
        <>
          <>
            <span
              className={`absolute left-0 h-full  text-white w-full transition-transform text-center justify-center 
        ${hovered ? `-translate-y-full ` : "translate-y-0 "} duration-300`}
            >
              {value}
            </span>

            {/* Copy of Text Entering from Bottom */}
            <span
              className={`absolute left-0  w-full transition-transform text-center justify-center text-white duration-300 ${
                hovered ? "translate-y-0" : "translate-y-full"
              }`}
            >
              {value}
            </span>
          </>
        </>
      ) : color === "black" ? (
        <>
          <div className="relative h-full w-full">
            {/* First Span */}
            <span
              className={`absolute top-0 left-0 z-10 h-full w-full items-center flex  justify-center border  border-gray-500 transition-transform duration-300 ${
                hovered ? "text-black" : "text-white "
              }`}
            >
              {value}
            </span>

            {/* Second Span */}
            <span
              className={`absolute top-0 left-0 z-0 h-full w-full bg-black flex items-center justify-center transition-transform duration-300 ${
                hovered
                  ? "text-black  -translate-y-full"
                  : "translate-y-0 text-white "
              }`}
            ></span>
          </div>

          {/* Copy of Text Entering from Bottom */}
          <span
            className={`absolute left-0 z-0 bg-white h-full w-full transition-transform text-center justify-center duration-300 ${
              hovered ? "translate-y-0" : "translate-y-full"
            }`}
          ></span>
        </>
      ) : (
        <>
          <div className="relative h-full w-full">
            {/* First Span */}
            <span
              className={`absolute top-0 left-0 z-10 h-full w-full items-center flex  justify-center transition-transform duration-300 ${
                hovered ? "text-white" : "text-black "
              }`}
            >
              {value}
            </span>

            {/* Second Span */}
            <span
              className={`absolute top-0 left-0 z-0 h-full w-full bg-white flex items-center justify-center transition-transform duration-300 ${
                hovered
                  ? "text-white  -translate-y-full"
                  : "translate-y-0 text-black "
              }`}
            ></span>
          </div>

          {/* Copy of Text Entering from Bottom */}
          <span
            className={`absolute left-0 z-0 bg-black h-full w-full transition-transform text-center justify-center duration-300 ${
              hovered ? "translate-y-0" : "translate-y-full"
            }`}
          ></span>
        </>
      )}
    </div>
  );
};

export default Botton;
