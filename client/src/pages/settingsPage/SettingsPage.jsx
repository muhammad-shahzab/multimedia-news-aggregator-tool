"use client";

import { Box, Typography } from "@mui/material";
import styles from "./SettingsPage.module.css";

const SettingsPage = () => {
  return (
    <Box
      className={styles.pageContainer}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <Typography variant="h4" color="textSecondary">
        Coming Soon
      </Typography>
    </Box>
  );
};

export default SettingsPage;
