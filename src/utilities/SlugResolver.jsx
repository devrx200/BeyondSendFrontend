import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Spinner, Container } from "reactstrap";
import PageLoader from "../components/PageLoader";
import ImportantPageDetail from "../views/pages/ImportantPageDetail";
import RichContentPages from "../views/pages/RichContentPages";
import MultiSectionPages from "../views/pages/MultiSectionPages";
import { useLanguage } from "../contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL;
const SITE_TITLE_SUFFIX = "Department of Higher Education, Government of Chhattisgarh India.";

const SlugResolver = ({ preview = false, fullSlugOverride }) => {
  const location = useLocation();
  const { isHindi } = useLanguage();
  const isPreview = preview || location.pathname.startsWith("/preview/");
  let slugForApi = fullSlugOverride || location.pathname.replace(/^\/+/, "");
  if (isPreview && !fullSlugOverride) {
    slugForApi = slugForApi.replace(/^preview\//, "");
  }

  const [status, setStatus] = useState("loading");
  const [pageData, setPageData] = useState(null);
  const [pageTitle, setPageTitle] = useState("");
  const [errorDetails, setErrorDetails] = useState("");

  const fetchData = useCallback(async (page = 1, limit = 10) => {
    try {
      setStatus("loading");
      let response = await axios.post(
        `${API}/api/resolve-slug/get-page`,
        {
          fullSlug: slugForApi,
          preview: isPreview,
          page,
          limit,
        },
        {
          validateStatus: (status) => status < 500,
        }
      );

      if ((!response.data?.success || response.status !== 200) && (slugForApi === "about" || slugForApi === "about-us")) {
        const altSlug = slugForApi === "about" ? "about-us" : "about";
        const altResponse = await axios.post(
          `${API}/api/resolve-slug/get-page`,
          {
            fullSlug: altSlug,
            preview: isPreview,
            page,
            limit,
          },
          {
            validateStatus: (status) => status < 500,
          }
        );
        if (altResponse.status === 200 && altResponse.data?.success) {
          response = altResponse;
        }
      }

      const data = response.data;
      if (response.status === 200 && data?.success) {
        setPageData(data.data);
        setStatus(data.type);
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
        <PageLoader inline={true} />
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
      <div className="my-5">
        <Container className="py-5 text-center shadow rounded-5">
          <div className="d-flex justify-content-center mb-3">
            <img
              src="/404.svg"
              alt="404"
              style={{ maxWidth: "420px", width: "100%", height: "auto" }}
            />
          </div>

          <h2 className="fw-bold mb-2" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)", color: "#1e293b" }}>
            {isHindi ? "पृष्ठ नहीं मिला" : "Page Not Found"}
          </h2>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: 480, fontSize: "clamp(0.88rem, 1.3vw, 0.98rem)" }}>
            {isHindi
              ? "क्षमा करें, आप जिस पृष्ठ की तलाश कर रहे हैं वह उपलब्ध नहीं है अथवा स्थानांतरित कर दिया गया है।"
              : "Sorry, the page you are looking for does not exist, has been removed, or is temporarily unavailable."}
            {errorDetails && <small className="text-danger mt-2 d-block">{errorDetails}</small>}
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm d-inline-flex align-items-center gap-2">
              <span>{isHindi ? "होम पेज पर जाएं" : "Go to Home"}</span>
            </Link>
          </div>
        </Container>
      </div>
    </>
  );
};

export default SlugResolver;