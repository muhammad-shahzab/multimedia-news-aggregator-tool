// import React, { useMemo } from "react";
// import {
//   AppBar, Toolbar, Typography, TextField,
//   InputAdornment, IconButton, Avatar, Menu, MenuItem,
// } from "@mui/material";
// import {
//   Search, Bookmark, AccessTime, AccountCircle,
//   Settings, Logout, Menu as MenuIcon,
// } from "@mui/icons-material";
// import { debounce } from "lodash";
// import styles from "./css/Header.module.css";

// const Header = ({
//   user, navigate, searchQuery, setSearchQuery,
//   anchorEl, setAnchorEl, handleLogout, setDrawerOpen,
// }) => {
//   const avatarLetter = user?.username?.[0]?.toUpperCase() ?? "U";

//   const debouncedSearch = useMemo(
//     () => debounce((v) => setSearchQuery(v), 300),
//     [setSearchQuery]
//   );

//   const handleMenuClick = (e) => setAnchorEl(e.currentTarget);
//   const handleMenuClose = () => setAnchorEl(null);
//   const handleNavigate = (p) => { handleMenuClose(); navigate(p); };

//   const menuItems = useMemo(
//     () => [
//       { label: "Profile",   icon: <AccountCircle />, path: "/profile" },
//       { label: "Settings",  icon: <Settings />,      path: "/settings" },
//     ],
//     []
//   );

//   return (
//     <AppBar position="sticky" className={styles.appbar}>
//       <Toolbar className={styles.toolbar}>
//         {/* Mobile menu */}
//         <div className={styles.menuIcon}>
//           <IconButton edge="start" onClick={() => setDrawerOpen(true)}>
//             <MenuIcon />
//           </IconButton>
//         </div>

//         {/* Logo */}
//         <div className={styles.logo}>
//           <Typography className={styles.logoText}>Persona</Typography>
//         </div>

//         {/* Search */}
//         <div className={styles.searchContainer}>
//           <TextField
//             fullWidth
//             size="small"
//             placeholder="Search news, topics, or sources..."
//             defaultValue={searchQuery}
//             onChange={(e) => debouncedSearch(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <Search className={styles.searchIcon} />
//                 </InputAdornment>
//               ),
//             }}
//           />
//         </div>

//         {/* Right actions */}
//         <div className={styles.actions}>
//           <IconButton onClick={() => navigate("/bookmarks")}>
//             <Bookmark className={styles.Bookmarkicon} />
//           </IconButton>
//           <IconButton onClick={() => navigate("/history")}>
//             <AccessTime className={styles.Bookmarkicon} />
//           </IconButton>
//           <IconButton onClick={handleMenuClick}>
//             <Avatar className={styles.avatar}>{avatarLetter}</Avatar>
//           </IconButton>
//         </div>
//       </Toolbar>

//       {/* Dropdown */}
//       <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
//         {menuItems.map(({ label, icon, path }) => (
//           <MenuItem key={label} onClick={() => handleNavigate(path)}>
//             {icon}
//             <span className={styles.menuItemText}>{label}</span>
//           </MenuItem>
//         ))}
//         <MenuItem onClick={handleLogout}>
//           <Logout className={styles.logoutIcon} />
//           Logout
//         </MenuItem>
//       </Menu>
//     </AppBar>
//   );
// };

// export default React.memo(Header);