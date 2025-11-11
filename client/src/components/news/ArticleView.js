import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Button, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState, useEffect } from "react";

function ArticleView() {
  const location = useLocation();
  const navigate = useNavigate();
  const url = location.state?.url;
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setBlocked(false); // reset if URL changes
  }, [url]);

  if (!url) {
    return <Typography>No article found</Typography>;
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header with Back Button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #ddd",
        }}
      >
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>
          Reading Article
        </Typography>
      </Box>

      {/* Article Content */}
      {blocked ? (
        <Box
          textAlign="center"
          flex={1}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h6" gutterBottom>
            This site doesn’t allow embedding.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.open(url, "_blank")}
          >
            Open in New Tab
          </Button>
        </Box>
      ) : (
        <iframe
          src={url}
          title="Article"
          width="100%"
          height="100%"
          style={{ border: "none", flex: 1 }}
          allow="autoplay; fullscreen; microphone; camera; encrypted-media"
          onError={() => setBlocked(true)}
        />
      )}
    </Box>
  );
}

export default ArticleView;
