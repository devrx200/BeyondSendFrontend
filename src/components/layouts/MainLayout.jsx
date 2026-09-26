import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "../headers/Header";
import Footer from "../footers/Footer";
import FooterBrandCarousel from "../footers/FooterBrandCarousel";
import PageLoader from "../common/PageLoader";

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
