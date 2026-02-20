import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import ContentPreview from "../../utilies/ContentPreview";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  CardText,
  Row,
  Col,
  Button,
  Alert,
  Container,
  Breadcrumb,
  BreadcrumbItem,
  Spinner,
  Badge,
} from "reactstrap";
import { useLanguage } from "../../contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL;

const DynamicPage = () => {
  const location = useLocation();
  const { isHindi } = useLanguage();

  const [pageData2, setPageData2] = useState([]);

  const menu = location.state?.menu;
  const data = location.state?.pageData;
  const dataFromState = location.state?.pageData;
  const pageDataByprops = data && data[0];
  const path = location.pathname;
  const pageData = pageDataByprops ? pageDataByprops : pageData2;

  useEffect(() => {
    if (!pageDataByprops) {
      fetchPageData();
    }
  }, [path]);

  const fetchPageData = async () => {
    try {
      const res = await axios.get(`${API}/api/menu-page-data-by-path`, {
        params: { path },
      });
      setPageData2(res?.data[0]);
    } catch (error) {
      console.error("Failed to load page data", error);
    }
  };

  /* ===== DATE FORMAT DD-MM-YYYY HH:MM AM ===== */
  const formatDateTime = (date) => {
    if (!date) return "—";
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    hours = String(hours).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };

  const publishDate = formatDateTime(pageData?.createdAt);
  const updateDate = formatDateTime(pageData?.updatedAt);

  /* ===== LOADING ===== */
  if (!pageData) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
        <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
        <p className="mt-3 text-muted fw-semibold">
          {isHindi ? "लोड हो रहा है..." : "Loading..."}
        </p>
      </div>
    );
  }

  return (
    <Container className="py-4">

      {/* Breadcrumb */}
      <Breadcrumb className="bg-white px-3 py-2 rounded-3 shadow-sm border mb-4">
        <BreadcrumbItem>
          <a href="/" className="text-decoration-none text-primary fw-medium">
            {isHindi ? "होम" : "Home"}
          </a>
        </BreadcrumbItem>
        <BreadcrumbItem active className="fw-semibold text-secondary">
          {isHindi ? pageData.titleHi : pageData.titleEn}
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Main Card */}
      <Card className="border-0 shadow-lg rounded-4 overflow-hidden">

        {/* ===== GRADIENT HEADER ===== */}
        <CardHeader
          className="text-white border-0 p-4"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)",
          }}
        >
          <h4 className="fw-bold mb-3 text-white">
            {isHindi ? pageData.titleHi : pageData.titleEn}
          </h4>

          <hr className="border-white opacity-25 my-3" />

          <Row className="g-2 align-items-center">

            <Col xs="auto">
              <Badge
                color="light"
                className="text-dark px-3 py-2 rounded-pill d-flex align-items-center gap-2"
              >
                📅 <strong>Published:</strong> {publishDate}
              </Badge>
            </Col>

            <Col xs="auto">
              <Badge
                color="light"
                className="text-dark px-3 py-2 rounded-pill d-flex align-items-center gap-2"
              >
                🔄 <strong>Updated:</strong> {updateDate}
              </Badge>
            </Col>

            <Col xs="auto" className="ms-auto text-end">
              <Button
                tag={Link}
                to="/"
                color="dark"
                size="sm"
                className="fw-semibold px-3"
              >
                ← Back To Home
              </Button>
            </Col>


          </Row>
        </CardHeader>

        {/* ===== CONTENT BODY ===== */}
        <CardBody className="p-4">

          {/* Short Description */}
          {pageData.shortDescriptionEn && (
            <Alert
              color="light"
              className="border-start border-4 border-primary rounded-3 mb-4"
            >
              <p className="mb-0 fst-italic text-secondary">
                {pageData.shortDescriptionEn}
              </p>
            </Alert>
          )}

          {/* Content Blocks */}
          {pageData.contents?.length > 0 && (
            <>
              <h5 className="fw-bold border-bottom pb-2 mb-3">
                Content
              </h5>
              <ContentPreview contents={pageData.contents} />
            </>
          )}

          {/* Description */}
          {pageData.descriptionEn && (
            <>
              <h5 className="fw-bold border-bottom pb-2 mt-4 mb-3">
                Details
              </h5>
              <CardText className="text-secondary lh-lg">
                {pageData.descriptionEn}
              </CardText>
            </>
          )}

        </CardBody>

        {/* Footer */}
        <CardFooter className="bg-light text-center fw-semibold text-muted py-3">
          {isHindi
            ? "उच्च शिक्षा विभाग, छत्तीसगढ़ सरकार, भारत"
            : "Higher Education Department, Government of Chhattisgarh, India"}
        </CardFooter>

      </Card>

    </Container>
  );
};

export default DynamicPage;
