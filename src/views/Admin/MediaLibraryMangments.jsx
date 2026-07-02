import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, Button, Spinner, Input, Modal, ModalHeader, ModalBody,
  Row, Col, Badge,
  CardHeader
} from "reactstrap";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaTh, FaList, FaCopy, FaEye, FaUpload,
  FaFileImage, FaFilePdf, FaFileExcel, FaFileAlt,
  FaImages, FaFile, FaTable, FaTimes, FaCheckCircle,
  FaExclamationTriangle, FaMagic, FaInfoCircle
} from "react-icons/fa";
import { FileViewer } from "@smazeeapps/file-viewer";

const API = import.meta.env.VITE_API_URL;
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
  if (lastDot <= 0) return { base: fileName, ext: "" };
  return { base: fileName.slice(0, lastDot), ext: fileName.slice(lastDot + 1).toLowerCase() };
};

const toSeoFriendlyName = (fileName) => {
  const { base, ext } = splitNameExt(fileName);
  let slug = base
    .toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) slug = "file";
  if (slug.length > 80) slug = slug.slice(0, 80).replace(/-+$/g, "");
  return ext ? `${slug}.${ext}` : slug;
};

const isSeoFriendlyName = (fileName) => {
  const { base } = splitNameExt(fileName);
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(base);
};

