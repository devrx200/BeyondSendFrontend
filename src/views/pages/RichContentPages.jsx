import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Card, CardBody, CardHeader, CardFooter,
  Row, Col, Badge, Button, Container,
  Breadcrumb, BreadcrumbItem,
} from 'reactstrap';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaHome, FaFileAlt } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL;
const SITE_TITLE_SUFFIX = 'BeyondSend — Customer Communication Platform';

const formatDateTime = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  const day    = String(d.getDate()).padStart(2, '0');
  const month  = String(d.getMonth() + 1).padStart(2, '0');
  const year   = d.getFullYear();
  let   hours  = d.getHours();
  const mins   = String(d.getMinutes()).padStart(2, '0');
  const ampm   = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day}-${month}-${year} ${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
};

/* Safe strip — works in both browser and SSR (no DOM dependency) */
const stripHtml = (html = '') =>
  html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

const RichContentPages = ({ prefetchedData, preview = false }) => {
  const { isHindi } = useLanguage();

  if (!prefetchedData) return null;

  const title          = (isHindi ? prefetchedData.titleHi : prefetchedData.titleEn) || '';
  const shortDesc      = isHindi ? prefetchedData.shortDescriptionHi : prefetchedData.shortDescriptionEn;
  const descriptionHtml = isHindi ? prefetchedData.descriptionHi : prefetchedData.descriptionEn;
  const publishDate    = formatDateTime(prefetchedData.publishDate);
  const updateDate     = formatDateTime(prefetchedData.updatedAt);

  const rawText        = stripHtml(descriptionHtml || '');
  const metaDescription = shortDesc
    ? stripHtml(shortDesc).slice(0, 160)
    : rawText.slice(0, 160);

  const allKeywords    = [
    ...(prefetchedData.metaKeywords || []),
    ...(prefetchedData.tags || []),
  ].filter(Boolean);
  const keywordsString = allKeywords.join(', ');

  const baseUrl      = typeof window !== 'undefined' ? window.location.origin : '';
  const canonicalUrl = `${baseUrl}/${prefetchedData.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: metaDescription,
    keywords: keywordsString,
    datePublished: prefetchedData.publishDate,
    dateModified: prefetchedData.updatedAt,
    author: {
      '@type': 'Organization',
      name: isHindi ? 'बियॉन्डसेंड' : 'BeyondSend',
    },
    publisher: {
      '@type': 'Organization',
      name: isHindi ? 'बियॉन्डसेंड' : 'BeyondSend',
      logo: { '@type': 'ImageObject', url: `${baseUrl}/beyondsend-logo.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
  };

  return (
    <>
      <Helmet>
        <html lang={isHindi ? 'hi' : 'en'} />
        <title>{`${title} - ${SITE_TITLE_SUFFIX}`}</title>
        <meta name="description" content={metaDescription} />
        {keywordsString && <meta name="keywords" content={keywordsString} />}
        <meta name="robots" content={preview ? 'noindex, nofollow' : 'index, follow'} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={`${title} - ${SITE_TITLE_SUFFIX}`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={SITE_TITLE_SUFFIX} />
        <meta property="article:published_time" content={prefetchedData.publishDate} />
        <meta property="article:modified_time" content={prefetchedData.updatedAt} />
        <meta name="author" content={SITE_TITLE_SUFFIX} />
        {prefetchedData.tags?.map((tag, idx) => (
          <meta property="article:tag" content={tag} key={idx} />
        ))}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metaDescription} />

        {/* Language alternates */}
        <link rel="alternate" href={canonicalUrl} hrefLang="en" />
        <link rel="alternate" href={canonicalUrl} hrefLang="hi" />
        <link rel="alternate" href={canonicalUrl} hrefLang="x-default" />

        {/* JSON-LD structured data — must be inside Helmet to land in <head> */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      {/* Preview watermark overlay */}
      {preview && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0,
            pointerEvents: 'none', zIndex: 9999, overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: '40%', left: '-20%',
            width: '140%', transform: 'rotate(-30deg)',
            textAlign: 'center', opacity: 0.12,
            fontSize: 'clamp(48px, 10vw, 100px)', fontWeight: 'bold',
            color: '#fc7785', whiteSpace: 'nowrap',
            letterSpacing: '8px', textTransform: 'uppercase',
          }}>
            {isHindi ? 'प्रीव्यू मोड' : 'PREVIEW MODE'}
          </div>
          <button
            onClick={() => window.close()}
            style={{
              position: 'fixed', top: 15, right: 15,
              backgroundColor: 'rgba(220,53,69,0.95)', color: '#fff',
              border: 'none', cursor: 'pointer', pointerEvents: 'auto',
              padding: '6px 16px', borderRadius: 30,
              fontSize: 13, fontWeight: 'bold', zIndex: 10000,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            {isHindi ? 'प्रीव्यू बंद करें' : 'Close Preview'}
          </button>
        </div>
      )}

      <Container className="py-4">
        {/* Breadcrumb */}
        <Breadcrumb listClassName="bg-white px-3 py-2 rounded-3 shadow-sm border mb-4 align-items-center flex-wrap">
          <BreadcrumbItem>
            <Link to="/" className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
              <FaHome size={13} aria-hidden="true" />
              {isHindi ? 'होम' : 'Home'}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem active className="fw-semibold d-flex align-items-center gap-1 text-secondary" style={{ maxWidth: '100%' }}>
            <FaFileAlt size={13} className="flex-shrink-0" aria-hidden="true" />
            <span className="text-truncate">{title}</span>
          </BreadcrumbItem>
        </Breadcrumb>

        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <CardHeader className="detail-card-header">
            <h1 className="fw-semibold mb-3 text-white h4 d-flex align-items-center gap-2">
              <FaFileAlt size={20} aria-hidden="true" />
              {title}
            </h1>
            <hr className="border-white opacity-25 my-3" />
            <div className="d-flex flex-nowrap align-items-center gap-2 mb-3 pb-1 overflow-auto" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
              <Badge color="light" className="text-dark rounded-pill px-2 py-1 px-md-3 py-md-2 d-inline-flex align-items-center gap-1 flex-shrink-0" style={{ fontSize: 11 }}>
                📅 <span className="fw-semibold">{isHindi ? 'प्रकाशित:' : 'Published:'}</span> {publishDate}
              </Badge>
              <Badge color="light" className="text-dark rounded-pill px-2 py-1 px-md-3 py-md-2 d-inline-flex align-items-center gap-1 flex-shrink-0" style={{ fontSize: 11 }}>
                🔄 <span className="fw-semibold">{isHindi ? 'अपडेट:' : 'Updated:'}</span> {updateDate}
              </Badge>
              <Button tag={Link} to="/" color="dark" size="sm" className="fw-semibold d-inline-flex align-items-center gap-1 ms-auto flex-shrink-0" style={{ fontSize: 11, padding: '4px 10px', borderRadius: '4px' }}>
                ← {isHindi ? 'होम' : 'Back To Home'}
              </Button>
            </div>
          </CardHeader>

          {/* Body */}
          <CardBody className="p-4">
            {shortDesc && (
              <div className="bg-light border-start border-4 border-primary rounded-3 mb-4 p-3">
                <p className="mb-0 fst-italic text-secondary">{stripHtml(shortDesc)}</p>
              </div>
            )}
            {descriptionHtml && (
              <>
                <h2 className="h5 fw-semibold">
                  {isHindi ? 'विवरण' : 'Details'}
                </h2>
                <hr />
                <div
                  className="cms-content"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              </>
            )}
          </CardBody>

          <CardFooter className="rich-card-footer justify-content-center text-center">
            <div className="rich-card-footer-note">
              <span className="rich-footer-badge">BeyondSend</span>
              <span className="rich-footer-text">
                {isHindi
                  ? 'ग्राहक संचार एवं मार्केटिंग ऑटोमेशन प्लेटफॉर्म'
                  : 'Customer Communication & Marketing Automation Platform'}
              </span>
            </div>
          </CardFooter>
        </Card>
      </Container>
    </>
  );
};

export default RichContentPages;
