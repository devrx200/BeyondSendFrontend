import HeroSlider from "../../components/HeroSlider";
import NoticeTicker from "../../components/NoticeTicker";
import AfterCarousel from "../../components/AfterCarousel";
import AboutSection from "../../components/AboutSection";
import ImportantLinksSection from "../../components/ImportantLinksSection";
import AnnouncementsAndSchemes from "../../components/AnnouncementsAndSchemes";
import NoticeDepAndDirectorate from "../../components/NoticeDepAndDirectorate";
import QuickAccess from "../../components/QuickAccess";

import { useLanguage } from "../../contexts/LanguageContext";

const Home = () => {
  const { isHindi } = useLanguage();

  return (
    <div>
      <HeroSlider />
      <NoticeTicker />
      <AfterCarousel />
      <AboutSection />

      {/* ✅ Now self-managed */}
      <QuickAccess isHindi={isHindi} />

      <NoticeDepAndDirectorate />
      <AnnouncementsAndSchemes />
      <ImportantLinksSection />
    </div>
  );
};

export default Home;