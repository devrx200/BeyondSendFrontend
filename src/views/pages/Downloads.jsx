import { useState, useEffect } from 'react';
import {
  Row, Col,
  Nav, NavItem, NavLink,
  TabContent, TabPane,
  Badge, Spinner,
} from 'reactstrap';
import {
  FaDownload, FaFilePdf, FaFileWord,
  FaFileExcel, FaCalendarAlt, FaFolderOpen,
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import { PageLayout, PageLoader } from "@/components";
import { useLanguage } from '../../contexts/LanguageContext';
import apiClient, { BASE_HOST } from "@apiService";

const getFileIcon = (type = '') => {
  switch (type.toUpperCase()) {
    case 'PDF':  return <FaFilePdf  style={{ color: '#fe5d70' }}  aria-hidden="true" />;
    case 'DOC':
    case 'DOCX': return <FaFileWord style={{ color: '#4f6ef7' }} aria-hidden="true" />;
    case 'XLS':
    case 'XLSX': return <FaFileExcel style={{ color: '#20c997' }} aria-hidden="true" />;
    default:     return <FaDownload  aria-hidden="true" />;
  }
};

const FILE_TYPE_COLORS = {
  PDF:  { bg: 'rgba(254,93,112,0.1)',   color: '#fe5d70',  label: 'PDF' },
  DOC:  { bg: 'rgba(79,110,247,0.1)',   color: '#4f6ef7',  label: 'DOC' },
  DOCX: { bg: 'rgba(79,110,247,0.1)',   color: '#4f6ef7',  label: 'DOCX' },
  XLS:  { bg: 'rgba(32,201,151,0.1)',   color: '#20c997',  label: 'XLS' },
  XLSX: { bg: 'rgba(32,201,151,0.1)',   color: '#20c997',  label: 'XLSX' },
};

const Downloads = () => {
  const { isHindi } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [activeTab,  setActiveTab]  = useState('');
  const [downloads,  setDownloads]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/category/list');
        const cats = res?.data || res || [];
        setCategories(Array.isArray(cats) ? cats : []);
        if (cats.length > 0) handleTabChange(cats[0]._id);
      } catch {
        Swal.fire('Error', 'Failed to load categories', 'error');
      } finally {
        setCatLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDownloadsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      setDownloads([]);
      const res = await apiClient.get(`/downloads/category/${categoryId}`);
      const list = res?.data || res || [];
      setDownloads(Array.isArray(list) ? list : []);
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
      description="Download product guides, templates, campaign resources and policy documents from BeyondSend."
      descriptionHi="बियॉन्डसेंड से उत्पाद मार्गदर्शिकाएं, टेम्पलेट, कैंपेन संसाधन एवं नीति दस्तावेज डाउनलोड करें।"
      showBreadcrumb
    >
      {catLoading ? (
        <PageLoader inline={true} />
      ) : (
        <Row>
          <Col lg={12}>
            <div className="pub-card">
              {/* Card Header */}
              <div className="pub-card-header">
                <div className="pub-dot-grid" aria-hidden="true" />
                <div className="pub-card-header-title" style={{ position: 'relative', zIndex: 1 }}>
                  <span className="downloads-header-icon" style={{ animation: 'pubFloat 4s ease-in-out infinite' }}>
                    <FaDownload />
                  </span>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.2px' }}>
                      {isHindi ? 'डाउनलोड केंद्र' : 'Download Center'}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', fontWeight: 400, marginTop: 2 }}>
                      {isHindi ? 'प्रपत्र, अधिसूचना, रिपोर्ट एवं दिशानिर्देश' : 'Forms, Notifications, Reports & Guidelines'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-3 p-md-4" style={{ background: 'var(--pub-bg)' }}>
                {/* Category Tabs */}
                <Nav className="downloads-nav-pills mb-4 gap-2 flex-wrap" role="tablist" aria-label={isHindi ? 'श्रेणियाँ' : 'Categories'}>
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
                      <table className="table table-hover align-middle mb-0">
                        <thead>
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
                                <PageLoader inline={true} />
                              </td>
                            </tr>
                          ) : downloads.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-5">
                                <div className="d-flex flex-column align-items-center gap-2">
                                  <FaFolderOpen size={36} style={{ color: 'var(--pub-primary)', opacity: 0.4 }} aria-hidden="true" />
                                  <span className="small fw-semibold text-muted">
                                    {isHindi ? 'इस श्रेणी में कोई फ़ाइल उपलब्ध नहीं है' : 'No downloads available in this category'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            downloads.map((item, index) => {
                              const ft = (item.fileType || '').toUpperCase();
                              const ftColor = FILE_TYPE_COLORS[ft] || { bg: '#f1f5f9', color: '#475569', label: ft };
                              return (
                                <tr key={item._id}>
                                  <td>
                                    <span className="fw-semibold" style={{ color: '#64748b', fontSize: '0.8rem' }}>{index + 1}</span>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center gap-2">
                                      <span
                                        style={{ width: 32, height: 32, borderRadius: 8, background: ftColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}
                                        aria-hidden="true"
                                      >
                                        {getFileIcon(item.fileType)}
                                      </span>
                                      <span className="fw-semibold" style={{ wordBreak: 'break-word', color: 'var(--pub-navy-800)', fontSize: '0.88rem' }}>
                                        {isHindi ? item.titleHi : item.titleEn}
                                      </span>
                                    </div>
                                  </td>
                                  <td>
                                    <span
                                      className="fw-bold"
                                      style={{ fontSize: '0.72rem', letterSpacing: '0.4px', padding: '3px 10px', borderRadius: 999, background: ftColor.bg, color: ftColor.color }}
                                    >
                                      {item.fileType}
                                    </span>
                                  </td>
                                  <td className="text-nowrap">
                                    <span className="d-flex align-items-center gap-1 small" style={{ color: '#64748b' }}>
                                      <FaCalendarAlt size={11} aria-hidden="true" />
                                      {new Date(item.createdAt).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN')}
                                    </span>
                                  </td>
                                  <td>
                                    <span style={{ fontSize: '0.78rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>
                                      {item.fileSize}
                                    </span>
                                  </td>
                                  <td className="text-center">
                                    <a
                                      className="downloads-btn"
                                      href={item.filePath?.startsWith('http') ? item.filePath : `${BASE_HOST}${item.filePath?.startsWith('/') ? '' : '/'}${item.filePath}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label={`${isHindi ? 'डाउनलोड' : 'Download'} ${isHindi ? item.titleHi : item.titleEn}`}
                                    >
                                      <FaDownload aria-hidden="true" />
                                      {isHindi ? 'डाउनलोड' : 'Download'}
                                    </a>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabPane>
                </TabContent>
              </div>
            </div>
          </Col>
        </Row>
      )}
    </PageLayout>
  );
};

export default Downloads;
