import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import styles from "./StatCard.module.css";

export default function StatCard({ title, value, icon: Icon, trend, trendLabel }) {
  const isPositive = trend !== undefined && trend >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={styles.card} data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={styles.cardContent}>
        
        <div className={styles.topRow}>
          <div className={styles.iconBox}>
            <Icon className={styles.mainIcon} />
          </div>

          {trend !== undefined && (
            <div className={isPositive ? styles.trendPositive : styles.trendNegative}>
              <TrendIcon className={styles.trendIcon} />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        <p className={styles.title}>{title}</p>

        <p
          className={styles.value}
          data-testid={`stat-value-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>

        {trendLabel && <p className={styles.trendLabel}>{trendLabel}</p>}
      </div>
    </div>
  );
}
