import { useState, useEffect } from "react";
import {
    Card, CardBody, Button, Table, Modal,
    ModalHeader, ModalBody, ModalFooter,
    Form, FormGroup, Label, Input, Badge, Row, Col
} from "reactstrap";
import { FaSchool, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
const initialForm = {
    nameEn: "",
    nameHi: "",
    location: "",
    type: "",
    courses: "",
    collegeLevel: "",
    isActive: true,
};

const CollegeManagement = () => {
    const { isHindi } = useLanguage();

    const [colleges, setColleges] = useState([]);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);

    /* ================= LOAD COLLEGES ================= */
    const loadColleges = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${API_URL}/api/get-all-college`
            );
            setColleges(res.data || []);
        } catch (error) {
            Swal.fire("Error", "Failed to load colleges", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadColleges();
    }, []);

    /* ================= MODAL ================= */
    const toggleModal = () => {
        setModal(!modal);
        if (modal) {
            setEditing(null);
            setFormData(initialForm);
        }
    };

    /* ================= INPUT CHANGE ================= */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /* ================= CREATE / UPDATE ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            courses: formData.courses
                ? formData.courses.split(",").map(c => c.trim())
                : [],
        };

        try {
            if (editing) {
                await axios.put(
                    `${API_URL}/api/update-college/${editing._id}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                Swal.fire("Updated", "College updated successfully", "success");
            } else {
                await axios.post(
                    `${API_URL}/api/create-college`,
                    payload ,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                Swal.fire("Created", "College created successfully", "success");
            }

            toggleModal();
            loadColleges();
        } catch (error) {
            Swal.fire(
                "Error",
                error.response?.data?.message || "Operation failed",
                "error"
            );
        }
    };

    /* ================= EDIT ================= */
    const handleEdit = (college) => {
        setEditing(college);
        setFormData({
            ...college,
            courses: college.courses?.join(", "),
        });
        setModal(true);
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: isHindi ? "क्या आप निश्चित हैं?" : "Are you sure?",
            text: isHindi
                ? "यह कॉलेज हटाया जाएगा"
                : "This college will be deleted",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: isHindi ? "हाँ, हटाएँ" : "Yes, delete",
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(
                `${API_URL}/api/delete-college/${id}`
            );

            Swal.fire("Deleted", "College deleted successfully", "success");
            loadColleges();
        } catch (error) {
            Swal.fire("Error", "Delete failed", "error");
        }
    };

    return (
        <Card className="border-0 shadow-sm">
            <CardBody className="p-4">

                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="fw-bold mb-0">
                            <FaSchool className="me-2" />
                            {isHindi ? "महाविद्यालय प्रबंधन" : "College Management"}
                        </h4>
                        <small className="text-muted">
                            {isHindi ? "कॉलेज जोड़ें, संपादित करें और हटाएँ" : "Add, edit and manage colleges"}
                        </small>
                    </div>

                    <Button color="primary" onClick={toggleModal}>
                        <FaPlus className="me-2" />
                        {isHindi ? "नया कॉलेज" : "Add College"}
                    </Button>
                </div>

                {/* TABLE */}
                <Table responsive hover striped>
                    <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>{isHindi ? "नाम" : "Name"}</th>
                            <th>{isHindi ? "स्थान" : "Location"}</th>
                            <th>{isHindi ? "प्रकार" : "Type"}</th>
                            <th>{isHindi ? "कॉलेज स्तर" : "College Level"}</th>
                            <th>{isHindi ? "पाठ्यक्रम" : "Courses"}</th>
                            <th>{isHindi ? "कार्य" : "Actions"}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-4">
                                    Loading...
                                </td>
                            </tr>
                        ) : colleges.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center text-muted">
                                    {isHindi ? "कोई डेटा उपलब्ध नहीं है" : "No colleges available"}
                                </td>
                            </tr>
                        ) : (
                            colleges.map((c, i) => (
                                <tr key={c._id}>
                                    <td>{i + 1}</td>
                                    <td>{isHindi ? c.nameHi : c.nameEn}</td>
                                    <td>{c.location}</td>
                                    <td>
                                        <Badge color="info">{c.type}</Badge>
                                    </td>
                                    <td>
                                        <Badge color="warning">{c.collegeLevel}</Badge>  
                                    </td>
                                    <td>
                                        {c.courses?.map((course, idx) => (
                                            <Badge key={idx} color="secondary" className="me-1">
                                                {course}
                                            </Badge>
                                        ))}
                                    </td>
                                    <td>
                                        <Button
                                            size="sm"
                                            color="primary"
                                            className="me-1"
                                            onClick={() => handleEdit(c)}
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            onClick={() => handleDelete(c._id)}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>

                {/* MODAL */}
                <Modal isOpen={modal} toggle={toggleModal} size="lg">
                    <ModalHeader toggle={toggleModal}>
                        {editing
                            ? isHindi ? "कॉलेज संपादित करें" : "Edit College"
                            : isHindi ? "नया कॉलेज जोड़ें" : "Add College"}
                    </ModalHeader>

                    <Form onSubmit={handleSubmit}>
                        <ModalBody>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>{isHindi ? "नाम (अंग्रेजी)" : "Name (English)"}</Label>
                                        <Input name="nameEn" value={formData.nameEn} onChange={handleChange} required />
                                    </FormGroup>
                                </Col>

                                <Col md={6}>
                                    <FormGroup>
                                        <Label>{isHindi ? "नाम (हिंदी)" : "Name (Hindi)"}</Label>
                                        <Input name="nameHi" value={formData.nameHi} onChange={handleChange} />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>{isHindi ? "स्थान" : "Location"}</Label>
                                        <Input name="location" value={formData.location} onChange={handleChange} required />
                                    </FormGroup>
                                </Col>

                                <Col md={6}>
                                    <FormGroup>
                                        <Label>{isHindi ? "प्रकार" : "Type"}</Label>
                                        <Input type="select" name="type" value={formData.type} onChange={handleChange} required>
                                            <option value="">{isHindi ? "चुनें" : "Select"}</option>
                                            <option value="Government">Government</option>
                                            <option value="Private">Private</option>
                                            <option value="Aided">Aided</option>
                                        </Input>
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>{isHindi ? "पाठ्यक्रम (कॉमा से अलग)" : "Courses (comma separated)"}</Label>
                                        <Input name="courses" value={formData.courses} onChange={handleChange} />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>
                                            {isHindi ? "कॉलेज स्तर" : "College Level"} <span className="text-danger">*</span>
                                        </Label>

                                        <Input
                                            type="select"
                                            name="collegeLevel"
                                            value={formData.collegeLevel}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">{isHindi ? "चुनें" : "Select"}</option>
                                            <option value="UG">{isHindi ? "स्नातक (UG)" : "UG"}</option>
                                            <option value="PG">{isHindi ? "स्नातकोत्तर (PG)" : "PG"}</option>
                                        </Input>

                                    </FormGroup>
                                </Col>
                            </Row>
                        </ModalBody>

                        <ModalFooter>
                            <Button color="primary" type="submit">
                                {isHindi ? "सहेजें" : "Save"}
                            </Button>
                            <Button color="secondary" onClick={toggleModal}>
                                {isHindi ? "रद्द करें" : "Cancel"}
                            </Button>
                        </ModalFooter>
                    </Form>
                </Modal>

            </CardBody>
        </Card>
    );
};

export default CollegeManagement;
