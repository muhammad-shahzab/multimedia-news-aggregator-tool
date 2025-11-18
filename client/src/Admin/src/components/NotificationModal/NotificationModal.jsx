import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import styles from "./NotificationModal.module.css";
import "react-datepicker/dist/react-datepicker.css";

export default function NotificationModal({
  open,
  onClose,
  onSave,
  notification,
  isLoading = false,
}) {
  const [type, setType] = useState("general");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState(new Date());

  const notificationTypes = [
    { value: "system_update", label: "System Update" },
    { value: "maintenance", label: "Maintenance Alert" },
    { value: "new_feature", label: "New Feature" },
    { value: "general", label: "General Info" },
  ];

  useEffect(() => {
    if (notification) {
      setType(notification.type);
      setTitle(notification.title);
      setMessage(notification.message);
      setScheduledDate(new Date(notification.scheduledDate));
    } else {
      setType("general");
      setTitle("");
      setMessage("");
      setScheduledDate(new Date());
    }
  }, [notification, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: notification?.id,
      type,
      title,
      message,
      scheduledDate,
      status: notification?.status || "scheduled",
      createdBy: notification?.createdBy || "",
    });
  };

  if (!open) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {notification ? "Edit Notification" : "Create Notification"}
          </h2>
          <p className={styles.description}>
            {notification
              ? "Update the notification details below"
              : "Schedule a new notification for the system users."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>

          {/* Type */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Notification Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={styles.select}
            >
              {notificationTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              required
            />
          </div>

          {/* Message */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Message</label>
            <textarea
              className={styles.textarea}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              rows={4}
              required
            ></textarea>
          </div>

          {/* Date */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Scheduled Date & Time</label>
            <DatePicker
              selected={scheduledDate}
              onChange={(date) => date && setScheduledDate(date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              className={styles.datepickerInput}
            />
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading
                ? "Saving..."
                : notification
                ? "Update"
                : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
