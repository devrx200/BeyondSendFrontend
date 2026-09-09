import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import GovtBrandCarousel from "./GovtBrandCarousel";
import PageLoader from "./PageLoader";

const MainLayout = ({ children }) => {
  return (
    <div className="app-wrapper d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 position-relative">
        <Suspense fallback={<PageLoader />}>
          {children || <Outlet />}
        </Suspense>
      </main>
      <GovtBrandCarousel />
      <Footer />
    </div>
  );
};

export default MainLayout;
