import { useEffect, useState } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner
} from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import PageLoader from '../../components/PageLoader';
import IconPicker from '../../components/IconPicker';
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
  FaImage
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
  const API = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem('authToken');
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
    icon: 'FaUserGraduate',
    color: '#6366f1',
    bg: '#e0e7ff',
    isExternal: false,
    order: 0,
    isActive: true
  });

  const getAuthConfig = () => ({
    headers: { Authorization: 'Bearer ' + token }
  });

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API + '/api/quick-access-for-admin', getAuthConfig());
        if (!cancelled) {
          if (res.data?.data) {
            setItems(res.data.data);
          } else if (Array.isArray(res.data)) {
            setItems(res.data);
          }
        }
      } catch {
        try {
          const fallback = await axios.get(API + '/api/quick-access');
          if (!cancelled && fallback.data?.data) setItems(fallback.data.data);
        } catch {}
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const loadItemsAgain = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API + '/api/quick-access-for-admin', getAuthConfig());
      if (res.data?.data) setItems(res.data.data);
      else if (Array.isArray(res.data)) setItems(res.data);
    } catch {
      try {
        const fallback = await axios.get(API + '/api/quick-access');
        if (fallback.data?.data) setItems(fallback.data.data);
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setForm({
      id: null,
      titleEn: '',
      titleHi: '',
      link: '',
      icon: 'FaUserGraduate',
      color: '#6366f1',
      bg: '#e0e7ff',
      isExternal: false,
      order: items.length > 0 ? Math.max(...items.map(i => i.order || 0)) + 1 : 1,
      isActive: true
    });
    setEditId(null);
    setModal(true);
  };

  const openEditForm = (item) => {
    setForm({
      id: item.id || null,
      titleEn: item.titleEn || '',
      titleHi: item.titleHi || '',
      link: item.link || '',
      icon: item.icon || 'FaUserGraduate',
      color: item.color || '#6366f1',
      bg: item.bg || '#e0e7ff',
      isExternal: !!item.isExternal,
      order: item.order || 0,
      isActive: !!item.isActive
    });
    setEditId(item.id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        titleEn: form.titleEn.trim(),
        titleHi: form.titleHi.trim(),
        link: form.link.trim(),
        icon: form.icon,
        color: form.color,
        bg: form.bg,
        isExternal: form.isExternal,
        order: form.order,
        isActive: form.isActive
      };

      let result;
      if (editId) {
        result = await axios.put(API + '/api/quick-access/' + editId, payload, getAuthConfig());
      } else {
        result = await axios.post(API + '/api/quick-access', payload, getAuthConfig());
      }

      if (result.data?.success || result.data) {
        Swal.fire({
          icon: 'success',
          title: isHindi ? 'सही है!' : 'Success!',
          text: isHindi
            ? (editId ? 'कार्ड पहचान चौकी अपडेट किया गया है.' : 'नया कार्ड पहचान चौकी जोड़ा गया है.')
            : (editId ? 'Quick access card updated.' : 'New quick access card added.'),
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
        text: err.response?.data?.message || 'कुछ गल्ती हो गई.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item, e) => {
    e.stopPropagation();
    const title = item.titleEn || item.titleHi || 'यह कार्ड';
    Swal.fire({
      icon: 'warning',
      title: isHindi ? 'क्या आप सुनिश्चित हैं?' : 'Are you sure?',
      text: isHindi
        ? 'क्या आप "' + title + '" को हटाना चाहते हैं? यह पूर्ववत नहीं किया जा सकता।'
        : 'Do you want to delete "' + title + '"? This action cannot be undone.',
      showCancelButton: true,
      confirmButtonText: isHindi ? 'हाँ, हटाएं' : 'Yes, Delete',
      cancelButtonText: isHindi ? 'रद्द करें' : 'Cancel',
      confirmButtonColor: '#fe5d70',
      cancelButtonColor: '#888888',
      reverseButtons: true
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          const id = item.id || item._id;
          await axios.delete(API + '/api/quick-access/' + id, getAuthConfig());
          Swal.fire({
            icon: 'success',
            title: isHindi ? 'हटा दिया!' : 'Deleted!',
            text: isHindi
              ? 'कार्ड पहचान चौकी सफलतापूर्वक हटा दी गई.'
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
      await axios.put(API + '/api/quick-access/' + id, { isActive: newActive }, getAuthConfig());
      loadItemsAgain();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'स्थिति बदलने में त्रुटि हुई.' });
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
    const IconComponent = ICONS[form.icon] || ICONS['FaUserGraduate'];
    return IconComponent ? <IconComponent /> : <FaUserGraduate />;
  };

  const handleColorInput = (e) => {
    const v = e.target.value;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) handleColorChange(v);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="container-fluid p-0">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="adm-quick-page-header">
        <div className="d-flex align-items-center gap-3">
          <div className="adm-quick-page-header-icon">
            <FaThLarge />
          </div>
          <div>
            <div className="adm-quick-page-title">
              {isHindi ? 'त्वरित पहुंच प्रबंधन' : 'Quick Access Management'}
            </div>
            <div className="adm-quick-page-subtitle mt-1">
              <FaExternalLinkAlt />
              {isHindi
                ? 'होमपेज पर दिखाए जाने वाले त्वरित कार्ड प्रबंधित करें'
                : 'Manage quick cards displayed on the homepage'}
            </div>
          </div>
        </div>
        <Button
          className="adm-quick-add-btn"
          onClick={openAddForm}
          disabled={saving}
        >
          <FaPlus />
          {isHindi ? 'नया कार्ड जोड़ें' : 'Add New Card'}
        </Button>
      </div>

      {/* ── Table / Grid ──────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="adm-quick-table-card">
          <div className="adm-quick-empty-state">
            <div className="adm-quick-empty-state-icon">
              <FaThLarge />
            </div>
            <div className="adm-quick-empty-state-title">
              {isHindi ? 'त्वरित पहुंच कार्ड नहीं मिले' : 'No Quick Access Cards Found'}
            </div>
            <div className="adm-quick-empty-state-sub">
              {isHindi
                ? 'आप यहां होमपेज पर दिखाई देने वाले त्वरित पहुंच कार्ड जोड़ या संपादित कर सकते हैं.'
                : 'You can add or edit quick access cards shown on the homepage from here.'}
            </div>
            <Button className="adm-quick-add-btn" onClick={openAddForm}>
              <FaPlus />
              {isHindi ? 'पहला कार्ड जोड़ें' : 'Add First Card'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="adm-quick-table-card">
          <div className="adm-quick-table-head">
            <table className="mb-0 w-100">
              <thead>
                <tr>
                  <th className="adm-quick-col-order">
                    {isHindi ? 'क्रम' : 'Order'}
                  </th>
                  <th>
                    {isHindi ? 'विवरण' : 'Details'}
                  </th>
                  <th className="adm-quick-col-type">
                    {isHindi ? 'प्रकार' : 'Type'}
                  </th>
                  <th className="adm-quick-col-status">
                    {isHindi ? 'स्थिति' : 'Status'}
                  </th>
                  <th className="adm-quick-col-actions">
                    {isHindi ? 'कार्य' : 'Actions'}
                  </th>
                </tr>
              </thead>
            </table>
          </div>
          <div className="adm-quick-table-body">
            {items
              .slice()
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((item, idx) => {
                return (
                  <div
                    key={item.id || item._id || idx}
                    className="adm-quick-table-row"
                    style={{
                      '--tile-color': item.color || '#6366f1',
                      '--tile-bg': item.bg || '#e0e7ff'
                    }}
                  >
                    {/* Order */}
                    <div className="adm-quick-table-col-order">
                      {item.order ?? idx + 1}
                    </div>

                    {/* Icon + Titles */}
                    <div className="adm-quick-table-col-icon">
                      <div
                        className="adm-quick-table-icon"
                        style={{
                          '--tile-color': item.color || '#6366f1',
                          '--tile-bg': item.bg || '#e0e7ff'
                        }}
                      >
                        {ICONS[item.icon] ? <ICONS[item.icon] /> : <FaUserGraduate />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="adm-quick-table-col-title-en">
                          {item.titleEn || '—'}
                        </div>
                        <div className="adm-quick-table-col-title-hi">
                          {item.titleHi || '—'}
                        </div>
                      </div>
                    </div>

                    {/* URL */}
                    <div className="adm-quick-table-col-url">
                      <code className="text-truncate d-inline-block">
                        {item.link || '—'}
                      </code>
                    </div>

                    {/* Type */}
                    <div className="adm-quick-table-col-type">
                      {item.isExternal ? (
                        <span className="adm-quick-badge-external">
                          <FaExternalLinkAlt />
                          {isHindi ? 'बाहरी' : 'External'}
                        </span>
                      ) : (
                        <span className="adm-quick-badge-internal">
                          <FaGlobe />
                          {isHindi ? 'आंतरिक' : 'Internal'}
                        </span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="adm-quick-table-col-status">
                      <button
                        className="adm-quick-toggle-btn"
                        onClick={() => handleToggle(item)}
                        type="button"
                        aria-label={isHindi
                          ? (item.isActive ? 'निष्क्रिय करें' : 'सक्रिय करें')
                          : (item.isActive ? 'Deactivate' : 'Activate')}
                      >
                        <span
                          className={dm-quick-status-badge }
                        >
                          {item.isActive ? (
                            <>
                              <FaToggleOn style={{ fontSize: '10px' }} />
                              {isHindi ? 'सक्रिय' : 'Active'}
                            </>
                          ) : (
                            <>
                              <FaToggleOff style={{ fontSize: '10px' }} />
                              {isHindi ? 'निष्क्रिय' : 'Inactive'}
                            </>
                          )}
                        </span>
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="adm-quick-table-col-actions">
                      <Button
                        className="adm-quick-action-btn"
                        type="button"
                        onClick={() => openEditForm(item)}
                      >
                        <FaEdit style={{ fontSize: '11px' }} />
                        {isHindi ? 'संपादित करें' : 'Edit'}
                      </Button>
                      <Button
                        className="adm-quick-action-btn is-delete"
                        type="button"
                        onClick={(e) => handleDelete(item, e)}
                      >
                        <FaTrash style={{ fontSize: '11px' }} />
                        {isHindi ? 'हटाएं' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Form Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={modal}
        toggle={() => setModal(false)}
        size="lg"
        centered
        className="adm-quick-modal"
      >
        <ModalHeader
          toggle={() => setModal(false)}
          className="adm-quick-modal-header"
          closeButton
        >
          <div className="adm-quick-modal-header-title">
            <FaThLarge className="adm-quick-modal-header-icon" />
            {editId ? (
              isHindi ? 'कार्ड पहचान चौकी संपादित करें' : 'Edit Quick Access Card'
            ) : (
              isHindi ? 'नया कार्ड पहचान चौकी जोड़ें' : 'Add New Quick Access Card'
            )}
          </div>
        </ModalHeader>
        <ModalBody className="adm-quick-modal-body">
          <Form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="adm-quick-form-section">
              <div className="adm-quick-form-section-title">
                {isHindi ? 'शीर्षक' : 'Title'}
              </div>
              <div className="adm-quick-form-row">
                <div className="adm-quick-form-col">
                  <FormGroup>
                    <Label className="adm-quick-form-label" for="quickTitleEn">
                      {isHindi ? 'अंग्रेजी शीर्षक (वाचक)' : 'English Title (Display)'}
                    </Label>
                    <Input
                      id="quickTitleEn"
                      className="adm-quick-form-input"
                      type="text"
                      placeholder={isHindi ? 'जैसे: शिक्षा सूचना' : 'e.g. Education Notice'}
                      value={form.titleEn}
                      onChange={e => setForm({ ...form, titleEn: e.target.value })}
                      required
                    />
                  </FormGroup>
                </div>
                <div className="adm-quick-form-col">
                  <FormGroup>
                    <Label className="adm-quick-form-label" for="quickTitleHi">
                      {isHindi ? 'हिंदी शीर्षक (वाचक)' : 'Hindi Title (Display)'}
                    </Label>
                    <Input
                      id="quickTitleHi"
                      className="adm-quick-form-input"
                      type="text"
                      placeholder={isHindi ? 'जैसे: शिक्षा सूचना' : 'जैसे: शिक्षा सूचना'}
                      value={form.titleHi}
                      onChange={e => setForm({ ...form, titleHi: e.target.value })}
                      required
                    />
                  </FormGroup>
                </div>
              </div>
            </div>

            {/* Link */}
            <div className="adm-quick-form-section">
              <div className="adm-quick-form-section-title">
                {isHindi ? 'लिंक' : 'Link'}
              </div>
              <div className="adm-quick-form-row">
                <div className="adm-quick-form-col">
                  <FormGroup>
                    <Label className="adm-quick-form-label" for="quickLink">
                      {isHindi ? 'लिंक URL' : 'Link URL'}
                    </Label>
                    <Input
                      id="quickLink"
                      className="adm-quick-form-input"
                      type="url"
                      placeholder="https://example.com/page"
                      value={form.link}
                      onChange={e => setForm({ ...form, link: e.target.value })}
                      required
                    />
                  </FormGroup>
                </div>
                <div className="adm-quick-form-col" style={{ flex: '0 0 auto' }}>
                  <FormGroup switch>
                    <Input
                      type="switch"
                      id="quickIsExternal"
                      checked={form.isExternal}
                      onChange={e => setForm({ ...form, isExternal: e.target.checked })}
                    />
                    <Label check for="quickIsExternal" className="fw-semibold small">
                      <FaExternalLinkAlt style={{ fontSize: '11px', marginRight: '4px' }} />
                      {isHindi ? 'नई टैब में खुलता है' : 'Opens in New Tab'}
                    </Label>
                  </FormGroup>
                </div>
              </div>
            </div>

            {/* Icon */}
            <div className="adm-quick-form-section">
              <div className="adm-quick-form-section-title">
                {isHindi ? 'आइकन चुनें' : 'Choose Icon'}
              </div>
              <div className="adm-quick-form-col">
                <button
                  type="button"
                  className="adm-quick-icon-picker-btn w-100"
                  onClick={() => setIconModal(true)}
                >
                  <FaImage style={{ fontSize: '14px' }} />
                  {isHindi ? 'आइकन चुनें' : 'Choose Icon'}
                </button>
              </div>
            </div>

            {/* Color */}
            <div className="adm-quick-form-section">
              <div className="adm-quick-form-section-title">
                {isHindi ? 'रंग चुनें' : 'Choose Color'}
              </div>
              <div className="adm-quick-form-row">
                <div className="adm-quick-form-col" style={{ flex: '0 0 auto' }}>
                  <div className="adm-quick-color-swatch-grid">
                    {COLOR_PRESETS.map(preset => (
                      <div
                        key={preset.color}
                        className={dm-quick-color-swatch }
                        style={{ background: preset.color }}
                        onClick={() => handleColorChange(preset.color)}
                        title={preset.name}
                        type="button"
                        role="button"
                        aria-pressed={form.color === preset.color}
                      />
                    ))}
                  </div>
                </div>
                <div className="adm-quick-form-col" style={{ flex: '1 1 140px' }}>
                  <div
                    className="d-flex align-items-center gap-2"
                    style={{ flexWrap: 'wrap' }}
                  >
                    <div
                      className="adm-quick-color-input-preview rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: '34px',
                        height: '34px',
                        background: form.color,
                        cursor: 'pointer'
                      }}
                      onClick={() => document.getElementById('quickColorInput').click()}
                    />
                    <Input
                      id="quickColorInput"
                      type="color"
                      className="adm-quick-color-input"
                      value={form.color}
                      onChange={e => handleColorChange(e.target.value)}
                      style={{ width: '34px', height: '34px', padding: 0 }}
                    />
                    <Input
                      type="text"
                      className="adm-quick-color-input-hex"
                      value={form.color}
                      onChange={handleColorInput}
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order */}
            <div className="adm-quick-form-section">
              <div className="adm-quick-form-section-title">
                {isHindi ? 'क्रम' : 'Order'}
              </div>
              <div className="adm-quick-form-row">
                <div className="adm-quick-form-col" style={{ flex: '0 0 140px' }}>
                  <FormGroup>
                    <Label className="adm-quick-form-label" for="quickOrder">
                      {isHindi ? 'क्रम संख्या' : 'Order Number'}
                    </Label>
                    <Input
                      id="quickOrder"
                      type="number"
                      className="adm-quick-form-input"
                      min={1}
                      value={form.order}
                      onChange={e =>
                        setForm({ ...form, order: parseInt(e.target.value, 10) || 1 })
                      }
                    />
                  </FormGroup>
                </div>
                <div className="adm-quick-form-col" style={{ flex: '1 1 auto' }}>
                  <FormGroup>
                    <Label className="adm-quick-form-label" for="quickStatus">
                      {isHindi ? 'स्थिति' : 'Status'}
                    </Label>
                    <FormGroup switch>
                      <Input
                        type="switch"
                        id="quickStatus"
                        checked={form.isActive}
                        onChange={e => setForm({ ...form, isActive: e.target.checked })}
                      />
                      <Label check for="quickStatus" className="fw-semibold small">
                        <FaToggleOn style={{ fontSize: '10px', marginRight: '4px' }} />
                        {isHindi ? 'होमपेज पर सक्रिय' : 'Active on Homepage'}
                      </Label>
                    </FormGroup>
                  </FormGroup>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="adm-quick-form-section">
              <div className="adm-quick-form-section-title">
                {isHindi ? 'लाइव पूर्वावलोकन' : 'Live Preview'}
              </div>
              <div className="adm-quick-preview-box">
                <span className="adm-quick-preview-label">
                  {isHindi ? 'होमपेज कार्ड' : 'Homepage Card'}
                </span>
                <div className="adm-quick-preview-wrap">
                  <div
                    className="adm-quick-preview-card"
                    style={{ '--tile-color': form.color, '--tile-bg': form.bg }}
                  >
                    <div
                      className="adm-quick-preview-icon"
                      style={{ '--tile-color': form.color, '--tile-bg': form.bg }}
                    >
                      <PreviewIcon />
                    </div>
                    <div className="adm-quick-preview-title">
                      {form.titleEn || 'Preview Title'}
                    </div>
                    <div className="adm-quick-preview-sub">
                      {form.titleHi || 'हिंदी शीर्षक'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ModalFooter className="adm-quick-modal-footer">
              <Button
                color="light"
                onClick={() => setModal(false)}
                disabled={saving}
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                className="adm-quick-add-btn"
                disabled={saving}
                style={{ padding: '0.5rem 1.4rem' }}
              >
                {saving ? <Spinner size="sm" className="me-1" /> : null}
                {editId
                  ? isHindi
                    ? 'अपडेट करें'
                    : 'Update Card'
                  : isHindi
                    ? 'जोड़ें'
                    : 'Add Card'}
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
    </div>
  );
};

export default QuickAccessManagement;