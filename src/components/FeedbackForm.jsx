import React, { useState } from "react";
import { Container, Row, Col } from "reactstrap";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL; 
// example: http://localhost:5000

/* ------------------ Initial State ------------------ */
const initialState = {
  fullName: "",
  email: "",
  phone: "",
  feedback: ""
};

/* ------------------ Validation ------------------ */
const validate = (values) => {
  const errors = {};

  if (!values.fullName.trim())
    errors.fullName = "Full name is required";

  if (!values.email)
    errors.email = "Email is required";
  else if (!/^[\w-.]+@[\w-]+\.[A-Za-z]{2,}$/.test(values.email))
    errors.email = "Enter a valid email";

  if (!values.phone)
    errors.phone = "Phone number is required";
  else if (!/^\d{10}$/.test(values.phone))
    errors.phone = "Phone must be 10 digits";

  if (!values.feedback.trim())
    errors.feedback = "Feedback is required";

  return errors;
};

/* ------------------ API Call ------------------ */
const sendFeedback = async (values) => {
  const payload = {
    name: values.fullName,      // 🔁 mapping for backend
    email: values.email,
    phone: values.phone,
    message: values.feedback
  };

  const res = await axios.post(
    `${API_URL}/api/feedback-creat`,
    payload,
    {
      headers: {
        "web-url": window.location.href
      }
    }
  );

  return res.data;
};

/* ------------------ Component ------------------ */
const FeedbackForm = () => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: null
    }));

    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) return;

    try {
      setLoading(true);
      await sendFeedback(values);

      setSuccessMsg("Thank you! Your feedback was submitted successfully.");
      setValues(initialState);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message || "Failed to submit feedback"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="feedback-section py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="feedback-card p-4 shadow-sm bg-white rounded">
              <h5 className="mb-3 text-center">We value your feedback</h5>

              {successMsg && (
                <div className="alert alert-success">{successMsg}</div>
              )}

              {errorMsg && (
                <div className="alert alert-danger">{errorMsg}</div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className={`form-control ${
                      errors.fullName ? "is-invalid" : ""
                    }`}
                    value={values.fullName}
                    onChange={handleChange}
                  />
                  {errors.fullName && (
                    <div className="invalid-feedback">
                      {errors.fullName}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    value={values.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className={`form-control ${
                      errors.phone ? "is-invalid" : ""
                    }`}
                    value={values.phone}
                    onChange={handleChange}
                    placeholder="10 digits"
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">
                      {errors.phone}
                    </div>
                  )}
                </div>

                {/* Feedback */}
                <div className="mb-3">
                  <label className="form-label">Feedback</label>
                  <textarea
                    name="feedback"
                    rows="4"
                    className={`form-control ${
                      errors.feedback ? "is-invalid" : ""
                    }`}
                    value={values.feedback}
                    onChange={handleChange}
                  />
                  {errors.feedback && (
                    <div className="invalid-feedback">
                      {errors.feedback}
                    </div>
                  )}
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Submit Feedback"}
                  </button>
                </div>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default FeedbackForm;
