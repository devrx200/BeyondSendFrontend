import { Container } from "reactstrap";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../contexts/LanguageContext";
import DynamicBreadcrumb from "./Breadcrumb";

const PageLayout = ({ title, titleHi, children, showBreadcrumb = true }) => {
  const { isHindi } = useLanguage();
  // Choose title based on language
  const pageTitle = isHindi && titleHi ? titleHi : title;
  return (
    <>
      {/* SEO: Dynamic title and language */}
      <Helmet>
        <html lang={isHindi ? "hi" : "en"} />
        <title>{pageTitle} - Department of Higher Education, Government of Chhattisgarh India.</title>
      </Helmet>

      <div className="page-layout">
        {/* Dynamic Breadcrumb */}
        {showBreadcrumb && <DynamicBreadcrumb />}

        {/* Page Header */}
        {title && (
          <Container className="mt-3">
            <div
              className="rounded-top-3 border border-1 border-white shadow text-white p-4 mb-4"
              style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)",
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
        {/* Page Content */}
        <div className="page-content pb-5">
          <Container>{children}</Container>
        </div>
      </div>
    </>
  );
};

export default PageLayout;