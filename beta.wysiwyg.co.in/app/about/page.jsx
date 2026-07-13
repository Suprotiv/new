import { Playfair_Display } from "next/font/google";
import Link from "next/link";
import EditableImage from "../components/EditableImage";
import EditableText from "../components/EditableText";
import TeamGrid from "../components/TeamGrid";
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export default function AboutPage() {
  return (
    <main className="bg-[#fefdf8] animate-fadeIn pt-20 relative z-10">
      {/* Hero */}
      <section className="w-full bg-[#111010]">
        <div className="w-[80vw] max-w-[80vw] mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[42vh] md:min-h-[48vh]">
          {/* Left copy */}
          <div className="flex flex-col justify-center py-14 pr-0 lg:pr-14 text-[#fefdf8]">
            <h1 className="text-3xl sm:text-4xl md:text-5xl leading-tight">
              <span className={`${playfair.className} italic text-[#b65a2a]`}>
                <EditableText keyName="about.hero.accent" fallback="Designers" />
              </span>{" "}
              <EditableText keyName="about.hero.line1" fallback="aren’t one role." />
              <br />
              <EditableText keyName="about.hero.line2" fallback="They’re multiple roles" />
              <br />
              <EditableText keyName="about.hero.line3" fallback="with one job title." />
            </h1>
          </div>

          {/* Right placeholder image */}
          <div className="relative aspect-[37/20] w-full overflow-hidden lg:aspect-auto lg:h-full">
            <EditableImage
              keyName="about.hero.image"
              fallback="/images/ban-about.jpg"
              alt="About Hero"
              fill
              wrapperClassName="h-full w-full"
              sizes="(min-width: 1024px) 40vw, 80vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="w-[80vw] max-w-[80vw] mx-auto flex justify-center py-10">
        <Link
          href="/contact"
          className="inline-flex h-11 items-center px-10 rounded-md bg-[#111010] text-[#fefdf8] text-xs font-semibold tracking-wide uppercase border border-black/20 hover:bg-[#5a6b3e] transition cursor-pointer"
        >
          <EditableText keyName="about.cta" fallback="Join the team" />
        </Link>
      </div>

      <TeamGrid playfairClassName={playfair.className} />
    </main>
  );
}
