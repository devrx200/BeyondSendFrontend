import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
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
  Spinner
} from "reactstrap";
import {
  FaCalendarAlt,
  FaCalendarPlus,
  FaChevronLeft,
  FaDownload,
  FaHome,
  FaPrint
} from "react-icons/fa";
import axios from "axios";
import { useLanguage } from "../../contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL;

const ImportantPageDetail = () => {
  const { slug } = useParams();
  const { isHindi } = useLanguage();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [slug]);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`${API}/api/important-page/${slug}`);
      setDetail(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Date Formatter ─── */
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
      hour12: true
    });
  };


  /* ─── Official Government Print Handler ─── */
  const handlePrint = () => {
    const printContent =
      document.getElementById("printable-content").innerHTML;

    const currentUrl = window.location.href;
    const printDate = new Date().toLocaleString(
      isHindi ? "hi-IN" : "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }
    );

    const win = window.open("", "", "width=1200,height=950");

    win.document.write(`
    <html>
      <head>
        <title>${detail.titleEn}</title>
        <style>
          body {
            font-family: "Times New Roman", serif;
            padding: 40px;
            line-height: 1.6;
            color: #000;
          }

          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }

          .header h2 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
          }

          .header h3 {
            margin: 5px 0 0 0;
            font-size: 16px;
          }

          .title {
            text-align: center;
            margin: 20px 0;
            font-size: 20px;
            font-weight: bold;

          }

          .content {
            margin-top: 20px;
            font-size: 15px;
          }

          .footer {
            margin-top: 40px;
            border-top: 1px solid #000;
            padding-top: 10px;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
          }

          .official-note {
            margin-top: 30px;
            font-size: 13px;
            font-style: italic;
            text-align: center;
          }

          @media print {
            body { margin: 0; }
          }
        </style>
      </head>

      <body>

        <div class="header">
          <h3>
            ${isHindi ? " उच्च शिक्षा विभाग छत्तीसगढ़ शासन, भारत " : " Department of Higher Education Government of Chhattisgarh, India "}
          </h3>
        </div>
        <div class="title">
          ${isHindi ? detail.titleHi : detail.titleEn}
        </div>
        <div class="content">
          ${printContent}
        </div>

        <div class="official-note">
          ${isHindi
        ? "यह दस्तावेज़ विभाग की आधिकारिक वेबसाइट से मुद्रित किया गया है।"
        : "This document is printed from the official website of the department."
      }
          <br/>
           
           <b>URL: ${currentUrl}</b> 
          
        </div>

        <div class="footer">
          <div>
            ${isHindi ? "प्रकाशन तिथि" : "Created On"
      }: ${formatDateTime(detail.createdAt)}
          </div>
          <div>
            ${isHindi ? "अपडेट" : "Updated On"
      }: ${formatDateTime(detail.updatedAt)}
          </div>
          <div>
            ${isHindi ? "प्रिंट दिनांक" : "Printed On"
      }: ${printDate}
          </div>
        </div>

      </body>
    </html>
  `);

    win.document.close();
    win.focus();
    win.print();
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
      </div>
    );

  if (!detail)
    return <Container className="py-5">
      <Row className="justify-content-center align-items-center">
        <Col md={8} lg={6}>
          <Card
            className="border-0 shadow-lg text-center"
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #f8fbff, #eef4ff)"
            }}
          >
            <CardBody className="p-5">

              {/* BIG 404 */}
              <h1
                className="fw-bold mb-3"
                style={{
                  fontSize: "80px",
                  color: "#0d6efd",
                  letterSpacing: "2px"
                }}
              >
                404
              </h1>

              {/* TITLE */}
              <h4 className="fw-semibold mb-2">
                Oops! Page Not Found
              </h4>

              {/* DESCRIPTION */}
              <p className="text-muted mb-4">
                The page you are looking for might have been removed,<br />
                renamed or is temporarily unavailable.
              </p>

              <Button
                tag={Link}
                to="/"
                color="primary"
                size="lg"
                className="rounded-pill px-4"
              >
                <FaHome className="me-2" />
                Go to Home
              </Button>

            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>;

  return (
    <Container className="py-4">
      <Card className="border-0 shadow-lg rounded-4 overflow-hidden">

        {/* Header */}
        <CardHeader
          className="text-white border-0 p-4"
          style={{
            background:
              "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)"
          }}
        >
          <h1 className="fw-bold mb-3 text-white">
            {isHindi ? detail.titleHi : detail.titleEn}
          </h1>
          <hr />
          <Row className="g-2 align-items-center">
            <Col xs="auto">
              <Badge color="light" className="text-dark rounded-pill px-3 py-2">
                <FaCalendarAlt size={11} />{" "}
                {isHindi ? "प्रकाशन तिथि" : "Created"} :{" "}
                {formatDateTime(detail.createdAt)}
              </Badge>
            </Col>

            <Col xs="auto">
              <Badge color="light" className="text-dark rounded-pill px-3 py-2">
                <FaCalendarPlus size={11} />{" "}
                {isHindi ? "अपडेट" : "Updated"} :{" "}
                {formatDateTime(detail.updatedAt)}
              </Badge>
            </Col>

            <Col className="text-end">
              <Badge
                tag={Link}
                to="/"
                color="dark"
                className="text-white px-3 py-2"
              >
                <FaChevronLeft size={12} />{" "}
                {isHindi ? "वापस जाएं मुख्य पृष्ठ पर" : "Back To Home"}
              </Badge>
            </Col>
          </Row>
        </CardHeader>

        {/* Body */}
        <CardBody className="p-4">

          <div
            id="printable-content"
            className="lh-lg text-secondary"
            dangerouslySetInnerHTML={{
              __html: isHindi
                ? detail.descriptionHi
                : detail.descriptionEn
            }}
          />

          <hr />

          <div className="d-flex justify-content-between align-items-center mt-3">

            {/* Download Button (Only if file exists) */}
            {detail.file && (
              <Button
                tag="a"
                href={`${API}${detail.file}`}
                download
                color="danger"
                size="sm"
              >
                <FaDownload size={14} />{" "}
                {isHindi ? "डाउनलोड" : "Download"}
              </Button>
            )}

            {/* Print Button (Always Visible) */}
            <Button
              onClick={handlePrint}
              color="primary"
              size="sm"
            >
              <FaPrint size={14} />{" "}
              {isHindi ? "प्रिंट करें" : "Print"}
            </Button>

          </div>

        </CardBody>


        <CardFooter className="bg-light text-center fw-bold">
          {isHindi ? "धन्यवाद !" : "Thanks For Reading !"}
        </CardFooter>

      </Card>
    </Container>
  );
};

export default ImportantPageDetail;
