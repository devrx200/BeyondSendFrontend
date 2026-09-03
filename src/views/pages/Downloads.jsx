import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Row, Col, Card, CardBody,
  Nav, NavItem, NavLink,
  TabContent, TabPane,
  Table, Badge, Button, Spinner,
} from 'reactstrap';
import {
  FaDownload, FaFilePdf, FaFileWord,
  FaFileExcel, FaCalendar,
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL;

const getFileIcon = (type = '') => {
  switch (type.toUpperCase()) {
    case 'PDF':  return <FaFilePdf  className="text-danger"  aria-hidden="true" />;
    case 'DOC':
    case 'DOCX': return <FaFileWord className="text-primary" aria-hidden="true" />;
    case 'XLS':
    case 'XLSX': return <FaFileExcel className="text-success" aria-hidden="true" />;
    default:     return <FaDownload aria-hidden="true" />;
  }
};

const Downloads = () => {
  const { isHindi } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [activeTab,  setActiveTab]  = useState('');
  const [downloads,  setDownloads]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [catLoading, setCatLoading] = useState(true);

  /* ── Fetch categories ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/get-categories`);
        const cats = res.data?.data || [];
        setCategories(cats);
        if (cats.length > 0) handleTabChange(cats[0]._id);
      } catch {
        Swal.fire('Error', 'Failed to load categories', 'error');
      } finally {
        setCatLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Fetch downloads by category ── */
  const fetchDownloadsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      setDownloads([]);
      const res = await axios.get(`${API_URL}/api/get-downloads-by-categary/${categoryId}`);
      setDownloads(res.data || []);
    } catch {
      Swal.fire('Error', 'Failed to load downloads', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (categoryId) => {
    setActiveTab(categoryId);
    fetchDownloadsByCategory(categoryId);
  };

  return (
    <PageLayout
      title="Downloads"
      titleHi="डाउनलोड"
      description="Download official forms, notifications, circulars, and policy documents from the Department of Higher Education, Chhattisgarh."
      descriptionHi="उच्च शिक्षा विभाग, छत्तीसगढ़ शासन के आधिकारिक प्रपत्र, अधिसूचनाएं, परिपत्र एवं नीतियां डाउनलोड करें।"
      showBreadcrumb
    >
      {catLoading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
        </div>
      ) : (
        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm rounded-4">
              <CardBody className="p-3 p-md-4 bg-light rounded-4">

                {/* Header */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="downloads-header-icon" aria-hidden="true">
                    <FaDownload />
                  </div>
                  <div>
                    <h2 className="h5 fw-semibold mb-1">
                      {isHindi ? 'डाउनलोड केंद्र' : 'Download Center'}
                    </h2>
                    <small className="text-muted">
                      {isHindi
                        ? 'प्रपत्र, अधिसूचना, रिपोर्ट एवं दिशानिर्देश'
                        : 'Forms, Notifications, Reports & Guidelines'}
                    </small>
                  </div>
                </div>

                {/* Category Tabs */}
                <Nav pills className="mb-4 gap-2 flex-wrap" role="tablist" aria-label={isHindi ? 'श्रेणियाँ' : 'Categories'}>
                  {categories.map((cat) => (
                    <NavItem key={cat._id}>
                      <NavLink
                        active={activeTab === cat._id}
                        onClick={() => handleTabChange(cat._id)}
                        style={{ cursor: 'pointer' }}
                        role="tab"
                        aria-selected={activeTab === cat._id}
                      >
                        {isHindi ? cat.categoryNameHi : cat.categoryNameEn}
                      </NavLink>
                    </NavItem>
                  ))}
                </Nav>

                {/* Downloads Table */}
                <TabContent activeTab={activeTab}>
                  <TabPane tabId={activeTab}>
                    <div className="downloads-table-wrap">
                      <Table responsive striped hover className="align-middle mb-0">
                        <thead className="table-primary">
                          <tr>
                            <th scope="col" style={{ width: 44 }}>#</th>
                            <th scope="col">{isHindi ? 'शीर्षक' : 'Title'}</th>
                            <th scope="col">{isHindi ? 'प्रकार' : 'Type'}</th>
                            <th scope="col">{isHindi ? 'तिथि' : 'Date'}</th>
                            <th scope="col">{isHindi ? 'आकार' : 'Size'}</th>
                            <th scope="col" className="text-center">{isHindi ? 'डाउनलोड' : 'Download'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={6} className="text-center py-4">
                                <Spinner size="sm" className="me-2" />
                                {isHindi ? 'लोड हो रहा है...' : 'Loading...'}
                              </td>
                            </tr>
                          ) : downloads.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center text-muted py-4">
                                {isHindi
                                  ? 'इस श्रेणी में कोई फ़ाइल उपलब्ध नहीं है'
                                  : 'No downloads available in this category'}
                              </td>
                            </tr>
                          ) : (
                            downloads.map((item, index) => (
                              <tr key={item._id}>
                                <td>{index + 1}</td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <Badge pill color="light" className="border flex-shrink-0">
                                      {getFileIcon(item.fileType)}
                                    </Badge>
                                    <span className="fw-semibold" style={{ wordBreak: 'break-word' }}>
                                      {isHindi ? item.titleHi : item.titleEn}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <Badge color="secondary">{item.fileType}</Badge>
                                </td>
                                <td className="text-nowrap">
                                  <FaCalendar className="me-1 text-muted" aria-hidden="true" />
                                  {new Date(item.createdAt).toLocaleDateString(
                                    isHindi ? 'hi-IN' : 'en-IN'
                                  )}
                                </td>
                                <td>
                                  <Badge color="secondary">{item.fileSize}</Badge>
                                </td>
                                <td className="text-center">
                                  <Button
                                    color="primary" size="sm"
                                    tag="a"
                                    href={`${API_URL}${item.filePath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${isHindi ? 'डाउनलोड' : 'Download'} ${isHindi ? item.titleHi : item.titleEn}`}
                                  >
                                    <FaDownload className="me-1" aria-hidden="true" />
                                    {isHindi ? 'डाउनलोड' : 'Download'}
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </TabPane>
                </TabContent>

              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </PageLayout>
  );
};

export default Downloads;
