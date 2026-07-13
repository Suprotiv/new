"use client";
import { Playfair_Display } from "next/font/google";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import EditableText from "./EditableText";
import EditableImage from "./EditableImage";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

/** Default paragraph layout; omit or replace per block when customizing. */
const copyBlockClass =
  "text-left text-2xl leading-[1.15] md:text-4xl md:leading-[1.12] font-normal tracking-wide";

const sansBase = "text-[#111010]";
const playfairItalic = `${playfair.className} font-[var(--font-playfair)] italic`;
const playfairSerifTeal = `${playfair.className} font-[var(--font-playfair)] text-[#1f7f8f]`;

const splitLines = (value) => String(value).split("\n");

const COPY_BLOCKS = [
  {
    id: "opening",
    keyName: "home.news.opening",
    fallback:
      "Creativity isn’t a box to fit into;\nit’s a wall to break through.\nWe chase the spark, ride the chaos\nand craft designs\nthat don’t just\nsit there—they shout!",
    className: `${copyBlockClass} ${sansBase}`,
    render: (value) => {
      const lines = splitLines(value);
      return (
        <>
          {lines[0] || "Creativity isn’t a box to fit into;"}<br />
          {lines[1] || "it’s a wall to break through."}
          <br />
          <span className={`${playfairItalic} text-[#b65a2a]`}>
            {lines[2] || "We chase the spark, ride the chaos"}<br />
            {lines[3] || "and craft designs"}
          </span>{" "}
          {lines[4] || "that don’t just"}<br />
          {lines[5] || "sit there—they shout!"}
        </>
      );
    },
  },
  {
    id: "guts",
    keyName: "home.news.guts",
    fallback:
      "Design with guts, not just grids.\nWe listen, we learn, we feel.\nGreat design isn’t just seen;\nit’s experienced.",
    className: `${copyBlockClass} ${sansBase}`,
    render: (value) => {
      const lines = splitLines(value);
      const firstLine = lines[0] || "Design with guts, not just grids.";
      const [accent = "Design with guts,", rest = "not just grids."] =
        firstLine.split(/,\s*/);
      return (
        <>
          <span className={`${playfairItalic} text-[#5a6b3e]`}>
            {accent},
          </span>
          <span className=" text-[#5a6b3e]">{rest}</span>
          <br />
          {lines[1] || "We listen, we learn, we feel."}
          <br />
          {lines[2] || "Great design isn’t just seen;"}
          <br />
          {lines[3] || "it’s experienced."}
        </>
      );
    },
  },
  {
    id: "precision",
    keyName: "home.news.precision",
    fallback: "We design with precision but we leave\nroom for the unexpected.",
    className: `${copyBlockClass} ${sansBase}`,
    render: (value) => {
      const lines = splitLines(value);
      return (
        <>
          {lines[0] || "We design with precision but we leave"}<br />
          {lines[1] || "room for the unexpected."}
        </>
      );
    },
  },
  {
    id: "perfect",
    keyName: "home.news.perfect",
    fallback: "Because perfect is boring.",
    className: `${copyBlockClass} ${playfairSerifTeal}`,
    render: (value) => {
      const text = value || "Because perfect is boring.";
      const parts = text.match(/^(.*?)(perfect)(.*)$/i);
      if (!parts) return text;
      return (
        <>
          <span className={`${playfairSerifTeal} not-italic`}>{parts[1]}</span>
          <span className={`${playfairSerifTeal} italic`}>{parts[2]}</span>
          <span className={`${playfairSerifTeal} not-italic`}>{parts[3]}</span>
        </>
      );
    },
  },
  {
    id: "colours",
    keyName: "home.news.colours",
    fallback:
      "Colours aren’t curated—they explode.\nPalettes are for painters;\nwe mix shades with attitude.\nBold? Always. Basic? Never.",
    className: `${copyBlockClass} ${sansBase}`,
    render: (value) => {
      const lines = splitLines(value);
      const lastLine = lines[3] || "Bold? Always. Basic? Never.";
      const [boldPart = "Bold? Always.", basicPart = "Basic? Never."] =
        lastLine.split(/\s+(?=Basic\?)/);
      return (
        <>
          {lines[0] || "Colours aren’t curated—they explode."}
          <br />
          {lines[1] || "Palettes are for painters;"}
          <br />
          {lines[2] || "we mix shades with attitude."}
          <br />
          <span className="text-[#f2bd3f]">
            {boldPart}{" "}
            <span className={playfairItalic}>{basicPart}</span>
          </span>
        </>
      );
    },
  },
  {
    id: "mainstream",
    keyName: "home.news.mainstream",
    fallback:
      "Design isn’t mainstream.\nIt’s got character. It grabs attention,\nspins it around and leaves a mark.\nIf you want quiet, you’re in the wrong place.",
    className: `${copyBlockClass} ${sansBase}`,
    render: (value) =>
      splitLines(value).map((line, index, lines) => (
        <span key={`${line}-${index}`}>
          {line}
          {index < lines.length - 1 ? <br /> : null}
        </span>
      )),
  },
  {
    id: "algorithm",
    keyName: "home.news.algorithm",
    fallback:
      "Trends are cool, but authenticity\nis cooler. We don’t follow the\nalgorithm—we rewrite it.",
    className: `${copyBlockClass} ${sansBase}`,
    render: (value) => {
      const lines = splitLines(value);
      const thirdLine = lines[2] || "algorithm—we rewrite it.";
      const [algorithm = "algorithm", rewrite = "we rewrite it."] =
        thirdLine.split("—");
      return (
        <>
          {lines[0] || "Trends are cool, but authenticity"}
          <br />
          is cooler.{" "}
          <span className="text-[#5a6b3e]">
            {(lines[1] || "is cooler. We don’t follow the").replace(/^is cooler\.\s*/, "")}
            <br />
            {algorithm}—
            <span className={playfairItalic}>{rewrite}</span>
          </span>
        </>
      );
    },
  },
  {
    id: "vibe",
    keyName: "home.news.vibe",
    fallback: "Symmetry is optional.\nVibe is everything.",
    className: `${copyBlockClass} ${sansBase}`,
    render: (value) => {
      const lines = splitLines(value);
      return (
        <>
          {lines[0] || "Symmetry is optional."}
          <br />
          <span className={`${playfairItalic} text-[#6b2d83]`}>
            {lines[1] || "Vibe is everything."}
          </span>
        </>
      );
    },
  },
  {
    id: "moved-on",
    keyName: "home.news.movedOn",
    fallback: "By the time everyone else catches on,\nwe’ve already moved on.",
    className: `${copyBlockClass} ${sansBase}`,
    render: (value) =>
      splitLines(value).map((line, index, lines) => (
        <span key={`${line}-${index}`}>
          {line}
          {index < lines.length - 1 ? <br /> : null}
        </span>
      )),
  },
  {
    id: "real",
    keyName: "home.news.real",
    fallback: "Real design. Real impact. No filters.",
    className: `${copyBlockClass} ${sansBase}`,
    render: (value) => value,
  },
];

