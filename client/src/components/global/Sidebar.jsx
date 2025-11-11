import {
  Drawer,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import styles from "./css/Sidebar.module.css";

const Sidebar = ({
  drawerOpen,
  setDrawerOpen,
  selectedCategory,
  setSelectedCategory,
  categories,
}) => {
  const handleSelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* MOBILE DRAWER */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        className="md:hidden"
        PaperProps={{ className: styles.sidebarDrawer }}
      >
        <div className={styles.drawerHeader}>
          <Typography variant="h6" className={styles.sidebarTitle}>
            Categories
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <Close />
          </IconButton>
        </div>

        <div className={styles.sidebarListContainer}>
          <List>
            {categories.map((category) => (
              <ListItem
                key={category.id}
                button
                onClick={() => handleSelect(category.id)}
                className={`${styles.sidebarListItem} ${
                  selectedCategory === category.id ? styles.activeListItem : ""
                }`}
              >
                <ListItemIcon
                  className={`${styles.sidebarListIcon} ${
                    selectedCategory === category.id ? styles.activeIcon : ""
                  }`}
                >
                  {category.icon}
                </ListItemIcon>
                <ListItemText primary={category.label} />
              </ListItem>
            ))}
          </List>
        </div>
      </Drawer>

      {/* DESKTOP SIDEBAR */}
      <div className={styles.desktopSidebarWrapper}>
        <aside className={styles.desktopSidebar}>
          <Typography variant="h5" fontWeight="bold" className={styles.sidebarTitle}>
            Categories
          </Typography>

          <div className={styles.sidebarContainer}>
            <List>
              {categories.map((category) => (
                <ListItem
                  key={category.id}
                  button
                  onClick={() => handleSelect(category.id)}
                  className={`${styles.sidebarListItem} ${
                    selectedCategory === category.id ? styles.activeListItem : ""
                  }`}
                >
                  <ListItemIcon
                    className={`${styles.sidebarListIcon} ${
                      selectedCategory === category.id ? styles.activeIcon : ""
                    }`}
                  >
                    {category.icon}
                  </ListItemIcon>
                  <ListItemText primary={category.label} />
                </ListItem>
              ))}
            </List>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;