import { Helmet } from 'react-helmet-async';
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
  const pageTitle = isHindi
    ? "उच्च शिक्षा विभाग की आधिकारिक वेबसाइट, छत्तीसगढ़ सरकार, भारत"
    : "Department of Higher Education, Government of Chhattisgarh, India";

  const metaDescription = isHindi
    ? "छत्तीसगढ़ राज्य में उच्च शिक्षा विभाग उत्कृष्टता को केन्द्र में रखकर, विश्वविद्यालयों एवं महाविद्यालयों का विस्तार करते हुये उच्च शिक्षा की सुविधा अधिकाधिक युवाओं तक पहुँचाने के लिये दृढप्रतिज्ञ है। यहाँ आपको राज्य के 9 शासकीय विश्वविद्यालय, 335 शासकीय महाविद्यालय, और प्रमुख छात्रवृत्तियों (मुख्यमंत्री उच्च शिक्षा प्रोत्साहन योजना, बीपीएल छात्रवृत्ति) के बारे में विस्तृत जानकारी मिलेगी।"
    : "The Department of Higher Education, Government of Chhattisgarh, is committed to expanding access to quality higher education across the state. It oversees 9 government universities, and 335 government colleges. The department implements key initiatives like the Mukhyamantri Uchcha Shiksha Protsahan Yojana, BPL scholarships, and the PM-USHA scheme to promote equity, excellence, and skill development for the youth of Chhattisgarh. This is the official website for all updates, policies, and recruitment notifications.";

  const canonicalUrl = "https://highereducation.cg.gov.in";
  const ogImage = "/Chhattisgarh.svg";

  return (
    <>
      <Helmet>
        <html lang={isHindi ? "hi" : "en"} />
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="Department of Higher Education, Chhattisgarh" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      </Helmet>

      <div>
        <HeroSlider />
        <NoticeTicker />
        <AfterCarousel />
        <AboutSection />
        <QuickAccess isHindi={isHindi} />
        <NoticeDepAndDirectorate />
        <AnnouncementsAndSchemes />
        <ImportantLinksSection />
      </div>
    </>
  );
};

export default Home;