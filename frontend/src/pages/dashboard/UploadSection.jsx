import React, { useState, useEffect } from "react";
import { useFileUpload } from "../../hooks/useFileUpload";
import { useAuthContext } from "../../context/AuthContext";

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024,
    sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1,
  );
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function UploadSection({ onUploadComplete }) {
  const { user } = useAuthContext();
  const {
    files,
    dragActive,
    uploadProgress,
    uploadStatus,
    addFiles,
    removeFile,
    handleDrag,
    handleDrop,
    uploadAll,
    retryFile,
    triggerFileInput,
  } = useFileUpload();

  const [applicationName, setApplicationName] = useState(
    sessionStorage.getItem("applicationName") || "",
  );
  const [description, setDescription] = useState(
    sessionStorage.getItem("description") || "",
  );

  useEffect(() => {
    sessionStorage.setItem("applicationName", applicationName);
  }, [applicationName]);
  useEffect(() => {
    sessionStorage.setItem("description", description);
  }, [description]);

  const handleInputFocus = (e) => {
    e.target.parentElement.style.transform = "scale(1.02)";
  };
  const handleInputBlur = (e) => {
    e.target.parentElement.style.transform = "scale(1)";
  };

  const ctx = {
    applicationName,
    description,
    userName: user.username || user.name,
  };

  return (
    <div className="content-section">
      <h2 style={{ color: "#fff", marginBottom: "2rem", fontSize: "2rem" }}>
        Upload Reports
      </h2>

      {/* Application Name */}
      <div style={{ marginBottom: "2rem" }}>
        <p
          style={{
            marginBottom: "0.9rem",
            fontWeight: "bold",
            fontSize: "1.2rem",
            color: "#FFF",
          }}
        >
          Application Name:
        </p>
        <div style={{ marginBottom: "1.5rem", position: "relative" }}>
          <input
            type="text"
            id="applicationName"
            value={applicationName}
            onChange={(e) => setApplicationName(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            required
            className="form-input"
            placeholder=" "
          />
          <label htmlFor="applicationName" className="form-label">
            Application Name
          </label>
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: "2rem" }}>
        <p
          style={{
            marginBottom: "0.9rem",
            fontWeight: "bold",
            fontSize: "1.2rem",
            color: "#FFF",
          }}
        >
          Description:
        </p>
        <div style={{ marginBottom: "1.5rem", position: "relative" }}>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            required
            rows={4}
            className="form-input"
            placeholder=" "
          />
          <label htmlFor="description" className="form-label">
            Description
          </label>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div>
        <p
          style={{
            marginBottom: "1rem",
            fontWeight: "bold",
            fontSize: "1.2rem",
            color: "#FFF",
          }}
        >
          Document Upload:
        </p>
        <div
          style={{
            border: `2px dashed ${dragActive ? "#667eea" : "#4a5568"}`,
            borderRadius: "12px",
            padding: "3rem 2rem",
            textAlign: "center",
            background: dragActive
              ? "rgba(102,126,234,0.1)"
              : "rgba(255,255,255,0.05)",
            transition: "all 0.3s ease",
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "#a0aec0", marginBottom: "1rem" }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <p
            style={{
              color: "#a0aec0",
              marginBottom: "1rem",
              fontSize: "1.1rem",
            }}
          >
            Drag and drop your reports here or click to browse
          </p>
          <p
            style={{
              color: "#718096",
              fontSize: "0.9rem",
              marginBottom: "1rem",
            }}
          >
            Maximum file size: 100MB | All file types supported
          </p>

          {/* File list */}
          {files.length > 0 && (
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                marginBottom: "1rem",
                textAlign: "left",
              }}
            >
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "0.5rem",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 0.5rem 0" }}>
                      <strong>{fileItem.file.name}</strong>
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        color: "#a0aec0",
                      }}
                    >
                      {formatFileSize(fileItem.file.size)} •{" "}
                      {fileItem.file.type || "Unknown type"}
                    </p>

                    {fileItem.status === "uploading" && (
                      <div
                        style={{
                          width: "100%",
                          height: "4px",
                          background: "rgba(255,255,255,0.2)",
                          borderRadius: "2px",
                          marginTop: "0.5rem",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${uploadProgress[fileItem.id] || 0}%`,
                            height: "100%",
                            background:
                              "linear-gradient(90deg, #667eea, #764ba2)",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    )}
                    {fileItem.status === "uploading" && (
                      <p
                        style={{
                          color: "#fbbf24",
                          fontSize: "0.9rem",
                          margin: "0.5rem 0 0 0",
                        }}
                      >
                        Uploading... {uploadProgress[fileItem.id] || 0}%
                      </p>
                    )}
                    {fileItem.status === "success" && (
                      <p
                        style={{
                          color: "#48bb78",
                          fontSize: "0.9rem",
                          margin: "0.5rem 0 0 0",
                        }}
                      >
                        ✓ Uploaded successfully
                      </p>
                    )}
                    {fileItem.status === "error" && (
                      <p
                        style={{
                          color: "#f56565",
                          fontSize: "0.9rem",
                          margin: "0.5rem 0 0 0",
                        }}
                      >
                        ✗ Upload failed – check your connection and try again
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginLeft: "1rem",
                    }}
                  >
                    {fileItem.status === "error" && (
                      <button
                        onClick={() => retryFile(fileItem.id, ctx)}
                        disabled={
                          !applicationName.trim() || !description.trim()
                        }
                        style={{
                          background:
                            !applicationName.trim() || !description.trim()
                              ? "rgba(255,255,255,0.2)"
                              : "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor:
                            !applicationName.trim() || !description.trim()
                              ? "not-allowed"
                              : "pointer",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        Retry
                      </button>
                    )}
                    {fileItem.status === "pending" && (
                      <button
                        onClick={() => removeFile(fileItem.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#f56565",
                          cursor: "pointer",
                          fontSize: "1.2rem",
                          padding: "0 6px",
                          borderRadius: "4px",
                        }}
                        title="Remove file"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <button
            onClick={triggerFileInput}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              marginRight: files.length > 0 ? "1rem" : "0",
            }}
            onMouseOver={(e) => (e.target.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
          >
            Choose Files
          </button>

          {files.length > 0 && uploadStatus !== "uploading" && (
            <button
              onClick={() => uploadAll({ ...ctx, onSuccess: onUploadComplete })}
              disabled={!applicationName.trim() || !description.trim()}
              style={{
                background:
                  !applicationName.trim() || !description.trim()
                    ? "rgba(255,255,255,0.2)"
                    : "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor:
                  !applicationName.trim() || !description.trim()
                    ? "not-allowed"
                    : "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              Upload All ({files.filter((f) => f.status === "pending").length})
            </button>
          )}

          {uploadStatus === "uploading" && (
            <p
              style={{
                color: "#fbbf24",
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}
            >
              Uploading files...
            </p>
          )}
          {uploadStatus === "success" && (
            <p
              style={{
                color: "#48bb78",
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}
            >
              All files uploaded successfully!
            </p>
          )}

          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={(e) => addFiles(Array.from(e.target.files))}
            multiple
            accept="*/*"
          />
        </div>
      </div>
    </div>
  );
}
