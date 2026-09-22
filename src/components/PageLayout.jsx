import { Container } from "reactstrap";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../contexts/LanguageContext";
import DynamicBreadcrumb from "./Breadcrumb";
import { FaRocket } from "react-icons/fa";

const SITE_TITLE_SUFFIX = "BeyondSend";

const PageLayout = ({
  title,
  titleHi,
  description,
  descriptionHi,
  children,
  showBreadcrumb = true,
}) => {
  const { isHindi } = useLanguage();
  const pageTitle = isHindi && titleHi ? titleHi : title;
  const pageDescription = isHindi && descriptionHi ? descriptionHi : description;
  const canonicalUrl =
    typeof window !== "undefined" ? window.location.href.split("?")[0] : "";

  return (
    <>
      {/* SEO */}
      <Helmet>
        <html lang={isHindi ? "hi" : "en"} />
        <title>
          {pageTitle} - {SITE_TITLE_SUFFIX}
        </title>
        {pageDescription && (
          <meta name="description" content={pageDescription} />
        )}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta
          property="og:title"
          content={`${pageTitle} - ${SITE_TITLE_SUFFIX}`}
        />
        {pageDescription && (
          <meta property="og:description" content={pageDescription} />
        )}
        <meta property="og:type" content="website" />
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        <meta property="og:site_name" content={SITE_TITLE_SUFFIX} />
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content={`${pageTitle} - ${SITE_TITLE_SUFFIX}`}
        />
        {pageDescription && (
          <meta name="twitter:description" content={pageDescription} />
        )}
      </Helmet>

      <div className="page-layout">
        {/* Dynamic Breadcrumb */}
        {showBreadcrumb && <DynamicBreadcrumb />}

        {/* Premium Page Header */}
        {title && (
          <Container className="mt-2 mt-md-3 px-2 px-sm-3">
            <div className="pub-page-header">
              {/* Dot grid overlay */}
              <div className="pub-dot-grid" aria-hidden="true" />

              {/* Live platform badge */}
              <div className="pub-page-header-badge" style={{ position: "relative", zIndex: 1 }}>
                <FaRocket size={10} />
                BeyondSend Platform
              </div>

              {/* Page Title */}
              <h1 className="pub-page-header-title">
                {isHindi && titleHi ? titleHi : title}
              </h1>

              {/* Page Description */}
              <p className="pub-page-header-desc mb-0">
                {pageDescription || (isHindi
                  ? "बियॉन्डसेंड — आधिकारिक पृष्ठ"
                  : "BeyondSend — Official Page")}
              </p>
            </div>
          </Container>
        )}

        {/* Page Content */}
        <main className="page-content pb-4 pb-md-5" role="main">
          <Container className="px-2 px-sm-3">{children}</Container>
        </main>
      </div>
    </>
  );
};

export default PageLayout;