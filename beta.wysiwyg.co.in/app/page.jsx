import Clients from "./components/Clients";

import FeaturedContent from "./components/FeaturedContent";
import Industries from "./components/Industries";
import Main from "./components/Main";
import NewsHeroBottomImage from "./components/NewsHeroBottomImage";
import SiddhaNewsBottomSection from "./components/SiddhaNewsBottomSection";
import StatisticSection from "./components/StatisticSection";
import HorizontalAwardSection from "./components/HorizontalAwardsSection";
import PreFooterCreativity from "./components/PreFooterCreativity";
import InTheNewsHeader from "./components/InTheNewsHeader";
import FadeIn from "./components/FadeIn";

export default function Home() {

  
  return (
   
    <div className="relative gap-16 font-[var(--font-plus-jakarta)]">
      <Main />
      <Clients />
      <div className="bg-[#111010] pt-10 pb-6">
        <div className="w-[80vw] mx-auto">
          <InTheNewsHeader text="In the news" keyName="home.news.heading" />
        </div>
      </div>
      <NewsHeroBottomImage />
      <SiddhaNewsBottomSection />
      <FeaturedContent /> 
      <StatisticSection />
      <div className="bg-[#111010] pt-10 pb-6">
        <FadeIn>
          <InTheNewsHeader text="our work" keyName="home.work.heading" />
        </FadeIn>
      </div>

      <Industries />

      

      <HorizontalAwardSection />
      <PreFooterCreativity />
    </div>
  );
}
