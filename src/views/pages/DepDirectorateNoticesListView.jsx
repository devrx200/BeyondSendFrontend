import { useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
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
  Input,
  InputGroup,
  InputGroupText,
  Breadcrumb,
  BreadcrumbItem,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import {
  FaCalendarAlt,
  FaChevronRight,
  FaHome,
  FaNewspaper,
  FaFileAlt,
  FaTag,
  FaChevronLeft,
  FaDownload,
  FaCalendarPlus,
  FaSearch,
  FaExclamationTriangle,
  FaInbox,
} from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL;

const DepDirectorateNoticesListView = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { isHindi } = useLanguage();

  const [list, setList] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  /* ─── Page type detection ─── */
  const path = location.pathname;
  const isDirectorateList = path === "/directorate-notices";
  const isDirectorateDetail = path.startsWith("/directorate-notice/");

  /* ─── API endpoints ─── */
  const LIST_API = isDirectorateList
    ? "/api/get-directorate-notice-for-user"
    : "/api/get-department-notice-for-user";

  const DETAIL_API = isDirectorateDetail
    ? `/api/get-directorate-notice-by-slug/${slug}`
    : `/api/get-department-notice-by-slug/${slug}`;

  /* ─── Fetchers ─── */
  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}${LIST_API}`);
      setList(res?.data?.data || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}${DETAIL_API}`);
      setDetail(res?.data?.data || null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError(false);
    setSearch("");
    slug ? fetchDetail() : fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, path]);

  /* ─── Helpers ─── */
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

  const pageTitleText = isDirectorateList
    ? isHindi ? "निदेशालय सूचनाएं" : "Directorate Notices"
    : isHindi ? "विभागीय सूचनाएं" : "Department Notices";

  const listRoute = isDirectorateDetail
    ? "/directorate-notices"
    : "/departments-notices";

  const listTitle = isDirectorateDetail
    ? (isHindi ? "निदेशालय सूचनाएं" : "Directorate Notices")
    : (isHindi ? "विभागीय सूचनाएं" : "Department Notices");

  const filteredList = list.filter((item) => {
    const q = search.toLowerCase();
    return (
      (item.titleEn || "").toLowerCase().includes(q) ||
      (item.titleHi || "").includes(q)
    );
  });

  /* ══════════════════════════════════════════
                    LOADING
  ══════════════════════════════════════════ */
  if (loading) {
    return (
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
    );
  }

  /* ══════════════════════════════════════════
                     ERROR
  ══════════════════════════════════════════ */
  if (error) {
    return (
      <Container className="py-5">
        <Alert color="danger" className="d-flex align-items-center gap-2 shadow-sm rounded-3">
          <FaExclamationTriangle size={20} />
          <span className="fw-semibold">
            {isHindi
              ? "कुछ गलत हो गया। कृपया पुनः प्रयास करें।"
              : "Something went wrong. Please try again."}
          </span>
        </Alert>
      </Container>
    );
  }

  /* ══════════════════════════════════════════
                    LIST PAGE
  ══════════════════════════════════════════ */
  if (!slug) {
    return (
      <Container className="py-4 bg-light my-3 rounded">

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
          <BreadcrumbItem active className="fw-semibold d-flex align-items-center gap-1 text-secondary">
            <FaNewspaper size={13} />
            {pageTitleText}
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Page Header */}
        <Card
          className="border-0 shadow-sm mb-4 text-white rounded-4"
          style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #befaed 100%)" }}
        >
          <CardBody className="py-4 px-4">
            <Row className="align-items-center g-2">
              <Col>
                <h4 className="mb-1 fw-bold d-flex align-items-center gap-2 text-white">
                  <FaNewspaper />
                  {pageTitleText}
                </h4>
                <p className="mb-0 small opacity-75 text-white">
                  {isHindi
                    ? "नवीनतम सूचनाओं की सूची नीचे दी गई है"
                    : "Browse the latest official notices below"}
                </p>
              </Col>
              <Col xs="auto">
                <Badge pill color="light" className="text-primary fw-bold fs-6 px-3 py-2">
                  {list.length}&nbsp;{isHindi ? "सूचनाएं" : "Notices"}
                </Badge>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Search Bar */}
        {list.length > 0 && (
          <InputGroup className="mb-4 shadow-sm rounded-3 overflow-hidden">
            <InputGroupText className="bg-white border-end-0 text-muted">
              <FaSearch size={14} />
            </InputGroupText>
            <Input
              placeholder={isHindi ? "सूचना खोजें..." : "Search Any Notices..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-start-0"
              bsSize="lg"
            />
          </InputGroup>
        )}

        {/* Notice List */}
        {filteredList.length > 0 ? (
          <Card className="border shadow-sm rounded-4 overflow-hidden">
            <ListGroup flush>
              {filteredList.map((item, idx) => (
                <ListGroupItem
                  key={item._id}
                  action
                  tag={Link}
                  to={isDirectorateList ? `/directorate-notice/${item.slug}` : `/department-notice/${item.slug}`}
                  className="text-decoration-none px-4 py-3 border-bottom d-flex align-items-center gap-3" >
                  {/* Serial Number Badge */}
                  <Badge color="primary" className="rounded-3 fw-bold d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 32, height: 32, fontSize: 12 }}>
                    {idx + 1}
                  </Badge>

                  {/* Title + Date */}
                  <div className="flex-grow-1 overflow-hidden">
                    <div
                      className="fw-semibold text-dark lh-sm mb-1 text-truncate"
                      style={{ fontSize: 14.5 }}
                    >
                      {isHindi ? item.titleHi : item.titleEn}
                    </div>
                    <div className="text-muted d-flex align-items-center gap-1 small">
                      <FaCalendarAlt size={11} />
                      {formatDateTime(item.createdAt)}
                    </div>
                  </div>
                  {/* Arrow */}
                  <FaChevronRight className="text-primary opacity-50 flex-shrink-0" size={13} />
                </ListGroupItem>
              ))}
            </ListGroup>
          </Card>
        ) : (
          /* Empty State */
          <Card className="border-0 shadow-sm rounded-4">
            <CardBody className="text-center py-5">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light"
                style={{ width: 72, height: 72 }}
              >
                <FaInbox size={30} className="text-primary opacity-50" />
              </div>
              <h6 className="text-muted fw-semibold mb-1">
                {search
                  ? (isHindi ? "खोज परिणाम नहीं मिले" : "No results found")
                  : (isHindi ? "कोई सूचना नहीं मिली" : "No notices available")}
              </h6>
              <p className="text-muted small mb-0">
                {search
                  ? (isHindi ? "कृपया अलग शब्द खोजें" : "Try a different search term")
                  : (isHindi ? "अभी कोई सूचना उपलब्ध नहीं है" : "Check back later for updates")}
              </p>
            </CardBody>
          </Card>
        )}

      </Container>
    );
  }

  if (!detail) {
    return (
      <Container className="py-5">
        <Alert color="warning" className="d-flex align-items-center gap-2 shadow-sm rounded-3">
          <FaExclamationTriangle size={18} />
          <span className="fw-semibold">
            {isHindi ? "विवरण नहीं मिला।" : "Notice details not found."}
          </span>
        </Alert>
      </Container>
    );
  }

  return (
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
          style={{ maxWidth: 300 }} >
          {isHindi ? detail.titleHi : detail.titleEn}
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Detail Card */}
      <Card className="border-0 shadow-lg rounded-4 overflow-hidden">

        {/* ── Gradient Header ── */}
        <CardHeader
          className="text-white border-0 p-4"
          style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)" }}
        >
          {/* Notice Title */}
          <h4 className="fw-bold mb-3 lh-base text-white">
            {isHindi ? detail.titleHi : detail.titleEn}
          </h4>

          <hr className="border-white opacity-25 my-3" />

          {/* Meta Pills Row */}
          <Row className="g-2 align-items-center">

            {/* Created */}
            <Col xs="auto">
              <Badge color="light" className="text-dark d-flex align-items-center gap-1 px-3 py-2 fw-normal rounded-pill" >
                <FaCalendarAlt size={11} className="text-primary" />
                {isHindi ? "प्रकाशन तिथि" : "Created At"} : {formatDateTime(detail.createdAt)}
              </Badge>
            </Col>

            {/* Updated */}
            <Col xs="auto">
              <Badge
                color="light"
                className="text-dark d-flex align-items-center gap-1 px-3 py-2 fw-normal rounded-pill"
              >
                <FaCalendarPlus size={11} className="text-success" />
                {isHindi ? "अपडेट किया गया" : "Updated At"} : {formatDateTime(detail.updatedAt)}
              </Badge>
            </Col>

            {/* Category */}
            {detail.categoryId && (
              <Col xs="auto">
                <Badge
                  color="warning"
                  className="text-dark d-flex align-items-center gap-1 px-3 py-2 fw-normal rounded-pill"
                >
                  <FaTag size={11} />
                  {isHindi
                    ? detail.categoryId?.categoryNameHi
                    : detail.categoryId?.categoryNameEn}
                </Badge>
              </Col>
            )}

            {/* Back Button — pushed to far right */}
            <Col className="d-flex justify-content-end">
              <Button tag={Link} to={listRoute} size="sm" outline className="d-flex align-items-center gap-1 fw-semibold text-white bg-dark py-1">
                <FaChevronLeft size={11} />
                {isHindi ? "सूची पर वापस जाएं" : "Back to List"}
              </Button>
            </Col>

          </Row>
        </CardHeader>

        {/* ── Notice Body ── */}
        <CardBody className="p-4">
          <div className="lh-lg text-secondary" dangerouslySetInnerHTML={{ __html: isHindi ? detail.descriptionHi : detail.descriptionEn, }} />

          <div className="d-flex justify-content-between align-items-center" >

            <div className="d-flex gap-2 fw-bold">
              Official Documents Download And Read  : 👉
            </div>

            {detail.file && (
              <div className="d-flex gap-2">
                <Button
                  tag="a"
                  href={`${API}${detail.file}`}
                  download={detail.file.split('/').pop() || 'document'}
                  color="danger"
                  size="sm"
                  className="d-inline-flex align-items-center gap-2 fw-semibold px-2"
                >
                  <FaDownload size={14} />
                  {isHindi ? "फ़ाइल डाउनलोड करें" : "Download File"}
                </Button>
                <Button
                  tag="a"
                  href={`${API}${detail.file}`}
                  target="_blank"
                  rel="noreferrer"
                  color="success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-2 fw-semibold px-2"
                >
                  <FaFileAlt size={14} />
                  {isHindi ? "फ़ाइल देखें" : "View File"}
                </Button>
              </div>
            )}
          </div>

        </CardBody>

        <CardFooter className="bg-light fw-bold border-top px-4 py-3 text-center">
          {isHindi ? "पढ़ने के लिए धन्यवाद !.." : "Thanks For Reading !.."}
        </CardFooter>

      </Card>
    </Container>
  );
};

export default DepDirectorateNoticesListView;