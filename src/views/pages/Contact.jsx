import { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Badge } from "reactstrap";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaUserTie,
  FaEnvelope,
  FaBuilding,
  FaUniversity,
  FaFax,


} from "react-icons/fa";
import PageLayout from "../../components/PageLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import axios from "axios";
import indrawatiBhavan from "/indrawati-bhavan.png";


const Contact = () => {
  const { isHindi } = useLanguage();
  const API = import.meta.env.VITE_API_URL;

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    const res = await axios.get(`${API}/api/contact-card/get`);
    setCards(res.data.data);
  };
  /* ================= LOAD CONTACT ================= */
  const loadContact = async () => {
    try {
      const res = await axios.get(`${API}/api/contact`);
      setContact(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContact();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  const address = contact?.address || {};
  const officeHours = contact?.officeHours || {};
  const officials = contact?.officials || [];

  return (
    <PageLayout
      title={isHindi ? "संपर्क विवरण" : "Contact Details"}
      titleHi="संपर्क विवरण"
      showBreadcrumb
    >

      {/* ================= TOP INFO ================= */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <h6 className="fw-semibold mb-2">
                <FaMapMarkerAlt className="me-2 text-primary" />
                {isHindi ? "कार्यालय का पता" : "Office Address"}
              </h6>
              <p className="small text-muted mb-0">
                {address.addressLine}<br />
                {address.city}, {address.state}<br />
                {address.pincode}
              </p>
            </CardBody>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <h6 className="fw-semibold mb-2">
                <FaPhone className="me-2 text-success" />
                {isHindi ? "संपर्क विवरण" : "Contact Details"}
              </h6>
              <p className="small mb-1 text-muted">{address.phone}</p>
              <p className="small text-muted mb-0">{address.email}</p>
            </CardBody>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <h6 className="fw-semibold mb-2">
                <FaClock className="me-2 text-warning" />
                {isHindi ? "कार्य समय" : "Office Hours"}
              </h6>

              {officeHours.weekdays ? (
                <>
                  <p className="small mb-1 text-muted">{officeHours.weekdays}</p>
                  <p className="small mb-1 text-muted">{officeHours.saturday}</p>
                  <p className="small mb-0 text-muted">{officeHours.sunday}</p>
                </>
              ) : (
                <p className="small text-muted mb-0">Not Available</p>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* ================= KEY OFFICIALS ================= */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <CardBody>
              {/* SECTION TITLE */}
              <h5 className="mb-2">
                <FaUserTie className="me-2 text-primary" />
                {isHindi ? "मुख्य अधिकारी" : "Key Officials"}
              </h5>
              <p className="text-muted small mb-3">
                {isHindi
                  ? "विभाग के प्रमुख अधिकारी"
                  : "List of department key officials"}
              </p>

              {/* COLUMN HEADERS */}
              <Row className="fw-semibold small text-muted border-bottom pb-2 mb-2">
                <Col md={2} className="text-center">{isHindi ? "प्रोफाइल छवि" : "Profile Picture"}</Col>
                <Col md={4}>{isHindi ? "नाम और पदनाम" : "Name & Designation"}</Col>
                <Col md={3}>{isHindi ? "संपर्क विवरण" : "Contact Details"}</Col>
                <Col md={3}>{isHindi ? "सोशल मीडिया लिंक" : "Social Media Links"}</Col>
              </Row>

              {/* OFFICIAL LIST */}
              {officials.map((official) => (
                <Row
                  key={official._id}
                  className="align-items-center py-3 border-bottom"
                >
                  {/* IMAGE */}
                  <Col md={2} className="text-center">
                    <img
                      src={
                        official.image
                          ? `${API}${official.image}`
                          : "/default-user.png"
                      }
                      alt={official.name}
                      style={{
                        width: 70,
                        height: 70,
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "1px solid #ddd"
                      }}
                    />
                  </Col>

                  {/* NAME + DESIGNATION */}
                  <Col md={4}>
                    <div className="fw-semibold">{official.name}</div>
                    <div className="small text-muted">
                      {official.designation}
                    </div>
                  </Col>

                  {/* CONTACT */}
                  <Col md={3} className="small">
                    {official.phone && (
                      <div>
                        <FaPhone size={12} className="me-1" />
                        {official.phone}
                      </div>
                    )}
                    {official.email && (
                      <div>
                        <FaEnvelope size={12} className="me-1" />
                        {official.email}
                      </div>
                    )}
                  </Col>

                  {/* SOCIAL */}
                  <Col md={3}>
                    <div className="d-flex gap-2">
                      {official.facebook && (
                        <a
                          href={official.facebook}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-light border rounded d-flex align-items-center justify-content-center"
                          style={{ width: 36, height: 36 }}
                        >
                          <i className="bi bi-facebook text-primary"></i>
                        </a>
                      )}

                      {official.instagram && (
                        <a
                          href={official.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-light border rounded d-flex align-items-center justify-content-center"
                          style={{ width: 36, height: 36 }}
                        >
                          <i className="bi bi-instagram text-danger"></i>
                        </a>
                      )}

                      {official.linkedin && (
                        <a
                          href={official.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-light border rounded d-flex align-items-center justify-content-center"
                          style={{ width: 36, height: 36 }}
                        >
                          <i className="bi bi-linkedin text-info"></i>
                        </a>
                      )}

                      {official.youtube && (
                        <a
                          href={official.youtube}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-light border rounded d-flex align-items-center justify-content-center"
                          style={{ width: 36, height: 36 }}
                        >
                          <i className="bi bi-youtube text-danger"></i>
                        </a>
                      )}
                    </div>
                  </Col>


                </Row>
              ))}
            </CardBody>

          </Card>
        </Col>
      </Row>
      <Row>

      </Row>
     

        {/* /////////////// */}

        <Row className="mt-4">

  {/* ================= DEPARTMENT ================= */}
  {cards.filter(c => c.type === "department").length > 0 ? (
    cards
      .filter(c => c.type === "department")
      .map((item, i) => {
        const isPrimary = item.color === "primary";

        const theme = {
          bg: isPrimary ? "#e8f0fe" : "#d1fae5",
          iconBg: isPrimary ? "#e8f0fe" : "#d1fae5",
          iconColor: isPrimary ? "#1a56db" : "#057a55",
          textColor: isPrimary ? "#1a56db" : "#057a55",
          border: isPrimary
            ? "rgba(13,110,253,0.1)"
            : "rgba(25,135,84,0.1)",
          dot1: isPrimary ? "bg-primary" : "bg-success",
          dot2: isPrimary ? "#4f83e7" : "#0e9f6e",
          dot3: isPrimary ? "#c7d8fc" : "#bbf7d0"
        };

        return (
          <Col xs={12} lg={6} key={i}>
              <Card className="h-100 border-0 shadow rounded-4 overflow-hidden mt-4 ">

                {/* top bar */}
                <div className={`bg-${item.color}`} style={{ height: 5 }} />

                {/* header */}
                <div
                  className="px-4 pt-4 pb-3"
                  style={{
                    background: `linear-gradient(135deg,${theme.bg} 0%,#fff 70%)`,
                    borderBottom: `1px solid ${theme.border}`,
                  }}
                >

                  <div className="d-flex align-items-center gap-3">
                    <div
                      className={`d-flex align-items-center justify-content-center rounded-3 bg-${item.color} text-white shadow-sm`}
                      style={{ width: 54, height: 54, fontSize: 22 }}
                    >
                      {item.icon}
                      <FaBuilding />
                    </div>

                    <div>
                      <Badge
                        color={item.color}
                        pill
                        className="mb-1 fw-semibold"
                        style={{
                          fontSize: "0.6rem",
                          letterSpacing: "0.08em",
                          opacity: 0.85
                        }}
                      >
                        {item.badge}
                      </Badge>

                      <h5 className="fw-bold mb-0 lh-sm">
                        {item.title}
                      </h5>
                      <small className="text-muted">{item.subtitle}</small>
                    </div>
                  </div>
                </div>

                <CardBody className="px-4 py-3">

                  {/* Address */}
                  <div className="d-flex gap-3 align-items-start p-3 rounded-3 mb-2"
                    style={{ background: "#f8f9fa" }}>
                    <div
                      className="d-flex align-items-center justify-content-center rounded-2"
                      style={{
                        width: 36,
                        height: 36,
                        background: theme.iconBg,
                        color: theme.iconColor
                      }}
                    >
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <div className="text-uppercase fw-bold text-secondary mb-1"
                        style={{ fontSize: "0.6rem" }}>
                        Office Address
                      </div>
                      <div className="small">{item.address}</div>
                    </div>
                  </div>

                  {/* Phone */}
                  {item.phone && (
                    <a href={`tel:${item.phone}`} className="text-decoration-none d-block mb-2">
                      <div className="d-flex gap-3 align-items-center p-3 rounded-3"
                        style={{ background: "#f8f9fa" }}>
                        <div
                          className="d-flex align-items-center justify-content-center rounded-2"
                          style={{
                            width: 36,
                            height: 36,
                            background: theme.iconBg,
                            color: theme.iconColor
                          }}
                        >
                          <FaPhone />
                        </div>
                        <div>
                          <div className="text-uppercase fw-bold text-secondary mb-1"
                            style={{ fontSize: "0.6rem" }}>
                            Phone
                          </div>
                          <div className="small fw-semibold" style={{ color: theme.textColor }}>
                            {item.phone}
                          </div>
                        </div>
                      </div>
                    </a>
                  )}

                  {/* Fax */}
                  {item.fax && (
                    <div className="d-flex gap-3 align-items-center p-3 rounded-3 mb-2"
                      style={{ background: "#f8f9fa" }}>
                      <div
                        className="d-flex align-items-center justify-content-center rounded-2"
                        style={{
                          width: 36,
                          height: 36,
                          background: theme.iconBg,
                          color: theme.iconColor
                        }}
                      >
                        <FaFax />
                      </div>
                      <div>
                        <div className="text-uppercase fw-bold text-secondary mb-1"
                          style={{ fontSize: "0.6rem" }}>
                          Fax
                        </div>
                        <div className="small fw-semibold">{item.fax}</div>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <a href={`mailto:${item.email}`} className="text-decoration-none d-block">
                    <div className="d-flex gap-3 align-items-center p-3 rounded-3"
                      style={{ background: "#f8f9fa" }}>
                      <div
                        className="d-flex align-items-center justify-content-center rounded-2"
                        style={{
                          width: 36,
                          height: 36,
                          background: theme.iconBg,
                          color: theme.iconColor
                        }}
                      >
                        <FaEnvelope />
                      </div>
                      <div>
                        <div className="text-uppercase fw-bold text-secondary mb-1"
                          style={{ fontSize: "0.6rem" }}>
                          Email
                        </div>
                        <div className="small fw-semibold" style={{ color: theme.textColor }}>
                          {item.email}
                        </div>
                      </div>
                    </div>
                  </a>

                </CardBody>

                {/* bottom dots */}
                <div className="px-4 pb-3 d-flex gap-1 align-items-center">
                  <div className={`${theme.dot1} rounded-pill`} style={{ width: 28, height: 4 }} />
                  <div className="rounded-pill" style={{ width: 14, height: 4, background: theme.dot2 }} />
                  <div className="rounded-pill" style={{ width: 7, height: 4, background: theme.dot3 }} />
                </div>

              </Card>
            </Col>
        );
      })
  ) : (
    <Col xs={12} lg={6}>
     <Card className="h-100 border-0 shadow rounded-4 overflow-hidden mt-4">

            {/* top colour bar */}
            <div className="bg-primary" style={{ height: 5 }} />

            {/* gradient header */}
            <div
              className="px-4 pt-4 pb-3"
              style={{
                background: "linear-gradient(135deg,#e8f0fe 0%,#fff 70%)",
                borderBottom: "1px solid rgba(13,110,253,0.1)",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                {/* icon badge */}
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 bg-primary text-white shadow-sm flex-shrink-0"
                  style={{ width: 54, height: 54, fontSize: 22 }}
                >
                  <FaBuilding />
                </div>

                <div>
                  <Badge
                    color="primary"
                    pill
                    className="mb-1 fw-semibold"
                    style={{ fontSize: "0.6rem", letterSpacing: "0.08em", opacity: 0.85 }}
                  >
                    DEPT. OF HIGHER EDUCATION
                  </Badge>
                  <h5 className="fw-bold mb-0 lh-sm" style={{ color: "#1a1f36" }}>
                    Department of Higher Education
                  </h5>
                  <small className="text-muted">Government of Chhattisgarh</small>
                </div>
              </div>
            </div>

            <CardBody className="px-4 py-5 text-center">

  <div className="d-flex flex-column align-items-center justify-content-center">

    {/* Icon */}
    <div
      className="d-flex align-items-center justify-content-center rounded-circle mb-3"
      style={{
        width: 60,
        height: 60,
        background: "#e8f0fe",
        color: "#1a56db",
        fontSize: 24
      }}
    >
      <FaBuilding />
    </div>

    {/* Title */}
    <h6 className="fw-bold mb-1">No Department Records</h6>

    {/* Subtitle */}
    <small className="text-muted">
      No data available for this section right now
    </small>

  </div>

</CardBody>
      </Card>
    </Col>
  )}

  {/* ================= DIRECTORATE ================= */}
  {cards.filter(c => c.type === "directorate").length > 0 ? (
    cards
      .filter(c => c.type === "directorate")
      .map((item, i) => {
        const isPrimary = item.color === "primary";

        const theme = {
          bg: isPrimary ? "#e8f0fe" : "#d1fae5",
          iconBg: isPrimary ? "#e8f0fe" : "#d1fae5",
          iconColor: isPrimary ? "#1a56db" : "#057a55",
          textColor: isPrimary ? "#1a56db" : "#057a55",
        };

        return (
          <Col xs={12} lg={6} key={i}>
              <Card className="h-100 border-0 shadow rounded-4 overflow-hidden mt-4 ">

                {/* top bar */}
                <div className={`bg-${item.color}`} style={{ height: 5 }} />

                {/* header */}
                <div
                  className="px-4 pt-4 pb-3"
                  style={{
                    background: `linear-gradient(135deg,${theme.bg} 0%,#fff 70%)`,
                    borderBottom: `1px solid ${theme.border}`,
                  }}
                >

                  <div className="d-flex align-items-center gap-3">
                    <div
                      className={`d-flex align-items-center justify-content-center rounded-3 bg-${item.color} text-white shadow-sm`}
                      style={{ width: 54, height: 54, fontSize: 22 }}
                    >
                      {item.icon}
                      <FaBuilding />
                    </div>

                    <div>
                      <Badge
                        color={item.color}
                        pill
                        className="mb-1 fw-semibold"
                        style={{
                          fontSize: "0.6rem",
                          letterSpacing: "0.08em",
                          opacity: 0.85
                        }}
                      >
                        {item.badge}
                      </Badge>

                      <h5 className="fw-bold mb-0 lh-sm">
                        {item.title}
                      </h5>
                      <small className="text-muted">{item.subtitle}</small>
                    </div>
                  </div>
                </div>

                <CardBody className="px-4 py-3">

                  {/* Address */}
                  <div className="d-flex gap-3 align-items-start p-3 rounded-3 mb-2"
                    style={{ background: "#f8f9fa" }}>
                    <div
                      className="d-flex align-items-center justify-content-center rounded-2"
                      style={{
                        width: 36,
                        height: 36,
                        background: theme.iconBg,
                        color: theme.iconColor
                      }}
                    >
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <div className="text-uppercase fw-bold text-secondary mb-1"
                        style={{ fontSize: "0.6rem" }}>
                        Office Address
                      </div>
                      <div className="small">{item.address}</div>
                    </div>
                  </div>

                  {/* Phone */}
                  {item.phone && (
                    <a href={`tel:${item.phone}`} className="text-decoration-none d-block mb-2">
                      <div className="d-flex gap-3 align-items-center p-3 rounded-3"
                        style={{ background: "#f8f9fa" }}>
                        <div
                          className="d-flex align-items-center justify-content-center rounded-2"
                          style={{
                            width: 36,
                            height: 36,
                            background: theme.iconBg,
                            color: theme.iconColor
                          }}
                        >
                          <FaPhone />
                        </div>
                        <div>
                          <div className="text-uppercase fw-bold text-secondary mb-1"
                            style={{ fontSize: "0.6rem" }}>
                            Phone
                          </div>
                          <div className="small fw-semibold" style={{ color: theme.textColor }}>
                            {item.phone}
                          </div>
                        </div>
                      </div>
                    </a>
                  )}

                  {/* Fax */}
                  {item.fax && (
                    <div className="d-flex gap-3 align-items-center p-3 rounded-3 mb-2"
                      style={{ background: "#f8f9fa" }}>
                      <div
                        className="d-flex align-items-center justify-content-center rounded-2"
                        style={{
                          width: 36,
                          height: 36,
                          background: theme.iconBg,
                          color: theme.iconColor
                        }}
                      >
                        <FaFax />
                      </div>
                      <div>
                        <div className="text-uppercase fw-bold text-secondary mb-1"
                          style={{ fontSize: "0.6rem" }}>
                          Fax
                        </div>
                        <div className="small fw-semibold">{item.fax}</div>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <a href={`mailto:${item.email}`} className="text-decoration-none d-block">
                    <div className="d-flex gap-3 align-items-center p-3 rounded-3"
                      style={{ background: "#f8f9fa" }}>
                      <div
                        className="d-flex align-items-center justify-content-center rounded-2"
                        style={{
                          width: 36,
                          height: 36,
                          background: theme.iconBg,
                          color: theme.iconColor
                        }}
                      >
                        <FaEnvelope />
                      </div>
                      <div>
                        <div className="text-uppercase fw-bold text-secondary mb-1"
                          style={{ fontSize: "0.6rem" }}>
                          Email
                        </div>
                        <div className="small fw-semibold" style={{ color: theme.textColor }}>
                          {item.email}
                        </div>
                      </div>
                    </div>
                  </a>

                </CardBody>

                {/* bottom dots */}
                <div className="px-4 pb-3 d-flex gap-1 align-items-center">
                  <div className={`${theme.dot1} rounded-pill`} style={{ width: 28, height: 4 }} />
                  <div className="rounded-pill" style={{ width: 14, height: 4, background: theme.dot2 }} />
                  <div className="rounded-pill" style={{ width: 7, height: 4, background: theme.dot3 }} />
                </div>

              </Card>
            </Col>
        );
      })
  ) : (
    <Col xs={12} lg={6}>
    <Card className="h-100 border-0 shadow rounded-4 overflow-hidden mt-4">

            {/* top colour bar */}
            <div className="bg-success" style={{ height: 5 }} />

            {/* gradient header */}
            <div
              className="px-4 pt-4 pb-3"
              style={{
                background: "linear-gradient(135deg,#d1fae5 0%,#fff 70%)",
                borderBottom: "1px solid rgba(25,135,84,0.1)",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                {/* icon badge */}
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 bg-success text-white shadow-sm flex-shrink-0"
                  style={{ width: 54, height: 54, fontSize: 22 }}
                >
                  <FaUniversity />
                </div>

                <div>
                  <Badge
                    color="success"
                    pill
                    className="mb-1 fw-semibold"
                    style={{ fontSize: "0.6rem", letterSpacing: "0.08em", opacity: 0.85 }}
                  >
                    DIRECTORATE · HIGHER EDUCATION
                  </Badge>
                  <h5 className="fw-bold mb-0 lh-sm" style={{ color: "#1a1f36" }}>
                    Directorate of Higher Education
                  </h5>
                  <small className="text-muted">Government of Chhattisgarh</small>
                </div>
              </div>
            </div>

           <CardBody className="px-4 py-5 text-center">

  <div className="d-flex flex-column align-items-center justify-content-center">

    {/* Icon */}
    <div
      className="d-flex align-items-center justify-content-center rounded-circle mb-3"
      style={{
        width: 60,
        height: 60,
        background: "#e8f0fe",
        color: "#0e9f6e",
        fontSize: 24
      }}
    >
      <FaBuilding />
    </div>

    {/* Title */}
    <h6 className="fw-bold mb-1">No Directorate Records</h6>

    {/* Subtitle */}
    <small className="text-muted">
      No data available for this section right now
    </small>

  </div>

</CardBody>
      </Card>
    </Col>
  )}

</Row>
      
      {/* CONTACT IMAGE */}
      <br/>
      <Row className="mt-4">
        <Col>
          <img
            src={indrawatiBhavan ? indrawatiBhavan : "/indrawati-bhavan.png"}
            alt="Contact"
            className="img-fluid rounded shadow-sm w-100 h-100"
          />
        </Col>
      </Row>

    </PageLayout>
  );
};

export default Contact;
