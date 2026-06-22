import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Container,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Badge,
  Button,
  Row,
  Col,
  Spinner,
  Breadcrumb,
  BreadcrumbItem,
} from "reactstrap";
import {
  FaCalendarAlt,
  FaCalendarPlus,
  FaChevronLeft,
  FaDownload,
  FaHome,
  FaList,
  FaPrint,
} from "react-icons/fa";
import axios from "axios";
import { useLanguage } from "../../contexts/LanguageContext";
import { FaTicketSimple } from "react-icons/fa6";

const API = import.meta.env.VITE_API_URL;
const SITE_TITLE_SUFFIX = "Department of Higher Education, Government of Chhattisgarh India.";

const ImportantPageDetail = ({ prefetchedData = null }) => {
  const { slug } = useParams();
  const { isHindi } = useLanguage();

  const [detail, setDetail] = useState(prefetchedData);
  const [loading, setLoading] = useState(!prefetchedData);

  // Sync when prefetchedData changes
  useEffect(() => {
    if (prefetchedData) {
      setDetail(prefetchedData);
      setLoading(false);
    }
  }, [prefetchedData]);

  // Fetch only when slug changes and no prefetchedData
  useEffect(() => {
    if (prefetchedData) return;

    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/important-page/${slug}`);
        if (isMounted) setDetail(res.data.data);
      } catch (err) {
        console.error(err);
        if (isMounted) setDetail(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => { isMounted = false; };
  }, [slug, prefetchedData]);

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

  const handlePrint = () => {
    const printContent = document.getElementById("printable-content").innerHTML;
    const currentUrl = window.location.href;
    const printDate = new Date().toLocaleString(isHindi ? "hi-IN" : "en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const win = window.open("", "", "width=1200,height=950");
    win.document.write(`
      <html>
        <head>
          <title>${detail?.titleEn || ""}</title>
          <style>
            body { font-family: "Times New Roman", serif; padding: 40px; line-height: 1.6; color: #000; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .header h2 { margin: 0; font-size: 18px; font-weight: bold; }
            .header h3 { margin: 5px 0 0 0; font-size: 16px; }
            .title { text-align: center; margin: 20px 0; font-size: 20px; font-weight: bold; }
            .content { margin-top: 20px; font-size: 15px; }
            .footer { margin-top: 40px; border-top: 1px solid #000; padding-top: 10px; font-size: 12px; display: flex; justify-content: space-between; }
            .official-note { margin-top: 30px; font-size: 13px; font-style: italic; text-align: center; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>${isHindi ? " उच्च शिक्षा विभाग छत्तीसगढ़ शासन, भारत " : " Department of Higher Education Government of Chhattisgarh, India "}</h3>
          </div>
          <div class="title">${isHindi ? detail?.titleHi : detail?.titleEn}</div>
          <div class="content">${printContent}</div>
          <div class="official-note">
            ${isHindi ? "यह दस्तावेज़ विभाग की आधिकारिक वेबसाइट से मुद्रित किया गया है।" : "This document is printed from the official website of the department."}
            <br/><b>URL: ${currentUrl}</b>
          </div>
          <div class="footer">
            <div>${isHindi ? "प्रकाशन तिथि" : "Created On"}: ${formatDateTime(detail?.createdAt)}</div>
            <div>${isHindi ? "अपडेट" : "Updated On"}: ${formatDateTime(detail?.updatedAt)}</div>
            <div>${isHindi ? "प्रिंट दिनांक" : "Printed On"}: ${printDate}</div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  // Helper to generate meta description (strip HTML tags, truncate)
  const getMetaDescription = () => {
    if (!detail) return "";
    const rawHtml = isHindi ? detail.descriptionHi : detail.descriptionEn;
    if (!rawHtml) return "";
    const text = rawHtml.replace(/<[^>]*>/g, "").trim();
    return text.length > 160 ? text.substring(0, 157) + "..." : text;
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? "hi" : "en"} />
          <title>{isHindi ? "लोड हो रहा है..." : "Loading..."}</title>
        </Helmet>
        <div className="text-center py-5">
          <Spinner color="primary" />
        </div>
      </>
    );
  }

  // 404 state
  if (!detail) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? "hi" : "en"} />
          <title>{isHindi ? "पृष्ठ नहीं मिला" : "Page Not Found"}</title>
          <meta name="description" content={isHindi ? "अनुरोधित पृष्ठ मौजूद नहीं है" : "The requested page does not exist"} />
        </Helmet>
        <Container className="py-5">
          <Row className="justify-content-center align-items-center">
            <Col md={8} lg={6}>
              <Card
                className="border-0 shadow-lg text-center"
                style={{ borderRadius: "16px", background: "linear-gradient(135deg, #f8fbff, #eef4ff)" }}
              >
                <CardBody className="p-5">
                  <h1 className="fw-bold mb-3" style={{ fontSize: "80px", color: "#0d6efd", letterSpacing: "2px" }}>
                    404
                  </h1>
                  <h4 className="fw-semibold mb-2">{isHindi ? "उफ़! पृष्ठ नहीं मिला" : "Oops! Page Not Found"}</h4>
                  <p className="text-muted mb-4">
                    {isHindi
                      ? "आप जिस पृष्ठ को खोज रहे हैं, उसे हटा दिया गया होगा, नाम बदल दिया गया होगा या अस्थायी रूप से अनुपलब्ध है।"
                      : "The page you are looking for might have been removed, renamed or is temporarily unavailable."}
                  </p>
                  <Button tag={Link} to="/" color="primary" size="lg" className="rounded-pill px-4">
                    <FaHome className="me-2" /> {isHindi ? "होम पर जाएं" : "Go to Home"}
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  // Normal view with SEO
  const pageTitle = (isHindi ? detail.titleHi : detail.titleEn) || "";
  const metaDescription = getMetaDescription();
  const canonicalUrl = `${window.location.origin}/important-page/${slug}`;

  return (
    <>
      <Helmet>
        <html lang={isHindi ? "hi" : "en"} />
        <title>{`${pageTitle} - ${SITE_TITLE_SUFFIX}`}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        <meta name="keywords" content={`${isHindi ? detail.titleHi : detail.titleEn}, important page, official announcement`} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${pageTitle} - ${SITE_TITLE_SUFFIX}`} />
        {metaDescription && <meta property="og:description" content={metaDescription} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={SITE_TITLE_SUFFIX} />
        <meta name="author" content={SITE_TITLE_SUFFIX} />
      </Helmet>

      <Container className="py-4">
        <Breadcrumb listClassName="bg-white px-3 py-2 rounded-3 shadow-sm border mb-4 align-items-center">
          <BreadcrumbItem>
            <Link to="/" className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
              <FaHome size={13} />
              {isHindi ? "होम" : "Home"}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem active className="fw-semibold d-flex align-items-center gap-1 text-secondary text-truncate" style={{ maxWidth: "100%" }}>
            <FaList size={13} className="flex-shrink-0" />
            <span className="text-truncate">{isHindi ? detail.titleHi : detail.titleEn}</span>
          </BreadcrumbItem>
        </Breadcrumb>
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
          <CardHeader
            className="text-white border-0 p-4"
            style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)" }}
          >
            <h1 className="fw-bold mb-3 text-white d-flex align-items-center gap-2">
              <FaTicketSimple size={24} />
              {isHindi ? detail.titleHi : detail.titleEn}
            </h1>
            <hr />
            <Row className="g-2 align-items-center">
              <Col xs="auto">
                <Badge color="light" className="text-dark rounded-pill px-3 py-2">
                  <FaCalendarAlt size={11} /> {isHindi ? "प्रकाशन तिथि" : "Created"} : {formatDateTime(detail.createdAt)}
                </Badge>
              </Col>
              <Col xs="auto">
                <Badge color="light" className="text-dark rounded-pill px-3 py-2">
                  <FaCalendarPlus size={11} /> {isHindi ? "अपडेट" : "Updated"} : {formatDateTime(detail.updatedAt)}
                </Badge>
              </Col>
              <Col xs={12} md className="text-start text-md-end">
                <Badge tag={Link} to="/" color="dark" className="text-white px-3 py-2">
                  <FaChevronLeft size={12} /> {isHindi ? "वापस जाएं मुख्य पृष्ठ पर" : "Back To Home"}
                </Badge>
              </Col>
            </Row>
          </CardHeader>

          <CardBody className="p-4">
            <div
              id="printable-content"
              className="lh-lg text-secondary"
              dangerouslySetInnerHTML={{ __html: isHindi ? detail.descriptionHi : detail.descriptionEn }}
            />
            <hr />
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
              {detail.file && (
                <Button tag="a" href={`${API}${detail.file}`} download color="danger" size="sm">
                  <FaDownload size={14} /> {isHindi ? "डाउनलोड" : "Download"}
                </Button>
              )}
              <Button onClick={handlePrint} color="primary" size="sm" className="ms-auto">
                <FaPrint size={14} /> {isHindi ? "प्रिंट करें" : "Print"}
              </Button>
            </div>
          </CardBody>

          <CardFooter className="bg-light text-center fw-bold">
            {isHindi ? "धन्यवाद !" : "Thanks For Reading !"}
          </CardFooter>
        </Card>
      </Container>
    </>
  );
};

export default ImportantPageDetail;