import React from 'react';
import { Card, CardBody, Row, Col } from 'reactstrap';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { FaTextHeight, FaKeyboard, FaUniversalAccess } from 'react-icons/fa';

const Accessibility = () => {
  const { isHindi } = useLanguage();
  const { increaseFontSize, decreaseFontSize, resetFontSize, fontSize } = useAccessibility();

  const breadcrumb = [
    { label: 'Home', labelHi: 'मुख्य पृष्ठ', link: '/' },
    { label: 'Accessibility', labelHi: 'अभिगम्यता' }
  ];

  return (
    <PageLayout 
      title="Accessibility Statement" 
      titleHi="अभिगम्यता विवरण"
      breadcrumb={breadcrumb}
    >
      {isHindi ? (
        <>
          <h2>अभिगम्यता विवरण</h2>
          <p>
            उच्च शिक्षा विभाग सभी उपयोगकर्ताओं के लिए अपनी वेबसाइट को सुलभ बनाने के लिए प्रतिबद्ध है।
          </p>

          <Row className="mt-4">
            <Col md={4} className="mb-3">
              <Card className="h-100">
                <CardBody className="text-center">
                  <FaTextHeight size={40} color="#D2691E" className="mb-3" />
                  <h4>फ़ॉन्ट आकार नियंत्रण</h4>
                  <p>पढ़ने में आसानी के लिए फ़ॉन्ट आकार बदलें</p>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline-primary" onClick={decreaseFontSize}>A</button>
                    <button className="btn btn-sm btn-outline-primary" onClick={resetFontSize}>A</button>
                    <button className="btn btn-sm btn-outline-primary" onClick={increaseFontSize}>A+</button>
                  </div>
                  <p className="mt-2 small">वर्तमान: {fontSize}</p>
                </CardBody>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card className="h-100">
                <CardBody className="text-center">
                  <FaKeyboard size={40} color="#D2691E" className="mb-3" />
                  <h4>कीबोर्ड नेविगेशन</h4>
                  <p>Tab कुंजी का उपयोग करके नेविगेट करें</p>
                  <ul className="text-start small">
                    <li>Tab - अगले लिंक पर जाएं</li>
                    <li>Shift+Tab - पिछले लिंक पर जाएं</li>
                    <li>Enter - लिंक खोलें</li>
                  </ul>
                </CardBody>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card className="h-100">
                <CardBody className="text-center">
                  <FaUniversalAccess size={40} color="#D2691E" className="mb-3" />
                  <h4>स्क्रीन रीडर</h4>
                  <p>स्क्रीन रीडर के साथ संगत</p>
                  <ul className="text-start small">
                    <li>JAWS</li>
                    <li>NVDA</li>
                    <li>VoiceOver</li>
                  </ul>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <h3 className="mt-4">अभिगम्यता सुविधाएं</h3>
          <ul>
            <li>उच्च कंट्रास्ट रंग योजना</li>
            <li>समायोज्य फ़ॉन्ट आकार</li>
            <li>कीबोर्ड नेविगेशन समर्थन</li>
            <li>स्क्रीन रीडर अनुकूलता</li>
            <li>वैकल्पिक पाठ के साथ चित्र</li>
            <li>स्पष्ट और सरल भाषा</li>
          </ul>

          <h3>प्रतिक्रिया</h3>
          <p>
            यदि आपको इस वेबसाइट पर कोई अभिगम्यता समस्या मिलती है, तो कृपया हमें बताएं:
            <br />
            ईमेल: wim.higheredu-cg@gov.in
          </p>
        </>
      ) : (
        <>
          <h2>Accessibility Statement</h2>
          <p>
            The Higher Education Department is committed to making its website accessible to all users.
          </p>

          <Row className="mt-4">
            <Col md={4} className="mb-3">
              <Card className="h-100">
                <CardBody className="text-center">
                  <FaTextHeight size={40} color="#D2691E" className="mb-3" />
                  <h4>Font Size Control</h4>
                  <p>Change font size for easier reading</p>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline-primary" onClick={decreaseFontSize}>A</button>
                    <button className="btn btn-sm btn-outline-primary" onClick={resetFontSize}>A</button>
                    <button className="btn btn-sm btn-outline-primary" onClick={increaseFontSize}>A+</button>
                  </div>
                  <p className="mt-2 small">Current: {fontSize}</p>
                </CardBody>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card className="h-100">
                <CardBody className="text-center">
                  <FaKeyboard size={40} color="#D2691E" className="mb-3" />
                  <h4>Keyboard Navigation</h4>
                  <p>Navigate using Tab key</p>
                  <ul className="text-start small">
                    <li>Tab - Move to next link</li>
                    <li>Shift+Tab - Move to previous link</li>
                    <li>Enter - Open link</li>
                  </ul>
                </CardBody>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card className="h-100">
                <CardBody className="text-center">
                  <FaUniversalAccess size={40} color="#D2691E" className="mb-3" />
                  <h4>Screen Reader</h4>
                  <p>Compatible with screen readers</p>
                  <ul className="text-start small">
                    <li>JAWS</li>
                    <li>NVDA</li>
                    <li>VoiceOver</li>
                  </ul>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <h3 className="mt-4">Accessibility Features</h3>
          <ul>
            <li>High contrast color scheme</li>
            <li>Adjustable font sizes</li>
            <li>Keyboard navigation support</li>
            <li>Screen reader compatibility</li>
            <li>Images with alternative text</li>
            <li>Clear and simple language</li>
          </ul>

          <h3>Feedback</h3>
          <p>
            If you encounter any accessibility issues on this website, please let us know:
            <br />
            Email: wim.higheredu-cg@gov.in
          </p>
        </>
      )}
    </PageLayout>
  );
};

export default Accessibility;

