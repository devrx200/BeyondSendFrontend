import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Table,
  Badge
} from 'reactstrap';
import apiClient from "@apiService";
import Swal from 'sweetalert2';
import { PageLoader, IconPicker } from "@/components";
import { ICONS } from '../../utilities/icons';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaGlobe,
  FaToggleOn,
  FaToggleOff,
  FaThLarge,
  FaExternalLinkAlt,
  FaImage,
  FaUserGraduate,
  FaBolt,
  FaPalette,
  FaCheck
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const COLOR_PRESETS = [
  { name: 'Indigo', color: '#6366f1', bg: '#e0e7ff' },
  { name: 'Emerald', color: '#10b981', bg: '#d1fae5' },
  { name: 'Amber', color: '#f59e0b', bg: '#fef3c7' },
  { name: 'Red', color: '#ef4444', bg: '#fee2e2' },
  { name: 'Blue', color: '#3b82f6', bg: '#dbeafe' },
  { name: 'Pink', color: '#ec4899', bg: '#fce7f3' },
  { name: 'Purple', color: '#8b5cf6', bg: '#ede9fe' },
  { name: 'Teal', color: '#0d9488', bg: '#ccfbf1' },
  { name: 'Orange', color: '#f97316', bg: '#ffedd5' },
  { name: 'Cyan', color: '#06b6d4', bg: '#cffafe' },
];

