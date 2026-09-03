import { Container } from "reactstrap";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../contexts/LanguageContext";
import DynamicBreadcrumb from "./Breadcrumb";

const SITE_TITLE_SUFFIX =
  "Department of Higher Education, Government of Chhattisgarh India.";

const PageLayout = ({
  title,
  titleHi,
  description,
  descriptionHi,
  children,
  showBreadcrumb = true,
}) => {
  const { isHindi } = useLanguage();
  // Choose title based on language
  const pageTitle = isHindi && titleHi ? titleHi : title;
  const pageDescription = isHindi && descriptionHi ? descriptionHi : description;
  const canonicalUrl =
    typeof window !== "undefined" ? window.location.href.split("?")[0] : "";

  return (
    <>
      {/* SEO: Dynamic title, description, and language */}
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

        {/* Page Header */}
        {title && (
          <Container className="mt-2 mt-md-3 px-2 px-sm-3">
            <div
              className="rounded-3 rounded-md-4 border border-1 border-white border-opacity-25 shadow text-white p-3 p-md-4 mb-3 mb-md-4"
              style={{
                background:
                  "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
                boxShadow: "0 8px 24px rgba(30, 58, 138, 0.18)"
              }}
            >
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
                {/* Title */}
                <div>
                  <h1 className="h4 h3-md fw-bold mb-1 text-white" style={{ fontSize: "clamp(1.25rem, 2.8vw, 1.75rem)" }}>
                    {isHindi && titleHi ? titleHi : title}
                  </h1>
                  <div className="opacity-75 small">
                    {pageDescription || (isHindi
                      ? "उच्च शिक्षा विभाग, छत्तीसगढ़ शासन — आधिकारिक पृष्ठ"
                      : "Department of Higher Education, Govt. of Chhattisgarh — Official Page")}
                  </div>
                </div>
              </div>
            </div>
          </Container>
        )}
        {/* Page Content — wrapped in <main> for accessibility */}
        <main className="page-content pb-4 pb-md-5" role="main">
          <Container className="px-2 px-sm-3">{children}</Container>
        </main>
      </div>
    </>
  );
};

export default PageLayout;