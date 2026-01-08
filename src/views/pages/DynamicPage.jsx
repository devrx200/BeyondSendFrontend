import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const DynamicPage = () => {
  const location = useLocation();
  const menu = location.state?.menu;
  const data = location.state?.pageData;
  const pageData = data && data[0];


  return (
    <div className="container my-5">
      {menu && (
        <div className="mb-3 text-muted">
          <small>
            {menu.titleEng}({menu.path})
          </small>
        </div>
      )}

      {pageData ? (
       <>
  {/* 🔹 PAGE WRAPPER */}
  <section className="container my-5">
    <div
      className="card border-0 shadow-sm rounded-4 p-4 p-md-5"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* 🔹 TITLE */}
      <h2 className="fw-bold mb-2 text-dark">
        {pageData.titleEn}
      </h2>

      {/* 🔹 META INFO */}
      <div className="text-muted small mb-3">
        <span>
          Published on:{" "}
          {new Date(pageData.createdAt).toLocaleDateString()}
        </span>
        {" • "}
        <span>
          Valid till:{" "}
          {new Date(pageData.expirydate).toLocaleDateString()}
        </span>
      </div>

      {/* 🔹 SHORT DESCRIPTION */}
      <p className="fs-6 text-secondary mb-4">
        {pageData.shortDescriptionEn}
      </p>

      {/* 🔹 IMAGE CONTENT */}
      {pageData.contentType === "IMAGE" && pageData.content?.file && (
        <div className="text-center my-4">
          <img
            src={pageData.content.file}
            alt={pageData.titleEn}
            className="img-fluid rounded-3 shadow"
            style={{ maxHeight: "420px", objectFit: "contain" }}
          />
        </div>
      )}

      {/* 🔹 MAIN DESCRIPTION */}
      <div className="mt-4">
        <p
          className="text-dark lh-lg"
          style={{ fontSize: "1rem" }}
        >
          {pageData.descriptionEn}
        </p>
      </div>

      {/* 🔹 EXTERNAL LINK */}
      {pageData.link && (
        <div className="mt-4">
          <a
            href={pageData.link}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary px-4 py-2"
          >
            Visit Related Page
          </a>
        </div>
      )}
    </div>
  </section>
</>

      ) : (
        <div>No Data found</div>
      )}
    </div>
  );
};

export default DynamicPage;
