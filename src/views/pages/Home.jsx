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

  const titleEn = "BeyondSend | Omnichannel CPaaS Platform in India";
  const titleHi = "BeyondSend - भारत का ओम्नीचैनल CPaaS प्लेटफ़ॉर्म";

  const descEn = "Unify SMS, RCS, email, WhatsApp, and voice with BeyondSend's omnichannel CPaaS platform in India. Improve delivery with real-time insights and secure infrastructure.";
  const descHi = "BeyondSend के ओम्नीचैनल CPaaS प्लेटफ़ॉर्म से SMS, RCS, ईमेल, WhatsApp और वॉइस संचार एक जगह संभालें। रीयल-टाइम इनसाइट्स और सुरक्षित इंफ्रास्ट्रक्चर पाएं।";

  const homeKeywords = [
    "BeyondSend",
    "Omnichannel CPaaS Platform India",
    "Customer Communication Platform",
    "Enterprise CPaaS",
    "Bulk SMS Service India",
    "SMS API India",
    "WhatsApp Business API",
    "RCS Business Messaging",
    "Transactional Email Service",
    "Voice Communication Platform",
    "Marketing Automation Platform"
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
        <AboutSection />
        <FeaturesSection />
        <QuickAccess isHindi={isHindi} />
      </main>
    </>
  );
};

export default Home;