import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Row,
  Col,
  Button,
  Container,
  Breadcrumb,
  BreadcrumbItem,
  Spinner,
  Badge,
} from "reactstrap";
import { useLanguage } from "../../contexts/LanguageContext";
import { FaHome, FaNewspaper, FaExclamationTriangle } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

const RichContentPages = () => {
  const { slug } = useParams();
  const { isHindi } = useLanguage();

  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setError("This URL does not exist on this site");
      setLoading(false);
      return;
    }

    const fetchPageData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/rich-content-page/get-by-slug/${slug}`);
        if (res.data?.success && res.data?.data) {
          setPageData(res.data.data);
        } else {
          setError("Page not found");
        }
      } catch (err) {
        console.error("Failed to load page data", err);
        setError(err.response?.data?.message || "Failed to load page");
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [slug]);

  const formatDateTime = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, "0");
    return `${day}-${month}-${year} ${hoursStr}:${minutes} ${ampm}`;
  };

  // Safely access fields
  const title = isHindi ? pageData?.titleHi : pageData?.titleEn;
  const shortDesc = isHindi ? pageData?.shortDescriptionHi : pageData?.shortDescriptionEn;
  const description = isHindi ? pageData?.descriptionHi : pageData?.descriptionEn;
  const publishDate = formatDateTime(pageData?.publishDate);
  const updateDate = formatDateTime(pageData?.updatedAt);

  // Loading spinner
  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
        <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
        <p className="mt-3 text-muted fw-semibold">
          {isHindi ? "लोड हो रहा है..." : "Loading..."}
        </p>
      </div>
    );
  }

  // 404 / Error card (replaces simple Alert)
  if (error || !pageData) {
    const errorTitle = isHindi ? "पृष्ठ नहीं मिला" : "Page Not Found";
    const errorMessage = error || (isHindi ? "यह पृष्ठ मौजूद नहीं है या हटा दिया गया है।" : "The page you are looking for does not exist or has been removed.");
    return (
      <Container className="py-5">
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden text-center">
          <CardHeader
            className="text-white border-0 py-5"
            style={{ background: "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)" }}
          >
            <FaExclamationTriangle size={64} className="mb-3" />
            <h2 className="fw-bold mb-0">{errorTitle}</h2>
          </CardHeader>
          <CardBody className="p-5">
            <p className="fs-5 text-muted mb-4">{errorMessage}</p>
            <Button
              tag={Link}
              to="/"
              color="primary"
              size="lg"
              className="px-4 py-2 fw-semibold"
            >
              <FaHome className="me-2" /> {isHindi ? "होम पेज पर जाएं" : "Go to Homepage"}
            </Button>
          </CardBody>
          <CardFooter className="bg-light text-muted py-3">
            {isHindi
              ? "उच्च शिक्षा विभाग, छत्तीसगढ़ सरकार, भारत"
              : "Higher Education Department, Government of Chhattisgarh, India"}
          </CardFooter>
        </Card>
      </Container>
    );
  }

  // Normal page view
  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb listClassName="bg-white px-3 py-2 rounded-3 shadow-sm border mb-4 align-items-center">
        <BreadcrumbItem>
          <Link to="/" className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
            <FaHome size={13} />
            {isHindi ? "होम" : "Home"}
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem active className="fw-semibold d-flex align-items-center gap-1 text-secondary">
          <FaNewspaper size={13} />
          {title}
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Main Card */}
      <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
        <CardHeader
          className="text-white border-0 p-4"
          style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)" }}
        >
          <h4 className="fw-bold mb-3 text-white">{title}</h4>
          <hr className="border-white opacity-25 my-3" />
          <Row className="g-2 align-items-center">
            <Col xs="auto">
              <Badge color="light" className="text-dark px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                📅 <strong>Published:</strong> {publishDate}
              </Badge>
            </Col>
            <Col xs="auto">
              <Badge color="light" className="text-dark px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                🔄 <strong>Updated:</strong> {updateDate}
              </Badge>
            </Col>
            <Col xs="auto" className="ms-auto text-end">
              <Button tag={Link} to="/" color="dark" size="sm" className="fw-semibold px-3">
                ← Back To Home
              </Button>
            </Col>
          </Row>
        </CardHeader>

        <CardBody className="p-4">
          {/* Short Description */}
          {shortDesc && (
            <div className="bg-light border-start border-4 border-primary rounded-3 mb-4 p-3">
              <p className="mb-0 fst-italic text-secondary">{shortDesc}</p>
            </div>
          )}

          {/* Main HTML Content */}
          {description && (
            <>
              <h5 className="fw-bold border-bottom pb-2 mb-3">
                {isHindi ? "विवरण" : "Details"}
              </h5>
              <div
                className="text-secondary lh-lg"
                dangerouslySetInnerHTML={{ __html: description }}
                style={{ wordBreak: "break-word" }}
              />
            </>
          )}
        </CardBody>

        <CardFooter className="bg-light text-center fw-semibold text-muted py-3">
          {isHindi
            ? "उच्च शिक्षा विभाग, छत्तीसगढ़ सरकार, भारत"
            : "Higher Education Department, Government of Chhattisgarh, India"}
        </CardFooter>
      </Card>
    </Container>
  );
};

export default RichContentPages;