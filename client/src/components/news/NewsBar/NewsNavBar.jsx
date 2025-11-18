

import { useState } from "react"
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
import { ChevronLeft, ChevronRight,Search, Close } from "@mui/icons-material";
import { styled } from "@mui/system";
import styles from "./NewsNavbar.module.css";
import {ChannelLogo} from "./logos/ChannelsLogo.js";

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


export default function NewsNavbar({ activeTab, onTabChange, selectedChannel, onChannelSelect , searchQuery,setSearchQuery}) {
  const [showSearch, setShowSearch] = useState(false); 

  const scrollRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const tabs = ["Home",
    //  "Headlines",
      "Following"];

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

          {/* Search Icon / Input */}
<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  {showSearch ? (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <input
        type="text"
        value={searchQuery}
        placeholder="Search articles..."
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          padding: "4px 8px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          width: "200px",
        }}
      />
      <IconButton size="small" onClick={() => { setShowSearch(false); setSearchQuery(""); }}>
        <Close />
      </IconButton>
    </Box>
  ) : (
    <IconButton size="small" onClick={() => setShowSearch(true)}>
      <Search />
    </IconButton>
  )}
</Box>

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
                className={`${styles.channelItem} ${selectedChannel === channel.name ? styles.activeChannel : ""}`}
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
