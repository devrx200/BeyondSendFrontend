import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Container, Row, Col,
  Card, CardBody,
  Spinner, Alert, Badge, Button,
  Input, InputGroup, InputGroupText,
  ListGroup, ListGroupItem,
  Pagination, PaginationItem, PaginationLink
} from 'reactstrap';
import {
  FaCalendarAlt, FaChevronRight,
  FaNewspaper, FaSearch, FaExclamationTriangle, FaInbox,
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import PageLayout from '../../components/PageLayout';

const API = import.meta.env.VITE_API_URL;
const SITE_TITLE_SUFFIX = 'Department of Higher Education, Government of Chhattisgarh India.';

const formatDateTime = (date, isHindi) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString(isHindi ? 'hi-IN' : 'en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const SchemeAnnouncementListView = () => {
  const location = useLocation();
  const { isHindi } = useLanguage();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const path = location.pathname;
  const isSchemes = path.startsWith('/schemes');

  const pageTitleText = isSchemes
    ? (isHindi ? 'योजनाएं' : 'Schemes')
    : (isHindi ? 'घोषणाएं' : 'Announcements');

  const detailRoutePrefix = isSchemes ? '/scheme' : '/announcement';

  const fetchList = async (page = 1) => {
    try {
      setLoading(true);
      setError(false);
      const res = await axios.get(`${API}/api/get-announcements`, {
        params: {
          isSchemes: isSchemes,
          page: page,
          limit: limit
        }
      });
      setList(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalItems(res.data?.pagination?.total || 0);
      setCurrentPage(page);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
    setSearch('');
  }, [path]);

  const filteredList = list.filter((item) => {
    const q = search.toLowerCase();
    return (
      (item.titleEn || '').toLowerCase().includes(q) ||
      (item.titleHi || '').includes(q)
    );
  });

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchList(page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <PaginationItem disabled={currentPage === 1}>
            <PaginationLink first onClick={() => handlePageChange(1)} />
          </PaginationItem>
          <PaginationItem disabled={currentPage === 1}>
            <PaginationLink previous onClick={() => handlePageChange(currentPage - 1)} />
          </PaginationItem>

          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem disabled>
                  <PaginationLink>...</PaginationLink>
                </PaginationItem>
              )}
            </>
          )}

          {pages.map(page => (
            <PaginationItem key={page} active={page === currentPage}>
              <PaginationLink onClick={() => handlePageChange(page)}>
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem disabled>
                  <PaginationLink>...</PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem disabled={currentPage === totalPages}>
            <PaginationLink next onClick={() => handlePageChange(currentPage + 1)} />
          </PaginationItem>
          <PaginationItem disabled={currentPage === totalPages}>
            <PaginationLink last onClick={() => handlePageChange(totalPages)} />
          </PaginationItem>
        </Pagination>
      </div>
    );
  };

  if (loading && list.length === 0) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? 'hi' : 'en'} />
          <title>{isHindi ? 'लोड हो रहा है...' : 'Loading...'} - {SITE_TITLE_SUFFIX}</title>
        </Helmet>
        <Container className="py-5 text-center">
          <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted fw-semibold">
            {isHindi ? 'लोड हो रहा है...' : 'Loading, please wait…'}
          </p>
        </Container>
      </>
    );
  }

  if (error && list.length === 0) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? 'hi' : 'en'} />
          <title>{isHindi ? 'त्रुटि' : 'Error'} - {SITE_TITLE_SUFFIX}</title>
        </Helmet>
        <Container className="py-5">
          <Alert color="danger" className="d-flex align-items-center gap-2 shadow-sm rounded-3">
            <FaExclamationTriangle size={20} />
            <span className="fw-semibold">
              {isHindi ? 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।' : 'Something went wrong. Please try again.'}
            </span>
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <html lang={isHindi ? 'hi' : 'en'} />
        <title>{pageTitleText} - {SITE_TITLE_SUFFIX}</title>
        <meta name="description" content={isHindi ? `${pageTitleText} की सूची` : `${pageTitleText} list`} />
      </Helmet>

      <PageLayout title={pageTitleText} titleHi={pageTitleText} showBreadcrumb>
        <div className="notice-list-container">
          <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)' }}>
            <CardBody className="py-4 px-4">
              <Row className="align-items-center g-2">
                <Col>
                  <h2 className="mb-1 fw-bold h5 d-flex align-items-center gap-2 text-white">
                    <FaNewspaper />
                    {isHindi ? `सभी ${pageTitleText}` : `All ${pageTitleText}`}
                  </h2>
                  <p className="mb-0 small opacity-75 text-white">
                    {isHindi ? 'नवीनतम जानकारी नीचे दी गई है' : 'Browse the latest items below'}
                  </p>
                </Col>
                <Col xs="auto">
                  <Badge pill color="light" className="text-primary fw-bold fs-6 px-3 py-2">
                    {totalItems}&nbsp;{isHindi ? 'आइटम' : 'Items'}
                  </Badge>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {totalItems > 0 && (
            <InputGroup className="mb-4 shadow-sm rounded-3 overflow-hidden">
              <InputGroupText className="bg-white border-end-0 text-muted">
                <FaSearch size={14} />
              </InputGroupText>
              <Input
                placeholder={isHindi ? 'खोजें...' : 'Search...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-start-0"
                bsSize="lg"
              />
            </InputGroup>
          )}

          {filteredList.length > 0 ? (
            <Card className="border shadow-sm rounded-4 overflow-hidden">
              <ListGroup flush>
                {filteredList.map((item, idx) => (
                  <ListGroupItem
                    key={item._id}
                    action
                    tag={Link}
                    to={`${detailRoutePrefix}/${item.slug}`}
                    className="text-decoration-none px-4 py-3 border-bottom d-flex align-items-center gap-3"
                  >
                    <Badge
                      color="primary"
                      className="rounded-3 fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 32, height: 32, fontSize: 12 }}
                    >
                      {(currentPage - 1) * limit + idx + 1}
                    </Badge>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-semibold text-dark lh-sm mb-1 text-truncate" style={{ fontSize: 14.5 }}>
                        {isHindi ? item.titleHi : item.titleEn}
                      </div>
                      <div className="text-muted d-flex align-items-center gap-1 small">
                        <FaCalendarAlt size={11} />
                        {formatDateTime(item.createdAt, isHindi)}
                      </div>
                    </div>
                    <FaChevronRight className="text-primary opacity-50 flex-shrink-0" size={13} />
                  </ListGroupItem>
                ))}
              </ListGroup>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm rounded-4">
              <CardBody className="text-center py-5">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light"
                  style={{ width: 72, height: 72 }}
                >
                  <FaInbox size={30} className="text-primary opacity-50" />
                </div>
                <h6 className="text-muted fw-semibold mb-1">
                  {search
                    ? (isHindi ? 'खोज परिणाम नहीं मिले' : 'No results found')
                    : (isHindi ? 'कोई डेटा नहीं मिला' : 'No items available')}
                </h6>
              </CardBody>
            </Card>
          )}

          {renderPagination()}
        </div>
      </PageLayout>
    </>
  );
};

export default SchemeAnnouncementListView;
