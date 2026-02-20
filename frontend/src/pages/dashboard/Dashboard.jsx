import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useReports } from "../../hooks/useReports";

import DashboardLayout from "./DashboardLayout";
import DashboardOverview from "./DashboardOverview";
import UploadSection from "./UploadSection";
import ReportsSection from "./ReportsSection";
import BroadcastSection from "./BroadcastSection";
import MessagesSection from "./MessagesSection";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [activeSection, setActiveSection] = useState(
    () => sessionStorage.getItem("activeSection") || "dashboard",
  );

  const {
    reports,
    status,
    fetchReports,
    handleViewReport,
    handleDownloadReport,
    handleDeleteReport,
    handleUpdateReport,
  } = useReports();

  /* ── Guard: redirect if not logged in ─────────────────── */
  useEffect(() => {
    if (!user.username && !user.name) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  /* ── Fetch reports on mount ───────────────────────────── */
  useEffect(() => {
    fetchReports(user.username || user.name);
  }, [fetchReports, user.username, user.name]);

  /* ── Persist active section ───────────────────────────── */
  const handleSectionChange = (section) => {
    setActiveSection(section);
    sessionStorage.setItem("activeSection", section);
  };

  /* ── Section routing ──────────────────────────────────── */
  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardOverview
            reports={reports}
            status={status}
            onRefresh={() => fetchReports(user.username || user.name)}
            onViewReport={handleViewReport}
          />
        );
      case "upload":
        return (
          <UploadSection
            onUploadComplete={() => fetchReports(user.username || user.name)}
          />
        );
      case "reports":
        return (
          <ReportsSection
            reports={reports}
            status={status}
            onView={handleViewReport}
            onDownload={handleDownloadReport}
            onDelete={handleDeleteReport}
            onUpdate={handleUpdateReport}
          />
        );
      case "Broadcasting":
        return <BroadcastSection />;
      case "Messages":
        return <MessagesSection />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {renderSection()}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin   { from { transform: rotate(0deg); }                 to { transform: rotate(360deg); }              }
      `}</style>
    </DashboardLayout>
  );
}
