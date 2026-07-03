import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Spinner,
  Alert,
  Badge,
  Button,
  Breadcrumb,
  BreadcrumbItem,
} from "reactstrap";
import axios from "axios";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  FaCalendarAlt,
  FaHome,
  FaNewspaper,
  FaTag,
  FaChevronLeft,
  FaCalendarPlus,
  FaExclamationTriangle,
  FaBullhorn,
  FaHandHoldingHeart,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;
const SITE_TITLE_SUFFIX = "Department of Higher Education, Government of Chhattisgarh India.";

const SchemeAnnouncementDetails = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { isHindi } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // --- Type Detection (Scheme vs Announcement) based on URL ---
  const isScheme = location.pathname.includes("scheme");
  
  const listRoute = isScheme ? "/schemes" : "/announcements";
  const listTitle = isScheme
    ? (isHindi ? "योजनाएं" : "Schemes")
    : (isHindi ? "घोषणाएं" : "Announcements");
    
  const ListIcon = isScheme ? FaHandHoldingHeart : FaBullhorn;

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(false);
      // Assuming both use the same endpoint as per your provided code
      const res = await axios.get(`${API_URL}/api/get-announcement/${slug}`);
      setData(res.data.data);
    } catch (err) {
      console.error("Fetch failed", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(isHindi ? "hi-IN" : "en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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

  /* ══════════════════════════════════════════
                    LOADING
  ══════════════════════════════════════════ */
  if (loading) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? "hi" : "en"} />
          <title>{isHindi ? "लोड हो रहा है..." : "Loading..."} - {SITE_TITLE_SUFFIX}</title>
        </Helmet>
        <Container className="py-5">
          <Row className="justify-content-center text-center">
            <Col xs="auto">
              <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
              <p className="mt-3 text-muted fw-semibold">
                {isHindi ? "लोड हो रहा है..." : "Loading, please wait…"}
              </p>
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  /* ══════════════════════════════════════════
                     ERROR
  ══════════════════════════════════════════ */
  if (error || !data) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? "hi" : "en"} />
          <title>{isHindi ? "विवरण नहीं मिला" : "Details Not Found"} - {SITE_TITLE_SUFFIX}</title>
        </Helmet>
        <Container className="py-5">
          <Alert color="warning" className="d-flex align-items-center gap-2 shadow-sm rounded-3">
            <FaExclamationTriangle size={18} />
            <span className="fw-semibold">
              {isHindi ? "विवरण उपलब्ध नहीं है या हटा दिया गया है।" : "Details not found or have been removed."}
            </span>
          </Alert>
        </Container>
      </>
    );
  }

  /* ══════════════════════════════════════════
                  DETAIL PAGE
  ══════════════════════════════════════════ */
  const detailTitle = isHindi ? data.titleHi : data.titleEn;
  const descriptionHtml = isHindi ? data.descriptionHi : data.descriptionEn;
  const metaDescription = getMetaDescription(descriptionHtml, isHindi ? data.shortDescriptionHi : data.shortDescriptionEn);
  const pageTitle = `${detailTitle} - ${SITE_TITLE_SUFFIX}`;

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

      <Container className="py-4">
        {/* ── Breadcrumb ── */}
        <Breadcrumb listClassName="bg-white px-3 py-2 rounded-3 shadow-sm border mb-4 align-items-center">
          <BreadcrumbItem>
            <Link
              to="/"
              className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium"
            >
              <FaHome size={13} />
              {isHindi ? "होम" : "Home"}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link
              to={listRoute}
              className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium"
            >
              <ListIcon size={13} />
              {listTitle}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem
            active
            className="fw-semibold text-secondary text-truncate"
            style={{ maxWidth: "100%" }}
          >
            {detailTitle}
          </BreadcrumbItem>
        </Breadcrumb>

        {/* ── Detail Card ── */}
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
          
          {/* ── Gradient Header ── */}
          <CardHeader
            className="text-white border-0 p-4"
            style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)" }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              {data.isNew && (
                <Badge color="danger" className="px-3" pill style={{ letterSpacing: "1px" }}>
                  NEW
                </Badge>
              )}
            </div>

            <h4 className="fw-bold mb-3 lh-base text-white">
              {detailTitle}
            </h4>
            <hr className="border-white opacity-25 my-3" />
            
            <Row className="g-2 align-items-center">
              <Col xs="auto">
                <Badge color="light" className="text-dark d-flex align-items-center gap-1 px-3 py-2 fw-normal rounded-pill shadow-sm">
                  <FaCalendarAlt size={12} className="text-primary" />
                  {isHindi ? "प्रकाशन तिथि" : "Created At"} : {formatDateTime(data.createdAt)}
                </Badge>
              </Col>
              <Col xs="auto">
                <Badge
                  color="light"
                  className="text-dark d-flex align-items-center gap-1 px-3 py-2 fw-normal rounded-pill shadow-sm"
                >
                  <FaCalendarPlus size={12} className="text-success" />
                  {isHindi ? "अपडेट किया गया" : "Updated At"} : {formatDateTime(data.updatedAt)}
                </Badge>
              </Col>
              {data.categoryId && (
                <Col xs="auto">
                  <Badge
                    color="warning"
                    className="text-dark d-flex align-items-center gap-1 px-3 py-2 fw-medium rounded-pill shadow-sm"
                  >
                    <FaTag size={12} />
                    {isHindi
                      ? data.categoryId?.nameHi || data.categoryId?.categoryNameHi
                      : data.categoryId?.nameEn || data.categoryId?.categoryNameEn}
                  </Badge>
                </Col>
              )}
              
              {/* Back Button Aligned to Right */}
              <Col xs={12} md className="d-flex justify-content-start justify-content-md-end mt-3 mt-md-0">
                <Button tag={Link} to={listRoute} size="sm" outline className="d-flex align-items-center gap-1 fw-semibold text-white bg-dark py-2 px-3 border-0 shadow-sm rounded-pill hover-lift">
                  <FaChevronLeft size={11} />
                  {isHindi ? "सूची पर वापस जाएं" : "Back to List"}
                </Button>
              </Col>
            </Row>
          </CardHeader>

          {/* ── Content Body ── */}
          <CardBody className="p-4 p-md-5 bg-white">
            
            {/* Short Description */}
            {(data.shortDescriptionEn || data.shortDescriptionHi) && (
              <p className="lead text-muted mb-4 fs-6 fs-md-5 fw-medium border-start border-4 border-primary ps-3">
                {isHindi ? data.shortDescriptionHi : data.shortDescriptionEn}
              </p>
            )}

            {/* Featured Image */}
            {data.image && (
              <div className="text-center mb-5">
                <img
                  src={`${API_URL}${data.image}`}
                  alt={detailTitle}
                  className="img-fluid rounded-4 shadow-sm w-100"
                  style={{ maxHeight: "450px", objectFit: "cover" }}
                />
              </div>
            )}

            {/* HTML Description Content */}
            <div
              className="lh-lg text-secondary announcement-content fs-6"
              style={{ textAlign: "justify" }}
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
            
          </CardBody>

          {/* ── Footer ── */}
          <CardFooter className="bg-light fw-bold border-top px-4 py-3 text-center text-muted">
            {isHindi ? "पढ़ने के लिए धन्यवाद !" : "Thanks For Reading !"}
          </CardFooter>
        </Card>
      </Container>
    </>
  );
};

export default SchemeAnnouncementDetails;