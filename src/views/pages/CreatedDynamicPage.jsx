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
} from "reactstrap";
import { FaCalendarAlt, FaFileAlt } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

const CreatedDynamicPage = () => {
  const { mainSlug, slug } = useParams();

  const [pageData, setPageData] = useState(null);
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /* ================= FETCHERS ================= */
  const fetchSinglePage = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await axios.get(
        `${API}/api/get-content-by-slug/${slug}`
      );

      setPageData(res?.data?.data || null);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchListPage = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await axios.get(
        `${API}/api/get-content-by-main-slug/${mainSlug}`
      );

      setListData(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    slug ? fetchSinglePage() : fetchListPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainSlug, slug]);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="text-muted mt-2">Loading content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5 text-danger">
        Something went wrong. Please try again.
      </div>
    );
  }

  /* =================================================
     LIST PAGE (mainSlug)
  ================================================= */
  if (!slug) {
    return (
      <Container className="my-5">
        <Card className="border-0 shadow rounded-4">
          <CardBody className="p-4 p-md-5">
            <h3 className="fw-bold mb-4 text-capitalize">
              {mainSlug?.replace(/-/g, " ")}
            </h3>

            {listData.length === 0 && (
              <p className="text-muted">No records available</p>
            )}

            {listData.map((item) => (
              <div
                key={item._id}
                className="py-3 border-bottom d-flex justify-content-between align-items-start"
              >
                <div>
                  {/* TITLE */}
                  <Link
                    to={`/${mainSlug}/${item.slug}`}
                    className="fw-semibold fs-6 text-decoration-none text-dark d-block"
                  >
                    {item.titleHin || item.titleEng}
                  </Link>

                  {/* META */}
                  <div className="small text-muted mt-1">
                    <span className="me-3">
                      <FaCalendarAlt className="me-1" />
                      Published:{" "}
                      {item.publishDate
                        ? new Date(item.publishDate).toLocaleDateString("hi-IN")
                        : "—"}
                    </span>

                    <span>
                      Updated:{" "}
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleDateString("hi-IN")
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* FILE COUNT */}
                {item.documentsUpdate?.length > 0 && (
                  <Badge color="success" pill>
                    {item.documentsUpdate.length} Files
                  </Badge>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      </Container>
    );
  }

  /* =================================================
     DETAIL PAGE
  ================================================= */
  if (!pageData) {
    return (
      <div className="text-center py-5 text-danger">
        Page not found
      </div>
    );
  }

  return (
    <Container className="my-5">
      <Card className="border-0 shadow rounded-4">
        <CardBody className="p-4 p-md-5">

          {/* BREADCRUMB */}
          <small className="text-muted d-block mb-2">
            <Link to={`/${mainSlug}`} className="text-decoration-none">
              {mainSlug?.replace(/-/g, " ")}
            </Link>{" "}
            / {pageData.titleHin || pageData.titleEng}
          </small>

          {/* TITLE */}
          <h2 className="fw-bold mb-3">
            {pageData.titleHin || pageData.titleEng}
          </h2>

          {/* META */}
          <Row className="mb-4 text-muted small">
            <Col md="6">
              <FaCalendarAlt className="me-1" />
              Published:{" "}
              {pageData.publishDate
                ? new Date(pageData.publishDate).toLocaleDateString()
                : "—"}
            </Col>
            <Col md="6" className="text-md-end">
              Updated:{" "}
              {pageData.updatedAt
                ? new Date(pageData.updatedAt).toLocaleDateString()
                : "—"}
            </Col>
          </Row>

          <hr />

          {/* CONTENT */}
          {pageData.htmlContent && (
            <div
              className="content-area"
              style={{ fontSize: "16px", lineHeight: "1.9" }}
              dangerouslySetInnerHTML={{
                __html: pageData.htmlContent,
              }}
            />
          )}

          {/* DOCUMENTS */}
          <div className="mt-5">
            <h5 className="fw-bold mb-3">
              <FaFileAlt className="me-2" />
              Attachments
            </h5>

            {pageData.documentsUpdate?.length === 0 && (
              <p className="text-muted">No documents attached.</p>
            )}

            {pageData.documentsUpdate?.map((doc) => (
              <div
                key={doc._id}
                className="d-flex justify-content-between align-items-center border rounded-3 p-3 mb-2"
              >
                <a
                  href={`${API}${doc.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-decoration-none fw-semibold"
                >
                  {doc.titleHin || doc.titleEng}
                </a>

                <Badge color="secondary">
                  {doc.fileType?.toUpperCase() || "FILE"}
                  {doc.fileSize && ` • ${doc.fileSize}`}
                </Badge>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </Container>
  );
};

export default CreatedDynamicPage;
