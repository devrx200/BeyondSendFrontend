import React, { Fragment, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Row, Col, Card, CardBody,
  Badge, Button, Spinner,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Input, InputGroup
} from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  FaCamera, FaCalendarAlt, FaExternalLinkAlt,
  FaImages, FaChevronLeft, FaChevronRight,
  FaTimes, FaExpand, FaThLarge, FaList,
  FaSearch
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

const imgUrl = (path) => {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${clean}`;
};

/* ── Dynamic Collage Component with 1, 2, 3, 4+ layouts ── */
const Collage = ({ images = [] }) => {
  const total = images?.length || 0;
  const imgs = (images || []).slice(0, 4);

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.4s ease'
  };

  if (!imgs.length) {
    return (
      <div
        className="d-flex align-items-center justify-content-center bg-light"
        style={{ height: 240, width: '100%' }}
      >
        <FaImages size={48} className="text-muted opacity-50" aria-hidden="true" />
      </div>
    );
  }

  if (imgs.length === 1) {
    return (
      <div style={{ height: 240, width: '100%', overflow: 'hidden' }}>
        <img
          src={imgUrl(imgs[0])}
          alt="cover"
          style={imgStyle}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
        />
      </div>
    );
  }

  if (imgs.length === 2) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 240, width: '100%' }}>
        {imgs.map((img, i) => (
          <div key={i} style={{ overflow: 'hidden', height: '100%' }}>
            <img
              src={imgUrl(img)}
              alt={`preview ${i + 1}`}
              style={imgStyle}
              loading="lazy"
              onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (imgs.length === 3) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 2, height: 240, width: '100%' }}>
        <div style={{ overflow: 'hidden', height: '100%' }}>
          <img
            src={imgUrl(imgs[0])}
            alt="preview 1"
            style={imgStyle}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 2, height: '100%' }}>
          {imgs.slice(1).map((img, i) => (
            <div key={i} style={{ overflow: 'hidden', height: '100%' }}>
              <img
                src={imgUrl(img)}
                alt={`preview ${i + 2}`}
                style={imgStyle}
                loading="lazy"
                onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 2, height: 240, width: '100%' }}>
      {imgs.map((img, i) => (
        <div key={i} className="position-relative" style={{ overflow: 'hidden', height: '100%' }}>
          <img
            src={imgUrl(img)}
            alt={`preview ${i + 1}`}
            style={imgStyle}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
          />
          {i === 3 && total > 4 && (
            <div
              className="position-absolute d-flex align-items-center justify-content-center"
              style={{
                inset: 0,
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                backdropFilter: 'blur(2px)'
              }}
            >
              +{total - 3}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ── Inline Detail / Expanded Album Panel ── */
const DetailPanel = ({ item, galleryDetail, detailLoading, isHindi, onClose, onOpenLightbox, onExternalLink }) => {
  const title = isHindi
    ? (galleryDetail?.titleHin || item.titleHin || item.titleEng)
    : (galleryDetail?.titleEng || item.titleEng);

  const desc = isHindi
    ? (galleryDetail?.shortDescHin || item.shortDescHin)
    : (galleryDetail?.shortDescEng || item.shortDescEng);

  const images = galleryDetail?.images || item.images || [];

  return (
    <Col xs={12} className="my-2">
      <Card
        className="border-0 shadow-lg text-white overflow-hidden"
        style={{
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f766e 100%)',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.35)',
          animation: 'fadeInUp 0.3s ease-out'
        }}
      >
        <CardBody className="p-4 p-md-5">
          {/* Header row */}
          <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 pb-3 border-bottom border-white border-opacity-10 mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <Badge
                  pill
                  style={{
                    background: 'rgba(45, 212, 191, 0.15)',
                    color: '#2dd4bf',
                    border: '1px solid rgba(45, 212, 191, 0.3)',
                    padding: '6px 14px',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}
                >
                  <FaImages className="me-1" size={10} />
                  {isHindi ? 'गैलरी एल्बम' : 'Gallery Album'}
                </Badge>

                {item.createdAt && (
                  <span className="text-white-50 small d-inline-flex align-items-center gap-1">
                    <FaCalendarAlt size={11} />
                    {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}

                <Badge
                  pill
                  style={{
                    background: '#0d9488',
                    color: '#fff',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  <FaCamera className="me-1" size={10} />
                  {images.length} {isHindi ? 'फ़ोटो' : 'Photos'}
                </Badge>
              </div>

              <h3 className="h4 text-white fw-bold mb-2">{title}</h3>

              {desc && (
                <p
                  className="mb-0 text-white-50"
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    maxWidth: 800,
                    borderLeft: '3px solid #2dd4bf',
                    paddingLeft: 12
                  }}
                >
                  {desc}
                </p>
              )}
            </div>

            <div className="d-flex align-items-center gap-2">
              {item.link && (
                <Button
                  size="sm"
                  color="light"
                  className="rounded-pill px-3 fw-semibold shadow-sm d-inline-flex align-items-center gap-1"
                  onClick={() => onExternalLink(item)}
                >
                  <FaExternalLinkAlt size={11} /> {isHindi ? 'लिंक देखें' : 'Visit Link'}
                </Button>
              )}
              <button
                type="button"
                className="btn-close btn-close-white p-2 rounded-circle bg-white bg-opacity-10 border border-white border-opacity-25"
                onClick={onClose}
                aria-label={isHindi ? 'बंद करें' : 'Close'}
              />
            </div>
          </div>

          {/* Photo Gallery Grid */}
          {detailLoading ? (
            <div className="text-center py-5">
              <Spinner style={{ color: '#2dd4bf', width: 44, height: 44 }} />
              <p className="mt-3 text-white-50 small mb-0">
                {isHindi ? 'फ़ोटो लोड हो रहे हैं…' : 'Loading photos…'}
              </p>
            </div>
          ) : (
            <>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="small text-white-50">
                  {isHindi ? 'ज़ूम करने के लिए किसी भी फ़ोटो पर क्लिक करें' : 'Click on any photo to open high-resolution viewer'}
                </span>
                <Button
                  size="sm"
                  outline
                  color="light"
                  className="rounded-pill px-3 py-1 small"
                  style={{ borderColor: 'rgba(255,255,255,0.25)' }}
                  onClick={() => onOpenLightbox(0)}
                >
                  <FaExpand className="me-1" size={10} /> {isHindi ? 'स्लाइडशो देखें' : 'Start Slideshow'}
                </Button>
              </div>

              <Row className="g-2 g-md-3">
                {images.map((img, idx) => (
                  <Col key={idx} xs={6} sm={4} md={3} lg={2}>
                    <div
                      className="position-relative rounded-3 overflow-hidden shadow-sm"
                      style={{
                        paddingBottom: '100%',
                        cursor: 'pointer',
                        background: '#1e293b'
                      }}
                      onClick={() => onOpenLightbox(idx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && onOpenLightbox(idx)}
                    >
                      <img
                        src={imgUrl(img)}
                        alt={`${title} - ${idx + 1}`}
                        loading="lazy"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.35s ease'
                        }}
                        onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1.0)'; }}
                      />
                      <div
                        className="position-absolute bottom-0 end-0 m-1 px-2 py-0 rounded"
                        style={{
                          background: 'rgba(0,0,0,0.65)',
                          color: '#2dd4bf',
                          fontSize: 10,
                          fontWeight: 700,
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        {idx + 1}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

/* ══ Main Component ══ */
const Gallery = () => {
  const { isHindi } = useLanguage();

  const [galleryList, setGalleryList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [galleryDetail, setGalleryDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Fetch gallery list
  const fetchGallery = async () => {
    setListLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/get-gallery`);
      const items = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setGalleryList(items.sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0)));
    } catch (err) {
      console.error("Failed to load gallery:", err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Filtered gallery items
  const filteredGalleries = useMemo(() => {
    if (!searchQuery.trim()) return galleryList;
    const q = searchQuery.toLowerCase().trim();
    return galleryList.filter((item) => {
      const en = (item.titleEng || '').toLowerCase();
      const hi = (item.titleHin || '').toLowerCase();
      const descEn = (item.shortDescEng || '').toLowerCase();
      const descHi = (item.shortDescHin || '').toLowerCase();
      return en.includes(q) || hi.includes(q) || descEn.includes(q) || descHi.includes(q);
    });
  }, [galleryList, searchQuery]);

  // Total photo count across all galleries
  const totalPhotosCount = useMemo(() => {
    return galleryList.reduce((acc, curr) => acc + (curr.images?.length || 0), 0);
  }, [galleryList]);

  // Toggle expanded details
  const toggleDetail = async (id) => {
    if (activeId === id) {
      setActiveId(null);
      setGalleryDetail(null);
      return;
    }
    setActiveId(id);
    setGalleryDetail(null);
    setDetailLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/get-gallery-by-id/${id}`);
      setGalleryDetail(data.data || data);
    } catch (err) {
      console.error("Error loading gallery detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Lightbox handlers
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);

  const currentImages = galleryDetail?.images || (activeId ? galleryList.find(g => g._id === activeId)?.images : []) || [];
  const currentItem = galleryDetail || galleryList.find(g => g._id === activeId);

  const lbNext = useCallback(() => {
    if (!currentImages.length) return;
    setLightboxIndex((p) => (p + 1) % currentImages.length);
  }, [currentImages.length]);

  const lbPrev = useCallback(() => {
    if (!currentImages.length) return;
    setLightboxIndex((p) => (p - 1 + currentImages.length) % currentImages.length);
  }, [currentImages.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') lbNext();
      else if (e.key === 'ArrowLeft') lbPrev();
      else if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lbNext, lbPrev]);

  // External link confirmation
  const handleExternalLink = (g) => {
    if (!g.link) return;
    Swal.fire({
      title: isHindi ? 'बाहरी वेबसाइट लिंक' : 'External Website Link',
      text: isHindi
        ? 'आप इस वेबसाइट से बाहर एक बाहरी लिंक पर जा रहे हैं।'
        : 'You are navigating to an external link outside this portal.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#0f766e',
      cancelButtonColor: '#64748b',
      confirmButtonText: isHindi ? 'आगे बढ़ें' : 'Proceed',
      cancelButtonText: isHindi ? 'रद्द करें' : 'Cancel'
    }).then((res) => {
      if (res.isConfirmed) {
        window.open(g.link, g.openInNewTab ? '_blank' : '_self');
      }
    });
  };

  return (
    <PageLayout
      title="Photo Gallery"
      titleHi="चित्र प्रदर्शनी"
      description="Official photo gallery of the Department of Higher Education, Chhattisgarh."
      descriptionHi="उच्च शिक्षा विभाग, छत्तीसगढ़ शासन की आधिकारिक चित्र प्रदर्शनी।"
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gallery-card {
          border-radius: 16px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          background: #ffffff;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }
        .gallery-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 32px rgba(15, 118, 110, 0.12);
          border-color: #99f6e4;
        }
        .gallery-card.is-active {
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.25), 0 16px 36px rgba(15, 118, 110, 0.15);
        }
        .gallery-cover-overlay {
          background: linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.85) 100%);
        }
        .gallery-lightbox-nav-btn {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .gallery-lightbox-nav-btn:hover {
          background: #0d9488;
          color: #fff;
          transform: scale(1.1);
        }
      `}</style>

      {/* Control Bar & Filter Section */}
      <Card className="border-0 shadow-sm rounded-4 mb-4" style={{ background: '#ffffff' }}>
        <CardBody className="p-3 p-md-4">
          <Row className="align-items-center gy-3">
            {/* Stats chips */}
            <Col lg={4} md={6}>
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)' }}
                >
                  <FaImages size={18} />
                </div>
                <div>
                  <div className="fw-bold fs-5 text-dark lh-1">
                    {galleryList.length} <span className="text-muted fw-normal fs-6">/ {totalPhotosCount} {isHindi ? 'फ़ोटो' : 'Photos'}</span>
                  </div>
                  <small className="text-muted">
                    {isHindi ? 'उपलब्ध चित्र संग्रह' : 'Available Photo Albums'}
                  </small>
                </div>
              </div>
            </Col>

            {/* Search Input */}
            <Col lg={5} md={6}>
              <InputGroup className="shadow-sm rounded-pill overflow-hidden border">
                <span className="input-group-text bg-white border-0 ps-3 text-muted">
                  <FaSearch size={13} />
                </span>
                <Input
                  type="text"
                  className="border-0 shadow-none ps-2"
                  placeholder={isHindi ? "एल्बम या शीर्षक खोजें..." : "Search albums by title..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: 14 }}
                />
                {searchQuery && (
                  <Button
                    color="transparent"
                    className="border-0 text-muted pe-3"
                    onClick={() => setSearchQuery('')}
                  >
                    <FaTimes size={12} />
                  </Button>
                )}
              </InputGroup>
            </Col>

            {/* View Mode Toggle */}
            <Col lg={3} className="d-flex justify-content-md-end justify-content-start">
              <div className="btn-group shadow-sm rounded-pill p-1 bg-light border" role="group">
                <Button
                  size="sm"
                  color={viewMode === 'grid' ? 'primary' : 'light'}
                  className={`rounded-pill px-3 border-0 fw-semibold ${viewMode === 'grid' ? 'text-white' : 'text-secondary'}`}
                  style={viewMode === 'grid' ? { background: '#0f766e' } : {}}
                  onClick={() => setViewMode('grid')}
                >
                  <FaThLarge className="me-1" size={12} /> {isHindi ? 'ग्रिड' : 'Grid'}
                </Button>
                <Button
                  size="sm"
                  color={viewMode === 'list' ? 'primary' : 'light'}
                  className={`rounded-pill px-3 border-0 fw-semibold ${viewMode === 'list' ? 'text-white' : 'text-secondary'}`}
                  style={viewMode === 'list' ? { background: '#0f766e' } : {}}
                  onClick={() => setViewMode('list')}
                >
                  <FaList className="me-1" size={12} /> {isHindi ? 'सूची' : 'List'}
                </Button>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Main Gallery List Content */}
      {listLoading ? (
        <div className="text-center py-5 my-5">
          <Spinner style={{ color: '#0f766e', width: 48, height: 48 }} />
          <h6 className="mt-3 text-muted fw-normal">
            {isHindi ? 'गैलरी लोड हो रही है…' : 'Loading Photo Galleries…'}
          </h6>
        </div>
      ) : filteredGalleries.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-4 text-center py-5 my-4 bg-white">
          <CardBody className="py-5">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center text-muted mb-3"
              style={{ width: 72, height: 72, background: '#f1f5f9' }}
            >
              <FaImages size={32} />
            </div>
            <h5 className="text-dark fw-bold mb-1">
              {isHindi ? 'कोई गैलरी नहीं मिली' : 'No Photo Galleries Found'}
            </h5>
            <p className="text-muted small mb-3">
              {searchQuery
                ? (isHindi ? `"${searchQuery}" से मेल खाने वाली कोई गैलरी उपलब्ध नहीं है` : `No albums matching "${searchQuery}"`)
                : (isHindi ? 'वर्तमान में कोई गैलरी उपलब्ध नहीं है' : 'There are currently no gallery items available.')}
            </p>
            {searchQuery && (
              <Button
                size="sm"
                color="primary"
                className="rounded-pill px-3"
                style={{ background: '#0f766e', borderColor: '#0f766e' }}
                onClick={() => setSearchQuery('')}
              >
                {isHindi ? 'सभी देखें' : 'Clear Search'}
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <>
          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <Row className="g-4">
              {filteredGalleries.map((item) => {
                const isActive = activeId === item._id;
                const title = isHindi ? (item.titleHin || item.titleEng) : (item.titleEng || item.titleHin);
                const desc = isHindi ? (item.shortDescHin || item.shortDescEng) : (item.shortDescEng || item.shortDescHin);
                const photoCount = item.images?.length || 0;

                return (
                  <Fragment key={item._id}>
                    <Col xs={12} sm={6} lg={4}>
                      <div
                        className={`gallery-card h-100 overflow-hidden d-flex flex-column ${isActive ? 'is-active' : ''}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleDetail(item._id)}
                        onKeyDown={(e) => e.key === 'Enter' && toggleDetail(item._id)}
                      >
                        {/* Cover Image / Collage */}
                        <div className="position-relative overflow-hidden">
                          <Collage images={item.images} />

                          {/* Gradient Bottom Overlay */}
                          <div className="position-absolute inset-0 gallery-cover-overlay d-flex flex-column justify-content-end p-3 text-white">
                            <h5
                              className="fw-bold mb-1 text-white text-truncate-2"
                              style={{ fontSize: 16, lineHeight: 1.35, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                            >
                              {title}
                            </h5>

                            {item.createdAt && (
                              <div className="d-flex align-items-center gap-2 small text-white-50">
                                <FaCalendarAlt size={11} />
                                <span>
                                  {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Photo Count Pill */}
                          <Badge
                            pill
                            className="position-absolute shadow-sm"
                            style={{
                              top: 12,
                              right: 12,
                              background: 'rgba(15, 23, 42, 0.75)',
                              backdropFilter: 'blur(6px)',
                              color: '#2dd4bf',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              fontSize: 11,
                              padding: '5px 12px',
                              fontWeight: 600
                            }}
                          >
                            <FaCamera className="me-1" size={10} /> {photoCount} {isHindi ? 'फ़ोटो' : 'Photos'}
                          </Badge>
                        </div>

                        {/* Card Body Footer */}
                        <div className="p-3 bg-white d-flex align-items-center justify-content-between border-top mt-auto">
                          {desc ? (
                            <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: '65%' }}>
                              {desc}
                            </p>
                          ) : (
                            <span className="text-muted small">
                              {photoCount} {isHindi ? 'तस्वीरें' : 'Pictures'}
                            </span>
                          )}

                          <Button
                            size="sm"
                            className="rounded-pill px-3 fw-semibold border-0 shadow-sm d-inline-flex align-items-center gap-1"
                            style={{
                              background: isActive ? '#0f766e' : '#f1f5f9',
                              color: isActive ? '#ffffff' : '#0f766e',
                              fontSize: 12
                            }}
                          >
                            {isActive
                              ? (isHindi ? 'बंद करें ↑' : 'Close ↑')
                              : (isHindi ? 'देखें ↓' : 'View Album →')}
                          </Button>
                        </div>
                      </div>
                    </Col>

                    {/* Inline Expanded Album for Active Card */}
                    {isActive && (
                      <DetailPanel
                        item={item}
                        galleryDetail={galleryDetail}
                        detailLoading={detailLoading}
                        isHindi={isHindi}
                        onClose={() => { setActiveId(null); setGalleryDetail(null); }}
                        onOpenLightbox={openLightbox}
                        onExternalLink={handleExternalLink}
                      />
                    )}
                  </Fragment>
                );
              })}
            </Row>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <Row className="g-3">
              {filteredGalleries.map((item) => {
                const isActive = activeId === item._id;
                const title = isHindi ? (item.titleHin || item.titleEng) : (item.titleEng || item.titleHin);
                const desc = isHindi ? (item.shortDescHin || item.shortDescEng) : (item.shortDescEng || item.shortDescHin);
                const photoCount = item.images?.length || 0;
                const firstImage = item.images?.[0];

                return (
                  <Fragment key={item._id}>
                    <Col xs={12}>
                      <div
                        className={`gallery-card overflow-hidden ${isActive ? 'is-active' : ''}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleDetail(item._id)}
                        onKeyDown={(e) => e.key === 'Enter' && toggleDetail(item._id)}
                      >
                        <Row className="g-0 align-items-center">
                          {/* Thumbnail */}
                          <Col xs={4} sm={3} md={2}>
                            <div style={{ height: 110, overflow: 'hidden', position: 'relative', background: '#f1f5f9' }}>
                              {firstImage ? (
                                <img
                                  src={imgUrl(firstImage)}
                                  alt={title}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  loading="lazy"
                                  onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                                />
                              ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                  <FaImages size={28} />
                                </div>
                              )}
                              <Badge
                                pill
                                className="position-absolute bottom-0 start-0 m-1"
                                style={{
                                  background: 'rgba(15, 23, 42, 0.75)',
                                  color: '#2dd4bf',
                                  fontSize: 9,
                                  padding: '3px 6px'
                                }}
                              >
                                {photoCount}
                              </Badge>
                            </div>
                          </Col>

                          {/* Info */}
                          <Col xs={8} sm={9} md={10}>
                            <div className="p-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                              <div>
                                <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: 16 }}>
                                  {title}
                                </h5>
                                {desc && (
                                  <p className="text-muted small mb-1 text-truncate" style={{ maxWidth: 600 }}>
                                    {desc}
                                  </p>
                                )}
                                <div className="d-flex align-items-center gap-3 text-muted small">
                                  {item.createdAt && (
                                    <span className="d-inline-flex align-items-center gap-1">
                                      <FaCalendarAlt size={10} />
                                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  )}
                                  <span className="d-inline-flex align-items-center gap-1 text-primary">
                                    <FaCamera size={10} /> {photoCount} {isHindi ? 'फ़ोटो' : 'photos'}
                                  </span>
                                </div>
                              </div>

                              <Button
                                size="sm"
                                className="rounded-pill px-3 fw-semibold border-0 shadow-sm"
                                style={{
                                  background: isActive ? '#0f766e' : '#f1f5f9',
                                  color: isActive ? '#ffffff' : '#0f766e',
                                  fontSize: 12
                                }}
                              >
                                {isActive
                                  ? (isHindi ? 'बंद करें ↑' : 'Close ↑')
                                  : (isHindi ? 'एल्बम खोलें →' : 'View Album →')}
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Col>

                    {/* Inline Expanded Album for List View */}
                    {isActive && (
                      <DetailPanel
                        item={item}
                        galleryDetail={galleryDetail}
                        detailLoading={detailLoading}
                        isHindi={isHindi}
                        onClose={() => { setActiveId(null); setGalleryDetail(null); }}
                        onOpenLightbox={openLightbox}
                        onExternalLink={handleExternalLink}
                      />
                    )}
                  </Fragment>
                );
              })}
            </Row>
          )}
        </>
      )}

      {/* Modern Fullscreen Lightbox Modal */}
      {currentImages.length > 0 && (
        <Modal
          isOpen={lightboxOpen}
          toggle={closeLightbox}
          size="xl"
          centered
          contentClassName="border-0 shadow-2xl rounded-4 overflow-hidden"
          style={{ maxWidth: 1100 }}
        >
          {/* Lightbox Header */}
          <ModalHeader
            className="border-0 px-4 py-3 text-white"
            style={{
              background: '#0f172a',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            close={
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={closeLightbox}
                aria-label={isHindi ? 'बंद करें' : 'Close lightbox'}
              />
            }
          >
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold fs-6">
                {isHindi
                  ? (currentItem?.titleHin || currentItem?.titleEng)
                  : (currentItem?.titleEng || currentItem?.titleHin)}
              </span>
              <Badge
                pill
                style={{
                  background: 'rgba(45, 212, 191, 0.15)',
                  color: '#2dd4bf',
                  fontSize: 11,
                  padding: '4px 10px'
                }}
              >
                {lightboxIndex + 1} / {currentImages.length}
              </Badge>
            </div>
          </ModalHeader>

          {/* Lightbox Body */}
          <ModalBody
            className="p-0 position-relative d-flex align-items-center justify-content-center"
            style={{ background: '#020617', minHeight: '65vh' }}
          >
            {/* Main Current Photo */}
            <div className="p-3 w-100 text-center">
              <img
                key={lightboxIndex}
                src={imgUrl(currentImages[lightboxIndex])}
                alt={`Photo ${lightboxIndex + 1} of ${currentImages.length}`}
                onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                style={{
                  maxHeight: '68vh',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  borderRadius: 12,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                  animation: 'fadeInUp 0.25s ease-out'
                }}
              />
            </div>

            {/* Left Nav Button */}
            {currentImages.length > 1 && (
              <button
                type="button"
                className="gallery-lightbox-nav-btn position-absolute start-0 ms-3 shadow"
                onClick={lbPrev}
                aria-label={isHindi ? 'पिछला' : 'Previous photo'}
              >
                <FaChevronLeft size={16} />
              </button>
            )}

            {/* Right Nav Button */}
            {currentImages.length > 1 && (
              <button
                type="button"
                className="gallery-lightbox-nav-btn position-absolute end-0 me-3 shadow"
                onClick={lbNext}
                aria-label={isHindi ? 'अगला' : 'Next photo'}
              >
                <FaChevronRight size={16} />
              </button>
            )}
          </ModalBody>

          {/* Lightbox Footer with Thumbnail Carousel Strip */}
          <ModalFooter
            className="border-0 px-4 py-3 justify-content-between flex-wrap gap-2"
            style={{
              background: '#0f172a',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Thumbnails */}
            <div
              className="d-flex align-items-center gap-2 overflow-auto py-1"
              style={{ maxWidth: '75vw' }}
            >
              {currentImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className="p-0 border-0 bg-transparent rounded-2 overflow-hidden position-relative flex-shrink-0"
                  style={{
                    width: 56,
                    height: 56,
                    border: i === lightboxIndex ? '2px solid #2dd4bf' : '2px solid transparent',
                    opacity: i === lightboxIndex ? 1 : 0.45,
                    transform: i === lightboxIndex ? 'scale(1.05)' : 'scale(1.0)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  aria-label={`Thumbnail ${i + 1}`}
                >
                  <img
                    src={imgUrl(img)}
                    alt={`Thumbnail ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                  />
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="d-flex align-items-center gap-2 ms-auto">
              <Button
                size="sm"
                outline
                color="light"
                className="rounded-pill px-3"
                onClick={() => window.open(imgUrl(currentImages[lightboxIndex]), '_blank')}
              >
                <FaExpand className="me-1" size={11} /> {isHindi ? 'पूर्ण आकार' : 'Full Size'}
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      )}
    </PageLayout>
  );
};

export default Gallery;
