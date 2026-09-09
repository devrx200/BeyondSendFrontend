import { useState, useEffect } from 'react';
import {
  Row, Col, Card, CardBody,
  Nav, NavItem, NavLink,
  TabContent, TabPane,
  Badge, Spinner,
} from 'reactstrap';
import { FaUniversity } from 'react-icons/fa';
import { FaMapLocation } from 'react-icons/fa6';
import PageLayout from '../../components/PageLayout';
import PageLoader from '../../components/PageLoader';
import { useLanguage } from '../../contexts/LanguageContext';
import axios from 'axios';

const EXTERNAL_API_URL = import.meta.env.VITE_EXTERNAL_API_URL;

/* ── Logo with fallback ── */
const UniversityLogo = ({ src, alt }) => {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div className="d-flex align-items-center justify-content-center rounded-3 bg-white border" style={{ width: 48, height: 48 }}>
        <FaUniversity size={20} color="#6366f1" aria-hidden="true" />
      </div>
    );
  }
  return (
    <img src={src} alt={alt} width={48} height={48}
      className="rounded-3 border bg-white object-fit-contain"
      style={{ width: 48, height: 48 }}
      onError={() => setErrored(true)}
      loading="lazy"
    />
  );
};

/* ── Single info row ── */
const InfoRow = ({ icon, label, value, badge, badgeColor }) => (
  <div className="d-flex align-items-start gap-1">
    <span style={{ fontSize: 12, lineHeight: '20px', flexShrink: 0 }} aria-hidden="true">{icon}</span>
    <span className="text-muted" style={{ fontSize: 11, minWidth: 54, lineHeight: '20px', flexShrink: 0 }}>{label}</span>
    {badge ? (
      <Badge color={badgeColor || 'secondary'} pill style={{ fontSize: 10.5 }}>{value || '—'}</Badge>
    ) : (
      <span className="fw-medium text-dark" style={{ fontSize: 12, lineHeight: '20px', wordBreak: 'break-word' }}>{value || '—'}</span>
    )}
  </div>
);

