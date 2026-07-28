import React, { useEffect, useState } from "react";
import {
    Card, CardBody, Button, Table, Form,
    FormGroup, Label, Input, Row, Col, Badge,
    CardHeader
} from "reactstrap";
import axios from "axios";
import IconPicker from "../../components/IconPicker";
import { ICONS } from "../../utilities/icons";
import {
    FaEdit, FaTrash, FaLink, FaBolt, FaPlus, FaTimes, FaCheck,
    FaGlobe, FaToggleOn, FaImage, FaLanguage, FaFont
} from "react-icons/fa";
import { confirmDelete, swalSuccess, swalWarn, swalError } from "../../utilities/swalHelper";

const HINDI_TEXT_ONLY = /^[\u0900-\u097F .,!?'"()\-\n\r]+$/;
const ENGLISH_TEXT_ONLY = /^[A-Za-z .,!?'"()\-\n\r]+$/;
const URL_REGEX = /^(https?:\/\/|\/)[^\s]+$/;

const ImportantLinksManagement = () => {
    const API = import.meta.env.VITE_API_URL;
    const token = sessionStorage.getItem("authToken");
    const [links, setLinks] = useState([]);
    const [modal, setModal] = useState(false);
    const [iconModal, setIconModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        titleEng: "",
        titleHin: "",
        url: "",
        isExternal: true,
        icon: "FaInfoCircle",
        isActive: true
    });

    /* ================= LOAD ================= */
    const loadLinks = async () => {
        const res = await axios.get(`${API}/api/important-links-for-admin`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setLinks(res.data.data || []);
    };

    useEffect(() => {
        loadLinks();
    }, []);

    /* ================= OPEN ADD ================= */
    const openAdd = () => {
        setEditId(null);
        setForm({
            titleEng: "",
            titleHin: "",
            url: "",
            isExternal: true,
            icon: "FaInfoCircle",
            isActive: true
        });
        setModal(true);
    };

    /* ================= OPEN EDIT ================= */
    const openEdit = (item) => {
        setEditId(item._id);
        setForm({
            titleEng: item.titleEng,
            titleHin: item.titleHin,
            url: item.url,
            isExternal: item.isExternal,
            icon: item.icon,
            isActive: item.isActive
        });
        setModal(true);
    };
    const validateField = (name, value) => {
        if (!value || !value.toString().trim()) {
            return "This field is required";
        }

        switch (name) {
            case "titleEng":
                if (!ENGLISH_TEXT_ONLY.test(value))
                    return "Only English characters allowed";
                break;

            case "titleHin":
                if (value && !HINDI_TEXT_ONLY.test(value))
                    return "केवल हिंदी अक्षर मान्य हैं";
                break;

            case "url":
                if (!URL_REGEX.test(value))
                    return "Invalid URL (must start with / or http)";
                break;

            case "icon":
                if (!value)
                    return "Icon selection is required";
                break;

            default:
                break;
        }

        return "";
    };
    const handleChange = (name, value) => {
        setForm(prev => ({
            ...prev,
            [name]: value
        }));

        const error = validateField(name, value);

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    /* ================= SAVE ================= */
    const saveLink = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!form.titleEng || !form.url) {
            return swalWarn("Validation", "English title & URL required");
        }

        try {
            if (editId) {
                await axios.put(`${API}/api/important-links/${editId}`, form,
                    { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(`${API}/api/important-links`, form,
                    { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
                );
            }

            swalSuccess("Saved", "Link saved successfully");
            setModal(false);
            loadLinks();
        } catch (err) {
            swalError("Error", err?.response?.data?.message || "Could not save link");
        }
    };

    /* ================= DELETE ================= */
    const deleteLink = async (id) => {
        const ok = await confirmDelete({
            title: "Delete this link?",
            text: "This action cannot be undone."
        });
        if (!ok) return;

        try {
            await axios.delete(`${API}/api/important-links/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            swalSuccess("Deleted", "Link removed successfully");
            loadLinks();
        } catch (err) {
            swalError("Error", err?.response?.data?.message || "Delete failed");
        }
    };

    return (
        <>
            {/* PAGE HEADER */}
            <Card className="adm-card mb-4">
                <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <h3 className="adm-page-title"><FaLink className="" /> Important Links Management</h3>
                        <p className="adm-page-subtitle mb-0 text-white">Manage quick-access links shown on the public site.</p>
                    </div>
                    {!modal && (
                        <Button color="primary" onClick={openAdd}>
                            <FaPlus className="me-1" /> Add Link
                        </Button>
                    )}
                </CardHeader>
            </Card>


            {/* INLINE FORM CARD (replaces modal) */}
            {modal && (
                <div className="adm-form-card">
                    <div className="adm-form-card-header">
                        <div className="adm-form-card-icon"><FaLink /></div>
                        <div className="adm-form-card-titles">
                            <h4 className="adm-form-card-title">
                                {editId ? "Edit Important Link" : "Add New Important Link"}
                            </h4>
                            <p className="adm-form-card-subtitle">
                                <FaBolt /> Fill the details below and save to publish on the site
                            </p>
                        </div>
                    </div>

                    <Form onSubmit={saveLink}>
                        <div className="adm-form-card-body">
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label><FaFont /> Title (English) <span className="text-danger">*</span></Label>
                                        <Input
                                            name="titleEng"
                                            placeholder="e.g. Department of Higher Education"
                                            value={form.titleEng}
                                            invalid={!!errors.titleEng}
                                            onChange={e => handleChange("titleEng", e.target.value)}
                                        />
                                        {errors.titleEng && <small className="text-danger">{errors.titleEng}</small>}
                                    </FormGroup>
                                </Col>

                                <Col md={6}>
                                    <FormGroup>
                                        <Label><FaLanguage /> Title (Hindi)</Label>
                                        <Input
                                            name="titleHin"
                                            placeholder="जैसे - उच्च शिक्षा विभाग"
                                            value={form.titleHin}
                                            invalid={!!errors.titleHin}
                                            onChange={e => handleChange("titleHin", e.target.value)}
                                        />
                                        {errors.titleHin && <small className="text-danger">{errors.titleHin}</small>}
                                    </FormGroup>
                                </Col>

                                <Col md={12}>
                                    <FormGroup>
                                        <Label><FaGlobe /> URL <span className="text-danger">*</span></Label>
                                        <Input
                                            placeholder="https://example.com or /internal-page"
                                            value={form.url}
                                            invalid={!!errors.url}
                                            onChange={e => handleChange("url", e.target.value)}
                                        />
                                        {errors.url && <small className="text-danger">{errors.url}</small>}
                                    </FormGroup>
                                </Col>

                                <Col md={12}>
                                    <FormGroup>
                                        <Label><FaImage /> Search &amp; Select Icon <span className="text-danger">*</span></Label>
                                        <div className="d-flex align-items-center gap-3 mt-1 flex-wrap">
                                            <Input
                                                size="sm"
                                                placeholder="Click to search and select an icon"
                                                readOnly
                                                onClick={() => setIconModal(true)}
                                                style={{ cursor: "pointer", maxWidth: 360 }}
                                            />
                                            {form.icon && ICONS[form.icon] && (() => {
                                                const IconComponent = ICONS[form.icon];
                                                return (
                                                    <Badge
                                                        color="dark"
                                                        pill
                                                        className="d-inline-flex align-items-center gap-2 px-3 py-2 shadow-sm"
                                                        style={{ fontSize: "12px" }}
                                                    >
                                                        <IconComponent size={14} />
                                                        {form.icon}
                                                    </Badge>
                                                );
                                            })()}
                                        </div>
                                        {errors.icon && <small className="text-danger d-block mt-1">{errors.icon}</small>}
                                    </FormGroup>
                                </Col>

                                <Col md={3}>
                                    <FormGroup check className="mt-4">
                                        <Input
                                            type="checkbox"
                                            checked={form.isExternal}
                                            onChange={e => setForm({ ...form, isExternal: e.target.checked })}
                                        />{" "}
                                        <Label check><FaGlobe className="me-1" /> External</Label>
                                    </FormGroup>
                                </Col>

                                <Col md={3}>
                                    <FormGroup check className="mt-4">
                                        <Input
                                            type="checkbox"
                                            checked={form.isActive}
                                            onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                        />{" "}
                                        <Label check><FaToggleOn className="me-1" /> Active</Label>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </div>

                        <div className="adm-form-card-footer">
                            <div className="adm-actions-left">
                                <Button outline color="secondary" type="button" onClick={() => setModal(false)}>
                                    <FaTimes className="me-1" /> Cancel
                                </Button>
                            </div>
                            <div className="adm-actions-right">
                                <Button color="primary" type="submit">
                                    <FaCheck className="me-1" /> {editId ? "Update Link" : "Save Link"}
                                </Button>
                            </div>
                        </div>
                    </Form>
                </div>
            )}

            {/* DATA TABLE */}
            <Card className="adm-card">
                <CardBody className="p-0">
                    <Table bordered responsive className="mb-0">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Icon</th>
                                <th>Title (EN)</th>
                                <th>Title (HI)</th>
                                <th>URL</th>
                                <th>External</th>
                                <th>Status</th>
                                <th width="160">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {links.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-4 text-muted">
                                        No links found.
                                    </td>
                                </tr>
                            ) : (
                                links.map((l, i) => {
                                    const Icon = ICONS[l.icon];
                                    return (
                                        <tr key={l._id}>
                                            <td>{i + 1}</td>
                                            <td>{Icon && <Icon size={18} />}</td>
                                            <td>{l.titleEng}</td>
                                            <td>{l.titleHin || "-"}</td>
                                            <td className="text-truncate" style={{ maxWidth: 180 }}>
                                                {l.url}
                                            </td>
                                            <td>
                                                <Badge color={l.isExternal ? "info" : "secondary"}>
                                                    {l.isExternal ? "Yes" : "No"}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge color={l.isActive ? "success" : "secondary"}>
                                                    {l.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button size="sm" color="info" className="me-1" onClick={() => openEdit(l)}>
                                                    <FaEdit />
                                                </Button>
                                                <Button size="sm" color="danger" onClick={() => deleteLink(l._id)}>
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>

            {/* ICON PICKER (kept as popup) */}
            <IconPicker
                isOpen={iconModal}
                toggle={() => setIconModal(false)}
                onSelect={(icon) => {
                    handleChange("icon", icon);
                    setIconModal(false);
                }}
            />
        </>
    );
};

export default ImportantLinksManagement;
