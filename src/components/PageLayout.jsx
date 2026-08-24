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
          <Container className="mt-3">
            <div
              className="rounded-top-3 border border-1 border-white shadow text-white p-3 p-md-4 mb-4"
              style={{
                background:
                  "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)",
              }}
            >
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between">
                {/* Title */}
                <div>
                  <h1 className="h3 fw-bold mb-2 mb-md-0 text-white">
                    {isHindi && titleHi ? titleHi : title}
                  </h1>
                  <div className="opacity-75 small">
                    {isHindi
                      ? "आधिकारिक पृष्ठ जानकारी"
                      : "Official Page Information"}
                  </div>
                </div>
              </div>
            </div>
          </Container>
        )}
        {/* Page Content — wrapped in <main> for accessibility */}
        <main className="page-content pb-4 pb-md-5" role="main">
          <Container>{children}</Container>
        </main>
      </div>
    </>
  );
};

export default PageLayout;