"use client";
import React from "react";
import Link from "next/link";
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

function Main() {
  return (
    <div className="bg-[#111010]">
      <section className="animate-fadeInSlow w-[80vw] max-w-[80vw] mx-auto min-h-[70vh] flex flex-col lg:flex-row items-center justify-between text-white gap-12 py-16">
        {/* Left panel */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center">
          <h1 className="text-[2.6rem] sm:text-[56px] md:text-[72px] 2xl:text-[96px] font-medium leading-[1.05]">
            <EditableText keyName="home.hero.title.line1" fallback="We don’t" />
            <br />
            <EditableText keyName="home.hero.title.line2" fallback="just design," />
            <br />
            <span className={`text-[#72814B] ${playfair.className}`}>
              <EditableText keyName="home.hero.title.accent" fallback="we disrupt" />
            </span>
          </h1>

          <div className="mt-10">
            <Link
              href="/categories/all"
              className="inline-flex h-[53px] items-center px-9 rounded-md border border-white/40 text-[13px] sm:text-base font-semibold tracking-wide uppercase hover:border-white/70 transition"
            >
              <EditableText keyName="home.hero.cta" fallback="See work" />
            </Link>
          </div>
        </div>

        {/* Right image panel */}
        <div className="w-full lg:w-[45%] flex justify-start lg:justify-end">
          <div className="w-full max-w-[718px]">
            <EditableImage
              keyName="home.hero.image"
              fallback="/images/Home-Wysiwyg.png"
              alt="Wysiwyg hero"
              width={729}
              height={480}
              priority
              className="w-full h-auto object-contain"
              sizes="(min-width: 1024px) 718px, 80vw"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Main;
