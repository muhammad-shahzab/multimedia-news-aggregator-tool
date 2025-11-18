
import { useState } from "react";
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
import { getChannelLogo } from "./NewsBar/logos/ChannelsLogo.js"


const ArticleCard = ({ article, bookmarkedArticles, handleReadArticle, formatTimeAgo, }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(bookmarkedArticles.has(article._id));

 


  const thumbnail = article.image || "";
  const placeholder = getChannelLogo(article.channel);
  const timeAgo = formatTimeAgo(article.publishedAt);
  const isBreaking = timeAgo === "Just now";

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
          {article.isVideo && (
            <Chip label="Video" icon={<PlayArrow />} variant="outlined" size="small" />
          )}
        </div>




        <div className={styles.mediaWrapper}>
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={article.title}
              className={styles.media}
              loading="lazy"
            />
          ) : (
            // <div className={styles.placeholder}>
            //   <Typography variant="body2" color="text.secondary">
            //     No Media Available
            //   </Typography>
            // </div>

            <img
              src={placeholder}
              alt={article.title}
              className={styles.media}
            />

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