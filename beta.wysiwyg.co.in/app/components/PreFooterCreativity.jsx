"use client";

import { Playfair_Display } from "next/font/google";
import EditableImage from "./EditableImage";
import EditableText from "./EditableText";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-playfair",
  display: "swap",
});

/** Place asset at `public/prefooter.png` */
const PREFooter_SYMBOL_SRC = "images/pre-footer.png";

export default function PreFooterCreativity() {
  return (
    <section className="bg-[#111010] px-5 py-16 md:px-10 md:py-24 relative z-10 ">
      <div className="mx-auto flex max-w-6xl flex-col items-center  md:flex-row md:items-center ">
        <div className="relative h-30 w-30 shrink-0 md:h-60 md:w-60 mr-10">
          <EditableImage
            keyName="home.prefooter.image"
            fallback={`/${PREFooter_SYMBOL_SRC}`}
            alt="Wysiwyg pre-footer mark"
            fill
            wrapperClassName="h-full w-full"
            className="object-contain object-left"
            sizes="(max-width: 768px) 112px, 144px"
          />
        </div>
        <div className="max-w-4xl text-left">
          <p
            className="font-[var(--font-plus-jakarta)] text-[#ffffff] text-[clamp(1.25rem,4.2vw,50px)] leading-[1.25] md:text-[40px] md:leading-[60px]"
          >
            <EditableText
              keyName="home.prefooter.copy"
              fallback={`Creativity isn’t clean. It’s messy,\nunpredictable and beautifully chaotic.\nThat’s where the magic happens— and\nwhere the best stories are born.`}
              multiline
            >
              {(value) => {
                const lines = value.split("\n");
                const lastLine = lines.pop();
                return (
                  <>
                    {lines.map((line) => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))}
                    <span
                      className={`${playfair.className} text-[#72814B]`}
                      style={{ fontSize: "inherit", lineHeight: "inherit" }}
                    >
                      {lastLine}
                    </span>
                  </>
                );
              }}
            </EditableText>
          </p>
        </div>
      </div>
    </section>
  );
}
