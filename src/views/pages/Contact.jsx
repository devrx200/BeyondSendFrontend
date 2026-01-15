import { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button } from "reactstrap";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaUserTie,
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

      {/* CONTACT IMAGE */}
      <Row className="mt-4">
        <Col>
          <img
            src={indrawatiBhavan? indrawatiBhavan : "/indrawati-bhavan.png"}
            alt="Contact"
            className="img-fluid rounded shadow-sm w-100 h-100"
          />
        </Col>
      </Row>

    </PageLayout>
  );
};

export default Contact;
