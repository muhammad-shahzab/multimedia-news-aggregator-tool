// import { useEffect, useRef } from "react";
// import Hls from "hls.js";
// import {
//   Typography,
//   Chip,
//   Button,
//   IconButton,
// } from "@mui/material";
// import {
//   ThumbUp,
//   Share,
//   Bookmark,
//   BookmarkBorder,
//   PlayArrow,
// } from "@mui/icons-material";
// import CommentIcon from "@mui/icons-material/Comment";
// import styles from "./css/ArticleCard.module.css";

// const isValidUrl = (url) => {
//   try {
//     new URL(url);
//     return true;
//   } catch {
//     return false;
//   }
// };

// const ArticleCard = ({
//   article,
//   bookmarkedArticles,
//   handleBookmark,
//   handleReadArticle,
//   formatTimeAgo,
// }) => {
//   const videoRef = useRef(null);

//   useEffect(() => {
//     let hls;
//     if (article.isVideo && article.type !== "video" && isValidUrl(article.videoUrl)) {
//       const video = videoRef.current;
//       if (Hls.isSupported() && article.videoUrl.endsWith(".m3u8")) {
//         hls = new Hls();
//         hls.loadSource(article.videoUrl);
//         hls.attachMedia(video);
//       } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//         video.src = article.videoUrl;
//       }
//     }
//     return () => {
//       if (hls) hls.destroy();
//     };
//   }, [article.videoUrl, article.isVideo, article.type]);

//   const isBookmarked = bookmarkedArticles.has(article.id);
//   const timeAgo = formatTimeAgo(article.pubDate);
//   const isBreaking = timeAgo === "Just now";

//   const isYouTubeVideo = article.type === "video" && isValidUrl(article.videoUrl);
//   const showVideo = article.isVideo && isValidUrl(article.videoUrl) && article.type !== "video";
//   const showImage = isValidUrl(article.image) && !isYouTubeVideo;

//   const getYouTubeEmbedUrl = (url) => {
//     if (!url || !url.includes("youtube.com/watch")) return url;
//     const videoId = url.split("v=")[1]?.split("&")[0];
//     return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
//   };

//   return (
//     <div className={styles.card}>
//       {/* === Chips === */}
//       <div className={styles.chips}>
//         <Chip label={article.category} color="primary" size="small" />
//         {isBreaking && (
//           <Chip label="BREAKING" color="error" size="small" className={styles.breakingBadge} />
//         )}
//         {(showVideo || isYouTubeVideo) && (
//           <Chip label="Video" icon={<PlayArrow />} variant="outlined" size="small" />
//         )}
//       </div>

//       {/* === Media (Image / Video) === */}
//       <div className={styles.mediaWrapper}>
//         {isYouTubeVideo ? (
//           <iframe
//             src={getYouTubeEmbedUrl(article.videoUrl)}
//             title={article.title}
//             className={styles.media}
//             frameBorder="0"
//             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//             allowFullScreen
//           />
//         ) : showVideo ? (
//           <video
//             ref={videoRef}
//             controls
//             className={styles.media}
//             poster={showImage ? article.image : ""}
//           >
//             Your browser does not support the video tag.
//           </video>
//         ) : showImage ? (
//           <img
//             src={article.image}
//             alt={article.title}
//             className={styles.media}
//             loading="lazy"
//           />
//         ) : (
//           <div className={styles.placeholder}>
//             <Typography variant="body2" color="textSecondary">
//               No Media Available
//             </Typography>
//           </div>
//         )}
//       </div>

//       {/* === Title === */}
//       <Typography
//         variant="h6"
//         onClick={() => handleReadArticle(article)}
//         className={styles.title}
//       >
//         {article.title}
//       </Typography>

//       {/* === Summary (clamped for consistency) === */}
//       <Typography variant="body2" className={styles.summary}>
//         {article.summary}
//       </Typography>

