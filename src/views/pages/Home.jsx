import {
  AboutSection,
  QuickAccess,
  HeroSection,
  FeaturesSection,
  SEOHead,
} from "@/components";
import { useLanguage } from "../../contexts/LanguageContext";

const Home = () => {
  const { isHindi } = useLanguage();

  const titleEn = "BeyondSend - Customer Communication & Marketing Automation Platform";
  const titleHi = "बियॉन्डसेंड - कस्टमर कम्युनिकेशन एवं मार्केटिंग ऑटोमेशन प्लेटफॉर्म";

  const descEn = "BeyondSend is an enterprise customer communication and marketing automation platform that empowers businesses to engage customers across SMS, WhatsApp, RCS, and Email from a unified console.";
  const descHi = "बियॉन्डसेंड एक एंटरप्राइज कस्टमर कम्युनिकेशन एवं मार्केटिंग ऑटोमेशन प्लेटफॉर्म है जो व्यवसायों को एसएमएस, व्हाट्सएप, आरसीएस और ईमेल पर ग्राहकों से जुड़ने में सक्षम बनाता है।";

  const homeKeywords = [
    "BeyondSend",
    "Customer Communication",
    "Marketing Automation Platform",
    "Bulk SMS Gateway",
    "WhatsApp Business Solution",
    "RCS Messaging Service",
    "Transactional Email API",
    "Voice Broadcasting Platform",
    "Telecom API Solutions"
  ];

  const softwareSchema = {
    "@type": "SoftwareApplication",
    "@id": "https://beyondsend.in/#software",
    "name": "BeyondSend",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser, Cloud-based",
    "description": descEn,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    }
  };

  return (
    <>
      <SEOHead
        title={titleEn}
        titleHi={titleHi}
        description={descEn}
        descriptionHi={descHi}
        keywords={homeKeywords}
        canonical="https://beyondsend.in/"
        schema={softwareSchema}
      />

      <main role="main" id="main-content">
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <QuickAccess isHindi={isHindi} />
      </main>
    </>
  );
};

export default Home;