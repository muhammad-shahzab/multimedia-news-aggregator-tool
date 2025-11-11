import { useEffect, useRef } from "react";
import Hls from "hls.js";
import {
  Typography,
  Chip,
  Button,
  Box,
  Modal,
} from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import modalStyles from "./css/ArticleModal.module.css";

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const ArticleModal = ({
  open,
  onClose,
  article,
  handleReadArticle,
  formatTimeAgo,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    let hls;
    if (open && article.isVideo && isValidUrl(article.mediaUrl)) {
      const video = videoRef.current;
      if (Hls.isSupported() && article.mediaUrl.endsWith(".m3u8")) {
        hls = new Hls();
        hls.loadSource(article.mediaUrl);
        hls.attachMedia(video);
      } else if (video && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = article.mediaUrl;
      }
    }
    return () => {
      if (hls) hls.destroy();
    };
  }, [open, article.mediaUrl, article.isVideo]);

  const timeAgo = formatTimeAgo(article.publishedAt);
  const isBreaking = timeAgo === "Just now";
  const showVideo = article.isVideo && isValidUrl(article.mediaUrl);
  const showImage = isValidUrl(article.image) && !showVideo;

  const handleReadFull = () => {
    handleReadArticle(article);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box className={modalStyles.modalCard}>
        {/* Scrollable Content */}
        <Box className={modalStyles.contentWrapper}>
          {/* Chips */}
          <div className={modalStyles.chips}>
            <Chip label={article.category} color="primary" size="small" />
            {isBreaking && (
              <Chip
                label="BREAKING"
                color="error"
                size="small"
                className={modalStyles.breakingBadge}
              />
            )}
            {showVideo && (
              <Chip label="Video" icon={<PlayArrow />} variant="outlined" size="small" />
            )}
          </div>

          {/* Media */}
          <div className={modalStyles.mediaWrapper}>
            {showVideo ? (
              <video
                ref={videoRef}
                controls
                className={modalStyles.media}
                poster={showImage ? article.image : ""}
              >
                Your browser does not support the video tag.
              </video>
            ) : showImage ? (
              <img
                src={article.image}
                alt={article.title}
                className={modalStyles.media}
                loading="lazy"
              />
            ) : (
              <div className={modalStyles.placeholder}>
                <Typography variant="body2" color="text.secondary">
                  No Media Available
                </Typography>
              </div>
            )}
          </div>

          {/* Title */}
          <Typography variant="h5" className={modalStyles.title}>
            {article.title}
          </Typography>

          {/* Summary */}
          <Typography variant="body1" className={modalStyles.summary}>
            {article.summary}
          </Typography>

          {/* Meta */}
          <div className={modalStyles.meta}>
            <span>{article.channel}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </Box>

        {/* Fixed Action Buttons */}
        <Box className={modalStyles.actionsWrapper}>
          <Button
            variant="contained"
            size="large"
            onClick={handleReadFull}
            className={modalStyles.readButton}
          >
            Read Full Article
          </Button>
          <Button variant="outlined" size="large" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ArticleModal;