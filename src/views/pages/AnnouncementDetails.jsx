import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Button,
  Spinner,
} from "reactstrap";
import axios from "axios";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  FaHome,
  FaNewspaper,
  FaCalendarAlt,
  FaCalendarPlus,
  FaTag,
  FaChevronLeft,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;
const SITE_TITLE_SUFFIX = "Department of Higher Education, Government of Chhattisgarh India.";

const formatDateTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
};

const AnnouncementDetails = () => {
  const { slug } = useParams();
  const { isHindi } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const listRoute = "/announcements";
  const listTitle = isHindi ? "घोषणाएं" : "Announcements";

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
        <Container className="py-5 px-2">
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6} className="text-center text-danger">
              {isHindi ? "घोषणा उपलब्ध नहीं है" : "Announcement not found"}
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  const pageTitle = `${isHindi ? data.titleHi : data.titleEn} - ${SITE_TITLE_SUFFIX}`;
  const descriptionHtml = isHindi ? data.descriptionHi : data.descriptionEn;
  const metaDescription = getMetaDescription(descriptionHtml, isHindi ? data.shortDescriptionHi : data.shortDescriptionEn);
  const detailTitle = isHindi ? data.titleHi : data.titleEn;

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
        {/* Breadcrumb */}
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
              <FaNewspaper size={13} />
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

        {/* Detail Card */}
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
          {/* ── Gradient Header ── */}
          <CardHeader
            className="text-white border-0 p-4"
            style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)" }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              {data.isNew && (
                <Badge color="danger" pill>
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
                <Badge color="light" className="text-dark d-flex align-items-center gap-1 px-3 py-2 fw-normal rounded-pill">
                  <FaCalendarAlt size={11} className="text-primary" />
                  {isHindi ? "प्रकाशन तिथि" : "Created At"} : {formatDateTime(data.createdAt)}
                </Badge>
              </Col>
              <Col xs="auto">
                <Badge
                  color="light"
                  className="text-dark d-flex align-items-center gap-1 px-3 py-2 fw-normal rounded-pill"
                >
                  <FaCalendarPlus size={11} className="text-success" />
                  {isHindi ? "अपडेट किया गया" : "Updated At"} : {formatDateTime(data.updatedAt)}
                </Badge>
              </Col>
              {data.categoryId && (
                <Col xs="auto">
                  <Badge
                    color="warning"
                    className="text-dark d-flex align-items-center gap-1 px-3 py-2 fw-normal rounded-pill"
                  >
                    <FaTag size={11} />
                    {isHindi
                      ? data.categoryId?.nameHi
                      : data.categoryId?.nameEn}
                  </Badge>
                </Col>
              )}
              <Col xs={12} md className="d-flex justify-content-start justify-content-md-end">
                <Button tag={Link} to={listRoute} size="sm" outline className="d-flex align-items-center gap-1 fw-semibold text-white bg-dark py-1">
                  <FaChevronLeft size={11} />
                  {isHindi ? "सूची पर वापस जाएं" : "Back to List"}
                </Button>
              </Col>
            </Row>
          </CardHeader>

          {/* ── Announcement Body ── */}
          <CardBody className="p-4">
            {(data.shortDescriptionEn || data.shortDescriptionHi) && (
              <p className="lead text-muted mb-4 fs-6 fs-md-5">
                {isHindi ? data.shortDescriptionHi : data.shortDescriptionEn}
              </p>
            )}

            {data.image && (
              <img
                src={`${API_URL}${data.image}`}
                alt={data.titleEn}
                className="img-fluid rounded shadow-sm mb-4 w-100"
                style={{ maxHeight: "420px", objectFit: "cover" }}
              />
            )}

            <div
              className="lh-lg text-secondary announcement-content"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </CardBody>

          <CardFooter className="bg-light fw-bold border-top px-4 py-3 text-center">
            {isHindi ? "पढ़ने के लिए धन्यवाद !.." : "Thanks For Reading !.."}
          </CardFooter>
        </Card>
      </Container>
    </>
  );
};

export default AnnouncementDetails;