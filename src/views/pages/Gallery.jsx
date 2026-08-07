import { Fragment, useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, CardBody,
  Badge, Button, Spinner,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Nav, NavItem, NavLink,
} from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  FaCamera, FaCalendarAlt, FaExternalLinkAlt,
  FaImages, FaChevronLeft, FaChevronRight,
  FaTimes, FaExpand, FaThLarge, FaList,
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

const imgUrl = (path) => {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${clean}`;
};

/* ── Collage: up to 4 preview thumbnails ── */
const Collage = ({ images = [] }) => {
  const imgs = (images || []).slice(0, 4);
  if (!imgs.length) {
    return (
      <div className="d-flex align-items-center justify-content-center bg-secondary gallery-collage">
        <FaImages size={40} className="text-white opacity-50" aria-hidden="true" />
      </div>
    );
  }
  const s = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
  if (imgs.length === 1) return (
    <div className="gallery-collage"><img src={imgUrl(imgs[0])} alt="cover" style={s} loading="lazy" /></div>
  );
  if (imgs.length === 2) return (
    <div className="gallery-collage" style={{ display: 'flex', gap: 2 }}>
      {imgs.map((img, i) => <div key={i} style={{ flex: 1, overflow: 'hidden' }}><img src={imgUrl(img)} alt={`preview ${i + 1}`} style={s} loading="lazy" /></div>)}
    </div>
  );
  if (imgs.length === 3) return (
    <div className="gallery-collage" style={{ display: 'flex', gap: 2 }}>
      <div style={{ flex: 2, overflow: 'hidden' }}><img src={imgUrl(imgs[0])} alt="preview 1" style={s} loading="lazy" /></div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {imgs.slice(1).map((img, i) => <div key={i} style={{ flex: 1, overflow: 'hidden' }}><img src={imgUrl(img)} alt={`preview ${i + 2}`} style={s} loading="lazy" /></div>)}
      </div>
    </div>
  );
  return (
    <div className="gallery-collage" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 2 }}>
      {imgs.map((img, i) => (
        <div key={i} style={{ overflow: 'hidden' }}><img src={imgUrl(img)} alt={`preview ${i + 1}`} style={s} loading="lazy" /></div>
      ))}
    </div>
  );
};

/* ── Inline Detail Panel (shared by grid + list) ── */
const DetailPanel = ({ item, galleryDetail, detailLoading, isHindi, onClose, onOpenLightbox }) => (
  <Col xs={12}>
    <Card className="border-0" style={{ borderRadius: 16, background: 'linear-gradient(135deg,#0f2027 0%,#203a43 60%,#2c5364 100%)', boxShadow: '0 8px 40px rgba(44,83,100,0.3)' }}>
      <CardBody className="p-3 p-md-4">
        <Row className="align-items-start mb-4">
          <Col>
            <Badge style={{ background: 'rgba(79,195,247,0.15)', color: '#4fc3f7', fontSize: 10, padding: '4px 12px', borderRadius: 20, letterSpacing: 2, textTransform: 'uppercase' }} className="mb-2 d-inline-block">
              <FaImages size={9} className="me-1" aria-hidden="true" />
              {isHindi ? 'गैलरी विवरण' : 'Gallery Detail'}
            </Badge>
            <h2 className="text-white mb-1 fw-semibold" style={{ fontSize: 'clamp(16px,3vw,26px)' }}>
              {detailLoading ? (isHindi ? item.titleHin : item.titleEng) : (isHindi ? galleryDetail?.titleHin : galleryDetail?.titleEng)}
            </h2>
            {!detailLoading && galleryDetail && (
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <small className="d-flex align-items-center gap-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <FaCalendarAlt size={10} aria-hidden="true" />
                  {new Date(galleryDetail.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </small>
                <Badge style={{ background: '#4fc3f7', color: '#0f2027', fontWeight: 700, fontSize: 10, padding: '4px 12px', borderRadius: 20 }}>
                  <FaCamera size={9} className="me-1" aria-hidden="true" />
                  {galleryDetail.images?.length} {isHindi ? 'फ़ोटो' : 'Photos'}
                </Badge>
              </div>
            )}
          </Col>
          <Col xs="auto">
            <Button
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              onClick={onClose} aria-label={isHindi ? 'बंद करें' : 'Close detail'}>
              <FaTimes size={13} aria-hidden="true" />
            </Button>
          </Col>
        </Row>

        {!detailLoading && galleryDetail && (isHindi ? galleryDetail.shortDescHin : galleryDetail.shortDescEng) && (
          <p className="mb-4" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.8, borderLeft: '3px solid #4fc3f7', paddingLeft: 16 }}>
            {isHindi ? galleryDetail.shortDescHin : galleryDetail.shortDescEng}
          </p>
        )}

        {detailLoading ? (
          <div className="text-center py-5">
            <Spinner style={{ color: '#4fc3f7', width: 40, height: 40 }} />
            <p className="mt-3 mb-0" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{isHindi ? 'चित्र लोड हो रहे हैं…' : 'Loading images…'}</p>
          </div>
        ) : galleryDetail && (
          <Row className="g-2">
            {galleryDetail.images.map((img, index) => (
              <Col key={index} xs={6} sm={4} md={3} lg={2}>
                <button
                  className="w-100 border-0 p-0 position-relative overflow-hidden"
                  style={{ paddingBottom: '100%', borderRadius: 10, cursor: 'zoom-in', background: '#1a3a4a', display: 'block' }}
                  onClick={() => onOpenLightbox(index)}
                  aria-label={`${isHindi ? 'फोटो' : 'Photo'} ${index + 1}`}
                >
                  <img
                    src={imgUrl(img)}
                    alt={`${isHindi ? 'फोटो' : 'Photo'} ${index + 1}`}
                    loading="lazy"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s', borderRadius: 10 }}
                    onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                  <span className="position-absolute bottom-0 end-0 m-1" style={{ color: '#4fc3f7', fontSize: 10, fontWeight: 700, pointerEvents: 'none', background: 'rgba(15,32,39,0.6)', borderRadius: 4, padding: '2px 4px' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </button>
              </Col>
            ))}
          </Row>
        )}
      </CardBody>
    </Card>
  </Col>
);

/* ══ Main Component ══ */
const Gallery = () => {
  const { isHindi } = useLanguage();

  const [galleryList,     setGalleryList]     = useState([]);
  const [activeId,        setActiveId]        = useState(null);
  const [galleryDetail,   setGalleryDetail]   = useState(null);
  const [detailLoading,   setDetailLoading]   = useState(false);
  const [listLoading,     setListLoading]     = useState(true);
  const [viewMode,        setViewMode]        = useState('grid');
  const [lightboxOpen,    setLightboxOpen]    = useState(false);
  const [lightboxIndex,   setLightboxIndex]   = useState(0);

  const fetchGallery = async () => {
    setListLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/get-gallery`);
      setGalleryList(data.data.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (err) { console.error(err); }
    finally { setListLoading(false); }
  };

  const toggleDetail = async (id) => {
    if (activeId === id) { setActiveId(null); setGalleryDetail(null); return; }
    setActiveId(id);
    setGalleryDetail(null);
    setDetailLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/get-gallery-by-id/${id}`);
      setGalleryDetail(data.data);
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  };

  const openLightbox  = (i) => { setLightboxIndex(i); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const lbNext = () => setLightboxIndex((p) => (p + 1) % galleryDetail.images.length);
  const lbPrev = () => setLightboxIndex((p) => (p - 1 + galleryDetail.images.length) % galleryDetail.images.length);

  const handleLink = (g) => {
    Swal.fire({
      title: isHindi ? 'बाहरी लिंक' : 'External Link',
      text:  isHindi ? 'आप बाहरी वेबसाइट पर जा रहे हैं' : 'You are visiting an external website',
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Continue',
    }).then((r) => { if (r.isConfirmed) window.open(g.link, g.openInNewTab ? '_blank' : '_self'); });
  };

  useEffect(() => { fetchGallery(); }, []);

  return (
    <PageLayout title="Photo Gallery" titleHi="चित्र प्रदर्शनी">

      {/* Hero Banner — no double header; PageLayout already shows title */}
      <div className="gallery-hero rounded-3 mb-4">
        <Container>
          <Row className="align-items-center gy-3">
            <Col lg={7}>
              <h2 className="text-white fw-semibold mb-2 gallery-hero-title">
                {isHindi ? 'चित्र' : 'Photo'}{' '}
                <span style={{ color: '#4fc3f7' }}>{isHindi ? 'प्रदर्शनी' : 'Gallery'}</span>
              </h2>
              <p className="mb-0" style={{ color: 'rgba(255,255,255,.70)', fontSize: 15, maxWidth: 600 }}>
                {isHindi
                  ? 'उच्च शिक्षा विभाग के कार्यक्रमों, गतिविधियों एवं महत्वपूर्ण आयोजनों की झलकियाँ।'
                  : 'Explore memorable moments from events, activities and initiatives of the Higher Education Department.'}
              </p>
            </Col>
            <Col lg={5} className="d-flex justify-content-lg-end justify-content-start">
              <div className="d-flex align-items-center flex-wrap gap-4">
                {!listLoading && (
                  <>
                    <div className="d-flex align-items-center gap-2">
                      <div className="gallery-stat-icon" aria-hidden="true"><FaImages color="#4fc3f7" size={16} /></div>
                      <div>
                        <div className="text-white fw-semibold" style={{ fontSize: 18, lineHeight: 1 }}>{galleryList.length}</div>
                        <small style={{ color: 'rgba(255,255,255,.65)' }}>{isHindi ? 'कुल गैलरी' : 'Galleries'}</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div className="gallery-stat-icon" aria-hidden="true"><FaCamera color="#4fc3f7" size={16} /></div>
                      <div>
                        <div className="text-white fw-semibold" style={{ fontSize: 18, lineHeight: 1 }}>
                          {galleryList.reduce((t, g) => t + (g.images?.length || 0), 0)}
                        </div>
                        <small style={{ color: 'rgba(255,255,255,.65)' }}>{isHindi ? 'कुल फ़ोटो' : 'Photos'}</small>
                      </div>
                    </div>
                  </>
                )}
                <div className="btn-group" role="group" aria-label={isHindi ? 'व्यू मोड' : 'View mode'}>
                  <Button color={viewMode === 'grid' ? 'info' : 'outline-light'} size="sm" onClick={() => setViewMode('grid')}>
                    <FaThLarge className="me-1" size={12} aria-hidden="true" />{isHindi ? 'ग्रिड' : 'Grid'}
                  </Button>
                  <Button color={viewMode === 'list' ? 'info' : 'outline-light'} size="sm" onClick={() => setViewMode('list')}>
                    <FaList className="me-1" size={12} aria-hidden="true" />{isHindi ? 'सूची' : 'List'}
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Wave divider */}
      <div style={{ background: 'linear-gradient(135deg,#0f2027 0%,#2c5364 100%)', lineHeight: 0, marginTop: -2 }} aria-hidden="true">
        <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
          <path fill="#f4f6f9" d="M0,32 C360,0 1080,60 1440,16 L1440,40 L0,40 Z" />
        </svg>
      </div>

      {/* Gallery content */}
      <div style={{ background: '#f4f6f9', minHeight: '60vh', paddingBottom: 60, paddingTop: 24 }}>
        <Container>
          {listLoading && (
            <div className="text-center py-5">
              <Spinner style={{ width: 52, height: 52, color: '#2c5364' }} />
              <p className="mt-3 text-muted">{isHindi ? 'लोड हो रहा है…' : 'Loading galleries…'}</p>
            </div>
          )}

          {!listLoading && galleryList.length === 0 && (
            <div className="text-center py-5">
              <FaImages size={56} className="text-muted mb-3" aria-hidden="true" />
              <h5 className="text-muted fw-light">{isHindi ? 'कोई गैलरी नहीं मिली' : 'No galleries found'}</h5>
            </div>
          )}

          {/* GRID VIEW */}
          {!listLoading && viewMode === 'grid' && (
            <Row className="g-4">
              {galleryList.map((item) => {
                const isActive = activeId === item._id;
                return (
                  <Fragment key={item._id}>
                    <Col xs={12} sm={6} xl={4}>
                      <Card className="border-0 h-100 overflow-hidden" style={{ borderRadius: 16, boxShadow: isActive ? '0 0 0 3px #4fc3f7, 0 16px 40px rgba(44,83,100,0.25)' : '0 4px 20px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.25s', transform: isActive ? 'translateY(-6px)' : 'none' }}
                        onClick={() => toggleDetail(item._id)}>
                        <div className="position-relative overflow-hidden">
                          <Collage images={item.images} />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(15,32,39,0.75) 0%,transparent 55%)' }} aria-hidden="true" />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px' }}>
                            <div className="text-white fw-semibold" style={{ fontSize: 15, lineHeight: 1.3 }}>{isHindi ? item.titleHin : item.titleEng}</div>
                            <div className="d-flex align-items-center gap-1 mt-1" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>
                              <FaCalendarAlt size={9} aria-hidden="true" />
                              {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <Badge className="position-absolute" style={{ top: 12, right: 12, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', fontSize: 11, padding: '5px 10px', borderRadius: 20, color: '#fff', border: 'none' }}>
                            <FaImages size={9} aria-hidden="true" /> {item.images?.length || 0}
                          </Badge>
                          {isActive && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(79,195,247,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
                              <Badge style={{ background: '#4fc3f7', color: '#0f2027', fontWeight: 700, fontSize: 12, padding: '6px 16px', borderRadius: 20 }}>
                                ▼ {isHindi ? 'खुला है' : 'Viewing'}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardBody className="d-flex align-items-center justify-content-between py-3 px-3" style={{ background: isActive ? '#e8f7fd' : '#fff' }}>
                          <Badge style={{ background: '#e8f4fd', color: '#2c5364', fontSize: 10, padding: '4px 10px', borderRadius: 20, fontWeight: 500 }}>
                            {item.images?.length || 0} {isHindi ? 'फ़ोटो' : 'photos'}
                          </Badge>
                          <Button size="sm" style={{ background: isActive ? '#4fc3f7' : '#2c5364', border: 'none', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 600, padding: '5px 14px' }}
                            aria-expanded={isActive}>
                            {isActive ? (isHindi ? 'बंद करें ↑' : 'Close ↑') : (isHindi ? 'देखें ↓' : 'View ↓')}
                          </Button>
                        </CardBody>
                      </Card>
                    </Col>

                    {isActive && (
                      <DetailPanel item={item} galleryDetail={galleryDetail} detailLoading={detailLoading}
                        isHindi={isHindi}
                        onClose={() => { setActiveId(null); setGalleryDetail(null); }}
                        onOpenLightbox={openLightbox} />
                    )}
                  </Fragment>
                );
              })}
            </Row>
          )}

          {/* LIST VIEW */}
          {!listLoading && viewMode === 'list' && (
            <Row className="g-3">
              {galleryList.map((item) => {
                const isActive = activeId === item._id;
                const firstImg = item.images?.[0];
                return (
                  <Fragment key={item._id}>
                    <Col xs={12}>
                      <Card className="border-0 overflow-hidden" style={{ borderRadius: 14, boxShadow: isActive ? '0 0 0 3px #4fc3f7, 0 8px 30px rgba(44,83,100,0.2)' : '0 2px 12px rgba(0,0,0,0.07)', cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => toggleDetail(item._id)}>
                        <Row className="g-0">
                          <Col xs={4} sm={3} md={2}>
                            <div style={{ height: '100%', minHeight: 100, overflow: 'hidden', position: 'relative' }}>
                              {firstImg ? (
                                <img src={imgUrl(firstImg)} alt={isHindi ? item.titleHin : item.titleEng}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy"
                                  onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }} />
                              ) : (
                                <div className="d-flex align-items-center justify-content-center bg-secondary h-100" aria-hidden="true">
                                  <FaImages color="#fff" size={24} />
                                </div>
                              )}
                            </div>
                          </Col>
                          <Col>
                            <CardBody className="d-flex align-items-center justify-content-between h-100 py-3 px-3" style={{ background: isActive ? '#e8f7fd' : '#fff' }}>
                              <div>
                                <div className="fw-semibold mb-1" style={{ fontSize: 15, color: '#0f2027' }}>{isHindi ? item.titleHin : item.titleEng}</div>
                                <div className="d-flex align-items-center gap-3 flex-wrap" style={{ fontSize: 12, color: '#6c757d' }}>
                                  <span className="d-flex align-items-center gap-1">
                                    <FaCalendarAlt size={10} aria-hidden="true" />
                                    {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                  <Badge style={{ background: '#e8f4fd', color: '#2c5364', fontSize: 10, padding: '3px 10px', borderRadius: 20 }}>
                                    <FaImages size={9} className="me-1" aria-hidden="true" />{item.images?.length || 0} {isHindi ? 'फ़ोटो' : 'photos'}
                                  </Badge>
                                </div>
                              </div>
                              <Button size="sm" style={{ background: isActive ? '#4fc3f7' : '#2c5364', border: 'none', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 600, padding: '6px 16px', flexShrink: 0, marginLeft: 12 }}
                                aria-expanded={isActive}>
                                {isActive ? (isHindi ? 'बंद ↑' : 'Close ↑') : (isHindi ? 'देखें ↓' : 'View ↓')}
                              </Button>
                            </CardBody>
                          </Col>
                        </Row>
                      </Card>
                    </Col>

                    {isActive && (
                      <DetailPanel item={item} galleryDetail={galleryDetail} detailLoading={detailLoading}
                        isHindi={isHindi}
                        onClose={() => { setActiveId(null); setGalleryDetail(null); }}
                        onOpenLightbox={openLightbox} />
                    )}
                  </Fragment>
                );
              })}
            </Row>
          )}
        </Container>
      </div>

      {/* Lightbox Modal */}
      {galleryDetail && (
        <Modal isOpen={lightboxOpen} toggle={closeLightbox} size="xl" centered contentClassName="border-0" style={{ background: 'transparent' }}>
          <ModalHeader className="border-0 pb-0" style={{ background: '#0f2027' }}
            close={
              <Button style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '50%', width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={closeLightbox} aria-label={isHindi ? 'बंद करें' : 'Close lightbox'}>
                <FaTimes size={12} aria-hidden="true" />
              </Button>
            }>
            <span className="text-white fw-semibold" style={{ fontSize: 15 }}>{isHindi ? galleryDetail.titleHin : galleryDetail.titleEng}</span>
          </ModalHeader>

          <ModalBody className="p-3 text-center position-relative" style={{ background: '#0f2027' }}>
            <img key={lightboxIndex}
              src={imgUrl(galleryDetail.images[lightboxIndex])}
              alt={`${isHindi ? 'फोटो' : 'Photo'} ${lightboxIndex + 1} of ${galleryDetail.images.length}`}
              onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
              style={{ maxHeight: '65vh', maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }}
            />
            <Button className="gallery-lightbox-btn gallery-lightbox-prev" onClick={lbPrev} aria-label={isHindi ? 'पिछला' : 'Previous photo'}>
              <FaChevronLeft aria-hidden="true" />
            </Button>
            <Button className="gallery-lightbox-btn gallery-lightbox-next" onClick={lbNext} aria-label={isHindi ? 'अगला' : 'Next photo'}>
              <FaChevronRight aria-hidden="true" />
            </Button>
            <div className="d-flex gap-2 mt-3 justify-content-center flex-wrap" style={{ maxHeight: 80, overflow: 'auto' }}>
              {galleryDetail.images.map((img, i) => (
                <img key={i} src={imgUrl(img)} alt={`thumbnail ${i + 1}`}
                  onClick={() => setLightboxIndex(i)}
                  onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                  style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', flexShrink: 0, border: i === lightboxIndex ? '2px solid #4fc3f7' : '2px solid transparent', opacity: i === lightboxIndex ? 1 : 0.45, transition: 'all 0.2s' }}
                />
              ))}
            </div>
          </ModalBody>

          <ModalFooter className="border-0 justify-content-center py-2" style={{ background: '#0f2027' }}>
            <Badge style={{ background: 'rgba(79,195,247,0.15)', color: '#4fc3f7', fontSize: 12, padding: '6px 16px', borderRadius: 20, letterSpacing: 1 }}>
              {lightboxIndex + 1} / {galleryDetail.images.length}
            </Badge>
          </ModalFooter>
        </Modal>
      )}
    </PageLayout>
  );
};

export default Gallery;