const pageCount = 5;
const PAGE_VH = 50;
const DEAD_ZONE_PX = 50;

function stickyTopPx() {
  if (typeof window === "undefined") return 64;
  return window.matchMedia("(min-width: 768px)").matches ? 80 : 64;
}

export default function SiddhaNewsBottomSection() {
  const trackRef = useRef(null);
  const contentRef = useRef(null);
  const translateY = useMotionValue(0);
  const [stepPx, setStepPx] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [trackHeight, setTrackHeight] = useState(0);

  const updateFromScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    if (!stepPx) return;

    const rect = el.getBoundingClientRect();
    const topOffset = stickyTopPx();
    const denom = rect.height - window.innerHeight + topOffset;
    if (denom <= 0) return;

    const rawProgress = (topOffset - rect.top) / denom;
    const progress = Math.min(1, Math.max(0, rawProgress));
    const gateProgress = DEAD_ZONE_PX / denom;
    const gatedProgress =
      gateProgress >= 1
        ? 0
        : Math.min(1, Math.max(0, (progress - gateProgress) / (1 - gateProgress)));
    const maxShift = Math.max(0, contentHeight - stepPx);
    translateY.set(-gatedProgress * maxShift);
  }, [contentHeight, stepPx, translateY]);

  useEffect(() => {
    const updateMeasurements = () => {
      const nextStepPx = window.innerHeight * (PAGE_VH / 100);
      const nextContentHeight = contentRef.current?.scrollHeight ?? nextStepPx;
      const maxShift = Math.max(0, nextContentHeight - nextStepPx);

      setStepPx(nextStepPx);
      setContentHeight(nextContentHeight);
      setTrackHeight(window.innerHeight - stickyTopPx() + maxShift);
    };

    updateMeasurements();

    const onScroll = () => updateFromScroll();
    const onResize = () => {
      updateMeasurements();
      updateFromScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [updateFromScroll]);

  return (
    <div
      ref={trackRef}
      className="relative w-full"
      style={{ height: trackHeight ? `${trackHeight}px` : `${pageCount * PAGE_VH}vh` }}
    >
      <section className="sticky top-7 md:top-7 z-30 bg-[#fefdf8] pb-40">
        <div className="SiddhaNewsAlignedImage">
          <div className="SiddhaNewsBottomBanner">
            <EditableImage
              keyName="home.news.bottomImage"
              fallback="/images/img-News-Siddha-Serena-bottom.jpeg"
              alt="Siddha Serena news banner"
              fill
              wrapperClassName="h-full w-full"
              className="object-contain rounded-b-md"
              priority={false}
            />
          </div>
        </div>

        <div className="SiddhaNewsAlignedImage mt-10 md:mt-14">
          <div
            className="relative px-2 md:px-0 overflow-hidden"
            style={{ height: `${PAGE_VH}vh` }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-[#fefdf8] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-[#fefdf8] to-transparent" />
            <motion.div
              ref={contentRef}
              className="flex flex-col gap-[34px] md:gap-[35px] 2xl:gap-[40px] py-8 will-change-transform"
              style={{ y: translateY }}
            >
              {COPY_BLOCKS.map((block) => (
                <div key={block.id}>
                  <EditableText
                    as="p"
                    keyName={block.keyName}
                    fallback={block.fallback}
                    className={block.className}
                    multiline
                  >
                    {block.render}
                  </EditableText>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
