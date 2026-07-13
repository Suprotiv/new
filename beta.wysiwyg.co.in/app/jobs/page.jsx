import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import Image from "next/image";
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export default function JobsPage() {
  const images = [
    "/images/jobs/img-wi-new-Job-Apply-now.png",
    "/images/jobs/img-wi-new-Up-skill.png",
    "/images/jobs/img-wi-new-Get-real-projects.png",
    "/images/jobs/img-wi-new-Mentor.png",
    "/images/jobs/img-wi-new-Job-roles.png",
    "/images/jobs/img-wi-new-Summer-of-26.png",
    "/images/jobs/img-wi-new-Earning-Learnings.png",
    "/images/jobs/img-wi-new-Discover-a-new-city.png",
  ];

  return (
    <main className="bg-[#fefdf8] animate-fadeIn relative z-10 pt-20">
      {/* Hero */}
      <section className="w-full bg-[#111010]">
        <div className="w-[80vw] max-w-[80vw] mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[42vh] md:min-h-[48vh]">
          {/* Left copy */}
          <div className="flex flex-col justify-center py-14 pr-0 lg:pr-14 text-[#fefdf8]">
            <h1 className="text-3xl  leading-tight sm:text-4xl md:text-5xl">
              Are you the{" "}
              <span className={`${playfair.className} font-normal italic text-[#d4cf36]`}>
                right fit?
              </span>
              <br />
              Here’s 7 reasons
              <br />
              you could be...
            </h1>
          </div>

          {/* Right placeholder image */}
          <div className="relative aspect-[37/20] w-full overflow-hidden lg:aspect-auto lg:h-full">
            <Image
              src="/images/ban-jobs.jpg"
              alt="Jobs Hero"
              fill
              sizes="(min-width: 1024px) 40vw, 80vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="w-[80vw] max-w-[80vw] mx-auto flex justify-center py-10">
        <Link href="/contact">
          <button
            type="button"
            className="h-11 px-10 rounded-md bg-[#111010] text-[#fefdf8] text-xs font-semibold tracking-wide uppercase border border-black/20 hover:bg-[#5a6b3e] transition cursor-pointer"
          >
            Join the team
          </button>
        </Link>
      </div>

      {/* Posters grid */}
      <section className="w-[80vw] max-w-[80vw] mx-auto pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {images.map((src, idx) => (
            <div key={src} className="w-full">
              <div className="w-full overflow-hidden bg-[#fefdf8]">
                <img
                  src={src}
                  alt={`Job poster ${idx + 1}`}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
