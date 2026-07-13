import EditableImage from "./EditableImage";

const NEWS_LINK = "";

/** Full-viewport news hero: top bar + image aligned to the bottom of the screen (Tailwind only). */
export default function NewsHeroBottomImage() {
  return (
    <section className="flex  flex-col bg-[#111010]">
    
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-end">
        <a
          href={NEWS_LINK}
          aria-label="View Siddha Serena news"
          className="relative block aspect-[1920/1080] w-[86vw] shrink-0"
        >
          <EditableImage
            keyName="home.news.heroImage"
            fallback="/images/img-News-Siddha-Serena.jpeg"
            alt="Siddha Serena news"
            fill
            wrapperClassName="h-full w-full"
            sizes="80vw"
            className=" rounded-t-md object-contain object-bottom"
          />
        </a>
      </div>
    </section>
  );
}