const QuickAccessManagement = () => {
  const { isHindi } = useLanguage();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [iconModal, setIconModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    id: null,
    titleEn: '',
    titleHi: '',
    link: '',
    icon: 'FaBolt',
    color: '#6366f1',
    bg: '#e0e7ff',
    isExternal: false,
    order: 0,
    isActive: true
  });

  const parseList = (res) => {
    if (!res) return null;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    return null;
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        let list = null;
        try {
          const res = await apiClient.get('/quick-access/admin/list');
          list = parseList(res);
        } catch {}

        if (!list) {
          try {
            const fallback = await apiClient.get('/quick-access/list');
            list = parseList(fallback);
          } catch {}
        }

        if (!list) {
          try {
            const fallback2 = await apiClient.get('/quick-access');
            list = parseList(fallback2);
          } catch {}
        }

        if (!cancelled && list) {
          setItems(list);
        }
      } catch (err) {
        console.error('Failed to fetch quick access items:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const loadItemsAgain = async () => {
    try {
      let list = null;
      try {
        const res = await apiClient.get('/quick-access/admin/list');
        list = parseList(res);
      } catch {}

      if (!list) {
        try {
          const fallback = await apiClient.get('/quick-access/list');
          list = parseList(fallback);
        } catch {}
      }

      if (!list) {
        try {
          const fallback2 = await apiClient.get('/quick-access');
          list = parseList(fallback2);
        } catch {}
      }

      if (list) setItems(list);
    } catch (err) {
      console.error('Failed to reload quick access items:', err);
    }
  };

  const openAddForm = () => {
    setForm({
      id: null,
      titleEn: '',
      titleHi: '',
      link: '',
      icon: 'FaBolt',
      color: '#6366f1',
      bg: '#e0e7ff',
      isExternal: false,
      order: items.length > 0 ? Math.max(...items.map(i => i.displayOrder ?? i.order ?? 0)) + 1 : 1,
      isActive: true
    });
    setEditId(null);
    setModal(true);
  };

  const openEditForm = (item) => {
    const itemId = item._id || item.id || null;
    setForm({
      id: itemId,
      titleEn: item.titleEng || item.titleEn || '',
      titleHi: item.titleHin || item.titleHi || '',
      link: item.url || item.link || '',
      icon: item.icon || 'FaBolt',
      color: item.color || '#6366f1',
      bg: item.bgColor || item.bg || '#e0e7ff',
      isExternal: !!item.isExternal,
      order: item.displayOrder ?? item.order ?? 0,
      isActive: item.isActive !== undefined ? item.isActive : true
    });
    setEditId(itemId);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        titleEng: form.titleEn.trim(),
        titleHin: form.titleHi.trim(),
        url: form.link.trim(),
        titleEn: form.titleEn.trim(),
        titleHi: form.titleHi.trim(),
        link: form.link.trim(),
        icon: form.icon,
        color: form.color,
        bgColor: form.bg,
        bg: form.bg,
        displayOrder: Number(form.order) || 0,
        order: Number(form.order) || 0,
        isExternal: !!form.isExternal,
        openInNewTab: !!form.isExternal,
        isActive: form.isActive !== undefined ? form.isActive : true
      };

      let result;
      if (editId) {
        result = await apiClient.put('/quick-access/update/' + editId, payload).catch(() =>
          apiClient.put('/quick-access/' + editId, payload)
        );
      } else {
        result = await apiClient.post('/quick-access/create', payload).catch(() =>
          apiClient.post('/quick-access', payload)
        );
      }

      if (result) {
        Swal.fire({
          icon: 'success',
          title: isHindi ? 'सफल!' : 'Success!',
          text: isHindi
            ? (editId ? 'कार्ड सफलतापूर्वक अपडेट किया गया.' : 'नया कार्ड सफलतापूर्वक जोड़ा गया.')
            : (editId ? 'Quick access card updated successfully.' : 'New quick access card added successfully.'),
          timer: 1500,
          showConfirmButton: false
        });
        setModal(false);
        loadItemsAgain();
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || (isHindi ? 'कुछ त्रुटि हुई.' : 'Something went wrong.')
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item, e) => {
    e.stopPropagation();
    const title = item.titleEng || item.titleEn || item.titleHin || item.titleHi || (isHindi ? 'यह कार्ड' : 'This card');
    Swal.fire({
      icon: 'warning',
      title: isHindi ? 'क्या आप सुनिश्चित हैं?' : 'Are you sure?',
      text: isHindi
        ? `क्या आप "${title}" को हटाना चाहते हैं? यह पूर्ववत नहीं किया जा सकता।`
        : `Do you want to delete "${title}"? This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: isHindi ? 'हाँ, हटाएं' : 'Yes, Delete',
      cancelButtonText: isHindi ? 'रद्द करें' : 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      reverseButtons: true
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          const id = item.id || item._id;
          await apiClient.delete('/quick-access/delete/' + id).catch(() =>
            apiClient.delete('/quick-access/' + id)
          );
          Swal.fire({
            icon: 'success',
            title: isHindi ? 'हटा दिया!' : 'Deleted!',
            text: isHindi
              ? 'कार्ड सफलतापूर्वक हटा दिया गया.'
              : 'Quick access card removed successfully.',
            timer: 1500,
            showConfirmButton: false
          });
          loadItemsAgain();
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: isHindi
              ? 'हटाने में त्रुटि: ' + (err.response?.data?.message || 'कहीं गल्ती हुई।')
              : 'Delete failed: ' + (err.response?.data?.message || 'Something went wrong.')
          });
        }
      }
    });
  };

  const handleToggle = async (item) => {
    const id = item.id || item._id;
    const newActive = !(item.isActive || false);
    try {
      try {
        await apiClient.patch('/quick-access/toggle-status/' + id, {});
      } catch {
        await apiClient.put('/quick-access/' + id, { isActive: newActive }).catch(() =>
          apiClient.put('/quick-access/update/' + id, { isActive: newActive })
        );
      }
      loadItemsAgain();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: isHindi ? 'स्थिति बदलने में त्रुटि हुई.' : 'Failed to toggle status.' });
    }
  };

  const handleIconSelect = (iconName) => {
    setForm(prev => ({ ...prev, icon: iconName }));
    setIconModal(false);
  };

  const handleColorChange = (hex) => {
    const preset = COLOR_PRESETS.find(c => c.color.toLowerCase() === hex.toLowerCase());
    setForm(prev => ({ ...prev, color: hex, bg: preset ? preset.bg : hex }));
  };

  const PreviewIcon = () => {
    const IconComponent = (form.icon && ICONS[form.icon]) ? ICONS[form.icon] : (ICONS['FaBolt'] || FaUserGraduate || FaThLarge);
    return IconComponent ? <IconComponent /> : <FaThLarge />;
  };

  const handleColorInput = (e) => {
    const v = e.target.value;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) handleColorChange(v);
  };

  if (loading) return <PageLoader />;

  return (
    <>
      {/* ── Main Data Card with Integrated Header ─────────────────── */}
      <Card className="adm-card border-0 shadow-sm overflow-hidden mb-4">
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2.5">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-xs flex-shrink-0"
              style={{ width: "38px", height: "38px", background: "rgba(255, 255, 255, 0.15)", fontSize: "1.1rem" }}
            >
              <FaThLarge />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white fw-bold d-flex align-items-center gap-2" style={{ fontSize: "1.1rem" }}>
                <span>{isHindi ? 'त्वरित पहुंच प्रबंधन' : 'Quick Access Management'}</span>
              </h4>
              <p className="adm-page-subtitle mb-0 text-white-50 small d-flex align-items-center gap-1">
                <FaExternalLinkAlt style={{ fontSize: "9px" }} />
                <span>
                  {isHindi
                    ? 'होमपेज पर दिखाए जाने वाले त्वरित पहुंच कार्ड प्रबंधित करें'
                    : 'Manage quick access shortcut cards displayed on the public homepage'}
                </span>
              </p>
            </div>
          </div>
          <Button
            color="light"
            size="sm"
            className="text-primary fw-bold shadow-sm d-flex align-items-center gap-1.5 px-3 py-1.5 border-0"
            onClick={openAddForm}
            disabled={saving}
          >
            <FaPlus size={11} />
            <span>{isHindi ? 'नया कार्ड जोड़ें' : 'Add New Card'}</span>
          </Button>
        </CardHeader>

        <div className="bg-light border-bottom py-2.5 px-3 px-md-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="fw-semibold text-dark small d-flex align-items-center gap-2">
            <FaBolt className="text-warning" />
            <span>{isHindi ? 'त्वरित पहुंच कार्ड सूची' : 'Quick Access Cards List'}</span>
            <Badge color="primary" pill className="ms-1 px-2 py-0.5">
              {items.length} {items.length === 1 ? (isHindi ? 'कार्ड' : 'Card') : (isHindi ? 'कार्ड' : 'Cards')}
            </Badge>
          </div>
          {items.length > 0 && (
            <Button
              color="primary"
              size="sm"
              className="d-flex align-items-center gap-1 shadow-sm fw-semibold px-2.5 py-1"
              onClick={openAddForm}
            >
              <FaPlus size={10} />
              <span>{isHindi ? 'कार्ड जोड़ें' : 'Add Card'}</span>
            </Button>
          )}
        </div>

        <CardBody className="p-0">
          {items.length === 0 ? (
            <div className="text-center py-5 px-3">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm"
                style={{ width: "72px", height: "72px", background: "#f0f4ff", color: "#4f6ef7", fontSize: "1.85rem" }}
              >
                <FaThLarge />
              </div>
              <h5 className="fw-bold text-dark mb-1">
                {isHindi ? 'कोई त्वरित पहुंच कार्ड नहीं मिला' : 'No Quick Access Cards Found'}
              </h5>
              <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: "440px" }}>
                {isHindi
                  ? 'आप यहां होमपेज पर दिखाई देने वाले त्वरित पहुंच कार्ड जोड़ या संपादित कर सकते हैं.'
                  : 'Create quick access shortcuts to give users instant access to key pages, services, and telecom features on the homepage.'}
              </p>
              <Button
                color="primary"
                className="px-4 py-2 shadow-sm fw-semibold d-inline-flex align-items-center gap-2"
                onClick={openAddForm}
              >
                <FaPlus />
                <span>{isHindi ? 'पहला कार्ड जोड़ें' : 'Add First Card'}</span>
              </Button>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "70px", textAlign: "center" }}># {isHindi ? 'क्रम' : 'Order'}</th>
                  <th style={{ minWidth: "250px" }}>{isHindi ? 'कार्ड व शीर्षक' : 'Card & Title'}</th>
                  <th style={{ minWidth: "220px" }}>{isHindi ? 'लक्ष्य URL' : 'Target URL'}</th>
                  <th style={{ width: "120px", textAlign: "center" }}>{isHindi ? 'प्रकार' : 'Type'}</th>
                  <th style={{ width: "120px", textAlign: "center" }}>{isHindi ? 'स्थिति' : 'Status'}</th>
                  <th style={{ width: "160px", textAlign: "center" }}>{isHindi ? 'कार्रवाई' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {items
                  .slice()
                  .sort((a, b) => ((a.displayOrder ?? a.order ?? 0) - (b.displayOrder ?? b.order ?? 0)))
                  .map((item, idx) => {
                    const itemTitleEn = item.titleEng || item.titleEn || '—';
                    const itemTitleHi = item.titleHin || item.titleHi || '—';
                    const itemLink = item.url || item.link || '—';
                    const itemOrder = item.displayOrder ?? item.order ?? (idx + 1);
                    const itemColor = item.color || '#6366f1';
                    const itemBg = item.bgColor || item.bg || '#e0e7ff';
                    const ItemIcon = (item.icon && ICONS[item.icon]) ? ICONS[item.icon] : (FaUserGraduate || FaThLarge);

                    return (
                      <tr key={item.id || item._id || idx}>
                        <td className="text-center">
                          <span className="badge bg-light text-dark border px-2 py-1 fw-bold">
                            #{itemOrder}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center shadow-sm"
                              style={{
                                width: '42px',
                                height: '42px',
                                background: itemBg,
                                color: itemColor,
                                fontSize: '1.2rem',
                                flexShrink: 0
                              }}
                            >
                              <ItemIcon />
                            </div>
                            <div>
                              <div className="fw-bold text-dark" style={{ fontSize: '0.92rem' }}>
                                {itemTitleEn}
                              </div>
                              <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                                {itemTitleHi}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code
                            className="px-2 py-1 rounded bg-light text-dark border text-truncate d-inline-block"
                            style={{ maxWidth: '260px', fontSize: '0.82rem' }}
                          >
                            {itemLink}
                          </code>
                        </td>
                        <td className="text-center">
                          {item.isExternal ? (
                            <span className="badge bg-light text-secondary border px-2.5 py-1.5 d-inline-flex align-items-center gap-1">
                              <FaExternalLinkAlt size={10} />
                              <span>{isHindi ? 'बाहरी' : 'External'}</span>
                            </span>
                          ) : (
                            <span className="badge bg-light text-primary border px-2.5 py-1.5 d-inline-flex align-items-center gap-1">
                              <FaGlobe size={11} />
                              <span>{isHindi ? 'आंतरिक' : 'Internal'}</span>
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-sm border-0 p-0 shadow-none bg-transparent"
                            onClick={() => handleToggle(item)}
                            title={item.isActive ? "Click to Deactivate" : "Click to Activate"}
                          >
                            {item.isActive ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 d-inline-flex align-items-center gap-1 fw-bold">
                                <FaToggleOn size={13} />
                                <span>{isHindi ? 'सक्रिय' : 'Active'}</span>
                              </span>
                            ) : (
                              <span className="badge bg-secondary-subtle text-secondary border px-2.5 py-1.5 d-inline-flex align-items-center gap-1 fw-bold">
                                <FaToggleOff size={13} />
                                <span>{isHindi ? 'निष्क्रिय' : 'Inactive'}</span>
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="text-center">
                          <div className="d-flex align-items-center justify-content-center gap-1.5">
                            <Button
                              size="sm"
                              color="light"
                              className="border text-primary fw-semibold px-2.5 py-1 d-inline-flex align-items-center gap-1"
                              onClick={() => openEditForm(item)}
                            >
                              <FaEdit size={11} />
                              <span>{isHindi ? 'संपादित' : 'Edit'}</span>
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="border text-danger fw-semibold px-2.5 py-1 d-inline-flex align-items-center gap-1"
                              onClick={(e) => handleDelete(item, e)}
                            >
                              <FaTrash size={10} />
                              <span>{isHindi ? 'हटाएं' : 'Delete'}</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* ── Form Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={modal}
        toggle={() => setModal(false)}
        size="lg"
        centered
        className="modal-dialog-centered"
      >
        <ModalHeader
          toggle={() => setModal(false)}
          className="bg-primary text-white border-0"
        >
          <div className="d-flex align-items-center gap-2 text-white fw-bold">
            <FaThLarge />
            <span>
              {editId
                ? (isHindi ? 'त्वरित पहुंच कार्ड संपादित करें' : 'Edit Quick Access Card')
                : (isHindi ? 'नया त्वरित पहुंच कार्ड जोड़ें' : 'Add New Quick Access Card')}
            </span>
          </div>
        </ModalHeader>
        <ModalBody className="p-4 bg-light">
          <Form onSubmit={handleSubmit}>
            {/* Title Section */}
            <div className="card border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <span>{isHindi ? 'कार्ड शीर्षक' : 'Card Titles'}</span>
              </h6>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <FormGroup className="mb-0">
                    <Label className="fw-semibold text-secondary small" for="quickTitleEn">
                      {isHindi ? 'अंग्रेजी शीर्षक (Display)' : 'English Title (Display)'} <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id="quickTitleEn"
                      className="shadow-sm"
                      type="text"
                      placeholder={isHindi ? 'जैसे: शिक्षा सूचना' : 'e.g. Bulk SMS Service'}
                      value={form.titleEn}
                      onChange={e => setForm({ ...form, titleEn: e.target.value })}
                      required
                    />
                  </FormGroup>
                </div>
                <div className="col-12 col-md-6">
                  <FormGroup className="mb-0">
                    <Label className="fw-semibold text-secondary small" for="quickTitleHi">
                      {isHindi ? 'हिंदी शीर्षक (Display)' : 'Hindi Title (Display)'} <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id="quickTitleHi"
                      className="shadow-sm"
                      type="text"
                      placeholder={isHindi ? 'जैसे: शिक्षा सूचना' : 'जैसे: बल्क एसएमएस सेवा'}
                      value={form.titleHi}
                      onChange={e => setForm({ ...form, titleHi: e.target.value })}
                      required
                    />
                  </FormGroup>
                </div>
              </div>
            </div>

            {/* Link Section */}
            <div className="card border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <span>{isHindi ? 'लक्ष्य लिंक' : 'Target Link & URL'}</span>
              </h6>
              <div className="row g-3 align-items-end">
                <div className="col-12 col-md-8">
                  <FormGroup className="mb-0">
                    <Label className="fw-semibold text-secondary small" for="quickLink">
                      {isHindi ? 'लक्ष्य URL' : 'Target URL'} <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id="quickLink"
                      className="shadow-sm"
                      type="text"
                      placeholder="https://example.com/page or /services"
                      value={form.link}
                      onChange={e => setForm({ ...form, link: e.target.value })}
                      required
                    />
                  </FormGroup>
                </div>
                <div className="col-12 col-md-4">
                  <FormGroup switch className="mb-0 pt-2">
                    <Input
                      type="switch"
                      id="quickIsExternal"
                      checked={form.isExternal}
                      onChange={e => setForm({ ...form, isExternal: e.target.checked })}
                    />
                    <Label check for="quickIsExternal" className="fw-semibold small ms-2">
                      <FaExternalLinkAlt style={{ fontSize: '11px', marginRight: '4px' }} />
                      {isHindi ? 'नई टैब में खोलें' : 'Open in New Tab'}
                    </Label>
                  </FormGroup>
                </div>
              </div>
            </div>

            {/* Icon & Color Selection */}
            <div className="card border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <FaPalette className="text-primary" />
                <span>{isHindi ? 'आइकन एवं रंग शैली' : 'Icon & Color Styling'}</span>
              </h6>
              <div className="row g-3 align-items-center">
                <div className="col-12 col-md-4">
                  <Label className="fw-semibold text-secondary small d-block mb-2">
                    {isHindi ? 'चयनित आइकन' : 'Selected Icon'}
                  </Label>
                  <Button
                    type="button"
                    color="light"
                    className="border w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold shadow-xs"
                    onClick={() => setIconModal(true)}
                    style={{ background: "#f8fafc" }}
                  >
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-2 shadow-xs"
                      style={{
                        width: '28px',
                        height: '28px',
                        background: form.bg || '#e0e7ff',
                        color: form.color || '#4f6ef7',
                        fontSize: '15px',
                        flexShrink: 0
                      }}
                    >
                      <PreviewIcon />
                    </span>
                    <span className="text-truncate">
                      {isHindi ? 'आइकन चुनें' : 'Choose Icon'} {form.icon ? `(${form.icon})` : ''}
                    </span>
                  </Button>
                </div>
                <div className="col-12 col-md-8">
                  <Label className="fw-semibold text-secondary small d-block mb-2">
                    {isHindi ? 'रंग पैलेट चुनें' : 'Choose Color Palette'}
                  </Label>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {COLOR_PRESETS.map(preset => {
                      const isActive = form.color.toLowerCase() === preset.color.toLowerCase();
                      return (
                        <div
                          key={preset.color}
                          onClick={() => handleColorChange(preset.color)}
                          title={preset.name}
                          role="button"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: preset.color,
                            cursor: 'pointer',
                            border: isActive ? '3px solid #0f172a' : '2px solid #ffffff',
                            boxShadow: isActive ? '0 0 0 2px #4f6ef7' : '0 1px 3px rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isActive && <FaCheck size={11} />}
                        </div>
                      );
                    })}
                    <div className="d-flex align-items-center gap-2 ms-2">
                      <Input
                        id="quickColorInput"
                        type="color"
                        value={form.color}
                        onChange={e => handleColorChange(e.target.value)}
                        style={{ width: '34px', height: '34px', padding: 0, cursor: 'pointer', border: 'none', borderRadius: '6px' }}
                      />
                      <Input
                        type="text"
                        value={form.color}
                        onChange={handleColorInput}
                        placeholder="#6366f1"
                        style={{ width: '90px' }}
                        className="form-control-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Order & Active Status */}
            <div className="card border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
              <div className="row g-3 align-items-center">
                <div className="col-12 col-md-6">
                  <FormGroup className="mb-0">
                    <Label className="fw-semibold text-secondary small" for="quickOrder">
                      {isHindi ? 'प्रदर्शन क्रम (Order Number)' : 'Display Order'}
                    </Label>
                    <Input
                      id="quickOrder"
                      type="number"
                      min={1}
                      value={form.order}
                      onChange={e => setForm({ ...form, order: parseInt(e.target.value, 10) || 1 })}
                    />
                  </FormGroup>
                </div>
                <div className="col-12 col-md-6">
                  <FormGroup switch className="mb-0 pt-3">
                    <Input
                      type="switch"
                      id="quickStatus"
                      checked={form.isActive}
                      onChange={e => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <Label check for="quickStatus" className="fw-semibold small ms-2">
                      <FaToggleOn style={{ fontSize: '13px', marginRight: '4px' }} className="text-success" />
                      {isHindi ? 'होमपेज पर सक्रिय (Active)' : 'Active on Homepage'}
                    </Label>
                  </FormGroup>
                </div>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="card border-0 shadow-sm p-3 bg-white rounded-3">
              <h6 className="fw-bold text-dark mb-2 small text-uppercase tracking-wider">
                {isHindi ? 'लाइव पूर्वावलोकन (Homepage Card Preview)' : 'Live Homepage Card Preview'}
              </h6>
              <div className="p-3 rounded-3" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                <div
                  className="rounded-3 p-3 shadow-sm d-flex align-items-center gap-3 bg-white border"
                  style={{ maxWidth: '340px' }}
                >
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: '46px',
                      height: '46px',
                      background: form.bg,
                      color: form.color,
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}
                  >
                    <PreviewIcon />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.95rem' }}>
                      {form.titleEn || 'Shortcut Title'}
                    </div>
                    <div className="text-muted small text-truncate" style={{ fontSize: '0.82rem' }}>
                      {form.titleHi || 'शीर्षक पूर्वावलोकन'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ModalFooter className="px-0 pb-0 pt-3 border-0 bg-transparent">
              <Button
                color="light"
                className="border px-4"
                onClick={() => setModal(false)}
                disabled={saving}
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={saving}
                className="px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
              >
                {saving && <Spinner size="sm" />}
                <span>
                  {editId
                    ? (isHindi ? 'अपडेट करें' : 'Update Card')
                    : (isHindi ? 'कार्ड जोड़ें' : 'Save Card')}
                </span>
              </Button>
            </ModalFooter>
          </Form>
        </ModalBody>
      </Modal>

      {/* ICON PICKER MODAL */}
      {iconModal && (
        <IconPicker
          isOpen={iconModal}
          toggle={() => setIconModal(false)}
          onSelect={handleIconSelect}
          selectedIcon={form.icon}
        />
      )}
    </>
  );
};

export default QuickAccessManagement;