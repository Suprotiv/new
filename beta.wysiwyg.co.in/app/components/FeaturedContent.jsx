"use client";
import FadeIn from "./FadeIn";
import { Playfair_Display } from "next/font/google";
import EditableText from "./EditableText";
import EditableImage from "./EditableImage";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-playfair",
  display: "swap",
});

const FEATURED_LINK = "";

const FeaturedContent = () => {
  return (
    <div className="relative">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#d39775] opacity-100 z-0"
        aria-hidden="true"
      ></div>

      {/* Content Section */}
      <div className="relative max-w-[80vw] mx-auto flex flex-col bg-[#d39775] md:flex-row md:gap-10 items-center justify-center min-h-screen py-4 sm:py-6 md:py-12 text-white bg-fixed bg-center bg-cover">
        {/* Left: Image */}
        <div className="w-full md:w-3/5 h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center relative mb-6 md:mb-0 hover:cursor-pointer  transition-all duration-300">
          <FadeIn>
            <a href={FEATURED_LINK} aria-label="View Udyatt Luxury project">
              <EditableImage
                keyName="home.featured.image"
                fallback="/images/img-Featured-Ambuja-Neotia.jpg"
                alt="Udyatt Luxury brochure"
                width={900}
                height={600}
                loading="lazy"
                objectFit="cover"
                className=" shadow-xl"
              />
            </a>
          </FadeIn>
        </div>

        {/* Right: Text */}
        <div className="w-full md:w-1/2 bg-opacity-60 mt-10 z-10">
          <FadeIn>
            <h1 className="text-2xl md:text-4xl tracking-wide text-[#fefdf8] mb-4 sm:mb-6 leading-tight">
              <EditableText
                keyName="home.featured.title"
                fallback="featured Udyatt Luxury"
              >
                {(value) => {
                  const [first, ...rest] = value.split(" ");
                  return (
                    <>
                      <span className={playfair.className}>{first}</span>{" "}
                      {rest.join(" ")}
                    </>
                  );
                }}
              </EditableText>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white leading-relaxed">
              <EditableText
                keyName="home.featured.description"
                fallback="We partnered with Ambuja Neotia to design the brochure for Udyatt, the final masterpiece of legendary architect BV Doshi. Driven by a minimalist visual language, custom iconography and tactile material explorations, the piece beautifully balances art, science and philosophy. It stands as a timeless, breathing tribute to ultra-luxury living."
                multiline
              />
            </p>
            <p className="mt-6 text-xs sm:text-sm leading-relaxed text-white">
              <span className="font-semibold tracking-[0.18em] uppercase">
                <EditableText keyName="home.featured.category" fallback="COLLATERALS" />{" "}
              </span>
              <span className="tracking-wide">
                <EditableText keyName="home.featured.type" fallback="Brochure" />
              </span>
            </p>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

export default FeaturedContent;
