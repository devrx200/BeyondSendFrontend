import { useState, useEffect } from "react";
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
  InputGroupText
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaUser,
  FaLock,
  FaSignInAlt,
  FaEye,
  FaEyeSlash,
  FaSyncAlt
} from "react-icons/fa";

const AdminLogin = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ CAPTCHA STATES
  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  /* ---------- CAPTCHA GENERATOR ---------- */
  const generateCaptcha = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

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
        title: "Missing Information",
        text: "All fields are required."
      });
    }

    if (!isEmail(identifier) && !isValidMobile(identifier)) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Email / Mobile",
        html: `
          <ul style="text-align:left">
            <li>Email must be valid</li>
            <li>Mobile must be 10 digits</li>
            <li>Start with 6-9</li>
          </ul>
        `
      });
    }

    if (!isStrongPassword(password)) {
      return Swal.fire({
        icon: "error",
        title: "Weak Password",
        html: `
          <ul style="text-align:left">
            <li>8–21 characters</li>
            <li>Uppercase + lowercase</li>
            <li>Number + special character</li>
          </ul>
        `
      });
    }

    // ✅ CAPTCHA VALIDATION
    if (userCaptcha !== captcha) {
      generateCaptcha();
      setUserCaptcha("");

      return Swal.fire({
        icon: "error",
        title: "Invalid Captcha",
        text: "Please enter correct captcha"
      });
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/api/user-login`,
        { identifier, password },
        { timeout: 10000 }
      );

      sessionStorage.setItem("authToken", res.data.token);

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Redirecting...",
        timer: 1500,
        showConfirmButton: false
      });

      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (err) {
      let message = "Unable to connect to server";

      if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: message
      });

      // regenerate captcha on failure
      generateCaptcha();
      setUserCaptcha("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container  className="d-flex align-items-center justify-content-center my-3">
      <Row className="w-100 justify-content-center ">
        <Col md={6} lg={5}>
          <Card className="border border-2 shadow border-primary">
            <CardBody className="p-4">

              {/* HEADER */}
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #007bff, #00c6ff)",
                    color: "#fff"
                  }}
                >
                  <FaUser size={28} />
                </div>

                <h4 className="fw-bold mb-1">Admin Login</h4>
                <hr className="m-0" />
                <small className="text-muted">
                  Department of Higher Education
                </small>
              </div>

              <Form onSubmit={handleSubmit}>

                {/* EMAIL / MOBILE */}
                <FormGroup className="mb-3">
                  <Label className="fw-semibold small">
                    <FaUser className="me-1" />
                    Email / Mobile *
                  </Label>

                  <Input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        if (value.length <= 10) setIdentifier(value);
                      } else {
                        setIdentifier(value);
                      }
                    }}
                    placeholder="Enter email or mobile"
                  />
                </FormGroup>

                {/* PASSWORD */}
                <FormGroup className="mb-3">
                  <Label className="fw-semibold small">
                    <FaLock className="me-1" />
                    Password *
                  </Label>

                  <InputGroup>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                    />

                    <InputGroupText
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer" }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </InputGroupText>
                  </InputGroup>
                </FormGroup>

                {/* CAPTCHA */}
                <FormGroup className="ms-auto mb-4">
                  <div className="d-flex align-items-center gap-2">
                    {/* CAPTCHA BOX */}
                    <div
                      style={{
                        background: "#f1f1f1",
                        padding: "8px 15px",
                        fontWeight: "bold",
                        letterSpacing: "3px",
                        borderRadius: "6px",
                        fontSize: "18px",
                        minWidth: "120px",
                        textAlign: "center"
                      }}
                    >
                      {captcha}
                    </div>

                    {/* REFRESH BUTTON */}
                    <Button
                      type="button"
                      color="primary"
                      size="sm"
                      onClick={generateCaptcha}
                    >
                      <FaSyncAlt />
                    </Button>

                    {/* INPUT */}
                    <Input
                      type="text"
                      placeholder="Enter Captcha Code"
                      value={userCaptcha}
                      maxLength={6}
                      minLength={6}
                      onChange={(e) =>
                        setUserCaptcha(e.target.value.replace(/\s/g, "").slice(0, 6))
                      }
                      style={{ maxWidth: "190px" }}
                    />
                    {/* CLEAR BUTTON */}
                    <Button
                      type="button"
                      color="danger"
                      size="sm"
                      onClick={() => setUserCaptcha("")}
                    >
                      X
                    </Button>

                  </div>
                </FormGroup>

                {/* LOGIN BUTTON */}
                <Button
                  color="primary"
                  type="submit"
                  className="w-100 fw-semibold"
                  size="lg"
                  disabled={loading}
                >
                  <FaSignInAlt className="me-2" />
                  {loading ? "Logging in..." : "Login"}
                </Button>

              </Form>
            </CardBody>
          </Card>
        </Col>

        {/* RIGHT SIDE */}
        <Col md={6} lg={5} className="d-none d-md-block">
          <Card
            className="border-1 border-danger shadow-sm h-100"
            style={{
              background: "linear-gradient(135deg, #f8fbff, #eef6ff)"
            }}
          >
            <CardBody className="p-4 d-flex flex-column justify-content-center">

              {/* TITLE */}
              <div className="text-center mb-4">
                <h5 className="fw-bold mb-1 text-primary">
                  🔐 Secure Login Tips
                </h5>
                <small className="text-muted">
                  Keep your account safe & protected
                </small>
              </div>

              {/* TIPS */}
              <div className="d-flex flex-column gap-3">

                <div className="d-flex align-items-start gap-2">
                  <span className="text-danger">🔑</span>
                  <span className="small">
                    Never share your <b>password</b> with anyone
                  </span>
                </div>

                <div className="d-flex align-items-start gap-2">
                  <span className="text-success">🛡️</span>
                  <span className="small">
                    Use <b>strong passwords</b> (letters + numbers + symbols)
                  </span>
                </div>

                <div className="d-flex align-items-start gap-2">
                  <span className="text-warning">🚪</span>
                  <span className="small">
                    Always <b>logout</b> after using admin panel
                  </span>
                </div>

                <div className="d-flex align-items-start gap-2">
                  <span className="text-info">💻</span>
                  <span className="small">
                    Avoid login on <b>public/shared computers</b>
                  </span>
                </div>

              </div>

              {/* FOOTER NOTE */}
              <div className="text-center mt-4">
                <small className="text-muted">
                  Your security is our priority 🔒
                </small>
              </div>

            </CardBody>
          </Card>
        </Col>

      </Row>
    </Container>
  );
};

export default AdminLogin; 