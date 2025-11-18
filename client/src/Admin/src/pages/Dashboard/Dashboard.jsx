import { useState, useEffect } from "react";
import { Users, FileText, Tv, Activity as ActivityIcon } from "lucide-react";
import StatCard from "../components/StatCard";
import ActivityLog from "../components/ActivityLog";
import DashboardLayout from "../components/DashboardLayout";
import { Card } from "../components/ui/Card"; // assuming simple Card component
import styles from "../styles/Dashboard.module.css"; // CSS module for styling

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [distributionData, setDistributionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const [statsRes, activitiesRes, userGrowthRes, contentRes, distributionRes] =
          await Promise.all([
            fetch("/api/dashboard/stats").then((res) => res.json()),
            fetch("/api/dashboard/activities").then((res) => res.json()),
            fetch("/api/dashboard/charts/user-growth").then((res) => res.json()),
            fetch("/api/dashboard/charts/content").then((res) => res.json()),
            fetch("/api/dashboard/charts/distribution").then((res) => res.json()),
          ]);

        setStats(statsRes);
        setActivities(activitiesRes);
        setUserGrowthData(userGrowthRes);
        setContentData(contentRes);
        setDistributionData(distributionRes);

      } catch (err) {
        console.error(err);
        setError("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.center}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className={styles.center}>
          <p className={styles.error}>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Analytics Dashboard</h1>
          <p>Overview of your system metrics and performance</p>
        </div>

        <div className={styles.fourColGrid}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 0}
            icon={Users}
            trend={stats.userGrowth}
            trendLabel="vs last month"
          />
          <StatCard
            title="Total Articles"
            value={stats.totalArticles || 0}
            icon={FileText}
            trend={stats.articleGrowth}
            trendLabel="vs last month"
          />
          <StatCard
            title="Multimedia Channels"
            value={stats.totalMultimediaChannels || 0}
            icon={Tv}
            trend={stats.channelGrowth}
            trendLabel="vs last month"
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers || 0}
            icon={ActivityIcon}
            trend={stats.activeUserGrowth}
            trendLabel="last 7 days"
          />
        </div>

        <div className={styles.twoColGrid}>
          <Card>
            <div className={styles.cardHeader}>
              <h3>User Growth (Last 7 Days)</h3>
            </div>
            <div className={styles.cardContent}>
              {userGrowthData ? (
                <canvas id="userGrowthChart"></canvas>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </Card>

          <Card>
            <div className={styles.cardHeader}>
              <h3>Content Overview</h3>
            </div>
            <div className={styles.cardContent}>
              {contentData ? (
                <canvas id="contentChart"></canvas>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </Card>
        </div>

        <div className={styles.threeColGrid}>
          <Card>
            <div className={styles.cardHeader}>
              <h3>Content Distribution</h3>
            </div>
            <div className={styles.cardContent}>
              {distributionData ? (
                <canvas id="distributionChart"></canvas>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </Card>

          <div className={styles.activityLogWrapper}>
            <ActivityLog activities={activities} />
          </div>
        </div>

        <Card>
          <div className={styles.cardHeader}>
            <h3>System Health</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.systemHealthGrid}>
              <div className={styles.healthItem}>
                <p>API Status</p>
                <p>Operational</p>
                <span className={styles.badgeGreen}>Healthy</span>
              </div>
              <div className={styles.healthItem}>
                <p>Database</p>
                <p>Connected</p>
                <span className={styles.badgeGreen}>Healthy</span>
              </div>
              <div className={styles.healthItem}>
                <p>Server Load</p>
                <p>24%</p>
                <span className={styles.badgeBlue}>Normal</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
