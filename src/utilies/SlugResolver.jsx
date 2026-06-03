import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Spinner, Container } from "reactstrap";
import ImportantPageDetail from "../views/pages/ImportantPageDetail";
import RichContentPages from "../views/pages/RichContentPages";
import { useLanguage } from "../contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL;

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

  useEffect(() => {
    let mounted = true;

    const fetchPage = async () => {
      try {
        if (!slugForApi) {
          setStatus("404");
          return;
        }
        setStatus("loading");
        const response = await axios.post(`${API}/api/resolve-slug/get-page`, {
          fullSlug: slugForApi,
          preview: isPreview,
        });

        if (!mounted) return;

        const data = response.data;

        if (data?.success) {
          setPageData(data.data);
          setStatus(data.type);
        } else {
          setStatus("404");
        }
      } catch (error) {
        if (mounted) {
          setStatus("404");
        }
      }
    };

    fetchPage();

    return () => {
      mounted = false;
    };
  }, [slugForApi, isPreview]);

  if (status === "loading") {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
        <p className="mt-3 text-muted fw-semibold">
          {isHindi ? "लोड हो रहा है..." : "Loading..."}
        </p>
      </div>
    );
  }

  if (status === "important") {
    return <ImportantPageDetail prefetchedData={pageData} />;
  }

  if (status === "rich") {
    return <RichContentPages prefetchedData={pageData}  preview={isPreview} />;
  }

  return (
    <Container className="py-5 text-center">
      <h1 className="fw-bold" style={{ fontSize: "80px", color: "#0d6efd" }}>
        404
      </h1>
      <h4>{isHindi ? "पेज नहीं मिला" : "Page Not Found"}</h4>
      <p className="text-muted">
        {isHindi ? "यह पेज उपलब्ध नहीं है。" : "This page does not exist."}
      </p>
      <Link to="/" className="btn btn-primary rounded-pill px-4">
        {isHindi ? "होम पेज पर जाएं" : "Go to Home"}
      </Link>
    </Container>
  );
};

export default SlugResolver;