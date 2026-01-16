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
        <div className="page-header bg-gradient-primary text-white py-4 mb-4">
          <Container>
            <h1 className="page-title mb-0">
              {isHindi && titleHi ? titleHi : title}
            </h1>
          </Container>
        </div>
      )}

      {/* Page Content */}
      <div className="page-content pb-5">
        <Container>{children}</Container>
      </div>
    </div>
  );
};

export default PageLayout;
