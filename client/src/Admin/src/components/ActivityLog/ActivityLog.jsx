import React from "react";
import styles from "./ActivityLog.module.css";
import { formatDistanceToNow } from "date-fns";

export default function ActivityLog({ activities }) {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.headerRow}>
          <span className={styles.icon}>📊</span>
          <h3 className={styles.cardTitle}>Recent Activity</h3>
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.scrollArea}>
          {activities.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <p>No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className={styles.activityItem}
                data-testid={`activity-${activity.id}`}
              >
                <div className={styles.avatar}>{getInitials(activity.adminName)}</div>

                <div className={styles.activityInfo}>
                  <p className={styles.adminName}>{activity.adminName}</p>
                  <p className={styles.action}>{activity.action}</p>
                  <p className={styles.details}>{activity.details}</p>
                  <p className={styles.time}>
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
