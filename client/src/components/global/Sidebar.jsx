import {
  Drawer,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Close, Star, StarBorder } from "@mui/icons-material";
import { userAPI } from "../../services/api";
import styles from "./css/Sidebar.module.css";

const Sidebar = ({
  drawerOpen,
  setDrawerOpen,
  selectedCategory,
  setSelectedCategory,
  categories,
  onCategoryChange,
}) => {


  const [favTopics, setFavTopics] = useState({});

  // On mount, check favorite status for all categories
  useEffect(() => {
    categories.forEach(async (category) => {
      try {
        const { data } = await userAPI.checkFavTopic(category.label);
        setFavTopics((prev) => ({ ...prev, [category.label]: data.fav }));
      } catch (err) {
        console.error("❌ Error checking topic:", err);
      }
    });
  }, [categories]);

  const handleSelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setDrawerOpen(false);

    if (onCategoryChange) {
      onCategoryChange(categoryName);
    }
  };

  const toggleFollow = async (categoryName) => {
    // Optimistic update
    setFavTopics((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));

    try {
      const { data } = await userAPI.toggleFavTopic(categoryName);
      if (data && typeof data.fav === "boolean") {
        setFavTopics((prev) => ({ ...prev, [categoryName]: data.fav }));
      }
    } catch (err) {
      console.error("❌ Error toggling topic:", err);
      // revert on error
      setFavTopics((prev) => ({
        ...prev,
        [categoryName]: !prev[categoryName],
      }));
    }
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
                onClick={() => handleSelect(category.label)}
                className={`${styles.sidebarListItem} ${selectedCategory === category.label ? styles.activeListItem : ""
                  }`}
              >
                {category.icon ? (
                  <ListItemIcon
                    className={`${styles.sidebarListIcon} ${selectedCategory === category.label ? styles.activeIcon : ""
                      }`}
                  >
                    {category.icon}
                  </ListItemIcon>
                ) : (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent triggering select
                      toggleFollow(category.label);
                    }}
                  >
                    {favTopics[category.label] ? <Star /> : <StarBorder />}
                  </IconButton>
                )}

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
                  onClick={() => handleSelect(category.label)}
                  className={`${styles.sidebarListItem} ${selectedCategory === category.label ? styles.activeListItem : ""
                    }`}
                >
                  {category.icon ? (
                    <ListItemIcon
                      className={`${styles.sidebarListIcon} ${selectedCategory === category.label ? styles.activeIcon : ""
                        }`}
                    >
                      {category.icon}
                    </ListItemIcon>
                  ) : (
                    <IconButton
                      size="medium"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent triggering select
                        toggleFollow(category.label);
                      }}
                    >
                      {favTopics[category.label] ? <Star /> : <StarBorder />}
                    </IconButton>
                  )}

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