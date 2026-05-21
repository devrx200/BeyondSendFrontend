import { useState, useEffect } from "react";
import {
    Card, CardBody, Button, Table,
    Form, FormGroup, Label, Input, Badge, Row, Col
} from "reactstrap";
import {
    FaSchool, FaPlus, FaEdit, FaTrash, FaBolt,
    FaFont, FaLanguage, FaMapMarkerAlt, FaLayerGroup, FaBookOpen,
    FaGraduationCap, FaTimes, FaCheck
} from "react-icons/fa";
import axios from "axios";
import { confirmDelete, swalSuccess, swalError } from "../../utilies/swalHelper";
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
            swalError("Error", "Failed to load colleges");
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

                swalSuccess("Updated", "College updated successfully");
            } else {
                await axios.post(
                    `${API_URL}/api/create-college`,
                    payload ,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                swalSuccess("Created", "College created successfully");
            }

            toggleModal();
            loadColleges();
        } catch (error) {
            swalError("Error", error.response?.data?.message || "Operation failed");
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
        const ok = await confirmDelete({
            title: isHindi ? "क्या आप निश्चित हैं?" : "Are you sure?",
            text: isHindi ? "यह कॉलेज हटाया जाएगा" : "This college will be deleted",
            confirmButtonText: isHindi ? "हाँ, हटाएँ" : "Yes, delete",
            cancelButtonText: isHindi ? "रद्द करें" : "Cancel"
        });
        if (!ok) return;

        try {
            await axios.delete(
                `${API_URL}/api/delete-college/${id}`
            );

            swalSuccess("Deleted", "College deleted successfully");
            loadColleges();
        } catch (error) {
            swalError("Error", "Delete failed");
        }
    };

    return (
        <>
            {/* PAGE HEADER */}
            <div className="adm-page-head">
                <div>
                    <h3 className="adm-page-title">
                        <FaSchool /> {isHindi ? "महाविद्यालय प्रबंधन" : "College Management"}
                    </h3>
                    <p className="adm-page-subtitle">
                        {isHindi ? "कॉलेज जोड़ें, संपादित करें और हटाएँ" : "Add, edit and manage colleges"}
                    </p>
                </div>

                {!modal && (
                    <Button color="primary" onClick={toggleModal}>
                        <FaPlus className="me-2" />
                        {isHindi ? "नया कॉलेज" : "Add College"}
                    </Button>
                )}
            </div>

            {/* INLINE FORM CARD */}
            {modal && (
                <div className="adm-form-card">
                    <div className="adm-form-card-header">
                        <div className="adm-form-card-icon"><FaSchool /></div>
                        <div className="adm-form-card-titles">
                            <h4 className="adm-form-card-title">
                                {editing
                                    ? isHindi ? "कॉलेज संपादित करें" : "Edit College"
                                    : isHindi ? "नया कॉलेज जोड़ें" : "Add New College"}
                            </h4>
                            <p className="adm-form-card-subtitle">
                                <FaBolt /> {isHindi ? "विवरण भरें और सहेजें" : "Fill the details below and save"}
                            </p>
                        </div>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        <div className="adm-form-card-body">
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label><FaFont /> {isHindi ? "नाम (अंग्रेजी)" : "Name (English)"} <span className="text-danger">*</span></Label>
                                        <Input
                                            name="nameEn"
                                            placeholder={isHindi ? "अंग्रेजी में नाम दर्ज करें" : "e.g. Government Engineering College, Raipur"}
                                            value={formData.nameEn}
                                            onChange={handleChange}
                                            required
                                        />
                                    </FormGroup>
                                </Col>

                                <Col md={6}>
                                    <FormGroup>
                                        <Label><FaLanguage /> {isHindi ? "नाम (हिंदी)" : "Name (Hindi)"}</Label>
                                        <Input
                                            name="nameHi"
                                            placeholder="जैसे - शासकीय इंजीनियरिंग कॉलेज, रायपुर"
                                            value={formData.nameHi}
                                            onChange={handleChange}
                                        />
                                    </FormGroup>
                                </Col>

                                <Col md={6}>
                                    <FormGroup>
                                        <Label><FaMapMarkerAlt /> {isHindi ? "स्थान" : "Location"} <span className="text-danger">*</span></Label>
                                        <Input
                                            name="location"
                                            placeholder={isHindi ? "जिला / शहर" : "City / District"}
                                            value={formData.location}
                                            onChange={handleChange}
                                            required
                                        />
                                    </FormGroup>
                                </Col>

                                <Col md={6}>
                                    <FormGroup>
                                        <Label><FaLayerGroup /> {isHindi ? "प्रकार" : "Type"} <span className="text-danger">*</span></Label>
                                        <Input type="select" name="type" value={formData.type} onChange={handleChange} required>
                                            <option value="">{isHindi ? "चुनें" : "Select type"}</option>
                                            <option value="Government">Government</option>
                                            <option value="Private">Private</option>
                                            <option value="Aided">Aided</option>
                                        </Input>
                                    </FormGroup>
                                </Col>

                                <Col md={6}>
                                    <FormGroup>
                                        <Label><FaBookOpen /> {isHindi ? "पाठ्यक्रम (कॉमा से अलग)" : "Courses (comma separated)"}</Label>
                                        <Input
                                            name="courses"
                                            placeholder={isHindi ? "उदा. B.Tech, M.Tech, BCA" : "e.g. B.Tech, M.Tech, BCA"}
                                            value={formData.courses}
                                            onChange={handleChange}
                                        />
                                    </FormGroup>
                                </Col>

                                <Col md={6}>
                                    <FormGroup>
                                        <Label><FaGraduationCap /> {isHindi ? "कॉलेज स्तर" : "College Level"} <span className="text-danger">*</span></Label>
                                        <Input
                                            type="select"
                                            name="collegeLevel"
                                            value={formData.collegeLevel}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">{isHindi ? "चुनें" : "Select level"}</option>
                                            <option value="UG">{isHindi ? "स्नातक (UG)" : "UG"}</option>
                                            <option value="PG">{isHindi ? "स्नातकोत्तर (PG)" : "PG"}</option>
                                        </Input>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </div>

                        <div className="adm-form-card-footer">
                            <div className="adm-actions-left">
                                <Button outline color="secondary" type="button" onClick={toggleModal}>
                                    <FaTimes className="me-1" /> {isHindi ? "रद्द करें" : "Cancel"}
                                </Button>
                            </div>
                            <div className="adm-actions-right">
                                <Button color="primary" type="submit">
                                    <FaCheck className="me-1" /> {editing ? (isHindi ? "अद्यतन करें" : "Update College") : (isHindi ? "सहेजें" : "Save College")}
                                </Button>
                            </div>
                        </div>
                    </Form>
                </div>
            )}

            {/* DATA TABLE */}
            <Card className="adm-card">
                <CardBody className="p-0">
                    <Table responsive hover striped className="mb-0">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>{isHindi ? "नाम" : "Name"}</th>
                                <th>{isHindi ? "स्थान" : "Location"}</th>
                                <th>{isHindi ? "प्रकार" : "Type"}</th>
                                <th>{isHindi ? "कॉलेज स्तर" : "College Level"}</th>
                                <th>{isHindi ? "पाठ्यक्रम" : "Courses"}</th>
                                <th width="140">{isHindi ? "कार्य" : "Actions"}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        Loading...
                                    </td>
                                </tr>
                            ) : colleges.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-4">
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
                </CardBody>
            </Card>
        </>
    );
};

export default CollegeManagement;
