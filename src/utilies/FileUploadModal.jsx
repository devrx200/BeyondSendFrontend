import { useEffect, useRef, useState } from "react";
import { Modal, ModalHeader, ModalBody, Button, Progress } from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaUpload,
  FaEye,
  FaCopy,
  FaFilePdf,
  FaFileExcel,
  FaFileAlt,
  FaFileWord,
  FaFileImage,
  FaDownload,
  FaTimes,
  FaCloudUploadAlt,
  FaFileCode,
  FaFileArchive
} from "react-icons/fa";

const FileUploadModal = ({ isOpen, toggle }) => {
   const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("authToken");
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
 
  /* ================= FETCH FILE LIST ================= */
  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/files/list`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
      setFileList(res.data?.data || []);
    } catch {
      setFileList([]);
    }
  };

  useEffect(() => {
    if (isOpen) fetchFiles();
  }, [isOpen]);

  /* ================= FILE ICON HELPER ================= */
  const getFileIcon = (mimeType, size = 32) => {
    const iconProps = { size };

    if (mimeType?.startsWith("image")) return <FaFileImage {...iconProps} color="#10b981" />;
    if (mimeType === "application/pdf") return <FaFilePdf {...iconProps} color="#ef4444" />;
    if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel"))
      return <FaFileExcel {...iconProps} color="#22c55e" />;
    if (mimeType?.includes("document") || mimeType?.includes("word"))
      return <FaFileWord {...iconProps} color="#3b82f6" />;
    if (mimeType?.includes("zip") || mimeType?.includes("rar"))
      return <FaFileArchive {...iconProps} color="#f59e0b" />;
    if (mimeType?.includes("json") || mimeType?.includes("javascript") || mimeType?.includes("xml"))
      return <FaFileCode {...iconProps} color="#8b5cf6" />;

    return <FaFileAlt {...iconProps} color="#6b7280" />;
  };

  /* ================= FORMAT FILE SIZE ================= */
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  /* ================= FORMAT DATE ================= */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  /* ================= SELECT FILE ================= */
  const handleSelectFile = (selected) => {
    if (!selected) return;
    setFile(selected);
    setProgress(0);

    if (selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  /* ================= DRAG & DROP ================= */
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleSelectFile(e.dataTransfer.files[0]);
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async () => {
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    try {
      setUploading(true);
      await axios.post(`${API_URL}/api/files/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total))
      });

      Swal.fire({
        icon: "success",
        title: "File uploaded successfully!",
        timer: 1500,
        showConfirmButton: false
      });

      resetFile();
      fetchFiles();
    } catch {
      Swal.fire("Error", "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const resetFile = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
  };

  const closeModal = () => {
    resetFile();
    toggle();
  };

  const copyLink = (path) => {
    navigator.clipboard.writeText(API_URL + path);
    Swal.fire({
      icon: "success",
      title: "Link copied!",
      timer: 1000,
      showConfirmButton: false
    });
  };

  return (
    <Modal isOpen={isOpen} toggle={closeModal} size="xl" style={{ maxWidth: "1100px" }}>
      <ModalHeader
        toggle={closeModal}
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderBottom: "none",
          padding: "18px 24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "white" }}>
          <FaCloudUploadAlt size={26} />
          <span style={{ fontSize: 20, fontWeight: 600, color: "white" }}>Media Library</span>
        </div>
      </ModalHeader>

      <ModalBody style={{ padding: "24px", background: "#f8f9fa" }}>
        {/* ===== UPLOAD AREA ===== */}
        {!file && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            style={{
              border: isDragging ? "2px dashed #667eea" : "2px dashed #cbd5e0",
              borderRadius: 16,
              padding: 40,
              textAlign: "center",
              cursor: "pointer",
              marginBottom: 24,
              background: isDragging
                ? "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)"
                : "white",
              transition: "all 0.3s ease"
            }}
          >
            <FaCloudUploadAlt
              size={48}
              style={{
                color: isDragging ? "#667eea" : "#cbd5e0",
                marginBottom: 12
              }}
            />
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: isDragging ? "#667eea" : "#4a5568",
              marginBottom: 6
            }}>
              {isDragging ? "Drop your file here!" : "Drag & drop file or click to browse"}
            </div>
            <div style={{ fontSize: 13, color: "#a0aec0" }}>
              Supports: Images, PDFs, Documents, Spreadsheets & more
            </div>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={(e) => handleSelectFile(e.target.files[0])}
            />
          </div>
        )}

        {/* ===== SELECTED FILE PREVIEW ===== */}
        {file && (
          <div style={{
            background: "white",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Preview */}
              <div style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                background: preview ? "transparent" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0
              }}>
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ color: "white" }}>
                    {getFileIcon(file.type, 36)}
                  </div>
                )}
              </div>

              {/* File Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#2d3748",
                  marginBottom: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  {file.name}
                </div>
                <div style={{ fontSize: 13, color: "#718096" }}>
                  {formatFileSize(file.size)} • {file.type || "Unknown type"}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                <Button
                  color="primary"
                  onClick={handleUpload}
                  disabled={uploading}
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 24px",
                    fontWeight: 600,
                    fontSize: 14
                  }}
                >
                  <FaUpload style={{ marginRight: 6 }} />
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
                <Button
                  color="light"
                  onClick={resetFile}
                  disabled={uploading}
                  style={{
                    borderRadius: 10,
                    padding: "10px 20px",
                    fontSize: 14
                  }}
                >
                  <FaTimes />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div style={{ marginTop: 16 }}>
                <Progress
                  value={progress}
                  style={{ height: 6, borderRadius: 6 }}
                  barStyle={{
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
                  }}
                />
                <div style={{
                  textAlign: "right",
                  marginTop: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#667eea"
                }}>
                  {progress}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== FILE LIST HEADER ===== */}
        <hr />
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16
        }}>
          <h5 style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#2d3748",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <div style={{
              width: 3,
              height: 20,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 2
            }} />
            Your Files ({fileList.length})
          </h5>
        </div>

        {/* ===== SCROLLABLE FILE LIST ===== */}
        <div style={{
          maxHeight: "450px",
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: 8
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16
          }}>
            {fileList.map((f) => {
              const fullUrl = API_URL + f.filePath;
              const isImage = f.mimeType?.startsWith("image");
              const isHover = hoveredId === f._id;

              return (
                <div
                  key={f._id}
                  className="border border-1 border-dark shadow"
                  onMouseEnter={() => setHoveredId(f._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: isHover
                      ? "0 8px 24px rgba(0,0,0,0.12)"
                      : "0 2px 8px rgba(0,0,0,0.06)",
                    transform: isHover ? "translateY(-4px)" : "translateY(0)",
                    transition: "all 0.25s ease",
                    cursor: "pointer"
                  }}
                >
                  {/* Preview Section */}
                  <div style={{
                    height: 100,
                    background: isImage
                      ? "#f3f4f6"
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    {isImage ? (
                      <img
                        src={fullUrl}
                        alt={f.originalName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                          transform: isHover ? "scale(1.05)" : "scale(1)"
                        }}
                      />
                    ) : (
                      <div style={{ color: "white", opacity: 0.9 }}>
                        {getFileIcon(f.mimeType, 48)}
                      </div>
                    )}

                    {/* Hover Overlay with Actions */}
                    {isHover && (
                      <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(fullUrl, "_blank");
                          }}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "white",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                          }}
                          title="View"
                        >
                          <FaEye size={16} color="#667eea" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyLink(f.filePath);
                          }}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "white",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                          }}
                          title="Copy Link"
                        >
                          <FaCopy size={16} color="#10b981" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* File Details */}
                  <div style={{ padding: 12 }}>
                    {/* File Name */}
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#2d3748",
                      marginBottom: 6,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }} title={f.originalName}>
                      {f.originalName}
                    </div>

                    {/* File Size & Type */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6
                    }}>
                      <span style={{ fontSize: 12, color: "#718096" }}>
                        {formatFileSize(f.fileSize)}
                      </span>
                      <span style={{
                        background: "#e2e8f0",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#4a5568",
                        textTransform: "uppercase"
                      }}>
                        {f.mimeType?.split("/")[1] || "FILE"}
                      </span>
                      {/* Upload Date */}
                      <strong style={{
                        fontSize: 11,
                        color: "#a0aec0",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}>
                        <span>📅</span>
                        <span>{formatDate(f.createdAt)}</span>
                      </strong>
                    </div>


                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {fileList.length === 0 && !file && (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#a0aec0"
            }}>
              <FaFileAlt size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>
                No files uploaded yet
              </div>
              <div style={{ fontSize: 13 }}>
                Upload your first file to get started!
              </div>
            </div>
          )}
        </div>

        {/* Custom Scrollbar Styling */}
        <style>{`
          /* Scrollbar Styling */
          div::-webkit-scrollbar {
            width: 8px;
          }
          div::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          div::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
          }
        `}</style>
      </ModalBody>
    </Modal>
  );
};

export default FileUploadModal;
