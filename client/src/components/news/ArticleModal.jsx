import Hls from "hls.js";
import { useEffect, useRef , useState} from "react";
import { Typography, Chip, Button, Box, Modal, IconButton } from "@mui/material";
import { PlayArrow, ThumbUp, ThumbUpOutlined ,Share} from "@mui/icons-material";
import modalStyles from "./css/ArticleModal.module.css";
import { userAPI } from "../../services/api";

const isYouTube = (url) => url && (url.includes("youtube.com") || url.includes("youtu.be"));
const isHls = (url) => url?.endsWith(".m3u8");
const getMediaType = (article) => {
  if (article.isVideo && article.mediaUrl) {
    if (isYouTube(article.mediaUrl)) return "youtube";
    if (isHls(article.mediaUrl)) return "hls";
    return "video";
  }
  return article.image ? "image" : "none";
};
// Helper to extract YouTube video ID
const extractYouTubeID = (url) => {
  try {
    if (url.includes("youtu.be")) return url.split("/").pop();
    const params = new URL(url).searchParams;
    return params.get("v");
  } catch {
    return "";
  }
};

const ArticleModal = ({ open, onClose, article, handleReadArticle, formatTimeAgo }) => {
  const videoRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [saving, setSaving] = useState(false); // prevents double-submit

  const timeAgo = formatTimeAgo(article.publishedAt);
  const isBreaking = timeAgo === "Just now";
  const showVideo = article.isVideo;
  const mediaType = getMediaType(article);

  useEffect(() => {
    if (!open || mediaType !== "hls") return;
    const video = videoRef.current;
    const hls = new Hls();
    hls.loadSource(article.mediaUrl);
    hls.attachMedia(video);
    return () => hls.destroy();
  }, [open, article.mediaUrl, mediaType]);

  // NOTE: call API first (if needed), then close modal

  const extractTagName = (tag) => {
  // If tag is already simple text
  if (typeof tag === "string" && !tag.trim().startsWith("{")) {
    return tag;
  }

  // If tag is JSON formatted string
  try {
    const parsed = JSON.parse(tag);
    return parsed["_"] || null;
  } catch {
    return null;
  }
};

 const handleClose = async () => {
  onClose();

  if (liked && Array.isArray(article.tags) && article.tags.length > 0) {
    
    // Extract clean tag names
    const cleanedTags = article.tags
      .map(extractTagName)
      .filter(Boolean); // remove nulls

    if (cleanedTags.length === 0) return;

    try {
      await userAPI.addFavTags(cleanedTags);
      console.log("Tags added:", cleanedTags);
    } catch (err) {
      console.error("❌ Error adding tags:", err);
    }
  }
};

  // When user chooses "Read Full Article", preserve same close flow:
  const handleReadFull = async () => {
    // call reading handler first (navigates / marks read)
    try {
      await handleReadArticle(article);
    } catch (err) {
      console.error("❌ handleReadArticle error:", err);
    }
    // then run close logic (this will call API if liked)
    await handleClose();
  };


  const handleShare = (article) => {
  if (navigator.share) {
    navigator.share({ title: article.title, url: article.url }).catch(console.error);
  } else {
    navigator.clipboard.writeText(article.url);
    alert("Link copied!");
  }
};

  return (
    <Modal open={open} onClose={handleClose}>
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
            {mediaType === "youtube" && (
              <iframe
                className={modalStyles.media}
                src={`https://www.youtube.com/embed/${extractYouTubeID(article.mediaUrl)}`}
                title={article.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}

            {mediaType === "hls" && (
              <video ref={videoRef} controls className={modalStyles.media} poster={article.image || ""} />
            )}

            {mediaType === "video" && (
              <video controls className={modalStyles.media} src={article.mediaUrl} poster={article.image || ""} />
            )}

            {mediaType === "image" && <img src={article.image} alt={article.title} className={modalStyles.media} />}
            {mediaType === "none" && (
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
          <Box sx={{ mt: 2 }}>
            <IconButton
              onClick={() => setLiked((v) => !v)}
              color={liked ? "primary" : "default"}
              disabled={saving}
            >
              {liked ? <ThumbUp /> : <ThumbUpOutlined />}
            </IconButton>
          </Box>
          <Box sx={{ mt: 2 }}>
            <IconButton onClick={() => handleShare(article)}>
            <Share fontSize="medium" sx={{ mr: 1 }} /> 
          </IconButton>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={handleReadFull}
            className={modalStyles.readButton}
            disabled={saving}
          >
            Read Full Article
          </Button>
          <Button variant="outlined" size="large" onClick={handleClose} disabled={saving}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ArticleModal;
