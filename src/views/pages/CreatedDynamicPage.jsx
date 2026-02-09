import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Badge,
  Spinner,
  Container,
  Button,
} from "reactstrap";
import { FaCalendarAlt, FaFileAlt, FaDownload } from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL;

const CreatedDynamicPage = () => {
  const { mainSlug, slug } = useParams();
  console.log("mainSlug", mainSlug);
  const { isHindi } = useLanguage(); // ✅ FIXED

  const [contentDetail, setContentDetail] = useState(null);
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /* ================= LIST PAGE FETCH ================= */
  const fetchContentListByMainSlug = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await axios.get(
        `${API}/api/get-content-by-main-slug/${mainSlug}`
      );

      setContentList(res?.data?.data || []);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DETAIL PAGE FETCH ================= */
  const fetchContentDetailBySlug = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await axios.get(
        `${API}/api/get-content-by-slug/${mainSlug}/${slug}`
      );

      setContentDetail(res?.data?.data || null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
  setError(false);

  if (slug) {
    setContentDetail(null);
    fetchContentDetailBySlug();
  } else {
    setContentList([]);
    fetchContentListByMainSlug();
  }
}, [mainSlug, slug]);


  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="text-muted mt-2">
          {isHindi ? "लोड हो रहा है..." : "Loading content..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5 text-danger">
        {isHindi
          ? "कुछ गलत हो गया। कृपया पुनः प्रयास करें।"
          : "Something went wrong. Please try again."}
      </div>
    );
  }

  /* =================================================
     LIST PAGE
  ================================================= */
  if (!slug) {
    return (
      <Container className="py-5">
        <Card className="border-0 shadow rounded-4">
          <CardBody className="p-4 p-md-5">
            <h3 className="fw-bold mb-4 text-capitalize">
              {mainSlug.replace(/-/g, " ")}
            </h3>

            {contentList.length === 0 && (
              <p className="text-muted">
                {isHindi ? "कोई रिकॉर्ड नहीं मिला" : "No records found"}
              </p>
            )}

            {contentList.map((item) => (
              <Card
                key={item._id}
                className="mb-3 border-start border-4 border-primary"
              >
                <CardBody className="d-flex justify-content-between align-items-start">
                  <div>
                    <Link
                      to={`${item.menuId.path}/${mainSlug}/${item.slug}`}
                      className="fw-semibold fs-6 text-decoration-none text-dark"
                    >
                      {isHindi
                        ? item.titleHin || item.titleEng
                        : item.titleEng}
                    </Link>

                    <div className="small text-muted mt-1">
                      <FaCalendarAlt className="me-1" />
                      {item.publishDate
                        ? new Date(item.publishDate).toLocaleDateString(
                            isHindi ? "hi-IN" : "en-IN"
                          )
                        : "—"}
                    </div>
                  </div>

                  {item.documentsUpdate?.length > 0 && (
                    <Badge color="success" pill>
                      {item.documentsUpdate.length}{" "}
                      {isHindi ? "फ़ाइलें" : "Files"}
                    </Badge>
                  )}
                </CardBody>
              </Card>
            ))}
          </CardBody>
        </Card>
      </Container>
    );
  }

  /* =================================================
     DETAIL PAGE
  ================================================= */
  return (
    <Container className="py-5">
      <Card className="border-0 shadow rounded-4">
        <CardBody className="p-4 p-md-5">

          {/* BREADCRUMB */}
          <small className="text-muted d-block mb-2">
            <Link to={`${contentDetail.menuId.path}/${mainSlug}`} className="text-decoration-none">
              {mainSlug.replace(/-/g, " ")}
            </Link>{" "}
            /{" "}
            {contentDetail && (isHindi
              ? contentDetail.titleHin || contentDetail.titleEng
              : contentDetail.titleEng)}
          </small>

          {/* TITLE */}
          <h2 className="fw-bold mb-3">
            {isHindi
              ? contentDetail.titleHin || contentDetail.titleEng
              : contentDetail.titleEng}
          </h2>

          {/* META */}
          <Row className="text-muted small mb-4">
            <Col md="6">
              <FaCalendarAlt className="me-1" />
              {isHindi ? "प्रकाशित:" : "Published:"}{" "}
              {new Date(contentDetail.publishDate).toLocaleDateString(
                isHindi ? "hi-IN" : "en-IN"
              )}
            </Col>
            <Col md="6" className="text-md-end">
              {isHindi ? "अपडेट:" : "Updated:"}{" "}
              {new Date(contentDetail.updatedAt).toLocaleDateString(
                isHindi ? "hi-IN" : "en-IN"
              )}
            </Col>
          </Row>

          <hr />

          {/* CONTENT */}
          <div
            style={{ fontSize: "16px", lineHeight: "1.9" }}
            dangerouslySetInnerHTML={{
              __html: contentDetail.htmlContent,
            }}
          />

          {/* ATTACHMENTS */}
          <div className="mt-5">
            <h5 className="fw-bold mb-3">
              <FaFileAlt className="me-2" />
              {isHindi ? "संलग्नक" : "Attachments"}
            </h5>

            {contentDetail.documentsUpdate?.map((doc, index) => (
              <Card key={index} className="mb-2">
                <CardBody className="d-flex justify-content-between align-items-center">
                  <div>
                    <FaFileAlt className="me-2 text-primary" />
                    {isHindi
                      ? doc.titleHin || doc.titleEng
                      : doc.titleEng}
                  </div>

                  <Button
                    size="sm"
                    color="primary"
                    tag="a"
                    href={`${API}${doc.fileUrl}`}
                    target="_blank"
                  >
                    <FaDownload className="me-1" />
                    {isHindi ? "डाउनलोड" : "Download"}
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>

        </CardBody>
      </Card>
    </Container>
  );
};

export default CreatedDynamicPage;
