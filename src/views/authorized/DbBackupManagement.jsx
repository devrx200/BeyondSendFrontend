import { useEffect, useState } from "react";
import {
  Row, Col, Card, CardBody, CardHeader,
  Button, Badge, Spinner, Container, Table
} from "reactstrap";
import {
  FaPlayCircle, FaDownload, FaChevronLeft,
  FaChevronRight, FaFolderOpen, FaDatabase, FaHdd
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import PageLoader from "../../components/PageLoader";
import { useLanguage } from "../../contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 6;

const DbBackupManagement = () => {
  const { isHindi } = useLanguage();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const t = (en, hi) => (isHindi ? hi : en);

  const getAuthConfig = () => {
    const token = sessionStorage.getItem("authToken");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/nic/get-db-backup-list`, getAuthConfig());
      setData(res?.data?.backups || []);
    } catch (err) {
      console.error("Error fetching backup list:", err);
      Swal.fire({
        icon: "error",
        title: t("Oops...", "त्रुटि..."),
        text: t("Failed to load backups.", "बैकअप सूची लोड करने में विफल।"),
        confirmButtonColor: "#3085d6"
      });
    } finally {
      setLoading(false);
    }
  };

  const runLiveBackup = async () => {
    const confirmResult = await Swal.fire({
      title: t("Run Live Backup?", "लाइव बैकअप चलाएं?"),
      text: t("This action will generate a new snapshot of the database.", "यह क्रिया डेटाबेस का एक नया स्नैपशॉट तैयार करेगी।"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#dc3545",
      confirmButtonText: t("Yes, start backup", "हां, बैकअप शुरू करें"),
      cancelButtonText: t("Cancel", "रद्द करें"),
      background: "#fff"
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setActionLoading(true);

      // 1. Pro-grade loading layout built exclusively with Bootstrap structures
      Swal.fire({
        title: t("Executing Live Backup...", "लाइव बैकअप निष्पादित किया जा रहा है..."),
        html: `
          <div class="d-flex align-items-center justify-content-center my-4 gap-3">
            <div class="p-3 bg-light rounded-3 border">
              <span class="fs-4 text-primary fw-bold">💾 SRV</span>
            </div>
            
            <div class="d-flex align-items-center gap-1 mx-2">
              <div class="spinner-grow spinner-grow-sm text-success" style="animation-delay: 0s" role="status"></div>
              <div class="spinner-grow spinner-grow-sm text-success" style="animation-delay: 0.2s" role="status"></div>
              <div class="spinner-grow spinner-grow-sm text-success" style="animation-delay: 0.4s" role="status"></div>
            </div>
            
            <div class="p-3 bg-success bg-opacity-10 rounded-3 border border-success">
              <span class="fs-4 text-success fw-bold">🗄️ DB</span>
            </div>
          </div>
          <p class="text-muted small mb-0">
            ${t("Connecting to cloud server and capturing active data snapshots.", "क्लाउड सर्वर से कनेक्ट किया जा रहा है और सक्रिय डेटा स्नैपशॉट लिया जा रहा है।")}
          </p>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // 2. Parallel API processing combined with a deliberate 1500ms transition 
      const [res] = await Promise.all([
        axios.post(`${API}/api/nic/get-db-backup-run`, {}, getAuthConfig()),
        new Promise((resolve) => setTimeout(resolve, 1500))
      ]);

      if (res.data?.success) {
        Swal.fire({
          icon: "success",
          title: t("Success!", "सफलता!"),
          text: t("Database backup completed successfully!", "डेटाबेस बैकअप सफलतापूर्वक पूरा हुआ!"),
          confirmButtonColor: "#28a745"
        });
        await fetchBackups();
      }
    } catch (err) {
      console.error("Error executing live backup:", err);
      Swal.fire({
        icon: "error",
        title: t("Backup Failed", "बैकअप विफल रहा"),
        text: t("The database backup process encountered an error.", "डेटाबेस बैकअप प्रक्रिया में एक त्रुटि हुई।"),
        confirmButtonColor: "#3085d6"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const downloadBackupFile = async (folderName) => {
    const confirmResult = await Swal.fire({
      title: t("Download Archive?", "पुरालेख डाउनलोड करें?"),
      text: t(`Are you sure you want to download backup: ${folderName}?`, `क्या आप सुनिश्चित हैं कि आप बैकअप डाउनलोड करना चाहते हैं: ${folderName}?`),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#6c757d",
      confirmButtonText: t("Download ZIP", "जिप डाउनलोड करें"),
      cancelButtonText: t("Cancel", "रद्द करें")
    });

    if (!confirmResult.isConfirmed) return;

    try {
      Swal.fire({
        title: t("Preparing Download...", "डाउनलोड की तैयारी..."),
        text: t("Please wait while the files are being compressed.", "कृपया प्रतीक्षा करें जब तक फ़ाइलें संपीड़ित की जा रही हैं।"),
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const [response] = await Promise.all([
        axios({
          url: `${API}/api/nic/get-db-backup-download/${folderName}`,
          method: 'GET',
          responseType: 'blob',
          ...getAuthConfig()
        }),
        new Promise((resolve) => setTimeout(resolve, 1000))
      ]);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BeyondSend-DbBackup-${folderName}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      Swal.close();

    } catch (err) {
      console.error("Error downloading file:", err);

      let backendMessage = t("Could not retrieve the backup archive.", "बैकअप पुरालेख प्राप्त नहीं किया जा सका।");

      if (err.response?.data instanceof Blob) {
        try {
          const errorJson = JSON.parse(await err.response.data.text());
          if (errorJson?.message) backendMessage = errorJson.message;
        } catch (e) { }
      } else if (err.response?.data?.message) {
        backendMessage = err.response.data.message;
      } else if (err.message) {
        backendMessage = err.message;
      }

      Swal.fire({
        icon: "error",
        title: t("Download Failed", "डाउनलोड विफल रहा"),
        text: backendMessage,
        confirmButtonColor: "#3085d6"
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch { return "—"; }
  };

  const paginate = (arr, page) => arr.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = (arr) => Math.max(1, Math.ceil(arr.length / ITEMS_PER_PAGE));

  const Pagination = ({ page, setPage, arr }) => {
    const pages = totalPages(arr);
    if (pages <= 1) return null;
    return (
      <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
        <Button size="sm" color="light" className="border rounded-3 px-2"
          disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          <FaChevronLeft size={10} />
        </Button>
        {Array.from({ length: pages }, (_, i) => (
          <Button key={i} size="sm"
            color={page === i + 1 ? "primary" : "light"}
            className="rounded-3 border fw-semibold"
            style={{ minWidth: 32 }}
            onClick={() => setPage(i + 1)}>
            {i + 1}
          </Button>
        ))}
        <Button size="sm" color="light" className="border rounded-3 px-2"
          disabled={page === pages} onClick={() => setPage(p => p + 1)}>
          <FaChevronRight size={10} />
        </Button>
      </div>
    );
  };

  const paginatedBackups = paginate(data, currentPage);

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      <div className="px-3 px-md-4">

        {/* Top Header Panel */}
        <div className="bg-white rounded-4 shadow-sm p-3 mb-4 d-flex flex-column flex-sm-row align-items-sm-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 46, height: 46 }}>
              <FaDatabase className="text-primary" size={22} />
            </div>
            <div>
              <h5 className="fw-bold mb-0">
                {t("Database Backup Panel", "डेटाबेस बैकअप पैनल")}
              </h5>
              <small className="text-muted">
                {t("Manage system preservation dumps and data restorations", "सिस्टम डेटा डंप और डेटा पुनर्स्थापना प्रबंधित करें")}
              </small>
            </div>
          </div>
          <div className="ms-sm-auto d-flex align-items-center gap-2">
            <Badge color="secondary" pill className="px-3 py-2 d-flex align-items-center gap-1">
              <FaHdd size={11} /> {data.length} {t("Total Dumps", "कुल बैकअप")}
            </Badge>
            <Button
              color="success"
              className="rounded-3 px-3 d-flex align-items-center gap-2 fw-semibold shadow-sm"
              disabled={actionLoading}
              onClick={runLiveBackup}
            >
              {actionLoading ? (
                <Spinner size="sm" style={{ width: '14px', height: '14px' }} />
              ) : (
                <FaPlayCircle size={14} />
              )}
              {t("Run Live Backup", "लाइव बैकअप चलाएं")}
            </Button>
          </div>
        </div>

        {/* Main Content Card Container */}
        <Row>
          <Col xs={12}>
            <Card className="border-0 shadow rounded-4 position-relative">
              <CardHeader className="bg-white border-0 rounded-top-4 pb-0 pt-3 px-3">
                <div className="d-flex align-items-center gap-2 border-bottom pb-2 border-primary">
                  <span className="fw-bold text-dark">
                    {t("Available Archives", "उपलब्ध पुरालेख फ़ाइलें")}
                  </span>
                </div>
              </CardHeader>
              <CardBody className="p-3" style={{ minHeight: "200px" }}>

                {loading ? (
                  <PageLoader inline={true} />
                ) : paginatedBackups.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <FaFolderOpen size={42} className="mb-2 text-secondary opacity-50" />
                    <div className="small fw-semibold">
                      {t("No snapshot records found", "कोई बैकअप रिकॉर्ड नहीं मिला")}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <Table hover className="align-middle border-0 mb-0">
                        <thead className="table-light text-secondary small">
                          <tr>
                            <th className="border-0">{t("Backup Target Folder", "बैकअप लक्ष्य फ़ोल्डर")}</th>
                            <th className="border-0">{t("Creation Timestamp", "निर्माण समय")}</th>
                            <th className="border-0 text-end">{t("Actions", "कार्रवाई")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedBackups.map((item, index) => (
                            <tr key={index} className="border-bottom">
                              <td className="fw-semibold text-dark font-monospace" style={{ fontSize: "0.85rem" }}>
                                📁 {item.folderName}
                              </td>
                              <td className="text-muted small">
                                {formatDate(item.createdAt)}
                              </td>
                              <td className="text-end">
                                <Button
                                  size="sm"
                                  color="primary"
                                  className="rounded-3 px-3 d-inline-flex align-items-center gap-1"
                                  title={t("Download ZIP", "जिप डाउनलोड करें")}
                                  onClick={() => downloadBackupFile(item.folderName)}
                                >
                                  <FaDownload size={11} />
                                  <span className="d-none d-md-inline small ms-1">{t("Download", "डाउनलोड")}</span>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    <Pagination page={currentPage} setPage={setCurrentPage} arr={data} />
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

      </div>
    </Container>
  );
};

export default DbBackupManagement;