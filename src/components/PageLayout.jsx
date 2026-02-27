import { Container } from "reactstrap";
import { useLanguage } from "../contexts/LanguageContext";
import DynamicBreadcrumb from "./Breadcrumb";
import { useEffect, useState } from "react";
import bgImg from "../assets/page-bg.svg";
const PageLayout = ({ title, titleHi, children, showBreadcrumb = true }) => {
  const { isHindi } = useLanguage();


  return (
    <div
      className="page-layout"
      style={{
        backgroundColor: "#f4f6f9",
        backgroundImage: `url(${bgImg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
        backgroundSize: "cover",
        minHeight: "100vh"
      }}
    >

      {/* Dynamic Breadcrumb */}
      {showBreadcrumb && <DynamicBreadcrumb />}

      {/* Page Header */}
      {title && (
        <Container className="mt-3">
          <div
            className="rounded-top-3 border border-1 border-white  shadow text-white p-4 mb-4"
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
  );
};

export default PageLayout;
