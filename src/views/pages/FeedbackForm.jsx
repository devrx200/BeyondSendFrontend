import { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL;

const initialState = { fullName: '', email: '', phone: '', feedback: '', captcha: '' };

const validate = (values, captchaAnswer) => {
  const errors = {};
  const name     = values.fullName.trim();
  const email    = values.email.trim();
  const phone    = values.phone.trim();
  const feedback = values.feedback.trim();
  const captcha  = values.captcha.trim();

  if (!name)     errors.fullName = 'Full name is required';
  if (!email)    errors.email    = 'Email is required';
  else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email))
    errors.email = 'Enter a valid email address';
  if (!phone)    errors.phone    = 'Phone number is required';
  else if (!/^[6-9]\d{9}$/.test(phone))
    errors.phone = 'Enter a valid 10-digit mobile number';
  if (!feedback) errors.feedback = 'Feedback is required';
  else if (feedback.length < 10)
    errors.feedback = 'Feedback must be at least 10 characters';
  if (!captcha)  errors.captcha  = 'Captcha is required';
  else if (!/^\d+$/.test(captcha))
    errors.captcha = 'Captcha must be numeric';
  else if (parseInt(captcha, 10) !== captchaAnswer)
    errors.captcha = 'Captcha is incorrect';

  return errors;
};

const FeedbackForm = () => {
  const { isHindi } = useLanguage();
  const [values,  setValues]  = useState(initialState);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);

  const captchaAnswer = num1 + num2;

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10));
    setNum2(Math.floor(Math.random() * 10));
    setValues((prev) => ({ ...prev, captcha: '' }));
  };

  useEffect(() => { generateCaptcha(); }, []);

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
          name:    values.fullName.trim(),
          email:   values.email.trim().toLowerCase(),
          phone:   values.phone.trim(),
          message: values.feedback.trim(),
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      Swal.fire({
        icon: 'success',
        title: isHindi ? 'धन्यवाद!' : 'Thank You!',
        text: isHindi
          ? 'आपकी प्रतिक्रिया सफलतापूर्वक जमा की गई।'
          : 'Your feedback has been submitted successfully.',
        confirmButtonColor: '#0d6efd',
      });
      setValues(initialState);
      generateCaptcha();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: isHindi ? 'सबमिट विफल' : 'Submission Failed',
        text: err?.response?.data?.message || 'Unable to submit feedback. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="Feedback"
      titleHi="प्रतिक्रिया"
      showBreadcrumb
    >
      <div className="py-4 py-md-5 px-3 px-md-4 rounded-4 bg-light">
        <Row className="align-items-center justify-content-center g-4">

          {/* Left Illustration — hidden on small screens */}
          <Col
            lg={6}
            className="d-none d-lg-flex flex-column justify-content-between align-items-center text-center feedback-illustration"
            style={{ backgroundImage: "url('/feedback.png')" }}
            aria-hidden="true"
          >
            <div />
            <div className="pt-5">
              <h3 className="fw-bold text-danger mb-1">
                {isHindi ? 'हम आपकी प्रतिक्रिया को महत्व देते हैं' : 'We Value Your Feedback'}
              </h3>
              <p className="text-muted mb-0">
                {isHindi ? 'हमारी सेवाओं को बेहतर बनाने में हमारी सहायता करें' : 'Help us improve our services'}
              </p>
            </div>
          </Col>

          {/* Right Form */}
          <Col lg={6}>
            <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
              <h2 className="h4 fw-bold text-center mb-4">
                {isHindi ? 'अपनी प्रतिक्रिया भेजें' : 'Send Us Your Feedback'}
              </h2>

              <form onSubmit={handleSubmit} noValidate aria-label={isHindi ? 'प्रतिक्रिया फ़ॉर्म' : 'Feedback form'}>

                {/* Name + Email */}
                <Row className="g-3 mb-3">
                  <Col xs={12} md={6}>
                    <label className="form-label fw-semibold" htmlFor="fb-fullName">
                      {isHindi ? 'पूरा नाम' : 'Full Name'} <span className="text-danger">*</span>
                    </label>
                    <input
                      id="fb-fullName"
                      type="text"
                      name="fullName"
                      placeholder={isHindi ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                      className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                      value={values.fullName}
                      onChange={handleChange}
                      autoComplete="name"
                    />
                    <div className="invalid-feedback">{errors.fullName}</div>
                  </Col>

                  <Col xs={12} md={6}>
                    <label className="form-label fw-semibold" htmlFor="fb-email">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      id="fb-email"
                      type="email"
                      name="email"
                      placeholder={isHindi ? 'अपना ईमेल दर्ज करें' : 'Enter your email'}
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      value={values.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                    <div className="invalid-feedback">{errors.email}</div>
                  </Col>
                </Row>

                {/* Phone */}
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="fb-phone">
                    {isHindi ? 'फ़ोन नंबर' : 'Phone'} <span className="text-danger">*</span>
                  </label>
                  <input
                    id="fb-phone"
                    type="tel"
                    name="phone"
                    placeholder={isHindi ? 'अपना मोबाइल नंबर दर्ज करें' : 'Enter your phone number'}
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    value={values.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                  <div className="invalid-feedback">{errors.phone}</div>
                </div>

                {/* Feedback */}
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="fb-feedback">
                    {isHindi ? 'प्रतिक्रिया' : 'Feedback'} <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="fb-feedback"
                    name="feedback"
                    placeholder={isHindi ? 'अपनी प्रतिक्रिया दें...' : 'Enter your feedback...'}
                    rows={4}
                    className={`form-control ${errors.feedback ? 'is-invalid' : ''}`}
                    value={values.feedback}
                    onChange={handleChange}
                    style={{ resize: 'none' }}
                  />
                  <div className="invalid-feedback">{errors.feedback}</div>
                </div>

                {/* Captcha */}
                <div className="mb-4">
                  <label className="form-label fw-semibold" htmlFor="fb-captcha">
                    {isHindi ? 'सुरक्षा जांच:' : 'Security Check:'}{' '}
                    <strong>{num1} + {num2} = ?</strong>
                  </label>
                  <input
                    id="fb-captcha"
                    type="text"
                    name="captcha"
                    inputMode="numeric"
                    placeholder={isHindi ? 'उत्तर दर्ज करें' : 'Enter the answer'}
                    className={`form-control ${errors.captcha ? 'is-invalid' : ''}`}
                    value={values.captcha}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                  <div className="invalid-feedback">{errors.captcha}</div>
                </div>

                {/* Submit */}
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading
                      ? (isHindi ? 'जमा कर रहे हैं...' : 'Submitting...')
                      : (isHindi ? 'प्रतिक्रिया जमा करें' : 'Submit Feedback')}
                  </button>
                </div>
              </form>
            </div>
          </Col>
        </Row>
      </div>
    </PageLayout>
  );
};

export default FeedbackForm;
