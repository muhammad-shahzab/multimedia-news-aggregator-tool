import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Bell } from "lucide-react";
import { format } from "date-fns";

import DashboardLayout from "../components/DashboardLayout";
import NotificationModal from "../components/NotificationModal";
import styles from "./Notifications.module.css";

/**
 * Notifications page (plain React, no React Query, no ProtectedRoute)
 * - Keeps DashboardLayout
 * - Uses plain fetch() for API calls
 * - No confirm for delete (delete is immediate)
 */

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Fetch notifications from the server
  const fetchNotifications = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load notifications", err);
      setErrorMessage("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Create or update handler
  const handleSave = async (payload) => {
    setErrorMessage("");
    setSaving(true);

    try {
      // If payload includes id and we had selectedNotification, it's an update
      if (selectedNotification && selectedNotification.id) {
        const res = await fetch(`/api/notifications/${selectedNotification.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
      } else {
        const res = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
      }

      // close modal and refresh list
      setIsModalOpen(false);
      setSelectedNotification(null);
      await fetchNotifications();
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to save notification.");
    } finally {
      setSaving(false);
    }
  };

  // Edit -> open modal with selected
  const handleEdit = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  // Delete immediately without a confirm dialog (as requested)
  const handleDelete = async (id) => {
    setErrorMessage("");
    setDeletingId(id);
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      // refresh list
      await fetchNotifications();
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to delete notification.");
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeLabel = (type) => {
    const map = {
      system_update: "System Update",
      maintenance: "Maintenance Alert",
      new_feature: "New Feature",
      general: "General Info",
    };
    return map[type] || type;
  };

  const getStatusBadgeClass = (status) => {
    if (status === "sent") return styles.badgeGreen;
    if (status === "failed") return styles.badgeRed;
    return styles.badgeBlue; // scheduled
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Scheduled Notifications</h1>
            <p className={styles.subtitle}>
              Manage and schedule system notifications for users
            </p>
          </div>

          <div>
            <button
              className={styles.primaryButton}
              onClick={() => {
                setSelectedNotification(null);
                setIsModalOpen(true);
              }}
              data-testid="button-create-notification"
            >
              <Plus size={14} style={{ marginRight: 8 }} />
              Create Notification
            </button>
          </div>
        </div>

        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.headerIcon}>
              <Bell size={16} />
            </div>
            <h3 className={styles.cardTitle}>All Notifications</h3>
          </div>

          <div className={styles.cardContent}>
            {loading ? (
              <div className={styles.center}>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Title</th>
                      <th>Scheduled Date</th>
                      <th>Status</th>
                      <th className={styles.colActions}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((n) => (
                      <tr key={n.id} data-testid={`notification-row-${n.id}`}>
                        <td>
                          <span className={styles.typeBadge}>
                            {getTypeLabel(n.type)}
                          </span>
                        </td>

                        <td className={styles.titleCell}>{n.title}</td>

                        <td>
                          {n.scheduledDate
                            ? format(new Date(n.scheduledDate), "MMM dd, yyyy h:mm a")
                            : "-"}
                        </td>

                        <td>
                          <span className={getStatusBadgeClass(n.status || "scheduled")}>
                            {(n.status || "scheduled")
                              .charAt(0)
                              .toUpperCase() +
                              (n.status || "scheduled").slice(1)}
                          </span>
                        </td>

                        <td className={styles.colActions}>
                          <div className={styles.actionGroup}>
                            <button
                              className={styles.iconButton}
                              onClick={() => handleEdit(n)}
                              data-testid={`button-edit-${n.id}`}
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              className={styles.iconButton}
                              onClick={() => handleDelete(n.id)}
                              data-testid={`button-delete-${n.id}`}
                              disabled={deletingId === n.id}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Bell size={48} className={styles.emptyIcon} />
                <h3>No notifications yet</h3>
                <p>Create your first notification to get started</p>
                <button
                  className={styles.primaryButton}
                  onClick={() => {
                    setSelectedNotification(null);
                    setIsModalOpen(true);
                  }}
                >
                  <Plus size={14} style={{ marginRight: 8 }} />
                  Create Notification
                </button>
              </div>
            )}
          </div>
        </div>

        <NotificationModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedNotification(null);
          }}
          onSave={handleSave}
          notification={selectedNotification}
          isLoading={saving}
        />
      </div>
    </DashboardLayout>
  );
}
