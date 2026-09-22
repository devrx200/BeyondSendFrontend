import { Helmet } from 'react-helmet-async';
import AboutSection from "../../components/AboutSection";
import QuickAccess from "../../components/QuickAccess";
import HeroSection from "../../components/HeroSection";
import FeaturesSection from "../../components/FeaturesSection";
import { useLanguage } from "../../contexts/LanguageContext";

const Home = () => {
  const { isHindi } = useLanguage();
  const pageTitle = isHindi
    ? "बियॉन्डसेंड - कस्टमर कम्युनिकेशन एवं मार्केटिंग ऑटोमेशन प्लेटफॉर्म"
    : "BeyondSend - Customer Communication & Marketing Automation Platform";

  const metaDescription = isHindi
    ? "बियॉन्डसेंड एक आधुनिक कस्टमर कम्युनिकेशन, कैंपेन ऑटोमेशन एवं डेटा-ड्रिवन मार्केटिंग प्लेटफॉर्म है जो व्यवसायों को ग्राहकों से जुड़े रहने, अभियान चलाने और परिणाम मापने में मदद करता है।"
    : "BeyondSend is a modern customer communication and marketing automation platform that helps businesses engage customers, run multi-channel campaigns, and measure results from a single console.";

  const canonicalUrl = "https://beyondsend.in";
  const ogImage = "/beyondsend-logo.svg";

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
        <meta property="og:site_name" content="BeyondSend" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      </Helmet>

      <div>
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <QuickAccess isHindi={isHindi} />
      </div>
    </>
  );
};

export default Home;