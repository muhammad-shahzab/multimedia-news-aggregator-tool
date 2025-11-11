

import { useRef } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { styled } from "@mui/system";
import styles from "./NewsNavbar.module.css";
import ChannelLogo from "./logos/ChannelsLogo";

const ScrollContainer = styled(Box)(() => ({
  display: "flex",
  overflowX: "auto",
  whiteSpace: "nowrap",
  alignItems: "center",
  gap: "12px",
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": { display: "none" },
  scrollBehavior: "smooth",
  width: "100%",
}));



export const channels = [
  {
    name: "BBC News",
    logo: "BBC",
  },
  {
    name: "CNN",
    logo: "CNN",
  },
  {
    name: "The Guardian",
    logo: "Guardian",
  },
  {
    name: "Al Jazeera English",
    logo: "Al Jazeera",
  },
  {
    name: "Dawn",
    logo: "Dawn",
  },
  {
    name: "ESPN",
    logo: "ESPN",
  },
  {
    name: "Geo News",
    logo: "Geo",
  },
  {
    name: "The New York Times",
    logo: "NYT",
  },
  {
    name: "Tribune",
    logo: "Tribune",
  },
  {
    name: "Jang",
    logo: "Jang",
  },
];


export default function NewsNavbar({ activeTab, onTabChange, selectedChannel, onChannelSelect }) {
  const scrollRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const tabs = ["Home", "Headlines", "Following"];

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -120, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 120, behavior: "smooth" });

  return (
    <AppBar position="sticky" elevation={1} className={styles.navbar}>
      <Toolbar
        className={styles.toolbar}
        sx={{
          flexDirection: isMobile ? "column" : "row",
          alignItems: "flex-start",
          gap: isMobile ? 1 : 2,
        }}
      >
        {/* Tabs Section */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flex: isMobile ? "1 1 100%" : "0 0 40%",
            flexWrap: "wrap",
            mb: isMobile ? 1 : 0,
          }}
        >
          {tabs.map((tab) => (
            <Button
              key={tab}
              onClick={() => { console.log("Tab clicked:", tab); onTabChange(tab) }}

              className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ""}`}
            >
              {tab}
            </Button>
          ))}
        </Box>

        {/* Channels Slider */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flex: isMobile ? "1 1 100%" : "0 0 60%",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <IconButton size="small" onClick={scrollLeft}>
            <ChevronLeft fontSize="small" />
          </IconButton>

          <ScrollContainer ref={scrollRef}>
            {channels.map((channel) => (
              <Box
                key={channel.name}
                onClick={() => {
                  console.log("Channel clicked:", channel.name);
                   onChannelSelect(channel.name)
                }}
                className={`${styles.channelItem} ${selectedChannel === channel ? styles.activeChannel : ""}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0.3rem 0.6rem",
                  borderRadius: "8px",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
              >
                <ChannelLogo channelName={channel.logo} size={isMobile ? 26 : 32} />
                <Typography variant="body2" className={styles.channelName}>
                  {channel.name}
                </Typography>
              </Box>
            ))}
          </ScrollContainer>

          <IconButton size="small" onClick={scrollRight}>
            <ChevronRight fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
