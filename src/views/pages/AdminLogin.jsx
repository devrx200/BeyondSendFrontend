import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Row, Col, Card, Form, FormGroup, Label,
  Input, Button, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaUser, FaLock, FaSignInAlt, FaEye, FaEyeSlash,
  FaSyncAlt, FaShieldAlt, FaTimes, FaSms, FaEnvelope,
  FaMobileAlt, FaChartBar, FaHeadset, FaBullhorn
} from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";
import AdminLoginIllustration from "../../components/AdminLoginIllustration";

const createCaptchaString = () => {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const FEATURES = [
  { icon: <FaSms />, label: "Bulk SMS & Voice Campaigns" },
  { icon: <FaEnvelope />, label: "Email Marketing Automation" },
  { icon: <FaMobileAlt />, label: "WhatsApp & Social Media" },
  { icon: <FaHeadset />, label: "BPO Calling & CRM" },
  { icon: <FaChartBar />, label: "Real-time Analytics" },
  { icon: <FaBullhorn />, label: "Multi-channel Broadcasting" },
];

const AdminLogin = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState(createCaptchaString);
  const [userCaptcha, setUserCaptcha] = useState("");

  const navigate = useNavigate();
  const { isHindi } = useLanguage();
  const API_URL = import.meta.env.VITE_API_URL;

  const generateCaptcha = () => setCaptcha(createCaptchaString());

  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isValidMobile = (value) => /^[6-9]\d{9}$/.test(value);
  const isStrongPassword = (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,21}$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!identifier || !password || !userCaptcha) {
      return Swal.fire({
        icon: "warning",
        title: isHindi ? "आवश्यक जानकारी अधूरी है" : "Missing Information",
        text: isHindi ? "कृपया सभी आवश्यक फ़ील्ड भरें।" : "All fields are required."
      });
    }

    if (!isEmail(identifier) && !isValidMobile(identifier)) {
      return Swal.fire({
        icon: "error",
        title: isHindi ? "अमान्य ईमेल या मोबाइल" : "Invalid Email / Mobile",
        html: `<ul style="text-align:left; font-size: 14px;">
          <li>${isHindi ? "ईमेल सही प्रारूप में होना चाहिए" : "Email must be valid"}</li>
          <li>${isHindi ? "मोबाइल 10 अंकों का होना चाहिए (6-9 से शुरू)" : "Mobile must be 10 digits starting with 6-9"}</li>
        </ul>`
      });
    }

    if (!isStrongPassword(password)) {
      return Swal.fire({
        icon: "error",
        title: isHindi ? "कमजोर पासवर्ड" : "Weak Password",
        html: `<ul style="text-align:left; font-size: 14px;">
          <li>${isHindi ? "8-21 अक्षर होने चाहिए" : "8–21 characters"}</li>
          <li>${isHindi ? "अपरकेस + लोअरकेस अक्षर" : "Uppercase + lowercase"}</li>
          <li>${isHindi ? "संख्या + विशेष वर्ण (@$!%*?&)" : "Number + special character"}</li>
        </ul>`
      });
    }

    if (userCaptcha.trim().toLowerCase() !== captcha.toLowerCase()) {
      generateCaptcha();
      setUserCaptcha("");
      return Swal.fire({
        icon: "error",
        title: isHindi ? "अमान्य कैप्चा कोड" : "Invalid Captcha",
        text: isHindi ? "कृपया सही कैप्चा कोड दर्ज करें।" : "Please enter the correct captcha code."
      });
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        { identifier, password },
        { timeout: 10000 },
        { headers: { "Content-Type": "application/json" } }
      );
      sessionStorage.setItem("authToken", res.data.token);
      Swal.fire({
        icon: "success",
        title: isHindi ? "लॉगिन सफल" : "Login Successful",
        text: isHindi ? "व्यवस्थापक पैनल पर रीडायरेक्ट किया जा रहा है..." : "Redirecting to Admin Portal...",
        timer: 1500,
        showConfirmButton: false
      });
      setTimeout(() => navigate("/authorized/dashboard"), 1500);
    } catch (err) {
      let message = isHindi ? "सर्वर से कनेक्ट करने में असमर्थ" : "Unable to connect to server";
      if (err.response?.data?.message) message = err.response.data.message;
      Swal.fire({
        icon: "error",
        title: isHindi ? "लॉगिन विफल" : "Login Failed",
        text: message
      });
      generateCaptcha();
      setUserCaptcha("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper d-flex align-items-center justify-content-center py-4 py-lg-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} lg={11} xl={10}>
            <Card className="admin-login-card border-0">
              {/* Animated accent strip */}
              <div className="admin-login-accent-strip" />

              <Row className="g-0 align-items-stretch">
                {/* ── LEFT: Brand + Features Panel ── */}
                <Col xs={12} md={6} className="admin-login-illustration-panel d-none d-md-flex flex-column justify-content-between">
                  {/* SVG Illustration */}
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <AdminLoginIllustration isHindi={isHindi} />
                  </div>

                  {/* Brand text */}
                  <div className="admin-login-brand-label">
                    <h2>
                      {isHindi ? "बियॉन्डसेंड" : "BeyondSend"}
                    </h2>
                    <p>
                      {isHindi
                        ? "टेलीकॉम · SMS · ईमेल · सोशल मीडिया · BPO मार्केटिंग प्लेटफॉर्म"
                        : "Telecom · SMS · Email · Social Media · BPO Marketing Platform"}
                    </p>
                  </div>

                  {/* Feature pills */}
                  <div className="d-flex flex-wrap justify-content-center pb-4" style={{ position: "relative", zIndex: 1 }}>
                    {FEATURES.map((f, i) => (
                      <span key={i} className="admin-feature-pill">
                        {f.icon}
                        {f.label}
                      </span>
                    ))}
                  </div>
                </Col>

                {/* ── RIGHT: Login Form ── */}
                <Col xs={12} md={6} className="admin-login-form-panel p-4 p-md-5 d-flex flex-column justify-content-center">
                  {/* Brand header */}
                  <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center mb-3">
                      <img
                        src="/beyondsend-logo.svg"
                        alt="BeyondSend Logo"
                        className="img-fluid rounded p-1 bg-white"
                        style={{ maxHeight: "56px", width: "auto", objectFit: "contain" }}
                        onError={(e) => { e.target.src = "/beyondsend-logo.svg"; }}
                      />
                    </div>
                    <h2 className="fw-bold mb-1" style={{ fontFamily: "var(--pub-font)", fontSize: "1.35rem", color: "var(--pub-default)", letterSpacing: "-0.3px" }}>
                      {isHindi ? "लॉगिन करें" : "Welcome Back"}
                    </h2>
                    <p className="text-muted small mb-0">
                      {isHindi ? "अपने खाते में प्रवेश करें" : "Sign in to your BeyondSend account"}
                    </p>
                  </div>

                  <Form onSubmit={handleSubmit} noValidate>
                    {/* Email / Mobile */}
                    <FormGroup className="mb-3">
                      <Label className="form-label">
                        {isHindi ? "ईमेल आईडी / मोबाइल नंबर" : "Email / Mobile Number"}{" "}
                        <span className="text-danger">*</span>
                      </Label>
                      <InputGroup className="admin-login-input-group">
                        <InputGroupText><FaUser /></InputGroupText>
                        <Input
                          type="text"
                          value={identifier}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) {
                              if (val.length <= 10) setIdentifier(val);
                            } else {
                              setIdentifier(val);
                            }
                          }}
                          placeholder={isHindi ? "ईमेल या 10-अंकीय मोबाइल नंबर दर्ज करें" : "Enter registered email or mobile"}
                          autoComplete="username"
                          required
                        />
                      </InputGroup>
                    </FormGroup>

                    {/* Password */}
                    <FormGroup className="mb-3">
                      <Label className="form-label">
                        {isHindi ? "पासवर्ड" : "Password"}{" "}
                        <span className="text-danger">*</span>
                      </Label>
                      <InputGroup className="admin-login-input-group">
                        <InputGroupText><FaLock /></InputGroupText>
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={isHindi ? "पासवर्ड दर्ज करें" : "Enter password"}
                          autoComplete="current-password"
                          required
                        />
                        <InputGroupText
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ cursor: "pointer" }}
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </InputGroupText>
                      </InputGroup>
                    </FormGroup>

                    {/* Captcha */}
                    <FormGroup className="mb-4">
                      <Label className="form-label">
                        {isHindi ? "सुरक्षा कोड (कैप्चा)" : "Security Code (Captcha)"}{" "}
                        <span className="text-danger">*</span>
                      </Label>
                      <div className="d-flex align-items-center gap-2">
                        <div className="captcha-display-box flex-shrink-0">{captcha}</div>

                        <button
                          type="button"
                          className="captcha-refresh-btn flex-shrink-0"
                          onClick={generateCaptcha}
                          title={isHindi ? "नया कोड लोड करें" : "Refresh Captcha"}
                        >
                          <FaSyncAlt />
                        </button>

                        <Input
                          type="text"
                          placeholder={isHindi ? "कैप्चा कोड दर्ज करें" : "Enter Captcha"}
                          value={userCaptcha}
                          maxLength={6}
                          onChange={(e) => setUserCaptcha(e.target.value.replace(/\s/g, "").slice(0, 6))}
                          className="fw-semibold"
                          style={{ letterSpacing: "2px", borderRadius: "10px", border: "1.5px solid #e2e8f0" }}
                          autoComplete="off"
                          required
                        />

                        {userCaptcha && (
                          <button
                            type="button"
                            className="btn btn-light border text-danger d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: "42px", height: "42px", borderRadius: "10px" }}
                            onClick={() => setUserCaptcha("")}
                            title="Clear"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    </FormGroup>

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="btn-theme-login w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          {isHindi ? "सत्यापन हो रहा है..." : "Authenticating..."}
                        </>
                      ) : (
                        <>
                          <FaSignInAlt className="me-2" />
                          {isHindi ? "लॉगिन करें" : "Secure Login"}
                        </>
                      )}
                    </Button>
                  </Form>

                  {/* Security footer */}
                  <div className="admin-security-note mt-4 pt-3 border-top">
                    <FaShieldAlt className="text-success" />
                    <span>
                      {isHindi ? "256-बिट एसएसएल सुरक्षित व्यवस्थापक गेटवे" : "256-Bit SSL Encrypted Admin Gateway"}
                    </span>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin;