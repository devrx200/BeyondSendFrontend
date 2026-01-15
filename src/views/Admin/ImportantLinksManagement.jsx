import React, { useEffect, useState } from "react";
import {
    Card, CardBody, Button, Table,
    Modal, ModalHeader, ModalBody, ModalFooter,
    FormGroup, Label, Input, Row, Col, Badge
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import IconPicker from "../../components/IconPicker";
import { ICONS } from "../../utilies/icons";
import { FaEdit, FaTrash } from "react-icons/fa";

const ImportantLinksManagement = () => {
    const API = import.meta.env.VITE_API_URL;

    const [links, setLinks] = useState([]);
    const [modal, setModal] = useState(false);
    const [iconModal, setIconModal] = useState(false);
    const [editId, setEditId] = useState(null);

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
        const res = await axios.get(`${API}/api/important-links-for-admin`);
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

    /* ================= SAVE ================= */
    const saveLink = async () => {
        if (!form.titleEng || !form.url) {
            return Swal.fire("Validation", "English title & URL required", "warning");
        }

        if (editId) {
            await axios.put(`${API}/api/important-links/${editId}`, form);
        } else {
            await axios.post(`${API}/api/important-links`, form);
        }

        Swal.fire("Success", "Link saved successfully", "success");
        setModal(false);
        loadLinks();
    };

    /* ================= DELETE ================= */
    const deleteLink = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete this link?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33"
        });

        if (!confirm.isConfirmed) return;

        await axios.delete(`${API}/api/important-links/${id}`);
        Swal.fire("Deleted", "Link removed", "success");
        loadLinks();
    };

    return (
        <Card className="border-0 shadow-sm">
            <CardBody>
                <div className="d-flex justify-content-between mb-3">
                    <h5 className="mb-0">Important Links Management</h5>
                    <Button color="primary" size="sm" onClick={openAdd}>
                        + Add Link
                    </Button>
                </div>

                <Table bordered responsive>
                    <thead className="table-light">
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
                        {links.map((l, i) => {
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
                                        <Button size="sm" color="info" onClick={() => openEdit(l)}>
                                           <FaEdit />
                                        </Button>{" "}
                                        <Button size="sm" color="danger" onClick={() => deleteLink(l._id)}>
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </CardBody>

            {/* ================= MODAL ================= */}
            <Modal isOpen={modal} toggle={() => setModal(false)} size="lg">
                <ModalHeader toggle={() => setModal(false)}>
                    {editId ? "Edit Link" : "Add Link"}
                </ModalHeader>

                <ModalBody>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label>Title (English) *</Label>
                                <Input
                                    value={form.titleEng}
                                    onChange={e => setForm({ ...form, titleEng: e.target.value })}
                                />
                            </FormGroup>
                        </Col>

                        <Col md={6}>
                            <FormGroup>
                                <Label>Title (Hindi)</Label>
                                <Input
                                    value={form.titleHin}
                                    onChange={e => setForm({ ...form, titleHin: e.target.value })}
                                />
                            </FormGroup>
                        </Col>

                        <Col md={12}>
                            <FormGroup>
                                <Label>URL *</Label>
                                <Input
                                    value={form.url}
                                    onChange={e => setForm({ ...form, url: e.target.value })}
                                />
                            </FormGroup>
                        </Col>

                        <Col md={12}>
                            <FormGroup>
                                <Label className="fw-semibold">Search & Select Icon *</Label>

                                <div className="d-flex align-items-center gap-3 mt-1">
                                    {/* Select Button */}
                                    <Input
                                        size="sm"
                                        placeholder="Search And Select Icon"
                                        color="secondary"
                                        onClick={() => setIconModal(true)}
                                    >
                                        Search & Choose Icon
                                    </Input>

                                    {/* Selected Icon Preview */}
                                    {form.icon && ICONS[form.icon] && (() => {
                                        const IconComponent = ICONS[form.icon];
                                        return (
                                            <Badge
                                                color="dark"
                                                pill
                                                className="d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
                                                style={{ fontSize: "12px" }}
                                            >
                                                <IconComponent size={14} />
                                                {form.icon}
                                            </Badge>
                                        );
                                    })()}
                                </div>
                            </FormGroup>
                        </Col>


                        <Col md={3}>
                            <FormGroup check className="mt-4">
                                <Input
                                    type="checkbox"
                                    checked={form.isExternal}
                                    onChange={e => setForm({ ...form, isExternal: e.target.checked })}
                                />{" "}
                                External
                            </FormGroup>
                        </Col>

                        <Col md={3}>
                            <FormGroup check className="mt-4">
                                <Input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                />{" "}
                                Active
                            </FormGroup>
                        </Col>
                    </Row>
                </ModalBody>

                <ModalFooter className="d-flex justify-content-between">
                    <Button color="secondary" onClick={() => setModal(false)}>
                        Cancel
                    </Button>
                    <Button color="primary" onClick={saveLink}>
                        Save
                    </Button>
                </ModalFooter>
            </Modal>

            {/* ICON PICKER */}
            <IconPicker
                isOpen={iconModal}
                toggle={() => setIconModal(false)}
                onSelect={(icon) => setForm({ ...form, icon })}
            />
        </Card>
    );
};

export default ImportantLinksManagement;
