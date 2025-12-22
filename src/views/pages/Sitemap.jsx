import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, CardBody } from 'reactstrap';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const Sitemap = () => {
  const { isHindi } = useLanguage();

  const breadcrumb = [
    { label: 'Home', labelHi: 'मुख्य पृष्ठ', link: '/' },
    { label: 'Sitemap', labelHi: 'साइट मानचित्र' }
  ];

  const sitemapData = [
    {
      title: 'Main Pages',
      titleHi: 'मुख्य पृष्ठ',
      links: [
        { label: 'Home', labelHi: 'मुख्य पृष्ठ', path: '/' },
        { label: 'About Us', labelHi: 'हमारे बारे में', path: '/about' },
        { label: 'Contact Us', labelHi: 'संपर्क करें', path: '/contact' }
      ]
    },
    {
      title: 'Information',
      titleHi: 'जानकारी',
      links: [
        { label: 'Universities', labelHi: 'विश्वविद्यालय', path: '/universities' },
        { label: 'Colleges', labelHi: 'महाविद्यालय', path: '/colleges' },
        { label: 'Schemes', labelHi: 'योजनाएं', path: '/schemes' },
        { label: 'Admissions', labelHi: 'प्रवेश', path: '/admissions' }
      ]
    },
    {
      title: 'Resources',
      titleHi: 'संसाधन',
      links: [
        { label: 'Downloads', labelHi: 'डाउनलोड', path: '/downloads' },
        { label: 'Tenders', labelHi: 'निविदाएं', path: '/tenders' },
        { label: 'Careers', labelHi: 'करियर', path: '/careers' },
        { label: 'RTI', labelHi: 'आरटीआई', path: '/rti' }
      ]
    },
    {
      title: 'Policies',
      titleHi: 'नीतियां',
      links: [
        { label: 'Privacy Policy', labelHi: 'गोपनीयता नीति', path: '/privacy-policy' },
        { label: 'Terms & Conditions', labelHi: 'नियम और शर्तें', path: '/terms-conditions' },
        { label: 'Disclaimer', labelHi: 'खंडन', path: '/disclaimer' },
        { label: 'Copyright Policy', labelHi: 'सर्वाधिकार नीति', path: '/copyright-policy' },
        { label: 'Hyperlink Policy', labelHi: 'हाइपरलिंक नीति', path: '/hyperlink-policy' }
      ]
    },
    {
      title: 'Help & Support',
      titleHi: 'सहायता और समर्थन',
      links: [
        { label: 'Accessibility', labelHi: 'अभिगम्यता', path: '/accessibility' },
        { label: 'Sitemap', labelHi: 'साइट मानचित्र', path: '/sitemap' },
        { label: 'Help', labelHi: 'मदद', path: '/help' },
        { label: 'Feedback', labelHi: 'प्रतिक्रिया', path: '/feedback' }
      ]
    }
  ];

  return (
    <PageLayout 
      title="Sitemap" 
      titleHi="साइट मानचित्र"
      breadcrumb={breadcrumb}
    >
      <div className="sitemap-page">
        <p className="sitemap-intro">
          {isHindi 
            ? 'इस वेबसाइट पर उपलब्ध सभी पृष्ठों की सूची नीचे दी गई है।'
            : 'Below is a list of all pages available on this website.'}
        </p>

        <Row>
          {sitemapData.map((section, index) => (
            <Col md={6} lg={4} key={index} className="mb-4">
              <Card className="sitemap-card h-100">
                <CardBody>
                  <h3 className="sitemap-section-title">
                    {isHindi ? section.titleHi : section.title}
                  </h3>
                  <ul className="sitemap-links">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link to={link.path}>
                          {isHindi ? link.labelHi : link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </PageLayout>
  );
};

export default Sitemap;

