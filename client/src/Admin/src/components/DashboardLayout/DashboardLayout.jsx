import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "wouter";
import styles from "./DashboardLayout.module.css";

export default function DashboardLayout({ children }) {
  const { admin, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const menuItems = [
    { title: "Analytics", url: "/" },
    { title: "Notifications", url: "/notifications" },
  ];

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  return (
    <div className={styles.layoutWrapper}>
      
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.shieldIcon}>🛡️</span>
          <span className={styles.dashboardTitle}>Admin Dashboard</span>
        </div>

        <nav className={styles.menu}>
          {menuItems.map((item) => {
            const isActive = location === item.url;
            return (
              <a
                key={item.title}
                href={item.url}
                className={`${styles.menuItem} ${isActive ? styles.active : ""}`}
              >
                <span className={styles.menuBullet}>•</span>
                {item.title}
              </a>
            );
          })}
        </nav>

        {/* FOOTER USER MENU */}
        <div className={styles.userBox}>
          <div className={styles.avatar}>{getInitials(admin?.fullName) || "AD"}</div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{admin?.fullName || "Admin"}</p>
            <p className={styles.userEmail}>{admin?.email || "admin@example.com"}</p>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className={styles.mainContent}>
        
        {/* HEADER */}
        <header className={styles.header}>
          <div>
            <p className={styles.headerName}>{admin?.fullName}</p>
            <p className={styles.headerRole}>Administrator</p>
          </div>

          <div className={styles.avatarLarge}>
            {getInitials(admin?.fullName) || "AD"}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className={styles.pageContent}>{children}</main>
      </div>
    </div>
  );
}