const MediaLibraryMangments = () => {
  // ----------------------------- STATE -----------------------------
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [editableName, setEditableName] = useState("");
  const [fileExt, setFileExt] = useState("");
  const [nameIsSeoFriendly, setNameIsSeoFriendly] = useState(true);

  const MAX_UPLOAD_SIZE_BYTES = 32 * 1024 * 1024;
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
      const res = await axios.get(`${API}/api/files/list`, {
        headers: authHeader()
      });
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
    const fullUrl = `${API}${filePath}`;
    navigator.clipboard.writeText(fullUrl);
    Swal.fire({
      title: "Link copied!",
      icon: "success",
      timer: 1200,
      showConfirmButton: false,
      position: "bottom-end",
      toast: true
    });
  };

  // ----------------------------- PREVIEW MODAL (UPDATED) -----------------------------
  const openPreview = (file) => {
    setPreviewFile(file);
    setPreviewError(false);
    setPreviewOpen(true);
  };

  const getPreviewContent = () => {
    if (!previewFile) return null;
    const fileUrl = `${API}${previewFile.filePath}`;
    const extension = (previewFile.originalName || "").split(".").pop()?.toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension);
    const isAudio = ["mp3", "wav", "ogg", "m4a"].includes(extension);
    const isVideo = ["mp4", "mov", "webm", "avi"].includes(extension);
    const isText = ["txt", "csv", "json", "md", "xml", "html", "css", "js", "jsx", "ts", "tsx"].includes(extension);

    if (previewError) {
      return (
        <div className="text-center p-5">
          <FaFileAlt size={90} className="text-muted mb-3" />
          <p>Cannot preview this file directly.</p>
          <Button color="primary" href={fileUrl} target="_blank" rel="noopener noreferrer">
            Download / Open File
          </Button>
        </div>
      );
    }

    if (isImage) {
      return <img src={fileUrl} alt={previewFile.originalName} style={{ maxWidth: "100%", maxHeight: 560, objectFit: "contain" }} />;
    }

    if (isAudio) {
      return (
        <div className="text-center p-4">
          <audio controls src={fileUrl} style={{ width: "100%" }} />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="text-center p-4">
          <video controls src={fileUrl} style={{ width: "100%", maxHeight: 560 }} />
        </div>
      );
    }

    if (isText) {
      return (
        <div className="text-start p-3 border rounded bg-light" style={{ maxHeight: 560, overflow: "auto" }}>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{previewFile.originalName}</pre>
        </div>
      );
    }

    return (
      <FileViewer
        src={fileUrl}
        fileName={previewFile.originalName}
        height="600px"
        onError={() => setPreviewError(true)}
      />
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
      const message = "Selected file exceeds the 32 MB limit.";
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
      const message = "Selected file exceeds the 32 MB limit.";
      showToast("error", "File too large", message);
      return;
    }

    const originalBase = splitNameExt(selectedFile.name).base;
    const finalBase = editableName.trim() || originalBase;

    const formData = new FormData();
    formData.append("fileName", finalBase);
    formData.append("file", selectedFile);
    setUploadProgress(true);

    try {
      const res = await axios.post(`${API}/api/files/upload`, formData, {
        headers: { ...authHeader(), "Content-Type": "multipart/form-data" }
      });
      await fetchFiles();
      const successMessage = res?.data?.message || "File uploaded successfully";
      showToast("success", "Uploaded!", successMessage);
      handleCancelUpload();
    } catch (err) {
      const message = err?.response?.data?.message || "Upload failed. Check file type/size.";
      showToast("error", "Upload failed", message);
    } finally {
      setUploadProgress(false);
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
                <img src={`${API}${file.filePath}`} alt="thumb" style={{ maxHeight: 100, maxWidth: "100%", objectFit: "contain" }} />
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
                <a href={`${API}${file.filePath}`} target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">
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
      {/* Upload Area */}
      <div className="p-3 pb-0">
        <Card className="shadow-sm border-0 rounded-3 overflow-hidden">
          <CardHeader className="p-2">
            <h4 className="mb-0"> Media Library</h4>
          </CardHeader>
          <CardBody className="p-4">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-3 p-5 text-center transition-all ${isDragActive ? "bg-primary-soft border-primary" : "bg-light border-secondary"}`} style={{ cursor: "pointer", transition: "all 0.2s", borderStyle: "dashed" }}>
              <input {...getInputProps()} />
              {!selectedFile ? (
                <>
                  <FaUpload size={48} className={`mb-3 ${isDragActive ? "text-primary" : "text-muted"}`} />
                  <h5 className="mb-1">{isDragActive ? "Drop file here" : "Click or drag files here to upload"}</h5>
                  <p className="text-muted mb-0">Supported file types: images, documents, audio, video, and archives</p>
                  <small className="fw-bold">Maximum Upload File Size: 32 MB. </small><br />
                  <small className="text-muted mt-2 d-block"><strong>Supported:</strong> JPG, JPEG, PNG, GIF, WebP, SVG, PDF, DOC, DOCX, TXT, XLS, XLSX, CSV, PPT, PPTX, ZIP, MP3, MP4, MOV</small>
                </>
              ) : (
                <div className="text-center" style={{ maxWidth: 480, margin: "0 auto" }} onClick={(e) => e.stopPropagation()}>
                  <FaFile size={48} className="text-primary mb-3" />
                  <h6 className="mb-2">Selected File      <Button color="link" size="sm" className="p-0 align-baseline" onClick={(e) => { e.stopPropagation(); handleAutoFixName(); }}>
                    <FaMagic className="me-1" />Auto Fix Name
                  </Button></h6>

                  <div className="text-start">
                    <label className="small fw-semibold text-danger mb-1 d-block ">
                      File Name <span className="fw-normal text-warning">(optional — leave blank to keep original)</span>
                    </label>
                    <div className="d-flex align-items-center gap-2">
                      <Input
                        type="text"
                        placeholder={splitNameExt(selectedFile.name).base}
                        value={editableName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ fontSize: 13 }}
                        invalid={editableName.trim() !== "" && !nameIsSeoFriendly}
                      />
                      <span className={`small text-nowrap fw-semibold ${isValidUploadSize ? "text-success" : "text-danger"}`}>
                        .{fileExt} - {formatSize(selectedFile.size)}
                      </span>
                    </div>

                    {(() => {
                      const activeBase = editableName.trim() || splitNameExt(selectedFile.name).base;
                      const previewName = toSeoFriendlyName(fileExt ? `${activeBase}.${fileExt}` : activeBase);
                      const alreadyClean = editableName.trim() !== "" && nameIsSeoFriendly;
                      return (
                        <div className={`small mt-1 d-flex align-items-start gap-1 ${alreadyClean ? "text-success" : "text-warning"}`}>
                          {alreadyClean ? <FaCheckCircle className="mt-1" /> : <FaExclamationTriangle className="mt-1" />}
                          <span>
                            {alreadyClean ? "Looks SEO-friendly. " : "Will be auto-converted to: "}
                            <code>{previewName}</code>
                          </span>
                        </div>
                      );
                    })()}

                    <div className="small text-muted mt-2 d-flex align-items-start gap-1">
                      <FaInfoCircle className="mt-1" />
                      <span>
                        Tip: keep names short and descriptive, e.g. <code>annual-report-2026.pdf</code> instead of <code>Scan_001 (2).pdf</code> — this improves search visibility and page load performance. Hindi names are automatically transliterated too.
                      </span>
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-center">
                    <Button color="primary" onClick={handleUpload} disabled={uploadProgress}>
                      {uploadProgress ? <Spinner size="sm" className="me-1" /> : <FaUpload className="me-1" />}
                      Upload Now
                    </Button>
                    <Button color="secondary" outline onClick={handleCancelUpload} disabled={uploadProgress}>
                      <FaTimes className="me-1" /> Cancel
                    </Button>
                  </div>
                  {uploadProgress && <p className="mt-2 text-muted small">Uploading...</p>}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="bg-white mt-3 mx-3 rounded-top-3 p-3 d-flex flex-wrap align-items-center justify-content-between gap-2 shadow-sm">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <h4 className="mb-0 fw-bold " style={{ color: "#2271b1" }}>
            All Media Library
          </h4>
          <div className="d-flex gap-1">
            <button onClick={() => setFilterType("all")} style={filterBtnStyle(filterType === "all")}>
              <FaImages /> All
            </button>
            <button onClick={() => setFilterType("image")} style={filterBtnStyle(filterType === "image")}>
              <FaFileImage /> Images
            </button>
            <button onClick={() => setFilterType("pdf")} style={filterBtnStyle(filterType === "pdf")}>
              <FaFilePdf /> PDF
            </button>
            <button onClick={() => setFilterType("document")} style={filterBtnStyle(filterType === "document")}>
              <FaTable /> Documents
            </button>
            <button onClick={() => setFilterType("video")} style={filterBtnStyle(filterType === "video")}>
              <FaFile /> Videos
            </button>
          </div>
          <div style={{ width: 1, height: 30, background: "#ddd", margin: "0 4px" }} />
          <div>
            <Input type="text" placeholder="Search files On Library..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: 240, fontSize: 13, borderRadius: 15, paddingLeft: 32 }} className="form-control" />
          </div>
        </div>

        <div className="d-flex gap-1">
          <button onClick={() => setViewMode("grid")} style={filterBtnStyle(viewMode === "grid")}>
            <FaTh /> Grid
          </button>
          <button onClick={() => setViewMode("list")} style={filterBtnStyle(viewMode === "list")}>
            <FaList /> List
          </button>
        </div>
      </div>

      {/* Media Items */}
      <div className="p-3">
        {loading ? (
          <div className="text-center py-5"><Spinner /></div>
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
      <Modal isOpen={previewOpen} toggle={() => setPreviewOpen(false)} size="lg" centered scrollable>
        <ModalHeader toggle={() => setPreviewOpen(false)}>
          {previewFile?.originalName}
        </ModalHeader>
        <ModalBody className="text-center">
          {getPreviewContent()}
          <div className="mt-3">
            <Button color="success" onClick={() => copyLink(previewFile?.filePath)}>
              <FaCopy className="me-1" /> Copy Link
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default MediaLibraryMangments;