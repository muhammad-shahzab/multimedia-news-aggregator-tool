// components/layout/DrawerMenu.jsx
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { AccountCircle, Settings, Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const DrawerMenu = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    onClose();
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <List sx={{ width: 250, pt: 8 }}>
        <ListItem button onClick={() => handleNavigate("/profile")}>
          <ListItemIcon><AccountCircle /></ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem button onClick={() => handleNavigate("/settings")}>
          <ListItemIcon><Settings /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <Divider />
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><Logout /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default DrawerMenu;