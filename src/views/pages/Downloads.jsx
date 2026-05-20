import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Table,
  Badge,
  Button,
} from "reactstrap";
import {
  FaDownload,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaCalendar,
} from "react-icons/fa";
import Swal from "sweetalert2";
import PageLayout from "../../components/PageLayout";
import { useLanguage } from "../../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

const Downloads = () => {
  const { isHindi } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(false);

  const breadcrumb = [
    { label: isHindi ? "मुख्य पृष्ठ" : "Home", path: "/" },
    { label: isHindi ? "डाउनलोड" : "Downloads", active: true },
  ];

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/get-categories`);

        const cats = res.data?.data || [];
        setCategories(cats);

        // ✅ FIX: use _id
        if (cats.length > 0) {
          handleTabChange(cats[0]._id);
        }
      } catch (error) {
        Swal.fire("Error", "Failed to load categories", "error");
      }
    };

    fetchCategories();
  }, []);

  /* ================= FETCH DOWNLOADS ================= */
  const fetchDownloadsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      setDownloads([]);

      const res = await axios.get(
        `${API_URL}/api/get-downloads-by-categary/${categoryId}`
      );

      setDownloads(res.data || []);
    } catch (error) {
      Swal.fire("Error", "Failed to load downloads", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= TAB CHANGE ================= */
  const handleTabChange = (categoryId) => {
    setActiveTab(categoryId);
    fetchDownloadsByCategory(categoryId);
  };

  /* ================= FILE ICON ================= */
  const getFileIcon = (type = "") => {
    switch (type.toUpperCase()) {
      case "PDF":
        return <FaFilePdf className="text-danger" />;
      case "DOC":
      case "DOCX":
        return <FaFileWord className="text-primary" />;
      case "XLS":
      case "XLSX":
        return <FaFileExcel className="text-success" />;
      default:
        return <FaDownload />;
    }
  };

  /* ================= TABLE ================= */
  const renderTable = () => (
    <Table responsive striped hover className="mt-3 align-middle">
      <thead className="table-primary">
        <tr>
          <th>#</th>
          <th>{isHindi ? "शीर्षक" : "Title"}</th>
          <th>{isHindi ? "प्रकार" : "Type"}</th>
          <th>{isHindi ? "तिथि" : "Date"}</th>
          <th>{isHindi ? "फ़ाइल आकार" : "File Size"}</th>
          <th className="text-center">
            {isHindi ? "डाउनलोड" : "Download"}
          </th>
        
        </tr>
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td colSpan="5" className="text-center py-4">
              {isHindi ? "लोड हो रहा है..." : "Loading..."}
            </td>
          </tr>
        ) : downloads.length === 0 ? (
          <tr>
            <td colSpan="6" className="text-center text-muted py-4">
              {isHindi
                ? "इस श्रेणी में कोई फ़ाइल उपलब्ध नहीं है"
                : "No downloads available"}
            </td>
          </tr>
        ) : (
          downloads.map((item, index) => (
            <tr key={item._id}>
              <td>{index + 1}</td>

              <td>
                <div className="d-flex align-items-center gap-2">
                  <Badge pill color="light" className="border">
                    {getFileIcon(item.fileType)}
                  </Badge>
                  <span className="fw-semibold">
                    {isHindi ? item.titleHi : item.titleEn}
                  </span>
                </div>
              </td>

              <td>
                <Badge color="secondary">{item.fileType}</Badge>
              </td>

              <td>
                <FaCalendar className="me-1 text-muted" />
                {new Date(item.createdAt).toLocaleDateString(
                  isHindi ? "hi-IN" : "en-IN"
                )}
              </td>
              <td>
                <Badge color="secondary">{item.fileSize}</Badge>
              </td>
              <td className="text-center">
                <Button
                  color="primary"
                  size="sm"
                  tag="a"
                  href={`${API_URL}${item.filePath}`}
                  target="_blank"
                >
                  <FaDownload className="me-1" />
                  {/* {isHindi ? "डाउनलोड" : "Download"} */}
                </Button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
  return (
    <PageLayout
      title={isHindi ? "डाउनलोड" : "Downloads"}
      titleHi="डाउनलोड"
      breadcrumb={breadcrumb}
    >
      <Container className="py-5">
        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm rounded-4">
              <CardBody className="p-4 bg-light rounded-4">

                {/* HEADER */}
                <div className="d-flex align-items-center mb-4">
                  <FaDownload size={36} className="text-primary me-3" />
                  <div>
                    <h4 className="fw-bold mb-1">
                      {isHindi ? "डाउनलोड केंद्र" : "Download Center"}
                    </h4>
                    <small className="text-muted">
                      {isHindi
                        ? "प्रपत्र, अधिसूचना, रिपोर्ट एवं दिशानिर्देश"
                        : "Forms, Notifications, Reports & Guidelines"}
                    </small>
                  </div>
                </div>

                {/* TABS */}
                <Nav pills className="mb-4 gap-2">
                  {categories.map((cat) => (
                    <NavItem key={cat._id}>
                      <NavLink
                        active={activeTab === cat._id}
                        onClick={() => handleTabChange(cat._id)}
                        style={{ cursor: "pointer" }}
                      >
                        {isHindi
                          ? cat.categoryNameHi
                          : cat.categoryNameEn}
                      </NavLink>
                    </NavItem>
                  ))}
                </Nav>

                {/* TABLE */}
                <TabContent activeTab={activeTab}>
                  <TabPane tabId={activeTab}>
                    {renderTable()}
                  </TabPane>
                </TabContent>

              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
};

export default Downloads;
