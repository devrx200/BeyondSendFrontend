import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
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
  FaKey,
  FaClock,
  FaCheckCircle,
  FaUserShield,
  FaTimes
} from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

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
    <Container className="d-flex align-items-center justify-content-center py-4 my-auto" style={{ minHeight: "80vh" }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={10} lg={9} xl={8}>
          <Card className="border-0 shadow-lg rounded-4 overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
            <Row className="g-0">
              {/* LEFT SIDE: AUTHENTICATION FORM */}
              <Col xs={12} md={7} className="bg-white p-4 p-lg-5 d-flex flex-column justify-content-center">
                {/* BRAND HEADER */}
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center mb-2.5">
                    <img
                      src="/cg-hiedu-full-logo.jpg"
                      alt="Chhattisgarh Government"
                      className="img-fluid rounded p-1 bg-white"
                      style={{ maxHeight: "55px", width: "auto", objectFit: "contain" }}
                      onError={(e) => {
                        e.target.src = "/Chhattisgarh.svg";
                      }}
                    />
                  </div>

                  <h4 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.2px" }}>
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
                    <Label className="fw-bold text-dark small mb-1">
                      {isHindi ? "ईमेल आईडी / मोबाइल नंबर" : "Email / Mobile Number"} <span className="text-danger">*</span>
                    </Label>
                    <InputGroup>
                      <InputGroupText className="bg-light border-end-0 text-muted">
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
                        placeholder={isHindi ? "ईमेल या 10-अंकीय मोबाइल नंबर दर्ज करें" : "Enter registered email or mobile"}
                        className="border-start-0 ps-0"
                        autoComplete="username"
                        required
                      />
                    </InputGroup>
                  </FormGroup>

                  {/* PASSWORD */}
                  <FormGroup className="mb-3">
                    <Label className="fw-bold text-dark small mb-1">
                      {isHindi ? "पासवर्ड" : "Password"} <span className="text-danger">*</span>
                    </Label>
                    <InputGroup>
                      <InputGroupText className="bg-light border-end-0 text-muted">
                        <FaLock />
                      </InputGroupText>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isHindi ? "पासवर्ड दर्ज करें" : "Enter password"}
                        className="border-start-0 border-end-0 ps-0"
                        autoComplete="current-password"
                        required
                      />
                      <InputGroupText
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: "pointer" }}
                        className="bg-light text-muted"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </InputGroupText>
                    </InputGroup>
                  </FormGroup>

                  {/* CAPTCHA SECTION */}
                  <FormGroup className="mb-4">
                    <Label className="fw-bold text-dark small mb-1">
                      {isHindi ? "सुरक्षा कोड (कैप्चा)" : "Security Code (Captcha)"} <span className="text-danger">*</span>
                    </Label>
                    <div className="d-flex align-items-center gap-2">
                      {/* CAPTCHA DISPLAY BOX */}
                      <div
                        className="user-select-none d-flex align-items-center justify-content-center shadow-xs"
                        style={{
                          background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                          padding: "8px 14px",
                          fontWeight: "800",
                          letterSpacing: "4px",
                          borderRadius: "8px",
                          fontSize: "17px",
                          fontFamily: "monospace",
                          color: "#0f172a",
                          border: "1.5px dashed #94a3b8",
                          minWidth: "115px",
                          textAlign: "center"
                        }}
                      >
                        {captcha}
                      </div>

                      {/* REFRESH BUTTON */}
                      <Button
                        type="button"
                        color="light"
                        className="border d-flex align-items-center justify-content-center shadow-xs"
                        style={{ width: "38px", height: "38px" }}
                        onClick={generateCaptcha}
                        title={isHindi ? "नया कोड लोड करें" : "Refresh Captcha"}
                      >
                        <FaSyncAlt className="text-teal" style={{ color: "#0d9488" }} />
                      </Button>

                      {/* USER CAPTCHA INPUT */}
                      <Input
                        type="text"
                        placeholder={isHindi ? "कैप्चा कोड दर्ज करें" : "Enter Captcha code"}
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
                        <Button
                          type="button"
                          color="light"
                          className="border text-danger d-flex align-items-center justify-content-center shadow-xs"
                          style={{ width: "38px", height: "38px" }}
                          onClick={() => setUserCaptcha("")}
                          title="Clear"
                        >
                          <FaTimes />
                        </Button>
                      )}
                    </div>
                  </FormGroup>

                  {/* LOGIN SUBMIT BUTTON */}
                  <Button
                    type="submit"
                    className="w-100 fw-bold py-2.5 shadow-sm text-white border-0"
                    size="lg"
                    disabled={loading}
                    style={{
                      background: "linear-gradient(135deg, #0d9488 0%, #065f46 100%)",
                      fontSize: "15px",
                      borderRadius: "10px",
                      transition: "all 0.25s ease"
                    }}
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
              </Col>

              {/* RIGHT SIDE: SECURITY & OFFICIAL PORTAL ADVISORY */}
              <Col
                xs={12}
                md={5}
                className="d-none d-md-flex flex-column justify-content-between p-4 p-lg-5 text-white"
                style={{
                  background: "linear-gradient(145deg, #0f172a 0%, #134e4a 60%, #064e3b 100%)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* AMBIENT BACKGROUND GLOW */}
                <div
                  style={{
                    position: "absolute",
                    top: "-40px",
                    right: "-40px",
                    width: "160px",
                    height: "160px",
                    borderRadius: "50%",
                    background: "rgba(20, 184, 166, 0.18)",
                    filter: "blur(40px)"
                  }}
                />

                {/* TOP SECURITY SHIELD */}
                <div>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "36px", height: "36px", background: "rgba(255,255,255,0.12)" }}
                    >
                      <FaUserShield size={18} className="text-warning" />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-white">
                        {isHindi ? "सुरक्षा एवं सतर्कता दिशानिर्देश" : "Secure Access Protocol"}
                      </h6>
                      <small className="text-white-50" style={{ fontSize: "11px" }}>
                        {isHindi ? "केवल अधिकृत अधिकारियों के लिए" : "Authorized Personnel Only"}
                      </small>
                    </div>
                  </div>

                  {/* SECURITY BULLET POINTS */}
                  <div className="d-flex flex-column gap-3 mt-4">
                    <div className="d-flex align-items-start gap-2.5">
                      <FaShieldAlt className="text-teal mt-1 flex-shrink-0" style={{ color: "#2dd4bf" }} size={13} />
                      <span className="small text-white-90 lh-sm" style={{ fontSize: "12.5px" }}>
                        {isHindi
                          ? "अपना पासवर्ड या ओटीपी किसी के साथ साझा न करें।"
                          : "Never share your credentials or OTP with anyone."}
                      </span>
                    </div>

                    <div className="d-flex align-items-start gap-2.5">
                      <FaKey className="text-warning mt-1 flex-shrink-0" size={13} />
                      <span className="small text-white-90 lh-sm" style={{ fontSize: "12.5px" }}>
                        {isHindi
                          ? "मजबूत पासवर्ड (अक्षर, संख्या व विशेष वर्ण) का प्रयोग करें।"
                          : "Use strong passwords containing letters, numbers & symbols."}
                      </span>
                    </div>

                    <div className="d-flex align-items-start gap-2.5">
                      <FaClock className="text-info mt-1 flex-shrink-0" size={13} />
                      <span className="small text-white-90 lh-sm" style={{ fontSize: "12.5px" }}>
                        {isHindi
                          ? "कार्य पूर्ण होने के बाद हमेशा पोर्टल से साइन आउट करें।"
                          : "Always logout properly after completing administrative tasks."}
                      </span>
                    </div>

                    <div className="d-flex align-items-start gap-2.5">
                      <FaCheckCircle className="text-success mt-1 flex-shrink-0" size={13} />
                      <span className="small text-white-90 lh-sm" style={{ fontSize: "12.5px" }}>
                        {isHindi
                          ? "सार्वजनिक या असुरक्षित कंप्यूटरों पर लॉगिन करने से बचें।"
                          : "Avoid logging in from public or shared computer networks."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BOTTOM COMPLIANCE BADGE */}
                <div className="pt-4 border-top border-secondary border-opacity-25 mt-4">
                  <div className="d-flex align-items-center gap-2">
                    <FaShieldAlt className="text-success" size={14} />
                    <span className="text-white-50 small" style={{ fontSize: "11px" }}>
                      256-Bit SSL Encrypted Admin Gateway
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLogin; 