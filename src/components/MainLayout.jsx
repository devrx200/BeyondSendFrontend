import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import FooterBrandCarousel from "./FooterBrandCarousel";
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
      <FooterBrandCarousel />
      <Footer />
    </div>
  );
};

export default MainLayout;
