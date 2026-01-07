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
  InputGroupText
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaUser,
  FaLock,
  FaSignInAlt,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

const AdminLogin = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

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

    if (!identifier || !password) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Email/Mobile and Password are required."
      });
    }

    if (!isEmail(identifier) && !isValidMobile(identifier)) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Email / Mobile",
        html: `
          <ul style="text-align:left">
            <li>Email must be in valid format</li>
            <li>Mobile must be 10 digits</li>
            <li>Mobile should start with 6, 7, 8, or 9</li>
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
            <li>8–21 characters long</li>
            <li>At least 1 uppercase letter</li>
            <li>At least 1 lowercase letter</li>
            <li>At least 1 number</li>
            <li>At least 1 special character (@ $ ! % * ? &)</li>
          </ul>
        `
      });
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/user-login`,
        { identifier, password },
        { timeout: 10000 }
      );

      sessionStorage.setItem("authToken", res.data.token);

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Redirecting to dashboard...",
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #4e73df, #1cc88a)"
      }}
    >
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100 ">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0 ">
              <CardBody className="p-5 rounded border border-dark shadow">
                <div className="text-center mb-4">
                  <FaUser size={48} className="text-primary" />
                  <h2 className="mt-3 fw-bold">Admin Login</h2>
                  <hr className="p-0 m-0" />
                  <small className="text-muted ">
                     Department of Higher Education, Government of Chhattisgarh
                  </small>
                </div>

                <Form onSubmit={handleSubmit}>
                  {/* EMAIL / MOBILE */}
                  <FormGroup className="mb-3">
                    <Label className="fw-semibold">
                      <FaUser className="me-2" />
                      Email / Mobile <strong className="text-danger">*</strong>
                    </Label>
                    <Input
                      type="text"
                      className=" border border-1 border-black"
                      value={identifier}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          if (value.length <= 10) {
                            setIdentifier(value);
                          }
                        }
                        // Allow email
                        else {
                          setIdentifier(value);
                        }
                      }}
                      placeholder="Enter email or mobile"
                    />
                  </FormGroup>

                  {/* PASSWORD */}
                  <FormGroup className="mb-4">
                    <Label className="fw-semibold">
                      <FaLock className="me-2" />
                      Password <strong className="text-danger">*</strong>
                    </Label>
                    <InputGroup>
                      <Input
                       className=" border border-1 border-black"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                      />
                      <InputGroupText
                        style={{ cursor: "pointer" }}
                         className=" border border-1 border-black border-left-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </InputGroupText>
                    </InputGroup>
                  </FormGroup>

                  <Button
                    color="primary"
                    type="submit"
                    className="w-100"
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
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin;
