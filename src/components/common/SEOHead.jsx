import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

const CANONICAL_ORIGIN = "https://beyondsend.in";
const DEFAULT_IMAGE = `${CANONICAL_ORIGIN}/beyondsend-logo.svg`;
const SITE_NAME = "BeyondSend";

const DEFAULT_KEYWORDS_EN = [
  "BeyondSend",
  "Customer Communication Platform",
  "Marketing Automation",
  "Bulk SMS Marketing",
  "Email Campaigns",
  "WhatsApp Business API",
  "RCS Messaging",
  "Voice Broadcasting",
  "Transactional Messaging",
  "Telecom Marketing Solutions"
];

const DEFAULT_KEYWORDS_HI = [
  "बियॉन्डसेंड",
  "ग्राहक संचार मंच",
  "मार्केटिंग ऑटोमेशन",
  "थोक एसएमएस विपणन",
  "ईमेल अभियान",
  "व्हाट्सएप बिजनेस एपीआई",
  "आरसीएस मैसेजिंग",
  "वॉइस ब्रॉडकास्टिंग"
];

/**
 * SEOHead - High-performance, 100% Google Lighthouse & Indexing compliant Meta Manager.
 */
const SEOHead = ({
  title = "BeyondSend - Transforming Raw Data into Loyal Customers",
  titleHi,
  description = "BeyondSend unlocks the power of seamless customer communication, behavior analysis, and data-driven marketing across SMS, WhatsApp, RCS, and Email.",
  descriptionHi = "बियॉन्डसेंड एसएमएस, व्हाट्सएप, आरसीएस एवं ईमेल के माध्यम से निर्बाध ग्राहक संचार, व्यवहार विश्लेषण और डेटा-आधारित मार्केटिंग को सशक्त बनाता है।",
  keywords,
  canonical,
  ogType = "website",
  ogImage = DEFAULT_IMAGE,
  noindex = false,
  schema = null,
}) => {
  const { isHindi } = useLanguage();

  const activeTitle = isHindi && titleHi ? titleHi : title;
  const fullTitle = activeTitle.includes(SITE_NAME)
    ? activeTitle
    : `${activeTitle} - ${SITE_NAME}`;

  const activeDescription = isHindi && descriptionHi ? descriptionHi : description;

  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";
  const canonicalUrl = canonical || `${CANONICAL_ORIGIN}${currentPath}`;

  const activeKeywords = Array.isArray(keywords)
    ? keywords.join(", ")
    : keywords || (isHindi ? DEFAULT_KEYWORDS_HI.join(", ") : DEFAULT_KEYWORDS_EN.join(", "));

  const robotsContent = noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  // Build standard structured data
  const baseJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: fullTitle,
        description: activeDescription,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${CANONICAL_ORIGIN}/#website`,
          name: SITE_NAME,
          url: CANONICAL_ORIGIN,
        },
        inLanguage: isHindi ? "hi" : "en",
      },
      schema ? schema : null,
    ].filter(Boolean),
  };

  return (
    <Helmet>
      {/* ── Core Document Attributes ── */}
      <html lang={isHindi ? "hi" : "en"} />
      <title>{fullTitle}</title>
      <meta name="description" content={activeDescription} />
      <meta name="keywords" content={activeKeywords} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />

      {/* ── Internationalization / Hreflang ── */}
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="hi" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* ── OpenGraph / Facebook / LinkedIn / WhatsApp ── */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={activeDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content={isHindi ? "hi_IN" : "en_US"} />

      {/* ── Twitter Cards ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@BeyondSend" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={activeDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* ── Structured Data JSON-LD ── */}
      <script type="application/ld+json">
        {JSON.stringify(baseJsonLd)}
      </script>
    </Helmet>
  );
};

export default SEOHead;
