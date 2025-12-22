import { Link, useLocation } from 'react-router-dom';
import { Container, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { FaHome } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

const DynamicBreadcrumb = () => {
  const location = useLocation();
  const { isHindi } = useLanguage();

  // Route name mappings for breadcrumbs
  const routeNames = {
    'home': { en: 'Home', hi: 'मुख्य पृष्ठ' },
    'about': { en: 'About Us', hi: 'हमारे बारे में' },
    'contact': { en: 'Contact Us', hi: 'हमसे संपर्क करें' },
    'schemes': { en: 'Schemes', hi: 'योजनाएं' },
    'universities': { en: 'Universities', hi: 'विश्वविद्यालय' },
    'colleges': { en: 'Colleges', hi: 'महाविद्यालय' },
    'downloads': { en: 'Downloads', hi: 'डाउनलोड' },
    'notice-board': { en: 'Notice Board', hi: 'सूचना पट्ट' },
    'rti': { en: 'Right to Information', hi: 'सूचना का अधिकार' },
    'gallery': { en: 'Photo Gallery', hi: 'चित्र प्रदर्शनी' },
    'privacy-policy': { en: 'Privacy Policy', hi: 'गोपनीयता नीति' },
    'terms-conditions': { en: 'Terms & Conditions', hi: 'नियम और शर्तें' },
    'disclaimer': { en: 'Disclaimer', hi: 'खंडन' },
    'sitemap': { en: 'Sitemap', hi: 'साइट मानचित्र' },
    'accessibility': { en: 'Accessibility', hi: 'अभिगम्यता विवरण' },
    'college-development': { en: 'College Development', hi: 'कॉलेजों का विकास' },
    'college-locations': { en: 'College Locations', hi: 'कॉलेजों के स्थान' },
    'academic-calendar': { en: 'Academic Calendar', hi: 'शैक्षणिक कैलेंडर' },
    'budget': { en: 'Department Budget', hi: 'विभागीय बजट' },
    'annual-report': { en: 'Annual Report', hi: 'वार्षिक प्रतिवेदन' },
    'rules-acts': { en: 'Important Rules & Acts', hi: 'महत्वपूर्ण नियम एवं अधिनियम' },
    'who-is-who': { en: 'Who is Who', hi: 'कौन क्या है' },
    'organization-chart': { en: 'Organization Chart', hi: 'संगठन चार्ट' },
    'services': { en: 'Services', hi: 'सेवाएं' },
    'compassionate-appointment': { en: 'Compassionate Appointment', hi: 'अनुकम्पा नियुक्ति' },
    'non-govt-colleges': { en: 'Non-Government Colleges', hi: 'अशासकीय महाविद्यालय' },
    'web-portal': { en: 'Web Application Portal', hi: 'वेब एप्लीकेशन पोर्टल' },
    'news': { en: 'News', hi: 'समाचार' },
    'tenders': { en: 'Tenders', hi: 'निविदाएं' },
    'recruitment': { en: 'Recruitment', hi: 'भर्ती' },
    'seniority': { en: 'Seniority', hi: 'वरिष्ठता' },
    'circulars': { en: 'Circulars', hi: 'परिपत्र' },
    'orders': { en: 'Orders', hi: 'आदेश' },
    'promotion': { en: 'Promotion', hi: 'पदोन्नति' },
    'phd-permission': { en: 'PhD Permission', hi: 'पी.एच.डी. अनुमति' },
    'transfer': { en: 'Transfer', hi: 'स्थानांतरण' },
    'miscellaneous': { en: 'Miscellaneous', hi: 'विविध' },
    'admin': { en: 'Admin', hi: 'प्रशासन' },
    'login': { en: 'Login', hi: 'लॉगिन' },
    'dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' }
  };

  // Generate breadcrumb items from current path
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);

    // Don't show breadcrumb on home page
    if (pathnames.length === 0) {
      return null;
    }

    const breadcrumbs = [
      {
        name: isHindi ? 'मुख्य पृष्ठ' : 'Home',
        path: '/',
        isHome: true
      }
    ];

    let currentPath = '';
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const routeKey = segment.toLowerCase().replace(/_/g, '-');
      const routeInfo = routeNames[routeKey];

      // Only add if we have a valid route name (avoid duplicates and unknown routes)
      if (routeInfo) {
        breadcrumbs.push({
          name: isHindi ? routeInfo.hi : routeInfo.en,
          path: currentPath,
          isLast: index === pathnames.length - 1
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (!breadcrumbs) {
    return null;
  }

  return (
    <div className="breadcrumb-wrapper">
      <Container>
        <Breadcrumb className="custom-breadcrumb mb-0">
          {breadcrumbs.map((crumb, index) => (
            <BreadcrumbItem key={index} active={crumb.isLast}>
              {crumb.isLast ? (
                <span>{crumb.name}</span>
              ) : (
                <Link to={crumb.path}>
                  {crumb.isHome && <FaHome className="me-1" />}
                  {crumb.name}
                </Link>
              )}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      </Container>
    </div>
  );
};

export default DynamicBreadcrumb;

