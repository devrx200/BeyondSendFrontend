import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

/* ------------------ Initial State ------------------ */
const initialState = {
  fullName: "",
  email: "",
  phone: "",
  feedback: "",
  captcha: ""
};

/* ------------------ Validation ------------------ */
const validate = (values, captchaAnswer) => {
  const errors = {};

  const name = values.fullName.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const feedback = values.feedback.trim();
  const captcha = values.captcha.trim();

  if (!name) errors.fullName = "Full name is required";

  if (!email)
    errors.email = "Email is required";
  else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email))
    errors.email = "Enter a valid email address";

  if (!phone)
    errors.phone = "Phone number is required";
  else if (!/^[6-9]\d{9}$/.test(phone))
    errors.phone = "Enter a valid 10-digit mobile number";

  if (!feedback)
    errors.feedback = "Feedback is required";
  else if (feedback.length < 10)
    errors.feedback = "Feedback must be at least 10 characters";

  if (!captcha)
    errors.captcha = "Captcha is required";
  else if (!/^\d+$/.test(captcha))
    errors.captcha = "Captcha must be numeric";
  else if (parseInt(captcha, 10) !== captchaAnswer)
    errors.captcha = "Captcha is incorrect";

  return errors;
};

/* ------------------ Component ------------------ */
const FeedbackForm = () => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* CAPTCHA */
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);

  const captchaAnswer = num1 + num2;

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10));
    setNum2(Math.floor(Math.random() * 10));
    setValues((prev) => ({ ...prev, captcha: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const validationErrors = validate(values, captchaAnswer);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) return;

    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/api/feedback-creat`,
        {
          name: values.fullName.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone.trim(),
          message: values.feedback.trim()
        },
        {
          headers: {
            "Content-Type": "application/json",
            "web-url": window.location.href
          }
        }
      );

      Swal.fire({
        icon: "success",
        title: "Thank You!",
        text: "Your feedback has been submitted successfully.",
        confirmButtonColor: "#0d6efd"
      });

      setValues(initialState);
      generateCaptcha();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text:
          err?.response?.data?.message ||
          "Unable to submit feedback. Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-5 my-5 container rounded" style={{ backgroundColor: "#f8f9fa" }}>
      <Container>
        <Row className="align-items-center justify-content-center">


          {/* LEFT ILLUSTRATION */}
          <Col
            lg={6}
            className="d-none d-lg-flex flex-column justify-content-between align-items-center text-center"
            style={{
              backgroundImage: "url('/public/feedback.png')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center top",
              backgroundSize: "contain",
              minHeight: "400px",
              borderRadius: "16px",
              padding: "10px"
            }}
          >
            {/* EMPTY SPACE TOP */}
            <div />

            {/* TEXT AT BOTTOM */}
            <div className="pb--5 ">
              <h3 className="fw-bold text-danger mb-1">
                We Value Your Feedback
              </h3>
              <p className="text-muted mb-0">
                Help us improve our services
              </p>
            </div>
          </Col>


          {/* RIGHT FORM */}
          <Col lg={6}>
            <div className="bg-white rounded-3 shadow-sm p-4 p-md-5">
              <h4 className="fw-bold text-center mb-4">
                Send Us Your Feedback
              </h4>

              <form onSubmit={handleSubmit} noValidate>

                {/* Name + Email */}
                <Row className="g-3 mb-3">
                  <Col md={6}>
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter Your Name"
                      className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                      value={values.fullName}
                      onChange={handleChange}
                    />
                    <div className="invalid-feedback">{errors.fullName}</div>
                  </Col>

                  <Col md={6}>
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder=" Enter Your Email "
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      value={values.email}
                      onChange={handleChange}
                    />
                    <div className="invalid-feedback">{errors.email}</div>
                  </Col>
                </Row>

                {/* Phone */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter Your Phone Number"
                    className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                    value={values.phone}
                    onChange={handleChange}
                  />
                  <div className="invalid-feedback">{errors.phone}</div>
                </div>

                {/* Feedback */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Feedback</label>
                  <textarea
                    name="feedback"
                    placeholder="Enter Your Feedback !.."
                    rows="4"
                    className={`form-control ${errors.feedback ? "is-invalid" : ""}`}
                    value={values.feedback}
                    onChange={handleChange}
                    style={{ resize: "none" }}
                  />
                  <div className="invalid-feedback">{errors.feedback}</div>
                </div>

                {/* CAPTCHA */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Security Check: {num1} + {num2} = ?
                  </label>
                  <input
                    type="text"
                    name="captcha"
                    placeholder="Enter The Answer"
                    className={`form-control ${errors.captcha ? "is-invalid" : ""}`}
                    value={values.captcha}
                    onChange={handleChange}
                  />
                  <div className="invalid-feedback">{errors.captcha}</div>
                </div>

                {/* Submit */}
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Feedback"}
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
