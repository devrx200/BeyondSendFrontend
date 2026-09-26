import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, Button, Spinner, Input, Modal, ModalHeader, ModalBody, ModalFooter,
  Row, Col, Badge,
  CardHeader, Progress, Label, InputGroup, InputGroupText, Alert
} from "reactstrap";
import { useDropzone } from "react-dropzone";
import apiClient, { BASE_HOST } from "../../services/api.service";
import Swal from "sweetalert2";
import {
  FaTh, FaList, FaCopy, FaEye, FaUpload,
  FaFileImage, FaFilePdf, FaFileExcel, FaFileAlt,
  FaImages, FaFile, FaTable, FaTimes, FaCheckCircle,
  FaExclamationTriangle, FaMagic, FaInfoCircle,
  FaImage, FaDownload, FaExternalLinkAlt
} from "react-icons/fa";
import { useToast, ToastContainer, wpSwal } from "../../utilities/WPToast";
import PageLoader from "../../components/PageLoader";


const getToken = () => sessionStorage.getItem("authToken");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

const acceptedFileTypes = {
  "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc", ".docx"],
  "application/vnd.ms-excel": [".xls", ".xlsx"],
  "text/plain": [".txt"],
  "text/csv": [".csv"],
  "application/vnd.ms-powerpoint": [".ppt", ".pptx"],
  "application/zip": [".zip"],
  "audio/mpeg": [".mp3"],
  "video/mp4": [".mp4"],
  "video/quicktime": [".mov"]
};

// ----------------------------- SEO FILENAME HELPERS -----------------------------
const splitNameExt = (fileName) => {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return { base: fileName, ext: "" };
  return {
    base: fileName.slice(0, lastDot),
    ext: fileName.slice(lastDot + 1)
  };
};

const sanitizeForSeo = (name) => {
  const { base, ext } = splitNameExt(name);
  let slug = base
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) slug = "file";
  if (slug.length > 80) slug = slug.slice(0, 80).replace(/-+$/g, "");
  return ext ? `${slug}.${ext}` : slug;
};

