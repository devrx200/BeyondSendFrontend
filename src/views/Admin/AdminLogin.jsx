import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  InputGroup,
  InputGroupText,
  Spinner
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaUser,
  FaLock,
  FaSignInAlt,
  FaEye,
  FaEyeSlash,
  FaSyncAlt,
  FaShieldAlt,
  FaTimes
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

const AdminLogin = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Captcha State
  const [captcha, setCaptcha] = useState(createCaptchaString);
  const [userCaptcha, setUserCaptcha] = useState("");

  const navigate = useNavigate();
  const { isHindi } = useLanguage();
  const API_URL = import.meta.env.VITE_API_URL;

  /* ---------- CAPTCHA GENERATOR ---------- */
  const generateCaptcha = () => {
    setCaptcha(createCaptchaString());
  };

  /* ---------- VALIDATORS ---------- */
  const isEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const isValidMobile = (value) =>
    /^[6-9]\d{9}$/.test(value);

  const isStrongPassword = (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,21}$/.test(
      value
    );

  /* ---------- SUBMIT ---------- */
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
        html: `
          <ul style="text-align:left; font-size: 14px;">
            <li>${isHindi ? "ईमेल सही प्रारूप में होना चाहिए" : "Email must be valid"}</li>
            <li>${isHindi ? "मोबाइल 10 अंकों का होना चाहिए (6-9 से शुरू)" : "Mobile must be 10 digits starting with 6-9"}</li>
          </ul>
        `
      });
    }

    if (!isStrongPassword(password)) {
      return Swal.fire({
        icon: "error",
        title: isHindi ? "कमजोर पासवर्ड" : "Weak Password",
        html: `
          <ul style="text-align:left; font-size: 14px;">
            <li>${isHindi ? "8-21 अक्षर होने चाहिए" : "8–21 characters"}</li>
            <li>${isHindi ? "अपरकेस + लोअरकेस अक्षर" : "Uppercase + lowercase"}</li>
            <li>${isHindi ? "संख्या + विशेष वर्ण (@$!%*?&)" : "Number + special character"}</li>
          </ul>
        `
      });
    }

    // CAPTCHA VALIDATION (Case-Insensitive for seamless user experience)
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
        `${API_URL}/api/user-login`,
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

      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (err) {
      let message = isHindi ? "सर्वर से कनेक्ट करने में असमर्थ" : "Unable to connect to server";

      if (err.response?.data?.message) {
        message = err.response.data.message;
      }

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
            {/* MAIN AUTHENTICATION CARD */}
            <Card className="admin-login-card border-0 shadow-lg">
              {/* TOP COLOR THEME STRIP */}
              <div className="decorative-tribal-strip" />

              <Row className="g-0 align-items-stretch">
                {/* LEFT SIDE: ANIMATED SVG EDUCATION/ADMIN ILLUSTRATION WITH WAVE BACKDROP */}
                <Col xs={12} md={6} className="admin-login-illustration-panel d-none d-md-flex flex-column">
                  <AdminLoginIllustration isHindi={isHindi} />
                </Col>

                {/* RIGHT SIDE: AUTHENTICATION FORM */}
                <Col xs={12} md={6} className="admin-login-form-panel p-4 p-md-5 d-flex flex-column justify-content-center">
                  {/* BRAND HEADER */}
                  <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center mb-2">
                      <img
                        src="/cg-hiedu-full-logo.jpg"
                        alt="Chhattisgarh Government"
                        className="img-fluid rounded p-1 bg-white"
                        style={{ maxHeight: "56px", width: "auto", objectFit: "contain" }}
                        onError={(e) => {
                          e.target.src = "/Chhattisgarh.svg";
                        }}
                      />
                    </div>

                    <h4 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.2px", color: "#1e3a8a" }}>
                      {isHindi ? "विभागीय अधिकारी लॉगिन" : "Admin / Officer Login"}
                    </h4>
                    <p className="text-muted small mb-0">
                      {isHindi
                        ? "उच्च शिक्षा विभाग, छत्तीसगढ़ शासन"
                        : "Department of Higher Education, Govt. of Chhattisgarh"}
                    </p>
                  </div>

                  <Form onSubmit={handleSubmit} noValidate>
                    {/* EMAIL / MOBILE */}
                    <FormGroup className="mb-3">
                      <Label className="form-label">
                        {isHindi ? "ईमेल आईडी / मोबाइल नंबर" : "Email / Mobile Number"}{" "}
                        <span className="text-danger">*</span>
                      </Label>
                      <InputGroup className="admin-login-input-group shadow-xs">
                        <InputGroupText>
                          <FaUser />
                        </InputGroupText>
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
                          placeholder={
                            isHindi ? "ईमेल या 10-अंकीय मोबाइल नंबर दर्ज करें" : "Enter registered email or mobile"
                          }
                          autoComplete="username"
                          required
                        />
                      </InputGroup>
                    </FormGroup>

                    {/* PASSWORD */}
                    <FormGroup className="mb-3">
                      <Label className="form-label">
                        {isHindi ? "पासवर्ड" : "Password"}{" "}
                        <span className="text-danger">*</span>
                      </Label>
                      <InputGroup className="admin-login-input-group shadow-xs">
                        <InputGroupText>
                          <FaLock />
                        </InputGroupText>
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

                    {/* CAPTCHA SECTION */}
                    <FormGroup className="mb-4">
                      <Label className="form-label">
                        {isHindi ? "सुरक्षा कोड (कैप्चा)" : "Security Code (Captcha)"}{" "}
                        <span className="text-danger">*</span>
                      </Label>
                      <div className="d-flex align-items-center gap-2">
                        {/* CAPTCHA DISPLAY BOX */}
                        <div className="captcha-display-box flex-shrink-0">
                          {captcha}
                        </div>

                        {/* REFRESH BUTTON */}
                        <button
                          type="button"
                          className="captcha-refresh-btn flex-shrink-0"
                          onClick={generateCaptcha}
                          title={isHindi ? "नया कोड लोड करें" : "Refresh Captcha"}
                        >
                          <FaSyncAlt />
                        </button>

                        {/* USER CAPTCHA INPUT */}
                        <Input
                          type="text"
                          placeholder={isHindi ? "कैप्चा कोड दर्ज करें" : "Enter Captcha"}
                          value={userCaptcha}
                          maxLength={6}
                          onChange={(e) =>
                            setUserCaptcha(e.target.value.replace(/\s/g, "").slice(0, 6))
                          }
                          className="fw-semibold"
                          style={{ letterSpacing: "2px" }}
                          autoComplete="off"
                          required
                        />

                        {/* CLEAR BUTTON */}
                        {userCaptcha && (
                          <button
                            type="button"
                            className="btn btn-light border text-danger d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: "42px", height: "42px", borderRadius: "8px" }}
                            onClick={() => setUserCaptcha("")}
                            title="Clear"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    </FormGroup>

                    {/* LOGIN SUBMIT BUTTON */}
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

                  {/* SECURITY FOOTER NOTE */}
                  <div className="admin-security-note mt-4 pt-3 border-top text-center">
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