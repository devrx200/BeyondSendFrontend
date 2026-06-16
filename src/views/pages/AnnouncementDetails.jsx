import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Container,
  Badge,
  Spinner
} from "reactstrap";
import axios from "axios";
import { useLanguage } from "../../contexts/LanguageContext";
import { FaCalendarAlt } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;
const SITE_TITLE_SUFFIX = "Department of Higher Education, Government of Chhattisgarh India.";

const AnnouncementDetails = () => {
  const { slug } = useParams();
  const { isHindi } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [slug]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await axios.get(`${API_URL}/api/get-announcement/${slug}`);
      setData(res.data.data);
    } catch (err) {
      console.error("Announcement fetch failed", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  };

  const getMetaDescription = (htmlContent, fallback = "") => {
    if (!htmlContent) return fallback;
    const text = stripHtml(htmlContent);
    return text.length > 160 ? text.substring(0, 157) + "..." : text;
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? "hi" : "en"} />
          <title>{isHindi ? "लोड हो रहा है..." : "Loading..."} - {SITE_TITLE_SUFFIX}</title>
          <meta name="description" content={isHindi ? "कृपया प्रतीक्षा करें" : "Please wait while content loads"} />
        </Helmet>
        <div className="text-center py-5">
          <Spinner color="primary" />
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? "hi" : "en"} />
          <title>{isHindi ? "घोषणा नहीं मिली" : "Announcement Not Found"} - {SITE_TITLE_SUFFIX}</title>
          <meta name="description" content={isHindi ? "अनुरोधित घोषणा उपलब्ध नहीं है" : "The requested announcement is not available"} />
        </Helmet>
        <div className="text-center py-5 text-danger">
          {isHindi ? "घोषणा उपलब्ध नहीं है" : "Announcement not found"}
        </div>
      </>
    );
  }

  const pageTitle = `${isHindi ? data.titleHi : data.titleEn} - ${SITE_TITLE_SUFFIX}`;
  const descriptionHtml = isHindi ? data.descriptionHi : data.descriptionEn;
  const metaDescription = getMetaDescription(descriptionHtml, isHindi ? data.shortDescriptionHi : data.shortDescriptionEn);

  return (
    <>
      <Helmet>
        <html lang={isHindi ? "hi" : "en"} />
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
      </Helmet>

      <Container className="py-4 bg-white rounded my-3 border border-3 border-white shadow">
        <div className="mb-2">
          <Badge color="primary">
            {isHindi ? data.categoryId?.nameHi : data.categoryId?.nameEn}
          </Badge>
          {data.isNew && (
            <Badge color="danger" className="ms-2" pill>
              NEW
            </Badge>
          )}
        </div>

        <h3 className="fw-bold mb-2">
          {isHindi ? data.titleHi : data.titleEn}
        </h3>
        <hr />
        <div className="text-muted small fw-bold mb-3 d-flex flex-wrap justify-content-between gap-2">
          <i><FaCalendarAlt className="me-1" /> Created At {new Date(data.createdAt).toLocaleDateString()}</i>
          <i> <FaCalendarAlt className="me-1" /> Updated At {new Date(data.updatedAt).toLocaleDateString()}</i>
        </div>
        <hr />

        <p className="lead text-muted mb-4">
          {isHindi ? data.shortDescriptionHi : data.shortDescriptionEn}
        </p>

        {data.image && (
          <img
            src={`${API_URL}${data.image}`}
            alt={data.titleEn}
            className="img-fluid rounded shadow-sm mb-4"
            style={{ maxHeight: "420px", objectFit: "cover" }}
          />
        )}

        <div
          className="announcement-content"
          dangerouslySetInnerHTML={{
            __html: descriptionHtml
          }}
        />
      </Container>
    </>
  );
};

export default AnnouncementDetails;