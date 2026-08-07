import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Spinner, Container } from "reactstrap";
import ImportantPageDetail from "../views/pages/ImportantPageDetail";
import RichContentPages from "../views/pages/RichContentPages";
import MultiSectionPages from "../views/pages/MultiSectionPages";
import { useLanguage } from "../contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL;
const SITE_TITLE_SUFFIX = "Department of Higher Education, Government of Chhattisgarh India.";

const SlugResolver = ({ preview = false }) => {
  const location = useLocation();
  const { isHindi } = useLanguage();
  const isPreview = preview || location.pathname.startsWith("/preview/");
  let slugForApi = location.pathname.replace(/^\/+/, "");
  if (isPreview) {
    slugForApi = slugForApi.replace(/^preview\//, "");
  }

  const [status, setStatus] = useState("loading");
  const [pageData, setPageData] = useState(null);
  const [pageTitle, setPageTitle] = useState("");
  const [errorDetails, setErrorDetails] = useState("");

  const fetchData = useCallback(async (page = 1, limit = 10) => {
    try {
      setStatus("loading");
      const response = await axios.post(`${API}/api/resolve-slug/get-page`, {
        fullSlug: slugForApi,
        preview: isPreview,
        page,
        limit,
      });
      const data = response.data;
      if (data?.success) {
        setPageData(data.data);
        setStatus(data.type);
        // Extract title for SEO
        if (data.data) {
          const title = isHindi 
            ? (data.data.titleHi || data.data.titleEn) 
            : (data.data.titleEn || data.data.titleHi);
          setPageTitle(title || "");
        }
      } else {
        setStatus("404");
        if (data?.details) setErrorDetails(data.details);
      }
    } catch (error) {
      setStatus("404");
      if (error.response?.data?.details) {
        setErrorDetails(error.response.data.details);
      }
    }
  }, [slugForApi, isPreview, isHindi]);

  useEffect(() => {
    if (!slugForApi) {
      setStatus("404");
      return;
    }
    fetchData();
  }, [slugForApi, isPreview, fetchData]);

  if (status === "loading") {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? "hi" : "en"} />
          <title>{isHindi ? "लोड हो रहा है..." : "Loading..."} - {SITE_TITLE_SUFFIX}</title>
        </Helmet>
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
          <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3 text-muted fw-semibold">{isHindi ? "लोड हो रहा है..." : "Loading..."}</p>
        </div>
      </>
    );
  }

  if (status === "important") {
    return <ImportantPageDetail prefetchedData={pageData} />;
  }

  if (status === "rich") {
    return <RichContentPages prefetchedData={pageData} preview={isPreview} />;
  }

  if (status === "multi-list" || status === "multi-detail") {
    return (
      <MultiSectionPages
        prefetchedData={pageData}
        mode={status}
        fullSlug={slugForApi}
        onPageChange={(page) => fetchData(page, 10)}
        preview={isPreview}
      />
    );
  }

  return (
    <>
      <Helmet>
        <html lang={isHindi ? "hi" : "en"} />
        <title>{isHindi ? "पेज नहीं मिला" : "Page Not Found"} - {SITE_TITLE_SUFFIX}</title>
      </Helmet>
      <Container className="py-5 text-center">
        <h1 className="fw-bold" style={{ fontSize: "80px", color: "#0d6efd" }}>404</h1>
        <h4>{isHindi ? "पेज नहीं मिला" : "Page Not Found"}</h4>
        <p className="text-muted">
          {isHindi ? "यह पेज उपलब्ध नहीं है।" : "This page does not exist."}
          {errorDetails && <small className="text-danger mt-2 d-block">{errorDetails}</small>}
        </p>
        <Link to="/" className="btn btn-primary rounded-pill px-4 mt-3">
          {isHindi ? "होम पेज पर जाएं" : "Go to Home"}
        </Link>
      </Container>
    </>
  );
};

export default SlugResolver;