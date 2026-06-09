import { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    Button,
    Input,
    FormGroup,
    Label,
    Table, FormFeedback
} from "reactstrap";
import {
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaTrash,
    FaPlus,
    FaLink, FaEdit, FaSave, FaTimes,
    FaUser
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import "../../css/Footer.css";

const API = import.meta.env.VITE_API_URL;
 const token = sessionStorage.getItem("authToken");
const HINDI_TEXT_ONLY = /^[\u0900-\u097F .,!?'"()\-\n\r]+$/;
const HINDI_WITH_NUMBERS = /^[\u0900-\u097F0-9०-९ .,!?'"()\-\n\r]+$/;

const ENGLISH_TEXT_ONLY = /^[A-Za-z .,!?'"()\-\n\r]+$/;
const ENGLISH_WITH_NUMBERS = /^[A-Za-z0-9 .,!?'"()\-\n\r]+$/;

const PHONE_REGEX = /^(\+91[- ]?)?[6-9][0-9]{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FooterSection = () => {
    const [errors, setErrors] = useState({});
    const [footer, setFooter] = useState({
        contactInfo: {
            departmentNameHi: "",
            departmentNameEn: "",
            addressHi: "",
            addressEn: "",
            phone: "",
            email: "",
            organizerNameEn: "",
            organizerNameHi: "",
            organizerLogo: null,
        },
        quickLinks: [],
        importantLinks: [],
        socialLinks: [],
    });

    const [newLink, setNewLink] = useState({
        titleEn: "",
        titleHin: "",
        url: "",
        type: "quick",
    });
    const [newSocial, setNewSocial] = useState({
        platform: "",
        url: "",
    });
    const [editRow, setEditRow] = useState({
        type: null,
        index: null,
        data: null,   // MUST be null
    });

    const deleteAnyLink = async (type, link, index) => {
        const key =
            type === "social"
                ? "socialLinks"
                : type === "quick"
                    ? "quickLinks"
                    : "importantLinks";

        const confirm = await Swal.fire({
            title: "Delete this link?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes",
        });

        if (!confirm.isConfirmed) return;

        try {
            setFooter(prev => ({
                ...prev,
                [key]: prev[key].filter((_, i) => i !== index),
            }));

            if (link?._id) {
                await axios.delete(`${API}/api/delete-link/${type}/${link._id}`, {
                    headers: { "Content-Type": "application/json", "web-url": window.location.href, Authorization: `Bearer ${token}` },
                });
            }

            await saveFooterToDB({
                ...footer,
                [key]: footer[key].filter((_, i) => i !== index),
            });

            Swal.fire("Deleted", "Link removed successfully", "success");
        } catch (err) {
            Swal.fire("Error", "Delete failed", "error");
            fetchFooter();
        }
    };

    /* ================= LOAD ================= */
    useEffect(() => {
        fetchFooter();
    }, []);

    const fetchFooter = async () => {
        const { data } = await axios.get(`${API}/api/get-all-footer`, {
          headers: { "Content-Type": "application/json",  },
        });
        if (data) setFooter(data);
    };

    const validateField = (name, value, options = {}) => {
        const { isHindi = false, isTextarea = false } = options;

        if (!value || !value.trim()) {
            return isHindi ? "यह फ़ील्ड आवश्यक है" : "This field is required";
        }

        if (isHindi) {
            const regex = isTextarea ? HINDI_WITH_NUMBERS : HINDI_TEXT_ONLY;
            if (!regex.test(value)) {
                return isTextarea
                    ? "कृपया केवल हिंदी अक्षर और अंक प्रयोग करें"
                    : "कृपया केवल हिंदी अक्षर प्रयोग करें";
            }
        } else {
            const regex = isTextarea ? ENGLISH_WITH_NUMBERS : ENGLISH_TEXT_ONLY;
            if (!regex.test(value)) {
                return isTextarea
                    ? "Please enter English text and numbers only"
                    : "Please enter English text only";
            }
        }

        return "";
    };
    const validateRequired = (value) => {
        if (!value || !value.trim()) {
            return "This field is required";
        }
        return "";
    };
    const validateEnglish = (value) => {
        if (!value || !value.trim()) return "This field is required";
        if (!ENGLISH_TEXT_ONLY.test(value)) {
            return "Only English characters are allowed";
        }
        return "";
    };

    const validateHindi = (value) => {
        if (!value || !value.trim()) return "This field is required";
        if (!HINDI_TEXT_ONLY.test(value)) {
            return "केवल हिंदी अक्षर मान्य हैं";
        }
        return "";
    };
    const validateSocialUrl = (value) => {
        if (!value || !value.trim()) {
            return "This field is required";
        }
        // allow only real URLs for social
        if (!/^https?:\/\//i.test(value)) {
            return "Please enter full URL (https://...)";
        }
        return "";
    };

    const handleChange = (field, value, options = {}) => {
        setFooter(prev => ({
            ...prev,
            contactInfo: {
                ...prev.contactInfo,
                [field]: value,
            },
        }));

        const error = validateField(field, value, options);
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const validateFooter = () => {
        const errors = {};
        const { contactInfo } = footer;

        if (!contactInfo.departmentNameEn?.trim())
            errors.departmentNameEn = "Department Name (English) is required";

        if (!contactInfo.departmentNameHi?.trim())
            errors.departmentNameHi = "Department Name (Hindi) is required";

        if (!contactInfo.addressEn?.trim())
            errors.addressEn = "Address (English) is required";

        if (!contactInfo.addressHi?.trim())
            errors.addressHi = "Address (Hindi) is required";

        if (!contactInfo.phone?.trim())
            errors.phone = "Mobile number is required";

        if (!contactInfo.email?.trim())
            errors.email = "Email is required";
        if (!contactInfo.organizerNameEn?.trim())
            errors.organizerNameEn = "organizer Name is required";
        if (!contactInfo.organizerNameHi?.trim())
            errors.organizerNameHi = "organizer Name is required";

        /* ===== LANGUAGE VALIDATION ===== */
        if (
            contactInfo.departmentNameEn &&
            !ENGLISH_TEXT_ONLY.test(contactInfo.departmentNameEn)
        ) {
            errors.departmentNameEn =
                "Department Name (English) must contain only English characters";
        }

        if (
            contactInfo.departmentNameHi &&
            !HINDI_TEXT_ONLY.test(contactInfo.departmentNameHi)
        ) {
            errors.departmentNameHi =
                "Department Name (Hindi) must contain only Hindi characters";
        }

        if (
            contactInfo.addressEn &&
            !ENGLISH_WITH_NUMBERS.test(contactInfo.addressEn)
        ) {
            errors.addressEn = "Address (English) must be in English";
        }

        if (
            contactInfo.addressHi &&
            !HINDI_WITH_NUMBERS.test(contactInfo.addressHi)
        ) {
            errors.addressHi = "Address (Hindi) must be in Hindi";
        }

        /* ===== PHONE & EMAIL ===== */
        if (contactInfo.phone && !PHONE_REGEX.test(contactInfo.phone)) {
            errors.phone = "Invalid mobile number";
        }

        if (contactInfo.email && !EMAIL_REGEX.test(contactInfo.email)) {
            errors.email = "Invalid email address";
        }


        return errors;
    };


    /* ================= SAVE ================= */
    // const saveFooterToDB = async (footerPayload) => {
    //     await axios.post(`${API}/api/save-footer`, footerPayload, {
    //         headers: {   Authorization: `Bearer ${token}` },
    //     });
    // };
const saveFooterToDB = async (footerPayload) => {
    const formData = new FormData();
    formData.append("contactInfo", JSON.stringify(footerPayload.contactInfo));
    formData.append("quickLinks", JSON.stringify(footerPayload.quickLinks));
    formData.append("importantLinks", JSON.stringify(footerPayload.importantLinks));
    formData.append("socialLinks", JSON.stringify(footerPayload.socialLinks));

    // Only attach file if it's a new upload
    if (footerPayload.contactInfo?.organizerLogo instanceof File) {
        formData.append("organizerLogo", footerPayload.contactInfo.organizerLogo);
    }

    await axios.post(`${API}/api/save-footer`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        },
    });
};

const saveFooter = async () => {
    const validationErrors = validateFooter();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
        return Swal.fire("Validation Error", "Please fix the highlighted errors", "warning");
    }

    try {
        Swal.fire({ title: "Saving...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        // ❌ REMOVE the second Swal.fire and tokenString lines that were here

        await saveFooterToDB(footer); // ✅ reuse the fixed helper

        Swal.fire("Success", "Footer saved successfully", "success");
        fetchFooter();
    } catch (error) {
        Swal.fire("Error", error?.response?.data?.message || "Footer save failed", "error");
    }
};
    // const saveFooter = async () => {
    //     const validationErrors = validateFooter();
    //     setErrors(validationErrors);

    //     if (Object.keys(validationErrors).length > 0) {
    //         return Swal.fire(
    //             "Validation Error",
    //             "Please fix the highlighted errors",
    //             "warning"
    //         );
    //     }
    //     try {
    //         Swal.fire({
    //             title: "Saving...",
    //             allowOutsideClick: false,
    //             didOpen: () => Swal.showLoading(),
    //         });

    //         // const payload = {
    //         //     contactInfo: footer.contactInfo,
    //         //     quickLinks: footer.quickLinks,
    //         //     importantLinks: footer.importantLinks,
    //         //     socialLinks: footer.socialLinks,

    //         // };
    //          Swal.fire({ title: "Saving...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    //     const tokenString = token?.token || token?.access || token;
    //         const formData = new FormData();

    //         // Append normal data (convert to string)
    //         formData.append("contactInfo", JSON.stringify(footer.contactInfo));
    //         formData.append("quickLinks", JSON.stringify(footer.quickLinks));
    //         formData.append("importantLinks", JSON.stringify(footer.importantLinks));
    //         formData.append("socialLinks", JSON.stringify(footer.socialLinks));

    //         if (footer.contactInfo.organizerLogo instanceof File) {
    //             formData.append("organizerLogo", footer.contactInfo.organizerLogo);
    //         }
          
    //         const res = await axios.post(
    //             `${API}/api/save-footer`,
    //             formData,
    //             {
    //                 headers: {
    //                     "Content-Type": "multipart/form-data",
    //                     Authorization: `Bearer ${tokenString}`,
    //                 },
    //             }
    //         );

    //         Swal.fire("Success", "Footer saved successfully", "success");

    //         fetchFooter();
    //     } catch (error) {
    //         Swal.fire(
    //             "Error",
    //             error?.response?.data?.message || "Footer save failed",
    //             "error"
    //         );
    //     }
    // };

    const handleEditLink = (type, link, index) => {
        if (!link) return;

        setEditRow({
            type,
            index,
            data: link,
        });

        setNewLink({
            titleEn: link.titleEn || "",
            titleHin: link.titleHin || "",
            url: link.url || "",
            type,
        });
    };


    const handleEditSocial = (item, index) => {
        setEditRow({ type: "social", index, data: item });
        setNewSocial({
            platform: item.platform,
            url: item.url,
        });
    };

    const addOrUpdateLink = async () => {
        try {
            let payload = {};
            let type = editRow.type
                || (newSocial.platform || newSocial.url ? "social" : newLink.type);


            if (type === "social") {
                const platformError = validateRequired(newSocial.platform);
                const urlError = validateSocialUrl(newSocial.url);

                if (platformError || urlError) {
                    setErrors({ socialPlatform: platformError, socialUrl: urlError });
                    return;
                }

                payload = { platform: newSocial.platform, url: newSocial.url };
            } else {
                const titleEnError = validateEnglish(newLink.titleEn);
                const titleHinError = validateHindi(newLink.titleHin);
                const urlError = validateRequired(newLink.url);

                if (titleEnError || titleHinError || urlError) {
                    setErrors({
                        newLinkTitle: titleEnError,
                        newLinkTitleHin: titleHinError,
                        newLinkUrl: urlError,
                    });
                    return;
                }

                payload = {
                    titleEn: newLink.titleEn,
                    titleHin: newLink.titleHin,
                    url: newLink.url,
                };
            }

            Swal.fire({ title: "Saving...", didOpen: () => Swal.showLoading() });

            let updatedFooter = { ...footer };

            if (editRow.data?._id) {
                // UPDATE
                const key =
                    type === "social"
                        ? "socialLinks"
                        : type === "quick"
                            ? "quickLinks"
                            : "importantLinks";

                updatedFooter[key] = updatedFooter[key].map(item =>
                    item._id === editRow.data._id ? { ...item, ...payload } : item
                );
            } else {
                // ADD
                const key =
                    type === "social"
                        ? "socialLinks"
                        : type === "quick"
                            ? "quickLinks"
                            : "importantLinks";

                updatedFooter[key] = [...updatedFooter[key], payload];
            }

            await saveFooterToDB(updatedFooter);

            setFooter(updatedFooter);

            Swal.fire(
                "Success",
                editRow.data ? "Updated & saved successfully" : "Added & saved successfully",
                "success"
            );

            setEditRow({ type: null, index: null, data: null });
            setNewLink({ titleEn: "", titleHin: "", url: "", type: "quick" });
            setNewSocial({ platform: "", url: "" });

        } catch (err) {
            Swal.fire(
                "Error",
                err?.response?.data?.message || "Operation failed",
                "error"
            );
        }
    };

    return (
        <Container  className="footer-admin-page">
            <h3 className="page-title">Footer Section Manager</h3>

            <Card className="admin-card">
                <CardBody>
                    <h3 className="section-title">Contact Information</h3>

                    <Row>
                        <Col md="4">
                            <FormGroup>
                                <Label>Department Name (English)</Label>
                                <Input
                                    name="departmentNameEn"
                                    value={footer.contactInfo.departmentNameEn}
                                    onChange={e =>
                                        handleChange("departmentNameEn", e.target.value)
                                    }
                                    invalid={!!errors.departmentNameEn}
                                />
                                <small className="text-danger">{errors.departmentNameEn}</small>
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                <Label>Department Name (Hindi)</Label>
                                <Input
                                    name="departmentNameHi"
                                    value={footer.contactInfo.departmentNameHi}
                                    onChange={e =>
                                        handleChange("departmentNameHi", e.target.value, {
                                            isHindi: true,
                                        })
                                    }
                                    invalid={!!errors.departmentNameHi}
                                />
                                {errors.departmentNameHi && (
                                    <FormFeedback>{errors.departmentNameHi}</FormFeedback>
                                )}
                            </FormGroup>
                        </Col>

                        <Col md="4">
                            <FormGroup>
                                <Label>
                                    <FaPhoneAlt /> Phone
                                </Label>
                                <Input
                                    name="phone"
                                    value={footer.contactInfo.phone}
                                    onChange={e => {
                                        const value = e.target.value;
                                        setFooter({
                                            ...footer,
                                            contactInfo: { ...footer.contactInfo, phone: value },
                                        });
                                        setErrors(prev => ({
                                            ...prev,
                                            phone: PHONE_REGEX.test(value)
                                                ? ""
                                                : "Invalid mobile number",
                                        }));
                                    }}
                                    invalid={!!errors.phone}
                                />
                                {errors.phone && (
                                    <FormFeedback>{errors.phone}</FormFeedback>
                                )}
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                <Label>
                                    <FaMapMarkerAlt /> Address (English)
                                </Label>
                                <Input
                                    type="textarea"
                                    name="addressEn"
                                    value={footer.contactInfo.addressEn}
                                    onChange={e =>
                                        handleChange("addressEn", e.target.value, {
                                            isTextarea: true,
                                        })
                                    }
                                    invalid={!!errors.addressEn}
                                />
                                {errors.addressEn && (
                                    <FormFeedback>{errors.addressEn}</FormFeedback>
                                )}
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                <Label>
                                    <FaMapMarkerAlt /> Address (Hindi)
                                </Label>
                                <Input
                                    type="textarea"
                                    name="addressHi"
                                    value={footer.contactInfo.addressHi}
                                    onChange={e =>
                                        handleChange("addressHi", e.target.value, {
                                            isHindi: true,
                                            isTextarea: true,
                                        })
                                    }
                                    invalid={!!errors.addressHi}
                                />
                                {errors.addressHi && (
                                    <FormFeedback>{errors.addressHi}</FormFeedback>
                                )}
                            </FormGroup>
                        </Col>

                        {/* ================= Email ================= */}
                        <Col md="4">
                            <FormGroup>
                                <Label>
                                    <FaEnvelope /> Email
                                </Label>
                                <Input
                                    name="email"
                                    value={footer.contactInfo.email}
                                    onChange={e => {
                                        const value = e.target.value;
                                        setFooter({
                                            ...footer,
                                            contactInfo: { ...footer.contactInfo, email: value },
                                        });
                                        setErrors(prev => ({
                                            ...prev,
                                            email: EMAIL_REGEX.test(value)
                                                ? ""
                                                : "Invalid email address",
                                        }));
                                    }}
                                    invalid={!!errors.email}
                                />
                                {errors.email && (
                                    <FormFeedback>{errors.email}</FormFeedback>
                                )}
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                <Label>
                                    <FaUser /> Organizer Name (Web Info Manager) (English)
                                </Label>
                                <Input
                                    name="organizerNameEn"
                                    value={footer.contactInfo.organizerNameEn}
                                    onChange={e => {
                                        const value = e.target.value;
                                        setFooter({
                                            ...footer,
                                            contactInfo: { ...footer.contactInfo, organizerNameEn: value },
                                        });
                                        setErrors(prev => ({
                                            ...prev,
                                            organizerNameEn: !value.trim()
                                                ? "organizer Name is required"
                                                : "",
                                        }));
                                    }}
                                    invalid={!!errors.organizerNameEn}
                                />
                                {errors.organizerNameEn && (
                                    <FormFeedback>{errors.organizerNameEn}</FormFeedback>
                                )}
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                <Label>
                                    <FaUser /> Organizer Name (Web Info Manager) (Hindi)
                                </Label>
                                <Input
                                    name="organizerNameHi"
                                    value={footer.contactInfo.organizerNameHi}
                                    onChange={e => {
                                        const value = e.target.value;
                                        setFooter({
                                            ...footer,
                                            contactInfo: { ...footer.contactInfo, organizerNameHi: value },
                                        });
                                        setErrors(prev => ({
                                            ...prev,
                                            organizerNameHi: !value.trim()
                                                ? "organizer Name is required"
                                                : "",
                                        }));
                                    }}
                                    invalid={!!errors.organizerNameHi}
                                />
                                {errors.organizerNameHi && (
                                    <FormFeedback>{errors.organizerNameHi}</FormFeedback>
                                )}
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                <Label>
                                    <FaUser /> Organizer NIC Logo (upload)
                                </Label>

                                <Input
                                    name="organizerLogo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];

                                        setFooter({
                                            ...footer,
                                            contactInfo: {
                                                ...footer.contactInfo,
                                                organizerLogo: file,
                                            },
                                        });

                                        setErrors((prev) => ({
                                            ...prev,
                                            organizerLogo: !file
                                                ? "Organizer Logo is required"
                                                : "",
                                        }));
                                    }}
                                    invalid={!!errors.organizerLogo}
                                    
                                />

                                {errors.organizerLogo && (
                                    <FormFeedback>{errors.organizerLogo}</FormFeedback>
                                )}
                                    {footer?.contactInfo?.organizerLogo && (
      <div style={{ marginTop: "10px" }}>
        <img
          src={
            footer.contactInfo.organizerLogo instanceof File
              ? URL.createObjectURL(footer.contactInfo.organizerLogo) // new upload
              : `${API}${footer.contactInfo.organizerLogo}` // existing from DB
          }
          alt="Preview"
          height="60"
          style={{
            border: "1px solid #ddd",
            padding: "4px",
            borderRadius: "6px",
          }}/>
          </div>
    )}
                            </FormGroup>
                        </Col>
                        
                    </Row>
                </CardBody>
            </Card>
            {/* ================= LINKS MANAGER ================= */}
            <Card className="admin-card">
                <CardBody>
                    <h3 className="section-title">Footer Links Manager</h3>

                    <Row className="align-items-end">
                        <Col md="3">
                            <Label className="form-contol-label">
                                Link Title (English)
                            </Label>
                            <Input

                                value={newLink.titleEn}
                                invalid={!!errors.newLinkTitle}
                                onChange={e => {
                                    const value = e.target.value;
                                    setNewLink({ ...newLink, titleEn: value });
                                    setErrors(prev => ({
                                        ...prev,
                                        newLinkTitle: validateEnglish(value),
                                    }));
                                }}
                            />
                            {errors.newLinkTitle && (
                                <small className="text-danger">{errors.newLinkTitle}</small>
                            )}
                        </Col>
                        <Col md="3">
                            <Label className="form-contol-label">
                                Link Title (Hindi)
                            </Label>
                            <Input
                                value={newLink.titleHin}
                                invalid={!!errors.newLinkTitleHin}
                                onChange={e => {
                                    const value = e.target.value;
                                    setNewLink({ ...newLink, titleHin: value });
                                    setErrors(prev => ({
                                        ...prev,
                                        newLinkTitleHin: validateHindi(value),
                                    }));
                                }}
                            />
                            {errors.newLinkTitleHin && (
                                <small className="text-danger">{errors.newLinkTitleHin}</small>
                            )}
                        </Col>
                        <Col md="3">
                            <Label className="form-contol-label">
                                Title Path
                            </Label>
                            <Input
                                placeholder="/about /index /downloads"
                                value={newLink.url}
                                invalid={!!errors.newLinkUrl}
                                onChange={e => {
                                    const value = e.target.value;
                                    setNewLink({ ...newLink, url: value });
                                    setErrors(prev => ({
                                        ...prev,
                                        newLinkUrl: validateRequired(value),
                                    }));
                                }}
                            />
                            {errors.newLinkUrl && (
                                <small className="text-danger">{errors.newLinkUrl}</small>
                            )}
                        </Col>
                        <Col md="2">
                            <Label className="form-contol-label">
                                Link Type
                            </Label>
                            <Input
                                type="select"
                                value={newLink.type}
                                onChange={e =>
                                    setNewLink({ ...newLink, type: e.target.value })
                                }
                            >
                                <option value="quick">Quick Links</option>
                                <option value="important">Important Links</option>
                            </Input>
                        </Col>
                        <br></br>
                        <Col md="3" className="mt-3 text-nowrap ">
                            {/* <Button color="success" onClick={addLink} size="sm">
                                <FaPlus /> 
                            </Button> */}
                            <Button
                                color={editRow.data ? "warning" : "success"}
                                onClick={addOrUpdateLink}
                                size="sm"
                            >
                                {editRow.data ? "Update" : <FaPlus />}
                            </Button>

                            {editRow.data && (
                                <Button
                                    color="danger"
                                    size="sm"
                                    className="ms-2"
                                    onClick={() => {
                                        setEditRow({ type: null, index: null, data: null });
                                        setNewLink({ titleEn: "", titleHin: "", url: "", type: "quick" });
                                    }}
                                >
                                    <FaTimes />
                                </Button>
                            )}

                        </Col>
                    </Row>

                    {/* ================= QUICK LINKS TABLE ================= */}
                    <Row className="mt-4">
                        <Col md="6">
                            <h6><FaLink /> Quick Links</h6>
                            <Table
                                responsive
                                bordered
                                hover
                                size="sm"
                                className="footer-links-table"
                            >
                                <thead className="table-header">
                                    <tr>
                                        <th>Link Title (English)</th>
                                        <th>Link Title (Hindi)</th>
                                        <th className="text-center" style={{ width: "80px" }}>
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {footer.quickLinks.map((link, index) => (
                                        <tr key={link._id || index}>
                                            <td>{link.titleEn}</td>
                                            <td>{link.titleHin}</td>

                                            {/* <td width="60">
                                                <FaTrash
                                                    className="delete-icon"
                                                    onClick={() => deleteLink("quick", link, index)}
                                                />
                                            </td> */}
                                            <td className="text-center">
                                                <FaEdit
                                                    className="edit-icon me-2" style={{
                                                        background: "transparent",
                                                        border: "none",
                                                        padding: "4px",
                                                        marginRight: "6px",
                                                        cursor: "pointer",
                                                        fontSize: "23px",
                                                        lineHeight: "1",
                                                        color: "#198754",
                                                    }}
                                                    onClick={() => handleEditLink("quick", link, index)}
                                                />
                                                <FaTrash style={{
                                                    background: "transparent",
                                                    border: "none",
                                                    padding: "4px",
                                                    marginRight: "6px",
                                                    cursor: "pointer",
                                                    fontSize: "23px",
                                                    lineHeight: "1",
                                                    color: "#af2e1d",
                                                }} onClick={() => deleteAnyLink("quick", link, index)} />

                                            </td>
                                        </tr>
                                    ))}

                                </tbody>
                            </Table>
                        </Col>

                        <Col md="6">
                            <h6><FaLink /> Important Links</h6>
                            <Table
                                responsive
                                bordered
                                hover
                                size="sm"
                                className="footer-links-table"
                            >
                                <thead className="table-header">
                                    <tr>
                                        <th>Link Title (English)</th>
                                        <th>Link Title (Hindi)</th>
                                        <th className="text-center" style={{ width: "80px" }}>
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {footer.importantLinks.length === 0 ? (
                                        <tr>
                                            <td colSpan="2" className="text-center text-muted py-3">
                                                No important links added
                                            </td>
                                        </tr>
                                    ) : (
                                        footer.importantLinks.map((link, index) => (
                                            <tr key={link._id || index}>
                                                <td className="link-title-cell">{link.titleEn}</td>
                                                <td className="link-title-cell">{link.titleHin}</td>

                                                {/* <td className="text-center">
                                                    <FaTrash
                                                        className="delete-icon"
                                                        onClick={() => deleteLink("important", link, index)}
                                                        title="Delete"
                                                    />
                                                </td> */}
                                                <td className="text-center">
                                                    <FaEdit
                                                        className="edit-icon me-2" style={{
                                                            background: "transparent",
                                                            border: "none",
                                                            padding: "4px",
                                                            marginRight: "6px",
                                                            cursor: "pointer",
                                                            fontSize: "23px",
                                                            lineHeight: "1",
                                                            color: "#198754",
                                                        }}
                                                        onClick={() => handleEditLink("important", link, index)}
                                                    />
                                                    <FaTrash style={{
                                                        background: "transparent",
                                                        border: "none",
                                                        padding: "4px",
                                                        marginRight: "6px",
                                                        cursor: "pointer",
                                                        fontSize: "23px",
                                                        lineHeight: "1",
                                                        color: "#a71c17",
                                                    }} onClick={() => deleteAnyLink("important", link, index)} />
                                                </td>

                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>

                        </Col>
                    </Row>
                </CardBody>
            </Card>
            {/* ================= SOCIAL LINKS ================= */}
            <Card className="admin-card">
                <CardBody>
                    <h3 className="section-title">Social Media Links</h3>
                    <Row className="align-items-end">
                        <Col md="4">
                            <Label>Platform</Label>
                            <Input
                                placeholder="YouTube / Instagram / Facebook"
                                value={newSocial.platform}
                                invalid={!!errors.socialPlatform}
                                onChange={e => {
                                    const value = e.target.value;
                                    setNewSocial({ ...newSocial, platform: value });
                                    setErrors(prev => ({
                                        ...prev,
                                        socialPlatform: validateRequired(value),
                                    }));
                                }}
                            />
                            {errors.socialPlatform && (
                                <small className="text-danger">{errors.socialPlatform}</small>
                            )}
                        </Col>
                        <Col md="6">
                            <Label>URL</Label>
                            <Input
                                placeholder="https://youtube.com/..."
                                value={newSocial.url}
                                invalid={!!errors.socialUrl}
                                onChange={e => {
                                    const value = e.target.value;
                                    setNewSocial({ ...newSocial, url: value });
                                    setErrors(prev => ({
                                        ...prev,
                                        socialUrl: validateSocialUrl(value),
                                    }));
                                }}
                            />
                            {errors.socialUrl && (
                                <small className="text-danger">{errors.socialUrl}</small>
                            )}
                        </Col>
                        <Col md="2">
                            <Button
                                color={editRow.data ? "warning" : "success"}
                                onClick={addOrUpdateLink}
                                size="sm"
                            >
                                {editRow.data ? "Update" : <FaPlus />}
                            </Button>
                        </Col>
                    </Row>

                    {/* SOCIAL LINKS TABLE */}
                    <Table bordered responsive hover striped size="sm" className="mt-3">
                        <thead className="table-header">
                            <tr>
                                <th>Platform</th>
                                <th>URL</th>
                                <th width="80">Action</th>
                            </tr>
                        </thead>
                                <tbody>
                                    {footer.socialLinks.map((item, index) => (
                                        <tr key={item._id || index}>
                                            <td>{item.platform}</td>
                                            <td>{item.url}</td>
                                            <td className="text-center" style={{ whiteSpace: "nowrap" }}>
                                                {/* EDIT */}
                                                <button
                                                    type="button"
                                                    title="Edit"
                                                    onClick={() => handleEditSocial(item, index)}
                                                    style={{
                                                        background: "transparent",
                                                        border: "none",
                                                        padding: "4px",
                                                        marginRight: "6px",
                                                        cursor: "pointer",
                                                        fontSize: "16px",
                                                        lineHeight: "1",
                                                        color: "#198754",
                                                    }}
                                                >
                                                    <FaEdit />
                                                </button>

                                                {/* DELETE */}
                                                <button
                                                    type="button"
                                                    title="Delete"
                                                    onClick={() => deleteAnyLink("social", item, index)}
                                                    style={{
                                                        background: "transparent",
                                                        border: "none",
                                                        padding: "4px",
                                                        cursor: "pointer",
                                                        fontSize: "16px",
                                                        lineHeight: "1",
                                                        color: "#ad2937",
                                                    }}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                </tbody>
                    </Table>
                </CardBody>
            </Card>

            {/* ================= SAVE ================= */}
            <div className="text-end">
                <Button color="primary" size="lg" onClick={saveFooter}>
                    Save Footer Content
                </Button>
            </div>
        </Container>
    );
};

export default FooterSection;
