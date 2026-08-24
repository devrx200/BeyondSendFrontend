import { Link, useLocation } from "react-router-dom";
import { Container, Breadcrumb, BreadcrumbItem } from "reactstrap";
import { FaHome, FaChevronRight } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";

const DynamicBreadcrumb = () => {
  const location = useLocation();
  const { isHindi } = useLanguage();

  const pathnames = location.pathname.split("/").filter(Boolean);

  // Hide breadcrumb on home page
  if (pathnames.length === 0) return null;

  // Convert slug to readable text
  const formatName = (text) => {
    return text
      .replace(/-/g, " ")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Container className="mt-3">

      <Breadcrumb
        aria-label={isHindi ? "ब्रेडक्रम्ब नेविगेशन" : "Breadcrumb navigation"}
        listClassName="bg-white px-3 py-2 rounded-3 shadow-sm border mb-4 align-items-center flex-wrap"
      >

        {/* Home */}
        <BreadcrumbItem>
          <Link
            to="/"
            className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium"
          >
            <FaHome size={13} aria-hidden="true" />
            {isHindi ? "होम" : "Home"}
          </Link>
        </BreadcrumbItem>

        {/* Dynamic Routes */}
        {pathnames.map((segment, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          return (
            <BreadcrumbItem
              key={routeTo}
              active={isLast}
              className={`d-flex align-items-center gap-1 ${isLast ? "fw-semibold text-secondary" : ""
                }`}
              style={isLast ? { maxWidth: '60vw', overflow: 'hidden' } : undefined}
            >
              {isLast ? (
                <span className="text-truncate d-inline-block" style={{ maxWidth: '100%' }}>{formatName(segment)}</span>
              ) : (
                <Link
                  to={routeTo}
                  className="text-decoration-none text-primary fw-medium"
                >
                  {formatName(segment)}
                </Link>
              )}
            </BreadcrumbItem>
          );
        })}

      </Breadcrumb>

    </Container>
  );
};

export default DynamicBreadcrumb;