// ----------------------------- REAL-TIME DOCUMENT VIEWERS -----------------------------
const PdfViewer = ({ url, fileName }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let createdUrl = null;
    setLoading(true);
    setError(null);

    apiClient.get(url, { responseType: "blob" })
      .then((response) => {
        if (!isMounted) return;
        createdUrl = URL.createObjectURL(response.data);
        setBlobUrl(createdUrl);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("PDF fetch error:", err);
        setError("Failed to load PDF preview.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [url]);

  if (loading) {
    return (
      <div className="text-center py-5 bg-light rounded-3" style={{ minHeight: "350px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <PageLoader inline={true} />
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className="text-center py-5 bg-light rounded-3">
        <FaFilePdf size={48} className="text-danger mb-2" />
        <p className="text-danger fw-semibold">{error || "Could not preview PDF directly."}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
          Open PDF in New Window
        </a>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "650px", borderRadius: "8px", overflow: "hidden", background: "#525659" }}>
      <iframe
        src={`${blobUrl}#toolbar=1&navpanes=0`}
        width="100%"
        height="100%"
        title={fileName}
        style={{ border: "none", width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
};
const DocxViewer = ({ url, fileName }) => {
  const containerRef = React.useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    apiClient.get(url, { responseType: "blob" })
      .then(async (response) => {
        if (!isMounted) return;
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          try {
            const { renderAsync } = await import("docx-preview");
            await renderAsync(response.data, containerRef.current, null, {
              className: "docx-doc-page",
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: false
            });
            if (isMounted) setLoading(false);
          } catch (renderErr) {
            console.error("DOCX render error:", renderErr);
            if (isMounted) {
              setError("Cannot parse this Word Document format.");
              setLoading(false);
            }
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("DOCX load error:", err);
        setError("Failed to fetch Word document.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [url]);

  return (
    <div className="bg-light rounded-3 p-2 overflow-auto" style={{ maxHeight: "650px", minHeight: "350px" }}>
      {loading && (
        <PageLoader inline={true} />
      )}
      {error && (
        <div className="text-center py-5">
          <FaFileAlt size={48} className="text-danger mb-2" />
          <p className="text-danger fw-semibold">{error}</p>
          <a href={url} download={fileName} className="btn btn-sm btn-primary">Download File</a>
        </div>
      )}
      <div
        ref={containerRef}
        className="docx-preview-content"
        style={{
          display: loading || error ? "none" : "block",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          borderRadius: "4px",
          padding: "20px",
          textAlign: "left"
        }}
      />
    </div>
  );
};

const ExcelViewer = ({ url, fileName }) => {
  const [sheetData, setSheetData] = useState({});
  const [sheetNames, setSheetNames] = useState([]);
  const [activeSheet, setActiveSheet] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    apiClient.get(url, { responseType: "arraybuffer" })
      .then(async (response) => {
        if (!isMounted) return;
        try {
          const XLSX = await import("xlsx");
          const workbook = XLSX.read(response.data, { type: "array" });
          const parsed = {};
          workbook.SheetNames.forEach((name) => {
            const worksheet = workbook.Sheets[name];
            const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            parsed[name] = rawRows;
          });
          if (isMounted) {
            setSheetData(parsed);
            setSheetNames(workbook.SheetNames);
            setActiveSheet(workbook.SheetNames[0] || "");
            setLoading(false);
          }
        } catch (err) {
          console.error("Excel parse error:", err);
          if (isMounted) {
            setError("Failed to parse spreadsheet content.");
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError("Failed to load spreadsheet.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [url]);

  const currentRows = (activeSheet && sheetData[activeSheet]) || [];
  const maxCols = currentRows.reduce((max, row) => Math.max(max, row ? row.length : 0), 0);

  const getColLetter = (index) => {
    let letter = "";
    let temp = index;
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

  const filteredRows = filterText.trim()
    ? currentRows.filter((row, idx) =>
        idx === 0 || (row && row.some((cell) => String(cell).toLowerCase().includes(filterText.toLowerCase())))
      )
    : currentRows;

  return (
    <div className="excel-viewer-container bg-white rounded-3 shadow-sm border overflow-hidden" style={{ minHeight: "400px", maxHeight: "650px", display: "flex", flexDirection: "column" }}>
      {/* Top Excel Bar */}
      <div className="d-flex justify-content-between align-items-center p-2 bg-light border-bottom flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2 overflow-auto" style={{ maxWidth: "70%" }}>
          <span className="badge bg-success px-2 py-1.5 d-flex align-items-center gap-1" style={{ fontSize: "11px" }}>
            <FaFileExcel /> Sheets:
          </span>
          {sheetNames.map((name) => (
            <button
              key={name}
              type="button"
              className={`btn btn-sm px-2.5 py-1 ${activeSheet === name ? "btn-success fw-bold shadow-sm" : "btn-outline-secondary bg-white"}`}
              style={{ fontSize: "12px", whiteSpace: "nowrap" }}
              onClick={() => setActiveSheet(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="d-flex align-items-center gap-2">
          <Input
            type="text"
            placeholder="Filter cells..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="form-control-sm"
            style={{ width: "160px", fontSize: "12px" }}
          />
          <span className="text-muted small">
            {currentRows.length} Rows · {maxCols} Cols
          </span>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="overflow-auto flex-grow-1 position-relative" style={{ maxHeight: "580px", background: "#f8fafc" }}>
        {loading && (
          <PageLoader inline={true} />
        )}
        {error && (
          <div className="text-center py-5">
            <FaFileExcel size={48} className="text-danger mb-2" />
            <p className="text-danger fw-semibold">{error}</p>
            <a href={url} download={fileName} className="btn btn-sm btn-success">Download Spreadsheet</a>
          </div>
        )}
        {!loading && !error && currentRows.length === 0 && (
          <div className="text-center py-5 text-muted">Spreadsheet is empty.</div>
        )}
        {!loading && !error && currentRows.length > 0 && (
          <div className="table-responsive m-0">
            <table
              className="table table-bordered table-sm table-hover m-0 align-middle"
              style={{
                fontSize: "12.5px",
                borderCollapse: "collapse",
                background: "#fff",
                minWidth: "100%"
              }}
            >
              <thead className="bg-light sticky-top" style={{ zIndex: 2 }}>
                <tr className="bg-light text-muted text-center" style={{ fontSize: "11px" }}>
                  <th style={{ width: "45px", background: "#eef2f6", color: "#64748b", border: "1px solid #cbd5e1" }}>#</th>
                  {Array.from({ length: maxCols }).map((_, colIdx) => (
                    <th key={colIdx} style={{ background: "#eef2f6", color: "#475569", fontWeight: "600", minWidth: "120px", border: "1px solid #cbd5e1", padding: "6px 8px" }}>
                      {getColLetter(colIdx)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, rowIdx) => {
                  const isHeaderRow = rowIdx === 0;
                  return (
                    <tr key={rowIdx} style={{ backgroundColor: isHeaderRow ? "#f1f5f9" : (rowIdx % 2 === 0 ? "#ffffff" : "#fbfcfe") }}>
                      <td
                        className="text-center text-muted fw-semibold select-none"
                        style={{ width: "45px", background: "#f8fafc", fontSize: "11px", border: "1px solid #e2e8f0" }}
                      >
                        {rowIdx + 1}
                      </td>
                      {Array.from({ length: maxCols }).map((_, colIdx) => {
                        const cellVal = row && row[colIdx] !== undefined ? String(row[colIdx]) : "";
                        return (
                          <td
                            key={colIdx}
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px 10px",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              fontWeight: isHeaderRow ? "600" : "normal",
                              color: isHeaderRow ? "#1e293b" : "#334155"
                            }}
                          >
                            {cellVal}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const PptxViewer = ({ url, fileName }) => {
  const [presentation, setPresentation] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const slideContainerRef = React.useRef(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    apiClient.get(url, { responseType: "arraybuffer" })
      .then(async (response) => {
        if (!isMounted) return;
        try {
          const { loadPresentation } = await import("pptx-viewer");
          const pres = await loadPresentation(response.data);
          if (isMounted) {
            setPresentation(pres);
            setCurrentSlide(0);
            setLoading(false);
          }
        } catch (err) {
          console.error("PPTX presentation error:", err);
          if (isMounted) {
            setError("Cannot parse this PowerPoint presentation layout.");
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError("Failed to load PowerPoint file.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [url]);

  useEffect(() => {
    if (!presentation || !slideContainerRef.current) return;
    slideContainerRef.current.innerHTML = "";
    import("pptx-viewer").then(({ renderSlideToElement }) => {
      try {
        renderSlideToElement(presentation, currentSlide, slideContainerRef.current);
      } catch (err) {
        console.error("Slide render error:", err);
      }
    });
  }, [presentation, currentSlide]);

  const totalSlides = presentation?.slides?.length || 0;

  return (
    <div className="pptx-viewer-container bg-dark rounded-3 shadow border overflow-hidden" style={{ minHeight: "450px", maxHeight: "650px", display: "flex", flexDirection: "column" }}>
      {/* Top Slide Presentation Toolbar */}
      <div className="d-flex justify-content-between align-items-center p-2 bg-black bg-opacity-75 text-white flex-wrap gap-2 border-bottom border-secondary">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-warning text-dark fw-bold px-2 py-1">
            PPTX Slide {totalSlides > 0 ? currentSlide + 1 : 0} / {totalSlides}
          </span>
          <span className="small text-white-50 text-truncate" style={{ maxWidth: "250px" }}>{fileName}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button
            size="sm"
            color="secondary"
            className="py-0 px-2"
            disabled={currentSlide <= 0}
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
          >
            ◀ Prev
          </Button>
          <Button
            size="sm"
            color="warning"
            className="py-0 px-2 fw-bold text-dark"
            disabled={currentSlide >= totalSlides - 1}
            onClick={() => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))}
          >
            Next ▶
          </Button>
        </div>
      </div>

      {/* Main Slide Area */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3 position-relative overflow-auto" style={{ background: "#1e293b", maxHeight: "580px" }}>
        {loading && (
          <PageLoader inline={true} />
        )}
        {error && (
          <div className="text-center py-5 bg-light rounded-3 p-4 m-3">
            <FaTable size={48} className="text-warning mb-2" />
            <h6 className="fw-bold text-dark">{fileName}</h6>
            <p className="text-danger fw-semibold">{error}</p>
            <a href={url} download={fileName} className="btn btn-sm btn-warning fw-bold">
              <FaDownload className="me-1" /> Download Presentation
            </a>
          </div>
        )}
        {!loading && !error && (
          <div
            ref={slideContainerRef}
            className="slide-viewport shadow-lg bg-white rounded"
            style={{
              maxWidth: "100%",
              maxHeight: "520px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden"
            }}
          />
        )}
      </div>
    </div>
  );
};

const toSeoFriendlyName = sanitizeForSeo;

const isSeoFriendlyName = (fileName) => {
  const { base } = splitNameExt(fileName);
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(base);
};

const MediaLibraryMangments = () => {
  const { toasts, toast } = useToast();
  // ----------------------------- STATE -----------------------------
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState(null);
  const [editableName, setEditableName] = useState("");
  const [fileExt, setFileExt] = useState("");
  const [nameIsSeoFriendly, setNameIsSeoFriendly] = useState(true);

  // Generate real-time preview URL for selected file before upload
  useEffect(() => {
    if (!selectedFile) {
      setSelectedFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setSelectedFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const MAX_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024;
  const isValidUploadSize = selectedFile?.size <= MAX_UPLOAD_SIZE_BYTES;

  const showToast = useCallback((icon, title, text = "") => {
    Swal.fire({
      icon,
      title,
      text,
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  }, []);

  // ----------------------------- FETCH FILES -----------------------------
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/files/list');
      setFiles(res.data?.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load media files";
      showToast("error", "Media load failed", message);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const loadFiles = window.setTimeout(() => {
      void fetchFiles();
    }, 0);

    return () => window.clearTimeout(loadFiles);
  }, [fetchFiles]);

  // ----------------------------- COPY LINK -----------------------------
  const copyLink = (filePath) => {
    const fullUrl = `${BASE_HOST}${filePath}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(fullUrl);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = fullUrl;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try { document.execCommand("copy"); } catch (err) { }
      document.body.removeChild(textArea);
    }
    toast.success("Link copied to clipboard!");
  };

  // ----------------------------- PREVIEW MODAL (FULL SUPPORT) -----------------------------
  const openPreview = (file) => {
    setPreviewFile(file);
    setPreviewError(false);
    setTextContent("");
    setPreviewOpen(true);

    const ext = (file?.originalName || "").split(".").pop()?.toLowerCase();
    if (["txt", "csv", "json", "md", "xml", "html", "css", "js", "jsx", "ts", "tsx"].includes(ext)) {
      setTextLoading(true);
      apiClient.get(`${BASE_HOST}${file.filePath}`, { responseType: "text" })
        .then((res) => {
          setTextContent(typeof res.data === "string" ? res.data : JSON.stringify(res.data, null, 2));
        })
        .catch(() => {
          setTextContent("");
        })
        .finally(() => {
          setTextLoading(false);
        });
    }
  };

  const getPreviewContent = () => {
    if (!previewFile) return null;
    const fileUrl = `${BASE_HOST}${previewFile.filePath}`;
    const extension = (previewFile.originalName || "").split(".").pop()?.toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension);
    const isAudio = ["mp3", "wav", "ogg", "m4a"].includes(extension);
    const isVideo = ["mp4", "mov", "webm", "avi"].includes(extension);
    const isText = ["txt", "csv", "json", "md", "xml", "html", "css", "js", "jsx", "ts", "tsx"].includes(extension);

    if (previewError) {
      return (
        <div className="text-center py-5 px-3 bg-light rounded-3">
          <FaFileAlt size={64} className="text-muted mb-3" />
          <h5 className="fw-bold mb-2">{previewFile.originalName}</h5>
          <p className="text-muted mb-3">{formatSize(previewFile.fileSize)}</p>
          <div className="d-flex justify-content-center gap-2">
            <a href={fileUrl} download={previewFile.originalName} className="btn btn-primary d-inline-flex align-items-center gap-2">
              <FaDownload /> Download File
            </a>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2">
              <FaExternalLinkAlt /> Open in Browser
            </a>
          </div>
        </div>
      );
    }

    // 1. IMAGE PREVIEW
    if (isImage) {
      return (
        <div style={{ maxHeight: "600px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa", borderRadius: "8px", padding: "12px", overflow: "hidden" }}>
          <img
            src={fileUrl}
            alt={previewFile.originalName}
            style={{ maxWidth: "100%", maxHeight: "550px", objectFit: "contain", borderRadius: "4px" }}
          />
        </div>
      );
    }

    // 2. PDF PREVIEW (Blob-based to prevent cross-origin iframe security blocks)
    if (extension === "pdf") {
      return <PdfViewer url={fileUrl} fileName={previewFile.originalName} />;
    }

    // 3. AUDIO PREVIEW
    if (isAudio) {
      return (
        <div className="p-4 bg-light rounded-3 text-center">
          <div className="mb-3">
            <FaFile size={48} className="text-purple" />
          </div>
          <h6 className="fw-bold mb-1">{previewFile.originalName}</h6>
          <p className="text-muted small mb-3">{formatSize(previewFile.fileSize)} · Audio File</p>
          <audio controls src={fileUrl} className="w-100 mt-2 shadow-sm" autoPlay={false} />
        </div>
      );
    }

    // 4. VIDEO PREVIEW
    if (isVideo) {
      return (
        <div className="bg-dark rounded-3 overflow-hidden d-flex align-items-center justify-content-center p-2" style={{ maxHeight: "600px" }}>
          <video
            controls
            src={fileUrl}
            style={{ width: "100%", maxHeight: "550px", borderRadius: "6px" }}
            playsInline
          />
        </div>
      );
    }

    // 5. DOCX PREVIEW (Word Document)
    if (extension === "docx") {
      return <DocxViewer url={fileUrl} fileName={previewFile.originalName} />;
    }

    // 6. EXCEL & SPREADSHEET PREVIEW (XLSX, XLS, CSV)
    if (["xlsx", "xls", "csv"].includes(extension)) {
      return <ExcelViewer url={fileUrl} fileName={previewFile.originalName} />;
    }

    // 7. POWERPOINT PRESENTATION PREVIEW (PPTX, PPT)
    if (["pptx", "ppt"].includes(extension)) {
      return <PptxViewer url={fileUrl} fileName={previewFile.originalName} />;
    }

    // 8. TEXT / CODE PREVIEW
    if (isText && extension !== "csv") {
      return (
        <div className="text-start p-3 border rounded bg-white" style={{ maxHeight: "550px", overflow: "auto" }}>
          {textLoading ? (
            <PageLoader inline={true} />
          ) : (
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "Consolas, Monaco, monospace", fontSize: "12.5px", margin: 0, color: "#1e293b" }}>
              {textContent || previewFile.originalName}
            </pre>
          )}
        </div>
      );
    }

    // 9. OTHER ARCHIVES & DOCUMENTS (ZIP, RAR, 7Z, TAR)
    return (
      <div className="text-center py-5 px-3 bg-light rounded-3">
        <div className="mb-3">{getFileIcon(previewFile.originalName)}</div>
        <h5 className="fw-bold text-dark mb-1">{previewFile.originalName}</h5>
        <p className="text-muted small mb-4">
          <Badge color="primary" pill className="me-2 px-2.5 py-1 text-uppercase">{extension}</Badge>
          {formatSize(previewFile.fileSize)} · Uploaded on {formatDateTime(previewFile.createdAt)}
        </p>
        <div className="d-flex justify-content-center gap-2 flex-wrap">
          <a
            href={fileUrl}
            download={previewFile.originalName}
            className="btn btn-primary px-4 py-2 d-inline-flex align-items-center gap-2 rounded-pill shadow-sm fw-semibold"
          >
            <FaDownload /> Download {extension?.toUpperCase()} File
          </a>
          <a
            href={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-secondary px-3 py-2 d-inline-flex align-items-center gap-2 rounded-pill shadow-sm"
          >
            <FaExternalLinkAlt /> Open with Viewer
          </a>
        </div>
      </div>
    );
  };

  // ----------------------------- MANUAL UPLOAD HANDLERS -----------------------------
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const { ext } = splitNameExt(file.name);
    const normalizedExt = `.${ext.toLowerCase()}`;
    const allowedExtensions = new Set(Object.values(acceptedFileTypes).flat());

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      const message = "Selected file exceeds the 100 MB limit.";
      showToast("error", "File too large", message);
      return;
    }

    if (!allowedExtensions.has(normalizedExt)) {
      const message = "Unsupported file type. Please choose a supported file.";
      showToast("error", "Unsupported file", message);
      return;
    }

    setSelectedFile(file);
    setFileExt(ext);
    setEditableName("");
    setNameIsSeoFriendly(true);
  }, [MAX_UPLOAD_SIZE_BYTES, showToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: acceptedFileTypes,
    noClick: false
  });

  const handleNameChange = (val) => {
    setEditableName(val);
    setNameIsSeoFriendly(val.trim() === "" ? true : isSeoFriendlyName(`${val}.${fileExt}`));
  };

  const handleAutoFixName = () => {
    if (!selectedFile) return;
    const activeBase = editableName.trim() || splitNameExt(selectedFile.name).base;
    const seoName = toSeoFriendlyName(fileExt ? `${activeBase}.${fileExt}` : activeBase);
    const { base } = splitNameExt(seoName);
    setEditableName(base);
    setNameIsSeoFriendly(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      const message = "Please choose a file to upload.";
      showToast("warning", "No file selected", message);
      return;
    }

    if (selectedFile.size > MAX_UPLOAD_SIZE_BYTES) {
      const message = "Selected file exceeds the 100 MB limit.";
      showToast("error", "File too large", message);
      return;
    }

    const originalBase = splitNameExt(selectedFile.name).base;
    const finalBase = editableName.trim() || originalBase;

    const formData = new FormData();
    formData.append("fileName", finalBase);
    formData.append("file", selectedFile);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await apiClient.post('/files/upload', formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      await fetchFiles();
      const successMessage = res?.data?.message || "File uploaded successfully";
      showToast("success", "Uploaded!", successMessage);
      handleCancelUpload();
    } catch (err) {
      const message = err?.response?.data?.message || "Upload failed. Check file type/size.";
      showToast("error", "Upload failed", message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setEditableName("");
    setFileExt("");
    setNameIsSeoFriendly(true);
  };

  // ----------------------------- DATE TIME FORMATTER -----------------------------
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');
    return `${day}/${month}/${year} ${strHours}:${minutes}:${seconds} ${ampm}`;
  };

  // ----------------------------- FILTER & SEARCH -----------------------------
  const filteredFiles = files.filter(file => {
    const ext = file.originalName?.split(".").pop().toLowerCase();
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    const documentExts = ["xls", "xlsx", "doc", "docx", "ppt", "pptx", "txt", "csv"];
    const videoExts = ["mp4", "mov", "webm", "avi"];

    if (filterType === "image") return imageExts.includes(ext);
    if (filterType === "pdf") return ext === "pdf";
    if (filterType === "document") return documentExts.includes(ext);
    if (filterType === "video") return videoExts.includes(ext);
    return true;
  }).filter(file =>
    file.originalName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ----------------------------- UI HELPERS -----------------------------
  const getFileIcon = (fileName) => {
    const ext = fileName?.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return <FaFileImage size={32} className="text-primary" />;
    if (ext === "pdf") return <FaFilePdf size={32} className="text-danger" />;
    if (["xls", "xlsx"].includes(ext)) return <FaFileExcel size={32} className="text-success" />;
    if (["doc", "docx"].includes(ext)) return <FaFileAlt size={32} className="text-info" />;
    if (["ppt", "pptx"].includes(ext)) return <FaTable size={32} className="text-warning" />;
    if (["zip"].includes(ext)) return <FaFile size={32} className="text-secondary" />;
    if (["mp3", "mp4", "mov"].includes(ext)) return <FaFile size={32} className="text-purple" />;
    return <FaFileAlt size={32} className="text-secondary" />;
  };

  const formatSize = (bytes) => {
    if (bytes === null || bytes === undefined || bytes === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = Number(bytes);
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }

    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const filterBtnStyle = (active) => ({
    background: active ? "#2271b1" : "transparent",
    color: active ? "#fff" : "#1d2327",
    border: "1px solid #c3c4c7",
    borderRadius: "3px",
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: active ? 600 : 400,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    transition: "all 0.1s ease"
  });

  // ----------------------------- RENDER GRID VIEW -----------------------------
  const renderGridView = () => (
    <Row className="g-3">
      {filteredFiles.map(file => (
        <Col xs={6} sm={4} md={3} lg={2} key={file._id}>
          <Card className="h-100 shadow-sm border-0 rounded-3 overflow-hidden" style={{ transition: "transform 0.1s ease", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div className="text-center p-3 bg-light" style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => openPreview(file)}>
              {file.filePath?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={`${BASE_HOST}${file.filePath}`} alt="thumb" style={{ maxHeight: 100, maxWidth: "100%", objectFit: "contain" }} />
              ) : (
                getFileIcon(file.originalName)
              )}
            </div>
            <CardBody className="p-2">
              <div className="small text-truncate fw-bold" title={file.originalName}>{file.originalName}</div>
              <div className="text-muted small">{formatSize(file.fileSize)}</div>
              <div className="text-muted small">{formatDateTime(file.createdAt)}</div>
              <div className="d-flex justify-content-between mt-2">
                <Button size="sm" color="link" className="p-0" onClick={() => openPreview(file)}><FaEye /></Button>
                <Button size="sm" color="link" className="p-0 text-success" onClick={() => copyLink(file.filePath)}><FaCopy /></Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );

  // ----------------------------- RENDER LIST VIEW -----------------------------
  const renderListView = () => (
    <div className="table-responsive">
      <table className="table table-hover align-middle bg-white rounded-3 overflow-hidden" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
        <thead className="bg-light">
          <tr>
            <th style={{ padding: "12px 16px", borderBottom: "1px solid #e0e0e0" }}>File</th>
            <th style={{ padding: "12px 16px", borderBottom: "1px solid #e0e0e0" }}>File Type</th>
            <th style={{ padding: "12px 16px", borderBottom: "1px solid #e0e0e0" }}>Size</th>
            <th style={{ padding: "12px 16px", borderBottom: "1px solid #e0e0e0" }}>Uploaded At</th>
            <th style={{ padding: "12px 16px", borderBottom: "1px solid #e0e0e0" }}>File URL</th>
            <th style={{ padding: "12px 16px", borderBottom: "1px solid #e0e0e0" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFiles.map(file => (
            <tr key={file._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "12px 16px" }}>
                <div className="d-flex align-items-center gap-3">
                  {getFileIcon(file.originalName)}
                  <span className="fw-semibold">{file.originalName}</span>
                </div>
              </td>
              <td style={{ padding: "12px 16px" }}><Badge color="secondary" pill>{file.originalName?.split(".").pop().toUpperCase()}</Badge></td>
              <td style={{ padding: "12px 16px" }}>{formatSize(file.fileSize)}</td>
              <td style={{ padding: "12px 16px" }}>{formatDateTime(file.createdAt)}</td>
              <td style={{ padding: "12px 16px" }}>
                <a href={`${BASE_HOST}${file.filePath}`} target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">
                  Open Link
                </a>
              </td>
              <td style={{ padding: "12px 16px" }}>
                <div className="d-flex gap-2">
                  <Button size="sm" color="outline-primary" onClick={() => openPreview(file)}><FaEye /></Button>
                  <Button size="sm" color="outline-success" onClick={() => copyLink(file.filePath)}><FaCopy /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ----------------------------- MAIN RENDER -----------------------------
  return (
    <>
      <ToastContainer toasts={toasts} onRemove={toast.remove} />
      {/* PAGE HEADER */}
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h3 className="adm-page-title mb-1">
              <FaImage className="me-2" /> Media Library Management
            </h3>
            <p className="adm-page-subtitle mb-0 text-white">
              Upload and manage rich media, images, and document assets
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Upload Area */}
      <div className="p-0">
        <Card className="shadow-sm border-0 rounded-3 overflow-hidden">
          <CardBody className="p-4">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-3 p-2 text-center transition-all ${isDragActive ? "bg-primary-soft border-primary" : "bg-light border-secondary"}`} style={{ cursor: "pointer", transition: "all 0.2s", borderStyle: "dashed" }}>
              <input {...getInputProps()} />
              {!selectedFile ? (
                <>
                  <FaUpload size={48} className={`mb-3 ${isDragActive ? "text-primary" : "text-muted"}`} />
                  <h5 className="mb-1">{isDragActive ? "Drop file here" : "Click or drag files here to upload"}</h5>
                  <p className="text-muted mb-0">Supported file types: images, documents, audio, video, and archives</p>
                  <small className="fw-bold">Maximum Upload File Size: 100 MB. </small><br />
                  <small className="text-muted mt-2 d-block"><strong>Supported:</strong> JPG, JPEG, PNG, GIF, WebP, SVG, PDF, DOC, DOCX, TXT, XLS, XLSX, CSV, PPT, PPTX, ZIP, MP3, MP4, MOV</small>
                </>
              ) : (
                <div
                  className="mx-auto"
                  style={{ maxWidth: "900px" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
                    {/* Ultra-thin Accent Line */}
                    <div className="bg-primary bg-gradient" style={{ height: "3px" }}></div>

                    <CardBody className="p-3">
                      {/* Header */}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Label className="fw-bold mb-0 text-dark d-flex align-items-center" style={{ fontSize: "0.85rem" }}>
                          <FaFileAlt className="text-primary me-2 fs-6" />
                          File Details & Live Preview
                          <span className="text-muted fw-normal ms-1" style={{ fontSize: "0.7rem" }}>(Optional) - Modify Name</span>
                        </Label>

                        <Button
                          outline
                          className="rounded-pill px-2 bg-info text-white py-0 fw-bold d-flex align-items-center shadow-sm"
                          style={{ fontSize: "0.7rem", height: "22px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAutoFixName();
                          }}
                        >
                          <FaMagic className="me-1" />
                          Auto Fix
                        </Button>
                      </div>

                      {/* Live Visual Preview Box */}
                      {selectedFilePreview && (
                        <div className="mb-2 p-2 bg-light rounded-2 border d-flex align-items-center justify-content-center" style={{ minHeight: "80px", maxHeight: "160px", overflow: "hidden" }}>
                          {["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExt.toLowerCase()) ? (
                            <img
                              src={selectedFilePreview}
                              alt="Preview"
                              style={{ maxHeight: "140px", maxWidth: "100%", objectFit: "contain", borderRadius: "4px" }}
                            />
                          ) : ["mp4", "mov", "webm"].includes(fileExt.toLowerCase()) ? (
                            <video
                              src={selectedFilePreview}
                              controls
                              style={{ maxHeight: "140px", maxWidth: "100%", borderRadius: "4px" }}
                            />
                          ) : ["mp3", "wav", "ogg"].includes(fileExt.toLowerCase()) ? (
                            <div className="w-100 px-2 py-1 text-center">
                              <audio src={selectedFilePreview} controls className="w-100" />
                            </div>
                          ) : (
                            <div className="d-flex align-items-center gap-2 py-2">
                              {getFileIcon(selectedFile.name)}
                              <div className="text-start">
                                <div className="fw-bold small text-dark">{selectedFile.name}</div>
                                <small className="text-muted">{formatSize(selectedFile.size)} · {fileExt.toUpperCase()}</small>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Small Input Group */}
                      <InputGroup size="sm" className="mb-2 shadow-sm rounded-2">
                        <Input
                          type="text"
                          className="border-primary border-opacity-25"
                          style={{ fontSize: "0.8rem" }}
                          value={editableName}
                          placeholder={splitNameExt(selectedFile.name).base}
                          invalid={editableName.trim() !== "" && !nameIsSeoFriendly}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleNameChange(e.target.value)}
                        />
                        <InputGroupText
                          className="bg-primary bg-gradient text-white fw-bold px-2 border-primary"
                          style={{ fontSize: "0.75rem" }}
                        >
                          .{fileExt}
                        </InputGroupText>
                      </InputGroup>

                      {/* Tiny Information Tags */}
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                        <span className="badge rounded-pill px-2 py-1 bg-info bg-opacity-10 text-info border border-info border-opacity-25" style={{ fontSize: "0.65rem" }}>
                          📦 {formatSize(selectedFile.size)}
                        </span>
                        <span className="badge rounded-pill px-2 py-1 bg-success bg-opacity-10 text-success border border-success border-opacity-25" style={{ fontSize: "0.65rem" }}>
                          📄 .{fileExt.toUpperCase()}
                        </span>
                        <span className="badge rounded-pill px-2 py-1 bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25" style={{ fontSize: "0.65rem" }}>
                          ⚡ Ready
                        </span>
                      </div>

                      {/* Inline SEO Preview */}
                      {(() => {
                        const activeBase = editableName.trim() || splitNameExt(selectedFile.name).base;
                        const previewName = toSeoFriendlyName(
                          fileExt ? `${activeBase}.${fileExt}` : activeBase
                        );
                        const alreadyClean = editableName.trim() !== "" && nameIsSeoFriendly;

                        return (
                          <Alert
                            color={alreadyClean ? "success" : "secondary"}
                            className={`py-1 px-2 mb-2 border-0 rounded-2 d-flex align-items-center ${alreadyClean ? "bg-success bg-opacity-10" : "bg-light"
                              }`}
                          >
                            <div className={`me-2 ${alreadyClean ? "text-success" : "text-secondary"}`} style={{ fontSize: "0.75rem" }}>
                              {alreadyClean ? <FaCheckCircle /> : <FaExclamationTriangle />}
                            </div>
                            <div className="d-flex align-items-center flex-wrap gap-1">
                              <span className={`fw-bold ${alreadyClean ? "text-success" : "text-secondary"}`} style={{ fontSize: "0.7rem" }}>
                                {alreadyClean ? "SEO Name:" : "Preview:"}
                              </span>
                              <code
                                className="bg-white border rounded px-1 text-dark fw-bold"
                                style={{ wordBreak: "break-word", fontSize: "0.7rem" }}
                              >
                                {previewName}
                              </code>
                            </div>
                          </Alert>
                        );
                      })()}

                      {/* Compact Tip */}
                      <Alert className="bg-info bg-opacity-10 border-0 rounded-2 py-1 px-2 mb-3 d-flex align-items-start">
                        <FaInfoCircle className="text-info me-2 mt-1" style={{ fontSize: "0.7rem" }} />
                        <p className="mb-0 text-dark" style={{ fontSize: "0.7rem", lineHeight: "1.3" }}>
                          Use descriptive names like <strong className="text-info">report.pdf</strong > instead of <strong className="text-danger">scan1.pdf</strong>. Hindi is transliterated automatically.
                        </p>
                      </Alert>

                      {/* Slim Progress */}
                      {isUploading && (
                        <div className="mb-2 bg-light p-2 rounded-3 border">
                          <div className="d-flex justify-content-between mb-1" style={{ fontSize: "0.7rem" }}>
                            <span className="fw-bold text-primary">Uploading...</span>
                            <span className="fw-bold text-primary">{uploadProgress}%</span>
                          </div>
                          <Progress
                            value={uploadProgress}
                            animated
                            striped
                            color="primary"
                            className="bg-white rounded-pill"
                            style={{ height: "6px" }}
                          />
                        </div>
                      )}

                      {/* Small Buttons */}
                      <div className="d-grid d-sm-flex d-flex justify-content-between  gap-2">
                        <Button
                          color="light"
                          size="sm"
                          className="px-3 py-1 rounded-pill fw-bold text-secondary border shadow-sm"
                          style={{ fontSize: "0.75rem" }}
                          disabled={isUploading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelUpload();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          color="primary"
                          size="sm"
                          className="px-4 py-1 rounded-pill fw-bold shadow bg-gradient d-flex align-items-center justify-content-center"
                          style={{ fontSize: "0.75rem" }}
                          onClick={handleUpload}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <Spinner size="sm" className="me-1" style={{ width: "12px", height: "12px" }} />
                              Uploading
                            </>
                          ) : (
                            <>
                              <FaUpload className="me-1" />
                              Upload
                            </>
                          )}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="bg-white mt-3  rounded-top-3 p-3 d-flex flex-wrap align-items-center justify-content-between gap-2 shadow-sm">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <h4 className="mb-0 fw-bold " style={{ color: "#2271b1" }}>
            All Media Library
          </h4>
          <div className="d-flex gap-1">
            <button onClick={() => setFilterType("all")} className={`wp-filter-btn ${filterType === "all" ? "is-active" : ""}`}>
              <FaImages /> All
            </button>
            <button onClick={() => setFilterType("image")} className={`wp-filter-btn ${filterType === "image" ? "is-active" : ""}`}>
              <FaFileImage /> Images
            </button>
            <button onClick={() => setFilterType("pdf")} className={`wp-filter-btn ${filterType === "pdf" ? "is-active" : ""}`}>
              <FaFilePdf /> PDF
            </button>
            <button onClick={() => setFilterType("document")} className={`wp-filter-btn ${filterType === "document" ? "is-active" : ""}`}>
              <FaTable /> Documents
            </button>
            <button onClick={() => setFilterType("video")} className={`wp-filter-btn ${filterType === "video" ? "is-active" : ""}`}>
              <FaFile /> Videos
            </button>
          </div>
          <div style={{ width: 1, height: 30, background: "#ddd", margin: "0 4px" }} />
          <div>
            <Input type="text" placeholder="Search files On Library..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: 240, fontSize: 13, borderRadius: 15, paddingLeft: 32 }} className="form-control" />
          </div>
        </div>

        <div className="d-flex gap-1">
          <button onClick={() => setViewMode("grid")} className={`wp-filter-btn ${viewMode === "grid" ? "is-active" : ""}`}>
            <FaTh /> Grid
          </button>
          <button onClick={() => setViewMode("list")} className={`wp-filter-btn ${viewMode === "list" ? "is-active" : ""}`}>
            <FaList /> List
          </button>
        </div>
      </div>

      <div className="mt-3">
        {loading ? (
          <PageLoader inline={true} />
        ) : filteredFiles.length === 0 ? (
          <Card className="text-center py-5 shadow-sm border-0">
            <CardBody>
              <p className="text-muted">No media files found.</p>
            </CardBody>
          </Card>
        ) : (
          viewMode === "grid" ? renderGridView() : renderListView()
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={previewOpen}
        toggle={() => setPreviewOpen(false)}
        size={["pdf", "mp4", "mov", "webm", "avi", "txt", "csv", "docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(previewFile?.originalName?.split(".").pop()?.toLowerCase()) ? "xl" : "lg"}
        centered
        scrollable
      >
        <ModalHeader toggle={() => setPreviewOpen(false)} className="bg-light">
          <div className="d-flex align-items-center gap-2">
            {getFileIcon(previewFile?.originalName)}
            <div>
              <div className="fw-bold text-dark" style={{ fontSize: "15px" }}>{previewFile?.originalName}</div>
              <small className="text-muted">{formatSize(previewFile?.fileSize)} · Uploaded {formatDateTime(previewFile?.createdAt)}</small>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="p-3 text-center">
          {getPreviewContent()}
        </ModalBody>
        <ModalFooter className="d-flex justify-content-between align-items-center bg-light">
          <div className="text-muted small">
            <code>{previewFile?.filePath}</code>
          </div>
          <div className="d-flex gap-2">
            <Button color="light" className="border" onClick={() => copyLink(previewFile?.filePath)}>
              <FaCopy className="me-1 text-success" /> Copy Link
            </Button>
            <a
              href={`${BASE_HOST}${previewFile?.filePath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
            >
              <FaExternalLinkAlt size={12} /> Open in New Tab
            </a>
            <a
              href={`${BASE_HOST}${previewFile?.filePath}`}
              download={previewFile?.originalName}
              className="btn btn-primary d-inline-flex align-items-center gap-1"
            >
              <FaDownload size={12} /> Download
            </a>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default MediaLibraryMangments;