import { Container } from "reactstrap";
import { useLanguage } from "@/contexts/LanguageContext";
import DynamicBreadcrumb from "@/components/headers/Breadcrumb";
import SEOHead from "@/components/common/SEOHead";
import { FaRocket } from "react-icons/fa";

const PageLayout = ({
  title,
  titleHi,
  description,
  descriptionHi,
  keywords,
  canonical,
  ogImage,
  noindex = false,
  schema,
  children,
  showBreadcrumb = true,
}) => {
  const { isHindi } = useLanguage();
  const displayTitle = isHindi && titleHi ? titleHi : title;
  const displayDescription = isHindi && descriptionHi ? descriptionHi : description;

  return (
    <>
      {/* ── Comprehensive Google & Lighthouse SEO Head ── */}
      <SEOHead
        title={title}
        titleHi={titleHi}
        description={description}
        descriptionHi={descriptionHi}
        keywords={keywords}
        canonical={canonical}
        ogImage={ogImage}
        noindex={noindex}
        schema={schema}
      />

      <div className="page-layout">
        {/* Dynamic Breadcrumb */}
        {showBreadcrumb && <DynamicBreadcrumb />}

        {/* Premium Semantic Page Header */}
        {title && (
          <header className="page-header-wrap" role="banner">
            <Container className="mt-2 mt-md-3 px-2 px-sm-3">
              <div className="pub-page-header">
                {/* Dot grid overlay */}
                <div className="pub-dot-grid" aria-hidden="true" />

                {/* Live platform badge */}
                <div
                  className="pub-page-header-badge"
                  style={{ position: "relative", zIndex: 1 }}
                >
                  <FaRocket size={10} aria-hidden="true" />
                  <span>BeyondSend Platform</span>
                </div>

                {/* Single H1 Heading for Lighthouse 100% SEO */}
                <h1 className="pub-page-header-title">
                  {displayTitle}
                </h1>

                {/* Page Description */}
                <p className="pub-page-header-desc mb-0">
                  {displayDescription ||
                    (isHindi
                      ? "बियॉन्डसेंड — आधिकारिक पृष्ठ"
                      : "BeyondSend — Official Page")}
                </p>
              </div>
            </Container>
          </header>
        )}

        {/* Semantic Page Content */}
        <main className="page-content pb-4 pb-md-5" role="main">
          <Container className="px-2 px-sm-3">{children}</Container>
        </main>
      </div>
    </>
  );
};

export default PageLayout;