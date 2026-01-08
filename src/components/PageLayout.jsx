import { Container } from "reactstrap";
import { useLanguage } from "../contexts/LanguageContext";
import DynamicBreadcrumb from "./Breadcrumb";
import { useEffect, useState } from "react";

const PageLayout = ({ title, titleHi, children, showBreadcrumb = true }) => {
  const { isHindi } = useLanguage();

 
  return (
    <div className="page-layout">
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
