import { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import Swal from 'sweetalert2';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import apiClient from '../../services/api.service';
import {
  FaUser, FaEnvelope, FaPhone, FaCommentDots,
  FaShieldAlt, FaCheckCircle, FaBullhorn, FaSms,
  FaHeadset, FaChartLine,
} from 'react-icons/fa';

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

const FEATURES = [
  { icon: <FaBullhorn />, text: 'SMS & Email Broadcasting' },
  { icon: <FaHeadset />, text: 'BPO Call Support' },
  { icon: <FaChartLine />, text: 'Campaign Analytics' },
  { icon: <FaSms />, text: 'Multi-Channel Marketing' },
];

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
      await apiClient.post(
        '/feedback/create',
        {
          name:    values.fullName.trim(),
          email:   values.email.trim().toLowerCase(),
          phone:   values.phone.trim(),
          message: values.feedback.trim(),
        }
      );
      Swal.fire({
        icon: 'success',
        title: isHindi ? 'धन्यवाद!' : 'Thank You!',
        text: isHindi
          ? 'आपकी प्रतिक्रिया सफलतापूर्वक जमा की गई।'
          : 'Your feedback has been submitted successfully.',
        confirmButtonColor: '#4f6ef7',
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

  const fieldStyle = (hasError) => ({
    fontFamily: 'var(--pub-font)',
    fontSize: '0.875rem',
    border: `1.5px solid ${hasError ? '#fe5d70' : '#e2e8f0'}`,
    borderRadius: '10px',
    padding: '10px 14px',
    background: 'var(--pub-surface)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    color: 'var(--pub-default)',
    width: '100%',
    outline: 'none',
  });

  return (
    <PageLayout
      title="Feedback"
      titleHi="प्रतिक्रिया"
      description="Submit your feedback, suggestions, or queries to the BeyondSend team."
      descriptionHi="बियॉन्डसेंड टीम को अपने सुझाव, प्रतिक्रिया अथवा शिकायतें भेजें।"
      showBreadcrumb
    >
      <div className="feedback-page-wrap">
        <Row className="align-items-stretch justify-content-center g-4">

          {/* ── Left Illustration Panel ── */}
          <Col lg={5} className="d-none d-lg-flex">
            <div className="feedback-illustration w-100">
              {/* Floating icons */}
              <div className="fb-float-icon"><FaBullhorn /></div>
              <div className="fb-float-icon"><FaSms /></div>
              <div className="fb-float-icon"><FaHeadset /></div>
              <div className="fb-float-icon"><FaChartLine /></div>

              {/* Centre content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div className="d-flex justify-content-center mb-4">
                  <img
                    src="/beyondsend-logo.svg"
                    alt="BeyondSend"
                    style={{ height: 56, width: 'auto', background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '8px 16px' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>

                <h3 className="fb-illustration-title">
                  {isHindi ? 'हम आपकी प्रतिक्रिया को महत्व देते हैं' : 'We Value Your Feedback'}
                </h3>
                <p className="fb-illustration-desc">
                  {isHindi
                    ? 'आपके सुझाव हमें बेहतर बनाने में मदद करते हैं'
                    : 'Your insights help us build a better platform for everyone'}
                </p>

                {/* Feature list */}
                <ul className="fb-feature-list">
                  {FEATURES.map((f, i) => (
                    <li key={i}>
                      {f.icon}
                      {f.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Col>

          {/* ── Right Form Card ── */}
          <Col lg={7}>
            <div className="feedback-form-card h-100">
              <h2 className="feedback-form-title">
                {isHindi ? 'अपनी प्रतिक्रिया भेजें' : 'Send Us Your Feedback'}
              </h2>
              <p className="feedback-form-subtitle">
                {isHindi ? 'सभी फ़ील्ड भरना आवश्यक है' : 'All fields are required to submit'}
              </p>

              <form onSubmit={handleSubmit} noValidate aria-label={isHindi ? 'प्रतिक्रिया फ़ॉर्म' : 'Feedback form'}>

                {/* Name + Email */}
                <Row className="g-3 mb-3">
                  <Col xs={12} md={6}>
                    <div className="fb-form-group">
                      <label className="fb-form-label" htmlFor="fb-fullName">
                        <FaUser size={12} />
                        {isHindi ? 'पूरा नाम' : 'Full Name'} <span className="text-danger">*</span>
                      </label>
                      <input
                        id="fb-fullName"
                        type="text"
                        name="fullName"
                        placeholder={isHindi ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                        style={fieldStyle(!!errors.fullName)}
                        className={errors.fullName ? 'is-invalid' : ''}
                        value={values.fullName}
                        onChange={handleChange}
                        autoComplete="name"
                      />
                      {errors.fullName && <div className="invalid-feedback d-block" style={{ fontSize: '0.8rem' }}>{errors.fullName}</div>}
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="fb-form-group">
                      <label className="fb-form-label" htmlFor="fb-email">
                        <FaEnvelope size={12} />
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        id="fb-email"
                        type="email"
                        name="email"
                        placeholder={isHindi ? 'अपना ईमेल दर्ज करें' : 'Enter your email'}
                        style={fieldStyle(!!errors.email)}
                        className={errors.email ? 'is-invalid' : ''}
                        value={values.email}
                        onChange={handleChange}
                        autoComplete="email"
                      />
                      {errors.email && <div className="invalid-feedback d-block" style={{ fontSize: '0.8rem' }}>{errors.email}</div>}
                    </div>
                  </Col>
                </Row>

                {/* Phone */}
                <div className="fb-form-group">
                  <label className="fb-form-label" htmlFor="fb-phone">
                    <FaPhone size={12} />
                    {isHindi ? 'फ़ोन नंबर' : 'Phone'} <span className="text-danger">*</span>
                  </label>
                  <input
                    id="fb-phone"
                    type="tel"
                    name="phone"
                    placeholder={isHindi ? 'अपना मोबाइल नंबर दर्ज करें' : 'Enter your phone number'}
                    style={fieldStyle(!!errors.phone)}
                    className={errors.phone ? 'is-invalid' : ''}
                    value={values.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                  {errors.phone && <div className="invalid-feedback d-block" style={{ fontSize: '0.8rem' }}>{errors.phone}</div>}
                </div>

                {/* Feedback */}
                <div className="fb-form-group">
                  <label className="fb-form-label" htmlFor="fb-feedback">
                    <FaCommentDots size={12} />
                    {isHindi ? 'प्रतिक्रिया' : 'Feedback'} <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="fb-feedback"
                    name="feedback"
                    placeholder={isHindi ? 'अपनी प्रतिक्रिया दें...' : 'Enter your feedback...'}
                    rows={4}
                    style={{ ...fieldStyle(!!errors.feedback), resize: 'none' }}
                    className={errors.feedback ? 'is-invalid' : ''}
                    value={values.feedback}
                    onChange={handleChange}
                  />
                  {errors.feedback && <div className="invalid-feedback d-block" style={{ fontSize: '0.8rem' }}>{errors.feedback}</div>}
                </div>

                {/* Captcha */}
                <div className="fb-form-group mb-4">
                  <label className="fb-form-label" htmlFor="fb-captcha">
                    <FaShieldAlt size={12} />
                    {isHindi ? 'सुरक्षा जांच:' : 'Security Check:'}
                  </label>
                  <div className="d-flex align-items-center gap-3 flex-wrap mb-2">
                    <div className="fb-captcha-box">
                      {num1} + {num2} = ?
                    </div>
                    <span className="small text-muted">{isHindi ? 'उपरोक्त का उत्तर दर्ज करें' : 'Enter the answer above'}</span>
                  </div>
                  <input
                    id="fb-captcha"
                    type="text"
                    name="captcha"
                    inputMode="numeric"
                    placeholder={isHindi ? 'उत्तर दर्ज करें' : 'Enter the answer'}
                    style={fieldStyle(!!errors.captcha)}
                    className={errors.captcha ? 'is-invalid' : ''}
                    value={values.captcha}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                  {errors.captcha && <div className="invalid-feedback d-block" style={{ fontSize: '0.8rem' }}>{errors.captcha}</div>}
                </div>

                {/* Submit */}
                <button type="submit" className="fb-submit-btn" disabled={loading}>
                  {loading
                    ? (isHindi ? 'जमा कर रहे हैं...' : 'Submitting...')
                    : (isHindi ? 'प्रतिक्रिया जमा करें' : 'Submit Feedback')}
                </button>

                {/* Trust note */}
                <div className="d-flex align-items-center justify-content-center gap-2 mt-3" style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  <FaCheckCircle style={{ color: '#10b981' }} />
                  {isHindi ? 'आपका डेटा सुरक्षित है' : 'Your data is secure & private'}
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