/* ── University Card ── */
const UniversityCard = ({ university }) => (
  <article className="border rounded-3 bg-white overflow-hidden shadow-sm"
    style={{ transition: 'box-shadow .2s, transform .2s' }}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(30,58,138,.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
    <Row className="g-0 align-items-stretch">
      {/* Logo */}
      <Col xs={3} sm={2} md="auto"
        className="d-flex align-items-center justify-content-center border-end"
        style={{ minWidth: 68, background: 'linear-gradient(135deg,#f0e8ff,#e8f4fd)' }}>
        <UniversityLogo src={university.profileImgUrl || university.universityLogo} alt={university.name} />
      </Col>
      {/* Main info */}
      <Col xs={9} sm={10} md className="border-end px-3 py-2" style={{ minWidth: 0 }}>
        <p className="fw-semibold mb-2 d-flex align-items-center flex-wrap gap-1" style={{ fontSize: 13, color: '#1e1b4b', lineHeight: 1.5 }}>
          <span>{university.name}</span>
          <span className="px-2 py-1 rounded-pill" style={{ background: '#c7f1fe', color: '#793004', fontSize: 11, fontWeight: 700 }}>
            ⭐ NAAC: {university.naacGrade || 'N/A'}
          </span>
        </p>
        <div className="d-flex flex-column gap-1">
          <InfoRow icon="🎓" label="Mode" value={university.educationMode} />
          <InfoRow icon="📍" label="Address" value={university.address} />
          <InfoRow icon="📅" label="Est." value={university.establishYear} badge badgeColor="primary" />
        </div>
      </Col>
      {/* Contact & Location */}
      <Col xs={12} md={4} lg={4} xl={3} className="border-end border-top border-md-top-0 px-3 py-2">
        <p className="text-uppercase text-muted fw-semibold mb-2" style={{ fontSize: 9.5, letterSpacing: '.07em' }}>
          Contact &amp; Location
        </p>
        <div className="d-flex flex-column gap-1">
          <InfoRow icon="✉️" label="Email" value={university.universityEmail} />
          <InfoRow icon="📞" label="Phone" value={university.contactNumber} />
          <InfoRow icon="🏙" label="District" value={university.districtName} />
          <InfoRow icon="🏛" label="Assembly" value={university.vidhansabhaName} />
        </div>
      </Col>
      {/* Actions */}
      <Col xs={12} md="auto"
        className="d-flex flex-row flex-md-column align-items-center justify-content-center gap-2 px-3 py-2 border-top border-md-top-0 bg-light bg-opacity-25"
        style={{ minWidth: 120 }}>
        {university.googleLocation && (
          <a href={university.googleLocation} target="_blank" rel="noopener noreferrer"
            className="btn btn-sm btn-warning px-3 fw-semibold text-danger border border-dark flex-grow-1 flex-md-grow-0"
            style={{ fontSize: 11.5, borderRadius: 20 }}>
            <FaMapLocation aria-hidden="true" /> Map
          </a>
        )}
        {university.universityUrl && (
          <a href={university.universityUrl} target="_blank" rel="noopener noreferrer"
            className="btn btn-sm btn-primary px-3 fw-semibold flex-grow-1 flex-md-grow-0"
            style={{ fontSize: 11.5, borderRadius: 20 }}>
            🌐 Website
          </a>
        )}
      </Col>
    </Row>
  </article>
);

const TABS = [
  { id: 'STATE', typeVal: '1', en: 'State', hi: 'राज्य', color: 'primary' },
  { id: 'PRIVATE', typeVal: '0', en: 'Private', hi: 'निजी', color: 'success' },
  { id: 'CENTRAL', typeVal: '2', en: 'Central', hi: 'केंद्रीय', color: 'warning' },
];

/* ══ Main Component ══ */
const Universities = () => {
  const { isHindi } = useLanguage();

  const [activeTab, setActiveTab] = useState('STATE');
  const [universities, setUniversities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [allVidhansabha, setAllVidhansabha] = useState([]);
  const [vidhansabhaList, setVidhansabhaList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVidhan, setSelectedVidhan] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${EXTERNAL_API_URL}/api/district/get-all-district`)
      .then((res) => setDistricts(res.data || []))
      .catch((err) => console.error('District fetch error', err));
  }, []);

  useEffect(() => {
    axios.get(`${EXTERNAL_API_URL}/api/district/get-all-vidhansabha`)
      .then((res) => { setAllVidhansabha(res.data || []); setVidhansabhaList(res.data || []); })
      .catch((err) => console.error('Vidhansabha fetch error', err));
  }, []);

  useEffect(() => {
    if (!selectedDistrict) {
      setVidhansabhaList(allVidhansabha);
    } else {
      setVidhansabhaList(allVidhansabha.filter((v) => String(v.districtLGDCode) === String(selectedDistrict)));
    }
    setSelectedVidhan('');
  }, [selectedDistrict, allVidhansabha]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDistrict) params.district = selectedDistrict;
      if (selectedVidhan) params.vidhansabha = selectedVidhan;
      const res = await axios.get(`${EXTERNAL_API_URL}/api/university/get-all-university-form-main-hrmis`, { params });
      setUniversities(res.data.data || []);
    } catch (err) {
      console.error('University fetch error', err);
      setUniversities([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUniversities(); }, [selectedDistrict, selectedVidhan]);

  const filtered = universities.filter((u) => {
    const tab = TABS.find((t) => t.id === activeTab);
    return tab ? String(u.universityType) === tab.typeVal : false;
  });

  const clearFilters = () => { setSelectedDistrict(''); setSelectedVidhan(''); setVidhansabhaList(allVidhansabha); };

  return (
    <PageLayout
      title={isHindi ? 'विश्वविद्यालय' : 'Universities'}
      titleHi="विश्वविद्यालय"
      description="List of State, Central, and Private Universities in Chhattisgarh, Department of Higher Education."
      descriptionHi="छत्तीसगढ़ राज्य के शासकीय, केंद्रीय एवं निजी विश्वविद्यालयों की आधिकारिक सूची — उच्च शिक्षा विभाग।"
      showBreadcrumb
    >
      <Row>
        <Col lg={12}>
          <Card className="border-0 shadow-sm rounded-4 p-2">
            <CardBody className="p-1">

              {/* Header */}
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-3 p-2 me-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#ede9fe,#e0f2fe)' }} aria-hidden="true">
                  <FaUniversity size={26} color="#6366f1" />
                </div>
                <div>
                  <h1 className="h5 mb-0 fw-semibold">{isHindi ? 'छत्तीसगढ़ के विश्वविद्यालय' : 'Universities in Chhattisgarh'}</h1>
                  <p className="text-muted mb-0" style={{ fontSize: 12.5 }}>
                    {isHindi ? 'राज्य में उच्च शिक्षा के प्रमुख केंद्र' : 'Leading Centers of Higher Education in the State'}
                  </p>
                </div>
              </div>

              <hr className="my-3" />

              {/* Toolbar — type tabs + filters */}
              <Row className="align-items-center g-2 mb-3">
                {/* Type tabs */}
                <Col xs={12} sm="auto" md="auto">
                  <Nav pills className="gap-1 flex-nowrap overflow-auto pb-1 pb-sm-0" role="tablist" aria-label={isHindi ? 'विश्वविद्यालय प्रकार' : 'University type'} style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                    {TABS.map(({ id, en, hi, color }) => (
                      <NavItem key={id} className="flex-shrink-0">
                        <NavLink
                          className={['fw-semibold py-1 px-3',
                            activeTab === id
                              ? `bg-${color} ${color === 'warning' ? 'text-dark' : 'text-white'}`
                              : `border border-${color} text-${color} bg-white`,
                          ].join(' ')}
                          style={{ fontSize: 12.5, borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap' }}
                          onClick={() => setActiveTab(id)}
                          role="tab" aria-selected={activeTab === id}
                        >
                          {isHindi ? hi : en}
                        </NavLink>
                      </NavItem>
                    ))}
                  </Nav>
                </Col>

                {/* District select */}
                <Col xs={12} sm={6} md="auto">
                  <select
                    className="form-select form-select-sm"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    aria-label={isHindi ? 'जिला फ़िल्टर' : 'District filter'}
                    style={{ minWidth: 160, fontSize: 13, borderRadius: 8, cursor: 'pointer' }}
                  >
                    <option value="">{isHindi ? '📍 सभी जिले' : '📍 All Districts'}</option>
                    {districts.map((d) => (
                      <option key={d._id} value={d.LGDCode}>{d.districtNameEng || d.name}</option>
                    ))}
                  </select>
                </Col>

                {/* Vidhansabha select */}
                <Col xs={12} sm={6} md="auto">
                  <select
                    className="form-select form-select-sm"
                    value={selectedVidhan}
                    onChange={(e) => setSelectedVidhan(e.target.value)}
                    aria-label={isHindi ? 'विधानसभा फ़िल्टर' : 'Vidhansabha filter'}
                    style={{ minWidth: 180, fontSize: 13, borderRadius: 8, cursor: 'pointer' }}
                  >
                    <option value="">{isHindi ? '🏛️ सभी विधानसभा' : '🏛️ All Vidhansabha'}</option>
                    {vidhansabhaList.map((v) => (
                      <option key={v._id} value={v.ConstituencyNumber}>{v.ConstituencyName}</option>
                    ))}
                  </select>
                </Col>

                {/* Clear & Count */}
                <Col xs={12} md="auto" className="d-flex align-items-center gap-2 ms-md-auto mt-2 mt-md-0">
                  {(selectedDistrict || selectedVidhan) && (
                    <button className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center" style={{ fontSize: 12, borderRadius: 8, height: '30px' }} onClick={clearFilters}>
                      ✕ {isHindi ? 'साफ करें' : 'Clear'}
                    </button>
                  )}
                  <Badge color="dark" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20 }} className={!(selectedDistrict || selectedVidhan) ? 'ms-auto ms-md-0' : ''}>
                    {loading ? '…' : `${filtered.length} ${isHindi ? 'विश्वविद्यालय' : `Universit${filtered.length === 1 ? 'y' : 'ies'}`}`}
                  </Badge>
                </Col>
              </Row>

              {/* Tab Content */}
              <TabContent activeTab={activeTab}>
                {TABS.map(({ id }) => (
                  <TabPane tabId={id} key={id}>
                    {loading ? (
                      <PageLoader inline={true} />
                    ) : filtered.length > 0 ? (
                      <div className="d-flex flex-column gap-2">
                        {filtered.map((university) => (
                          <UniversityCard key={university._id} university={university} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5 text-muted">
                        <FaUniversity size={30} style={{ opacity: .2, display: 'block', margin: '0 auto 8px' }} aria-hidden="true" />
                        <p className="mb-0" style={{ fontSize: 13 }}>{isHindi ? 'कोई डेटा उपलब्ध नहीं है' : 'No universities found'}</p>
                      </div>
                    )}
                  </TabPane>
                ))}
              </TabContent>

            </CardBody>
          </Card>
        </Col>
      </Row>
    </PageLayout>
  );
};

export default Universities;
