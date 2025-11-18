
import { Box, Card, CardContent, Typography, Avatar, IconButton, Tooltip } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      alert("Email copied!");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: "100px", // space from navbar
        px: 2,
      }}
    >
      <Card sx={{ width: 400, p: 3, boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        

          {/* Avatar */}
          <Avatar
            src={user?.avatar || ""}
            sx={{ width: 100, height: 100 }}
          >
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </Avatar>

          {/* Username */}
          <Typography variant="h5">{user?.username || "User"}</Typography>

          {/* Email */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>{user?.email || "No email"}</Typography>
            {user?.email && (
              <Tooltip title="Copy email">
                <IconButton size="small" onClick={handleCopyEmail}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
