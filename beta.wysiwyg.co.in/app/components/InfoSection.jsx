// components/InfoSection.jsx
import Image from "next/image";
import FadeIn from "./FadeIn";

const InfoSection = () => {
  return (
    <div className=" bg-[#fefdf8]">
      <FadeIn>
        <div className="flex flex-col md:flex-row justify-center items-start gap-8 p-8 py-[10vh]">
          {/* Awards Section */}
          <div className="border p-6 w-full md:w-1/3 text-center  transform transition duration-500 ease-in-out hover:-translate-y-2 ">
            <h2 className="text-3xl font-bold mb-4">Awards</h2>
            <Image
              src="/images/Ambuja.png"
              alt="Award Trophy"
              width={300}
              height={300}
              className="mx-auto mb-2 "
            />
            <p className="font-semibold">Ambuja Utalika</p>
            <button className="mt-4 relative rounded-lg overflow-hidden group inline-flex items-center gap-2 px-4 py-2  border border-black text-black bg-white cursor-pointer">
              <span className="relative z-10 group-hover:text-white transition-colors duration-300 ">
                MORE AWARDS
              </span>
              <span className="text-2xl relative z-10 group-hover:text-white transition-colors duration-300">
                ▶
              </span>
              <span className="absolute inset-0 bg-[#111010] scale-x-0 origin-left transition-transform duration-500 ease-in-out group-hover:scale-x-100"></span>
            </button>
          </div>

          {/* Travel+ Section */}
          <div className="border p-6 w-full md:w-1/3 text-center bg-[#111010] text-white transform transition duration-500 ease-in-out hover:-translate-y-2 ">
            <h2 className="text-3xl font-bold mb-4">Travel+</h2>
            <Image
              src="/images/INSTA.png"
              alt="Durga Puja Theme"
              width={300}
              height={300}
              className="mx-auto mb-2 "
            />
            <p className="text-sm">
              Kolkata Pujas <span className="font-bold">Wysiwyg</span>
            </p>
            <button className="mt-4 relative overflow-hidden group inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white text-white bg-black cursor-pointer">
              <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                MORE INSIGHT
              </span>
              <span className="text-2xl relative z-10 group-hover:text-black transition-colors duration-300">
                ▶
              </span>
              <span className="absolute inset-0 bg-white scale-x-0 origin-left transition-transform duration-500 ease-in-out group-hover:scale-x-100"></span>
            </button>
          </div>

          {/* Newsletter Section */}
          <div className="border p-6 w-full md:w-1/3 text-center  transform transition duration-500 ease-in-out hover:-translate-y-2 ">
            <h2 className="text-3xl font-bold mb-4">Newsletter</h2>
            <Image
              src="/images/newsletter.png"
              alt="Newsletter Moth Icon"
              width={300}
              height={300}
              className="mx-auto mb-2 rounded-lg"
            />
            <p className="font-semibold">Client News Design Views:</p>

            <button className="mt-4 relative overflow-hidden group inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-black text-black bg-white cursor-pointer">
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                SUBSCRIBE NOW
              </span>
              <span className="text-2xl relative z-10 group-hover:text-white transition-colors duration-300">
                ▶
              </span>
              <span className="absolute inset-0 bg-black scale-x-0 origin-left transition-transform duration-500 ease-in-out group-hover:scale-x-100"></span>
            </button>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default InfoSection;
