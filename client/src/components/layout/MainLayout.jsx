// components/layout/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Header from "./Header/Header";
import BottomNav from "./BottomNav/BottomNav";
import { Box } from "@mui/material";
import styles from "./MainLayout.module.css";

const MainLayout = () => {
  return (
    <Box className={styles.layout}>
      <Header />
      <Box component="main" className={styles.content}>
        <Outlet />
      </Box>
      <BottomNav />
    </Box>
  );
};

export default MainLayout;