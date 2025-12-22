import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { isHindi } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError(isHindi ? 'कृपया सभी फ़ील्ड भरें' : 'Please fill all fields');
      return;
    }

    const result = login(username, password);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(isHindi ? 'अमान्य उपयोगकर्ता नाम या पासवर्ड' : 'Invalid username or password');
    }
  };

  return (
    <div className="admin-login-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5}>
            <Card className="login-card">
              <CardBody className="p-5">
                <div className="text-center mb-4">
                  <div className="login-icon-wrapper">
                    <FaUser size={50} />
                  </div>
                  <h2 className="login-title mt-3">
                    {isHindi ? 'व्यवस्थापक लॉगिन' : 'Admin Login'}
                  </h2>
                  <p className="text-muted">
                    {isHindi ? 'उच्च शिक्षा विभाग' : 'Higher Education Department'}
                  </p>
                </div>

                {error && <Alert color="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="username">
                      <FaUser className="me-2" />
                      {isHindi ? 'उपयोगकर्ता नाम' : 'Username'}
                    </Label>
                    <Input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={isHindi ? 'उपयोगकर्ता नाम दर्ज करें' : 'Enter username'}
                      className="login-input"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="password">
                      <FaLock className="me-2" />
                      {isHindi ? 'पासवर्ड' : 'Password'}
                    </Label>
                    <Input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isHindi ? 'पासवर्ड दर्ज करें' : 'Enter password'}
                      className="login-input"
                    />
                  </FormGroup>

                  <Button color="primary" type="submit" className="w-100 login-btn mt-4" size="lg">
                    <FaSignInAlt className="me-2" />
                    {isHindi ? 'लॉगिन' : 'Login'}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    {isHindi 
                      ? 'डेमो: उपयोगकर्ता नाम: admin, पासवर्ड: admin@123'
                      : 'Demo: Username: admin, Password: admin@123'}
                  </small>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin;

