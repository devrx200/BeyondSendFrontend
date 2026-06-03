import { Link } from "react-router-dom";
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
  Badge,
} from "reactstrap";
import { useLanguage } from "../../contexts/LanguageContext";
import { FaHome, FaNewspaper } from "react-icons/fa";

const RichContentPages = ({ prefetchedData, preview = false }) => {
  const { isHindi } = useLanguage();

  if (!prefetchedData) {
    return null;
  }

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

  const title = isHindi ? prefetchedData.titleHi : prefetchedData.titleEn;
  const shortDesc = isHindi ? prefetchedData.shortDescriptionHi : prefetchedData.shortDescriptionEn;
  const description = isHindi ? prefetchedData.descriptionHi : prefetchedData.descriptionEn;
  const publishDate = formatDateTime(prefetchedData.publishDate);
  const updateDate = formatDateTime(prefetchedData.updatedAt);

  return (
    <div style={{ position: "relative" }}>
      {/* Diagonal preview watermark */}
      {preview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          {/* Diagonal text */}
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "-20%",
              width: "140%",
              transform: "rotate(-30deg)",
              textAlign: "center",
              opacity: 0.15,
              fontSize: "100px",
              fontWeight: "bold",
              color: "#fc7785",
              whiteSpace: "nowrap",
              letterSpacing: "8px",
              fontFamily: "Arial, sans-serif",
              textTransform: "uppercase",
            }}
          >
            {isHindi ? "प्रीव्यू मोड" : "PREVIEW MODE"}
          </div>

          {/* Yellow diagonal line */}
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "-10%",
              width: "120%",
              height: "50px",
              backgroundColor: "rgba(251, 255, 7, 0.5)",
              transform: "rotate(-30deg)",
              transformOrigin: "left center",
            }}
          />

          {/* Corner badge */}
          <div
            style={{
              position: "fixed",
              top: "15px",
              right: "15px",
              backgroundColor: "rgba(220, 53, 69, 0.85)",
              color: "white",
              padding: "5px 14px",
              borderRadius: "30px",
              fontSize: "12px",
              fontWeight: "bold",
              fontFamily: "monospace",
              boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            }}
          >
            {isHindi ? "प्रीव्यू मोड" : "PREVIEW MODE"}
          </div>
        </div>
      )}

      <Container className="py-4">
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
            {shortDesc && (
              <div className="bg-light border-start border-4 border-primary rounded-3 mb-4 p-3">
                <p className="mb-0 fst-italic text-secondary">{shortDesc}</p>
              </div>
            )}
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
    </div>
  );
};

export default RichContentPages;