//       {/* === Meta + Actions === */}
//       <div className={styles.metaActions}>
//         <div className={styles.meta}>
//           <span>{article.source}</span>
//           <span>•</span>
//           <span>{timeAgo}</span>
//         </div>
//         <div className={styles.actions}>
//           <Button size="small" startIcon={<ThumbUp />}>
//             {article.likes}
//           </Button>
//           <Button size="small" startIcon={<CommentIcon />}>
//             {article.comments}
//           </Button>
//           <IconButton size="small">
//             <Share />
//           </IconButton>
//           <IconButton
//             size="small"
//             onClick={() => handleBookmark(article)}
//             color={isBookmarked ? "primary" : "default"}
//           >
//             {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
//           </IconButton>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ArticleCard;

// Updated ArticleCard.jsx - Now uses independent ArticleModal


import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import {
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import {
  PlayArrow,
  Bookmark,
  BookmarkBorder,
} from "@mui/icons-material";
import styles from "./css/ArticleCard.module.css";
import ArticleModal from "./ArticleModal";
import { bookmarksAPI } from "../../services/api";
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const ArticleCard = ({
  article,
  bookmarkedArticles,
  //  handleBookmark,
  handleReadArticle,
  formatTimeAgo,
}) => {
  const videoRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(bookmarkedArticles.has(article._id));
  useEffect(() => {
    let hls;
    if (article.isVideo && isValidUrl(article.mediaUrl)) {
      const video = videoRef.current;
      if (Hls.isSupported() && article.mediaUrl.endsWith(".m3u8")) {
        hls = new Hls();
        hls.loadSource(article.mediaUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = article.mediaUrl;
      }
    }
    return () => {
      if (hls) hls.destroy();
    };
  }, [article.mediaUrl, article.isVideo]);

  const timeAgo = formatTimeAgo(article.publishedAt);
  const isBreaking = timeAgo === "Just now";
  const showVideo = article.isVideo && isValidUrl(article.mediaUrl);
  const showImage = isValidUrl(article.image) && !showVideo;

  const handleBookmark = async () => {
  try {
    if (isBookmarked) {
      // Find the bookmark document ID for this article
      const { data } = await bookmarksAPI.getBookmarks();
      const bm = data.find((b) => b.articleId === article._id);
      if (bm) {
        // Remove the bookmark using the bookmark doc ID
        await bookmarksAPI.removeBookmark(bm._id);
        console.log("Bookmark removed for article:", article._id);
        setIsBookmarked(false);
      }
    } else {
      // Add bookmark: send only articleId
      await bookmarksAPI.addBookmark({ articleId: article._id });
      console.log("Bookmark added for article:", article._id);
      setIsBookmarked(true);
    }
  } catch (err) {
    console.error("❌ Bookmark toggle error:", err);
  }
};




  return (
    <>
      <div className={styles.card} onClick={() => setModalOpen(true)}>
        {/* Chips */}
        <div className={styles.chips}>
          <Chip label={article.category} color="primary" size="small" />
          {isBreaking && (
            <Chip label="BREAKING" color="error" size="small" className={styles.breakingBadge} />
          )}
          {showVideo && (
            <Chip label="Video" icon={<PlayArrow />} variant="outlined" size="small" />
          )}
        </div>

        {/* Media */}
        <div className={styles.mediaWrapper}>
          {showVideo ? (
            <video
              ref={videoRef}
              controls
              className={styles.media}
              poster={showImage ? article.image : ""}
            >
              Your browser does not support the video tag.
            </video>
          ) : showImage ? (
            <img
              src={article.image}
              alt={article.title}
              className={styles.media}
              loading="lazy"
            />
          ) : (
            <div className={styles.placeholder}>
              <Typography variant="body2" color="text.secondary">
                No Media Available
              </Typography>
            </div>
          )}
        </div>

        {/* Title */}
        <Typography variant="h6" className={styles.title}>
          {article.title}
        </Typography>

        {/* Summary */}
        <Typography variant="body2" className={styles.summary}>
          {article.summary}
        </Typography>

        {/* Meta + Actions */}
        <div className={styles.metaActions}>
          <div className={styles.meta}>
            <span>{article.channel}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
          <div className={styles.actions}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleBookmark(); // local toggle
              }}
              color={isBookmarked ? "primary" : "default"}
            >
              {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
          </div>
        </div>
      </div>

      <ArticleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        article={article}
        handleReadArticle={() => handleReadArticle(article)}
        formatTimeAgo={formatTimeAgo}
      />
    </>
  );
};

export default ArticleCard;