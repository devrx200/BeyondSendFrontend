import { useState, useEffect, useRef } from "react";

import {
    Card, CardBody, CardHeader, Button, Form,
    Input, Table, Row, Col, Badge,
    Spinner, FormGroup, Label
} from "reactstrap";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "reactstrap";

import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus, FaList, FaTrash, FaFilePdf, FaVideo } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const HelpGuidance = () => {

    const token = sessionStorage.getItem("authToken");
    const [errors, setErrors] = useState({});

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
    const multipartHeaders = {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
    };

    const initialForm = {
        title: "",
        description: "",
        contentType: "VIDEO",
        videoUrl: "",
        order: "",
        status: "ACTIVE"
    };

    const [form, setForm] = useState(initialForm);
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    const formRef = useRef(null);

    /* ================= FETCH ================= */
    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/get-help-guidance`, authHeaders);
            setData(res.data.data || []);
        } catch {
            Swal.fire("Error", "Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const validateField = (name, value) => {

        let message = "";
        const textRegex = /^[A-Za-z\s]+$/;

        if (name === "title") {

            if (!value.trim()) {
                message = "Title is required";
            }
            else if (value.trim().length < 5) {
                message = "Title must be at least 5 characters";
            }
            else if (value.trim().length > 50) {
                message = "Title cannot exceed 50 characters";
            }
            else if (!textRegex.test(value)) {
                message = "Title should contain only letters";
            }

        }

        if (name === "description") {

            if (!value.trim()) {
                message = "Description is required";
            }
            else if (value.trim().length < 10) {
                message = "Description must be at least 10 characters";
            }
            else if (!textRegex.test(value)) {
                message = "Description should contain only letters";
            }

        }

        if (name === "videoUrl" && form.contentType === "VIDEO") {

            if (!value.trim()) {
                message = "Video URL is required";
            }

        }

        setErrors((prev) => ({
            ...prev,
            [name]: message
        }));
    };

    /* ================= SUBMIT ================= */
    const handleFinalSubmit = async () => {

        if (!form.title) {
            Swal.fire("Required", "Title is required", "warning");
            return;
        }

        if (!form.order || form.order < 1) {
            Swal.fire("Required", "Order must be greater than 0", "warning");
            return;
        }

        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("description", form.description);
        fd.append("contentType", form.contentType);
        fd.append("order", form.order);
        fd.append("status", form.status);


        if (form.contentType === "VIDEO") {
            fd.append("videoUrl", form.videoUrl);
        }

        if (form.contentType === "PDF" && file) {
            fd.append("file", file);
        }

        try {
            setBtnLoading(true);

            if (isEdit) {
                await axios.put(
                    `${API_URL}/api/update-help-guidance/${editId}`,
                    fd,
                    multipartHeaders
                );
                Swal.fire("Updated", "Updated successfully", "success");
            } else {
                await axios.post(
                    `${API_URL}/api/create-help-guidance`,
                    fd,
                    multipartHeaders
                );
                Swal.fire("Success", "Added successfully", "success");
            }

            setForm(initialForm);
            setFile(null);
            setIsEdit(false);
            setEditId(null);
            fetchData();

        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Failed", "error");
        } finally {
            setBtnLoading(false);
        }
    };


    /* ================= Update ================= */
    const handleEdit = (item) => {
        setForm({
            title: item.title,
            description: item.description,
            contentType: item.contentType?.toUpperCase(),
            videoUrl: item.videoUrl || "",
            order: item.order || "",
            status: item.status?.toUpperCase()
        });

        setEditId(item._id);
        setIsEdit(true);
        if (isEdit && formRef.current) {
            formRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(
                    `${API_URL}/api/delete-help-guidance/${id}`,
                    authHeaders
                );

                Swal.fire("Deleted!", "Deleted successfully", "success");
                fetchData();

            } catch {
                Swal.fire("Error", "Delete failed", "error");
            }
        }
    };

    const pdfData = data
        .filter(item => item.contentType?.toLowerCase() === "pdf")
        .sort((a, b) => Number(a.order) - Number(b.order));

    const videoData = data
        .filter(item => item.contentType?.toLowerCase() === "video")
        .sort((a, b) => Number(a.order) - Number(b.order));


    return (
        <div className="shadow">

            {/* FORM */}
            <Row>
                <Col md={12}>
                    <div ref={formRef}>
                        <Card className="shadow-sm mb-5">
                            <CardHeader className="bg-primary text-white">
                                <FaPlus className="me-2" />
                                {isEdit ? "Update Help & Guidance" : "Add Help & Guidance"}
                            </CardHeader>
                            <CardBody>
                                <Form onSubmit={(e) => {
                                    e.preventDefault();
                                    setPreviewOpen(true);
                                }}>

                                    <Row>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label>Title</Label>
                                                <Input
                                                    value={form.title}
                                                    maxLength={50}
                                                    invalid={!!errors.title}
                                                    onChange={(e) => {
                                                        setForm({ ...form, title: e.target.value });
                                                        validateField("title", e.target.value);
                                                    }}

                                                />
                                                {errors.title && (
                                                    <small className="text-danger">{errors.title}</small>
                                                )}
                                            </FormGroup>
                                        </Col>

                                        <Col md={6}>
                                            <FormGroup>
                                                <Label>Content Type</Label>
                                                <Input
                                                    type="select"
                                                    value={form.contentType}
                                                    onChange={e => setForm({ ...form, contentType: e.target.value })}
                                                >
                                                    <option value="VIDEO">Video URL</option>
                                                    <option value="PDF">PDF</option>
                                                </Input>
                                            </FormGroup>
                                        </Col>
                                    </Row>


                                    <Row>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label>Order</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={form.order || ""}
                                                    onChange={(e) =>
                                                        setForm({ ...form, order: e.target.value })
                                                    }
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={12}>
                                            <FormGroup>
                                                <Label>Description</Label>
                                                <Input
                                                    type="textarea"
                                                    rows="3"
                                                    value={form.description}
                                                    invalid={!!errors.description}
                                                    onChange={(e) => {
                                                        setForm({ ...form, description: e.target.value });
                                                        validateField("description", e.target.value);
                                                    }}
                                                />

                                                {errors.description && (
                                                    <small className="text-danger">{errors.description}</small>
                                                )}

                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    {form.contentType === "VIDEO" && (
                                        <Row>
                                            <Col md={12}>
                                                <FormGroup>
                                                    <Label>Video URL</Label>
                                                    <Input
                                                        type="url"
                                                        value={form.videoUrl}
                                                        invalid={!!errors.videoUrl}
                                                        onChange={(e) => {
                                                            setForm({ ...form, videoUrl: e.target.value });
                                                            validateField("videoUrl", e.target.value);
                                                        }}
                                                    />

                                                    {errors.videoUrl && (
                                                        <small className="text-danger">{errors.videoUrl}</small>
                                                    )}

                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    )}

                                    {form.contentType === "PDF" && (
                                        <Row>
                                            <Col md={12}>
                                                <FormGroup>
                                                    <Label>Upload PDF</Label>
                                                    <Input
                                                        type="file"
                                                        accept="application/pdf"
                                                        onChange={e => setFile(e.target.files[0])}
                                                    />

                                                    {/* Show existing PDF if editing */}
                                                    {isEdit && !file && (
                                                        <div className="mt-2">
                                                            <small className="text-muted">
                                                                Current File:
                                                            </small>
                                                            <br />
                                                            <a
                                                                href={`${API_URL}${data.find(d => d._id === editId)?.pdfUrl}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                View Existing PDF
                                                            </a>
                                                        </div>
                                                    )}
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    )}

                                    <Row>
                                        <Col md={12}>
                                            <Label>Status</Label><br />
                                            <Input
                                                type="radio"
                                                name="status"
                                                checked={form.status === "ACTIVE"}
                                                onChange={() => setForm({ ...form, status: "ACTIVE" })}
                                            /> Active
                                            {"  "}
                                            <Input
                                                type="radio"
                                                name="status"
                                                checked={form.status === "INACTIVE"}
                                                onChange={() => setForm({ ...form, status: "INACTIVE" })}
                                            /> Inactive
                                        </Col>
                                    </Row>

                                    <Row className="mt-4 text-center">
                                        <Col>
                                            <Button color="primary" disabled={btnLoading}>
                                                {btnLoading ? <Spinner size="sm" /> : (isEdit ? "Update" : "Add")}
                                            </Button>
                                            {"  "}
                                            <Button
                                                color="secondary"
                                                onClick={() => {
                                                    setForm(initialForm);
                                                    setIsEdit(false);
                                                    setEditId(null);
                                                    setFile(null);
                                                }}
                                            >
                                                Reset
                                            </Button>
                                        </Col>
                                    </Row>

                                </Form>
                            </CardBody>
                        </Card>
                    </div>
                </Col>
            </Row>


            <Modal isOpen={previewOpen} toggle={() => setPreviewOpen(false)} size="lg">
                <ModalHeader toggle={() => setPreviewOpen(false)}>
                    Preview Help & Guidance
                </ModalHeader>

                <ModalBody>

                    <p><strong>Title:</strong> {form.title}</p>

                    <p><strong>Description:</strong> {form.description}</p>

                    <p><strong>Content Type:</strong> {form.contentType}</p>

                    <p><strong>Order:</strong> {form.order}</p>

                    {form.contentType === "VIDEO" && (
                        <p>
                            <strong>Video URL:</strong> {form.videoUrl}
                        </p>
                    )}

                    {form.contentType === "PDF" && file && (
                        <p>
                            <strong>PDF File:</strong> {file.name}
                        </p>
                    )}

                    <p><strong>Status:</strong> {form.status}</p>

                </ModalBody>

                <ModalFooter>
                    <Button color="secondary" onClick={() => setPreviewOpen(false)}>
                        Cancel
                    </Button>

                    <Button
                        color="primary"
                        onClick={() => {
                            setPreviewOpen(false);
                            handleFinalSubmit();
                        }}
                    >
                        Confirm & Submit
                    </Button>
                </ModalFooter>
            </Modal>

            {/* TABLE */}
            <Row>
                <Col md={12}>
                    <Card className="shadow">
                        <CardHeader className="bg-dark text-white">
                            <FaList className="me-2" /> Help & Guidance Pdf List
                        </CardHeader>
                        <CardBody>

                            {loading ? <Spinner /> : (
                                <Table bordered hover>
                                    <thead className="table-light">
                                        <tr>
                                            <th>order</th>
                                            <th>Title</th>
                                            <th>Description</th>
                                            <th>Type</th>
                                            <th>Content</th>
                                            <th>Status</th>
                                            <th>Action</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pdfData.map((item, i) => (

                                            <tr key={item._id}>
                                                <td>{item.order}</td>
                                                <td>{item.title}</td>
                                                <td>{item.description}</td>
                                                <td>
                                                    {item.contentType === "pdf"
                                                        ? <FaFilePdf color="red" />
                                                        : <FaVideo color="blue" />}
                                                </td>
                                                <td>
                                                    {item.contentType === "pdf"
                                                        ? (
                                                            <a
                                                                href={`${API_URL}${item.pdfUrl}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                download
                                                            >
                                                                Download
                                                            </a>
                                                        )
                                                        : (
                                                            <a href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                                                                Watch
                                                            </a>
                                                        )}
                                                </td>
                                                <td>
                                                    <Badge color={item.status === "active" ? "success" : "danger"}>
                                                        {item.status?.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        color="warning"
                                                        className="me-2"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        Edit
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        color="danger"
                                                        onClick={() => handleDelete(item._id)}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}

                        </CardBody>
                    </Card>
                </Col>
                <Col md={12}>
                    <Card className="shadow">+
                        <CardHeader className="bg-dark text-white">
                            <FaList className="me-2" /> Help & Guidance Video List
                        </CardHeader>
                        <CardBody>

                            {loading ? <Spinner /> : (
                                <Table bordered hover>
                                    <thead className="table-light">
                                        <tr>
                                            <th>order</th>
                                            <th>Title</th>
                                            <th>Description</th>
                                            <th>Type</th>
                                            <th>Content</th>
                                            <th>Status</th>
                                            <th>Action</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {videoData.map((item, i) => (

                                            <tr key={item._id}>
                                                <td>{item.order}</td>
                                                <td>{item.title}</td>
                                                <td>{item.description}</td>
                                                <td>
                                                    {item.contentType === "pdf"
                                                        ? <FaFilePdf color="red" />
                                                        : <FaVideo color="blue" />}
                                                </td>
                                                <td>
                                                    {item.contentType === "pdf"
                                                        ? (
                                                            <a
                                                                href={`${API_URL}${item.pdfUrl}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                download
                                                            >
                                                                Download
                                                            </a>
                                                        )
                                                        : (
                                                            <a href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                                                                Watch
                                                            </a>
                                                        )}
                                                </td>
                                                <td>
                                                    <Badge color={item.status === "active" ? "success" : "danger"}>
                                                        {item.status?.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        color="warning"
                                                        className="me-2"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        Edit
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        color="danger"
                                                        onClick={() => handleDelete(item._id)}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}

                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default HelpGuidance;