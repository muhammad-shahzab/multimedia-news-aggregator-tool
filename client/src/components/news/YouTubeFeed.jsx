// /client/src/components/YouTubeFeed.jsx
import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardMedia,
  CardContent,
  Box,
  Button,
} from "@mui/material";

const YouTubeFeed = ({ category = "for-you" }) => {
  const [videos, setVideos] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    fetch(`http://localhost:5000/api/youtube/videos?category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        setVisibleCount(10);
      })
      .catch(console.error);
  }, [category]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        YouTube News Videos
      </Typography>

      {videos.slice(0, visibleCount).map((video, index) => {
        const videoId = new URL(video.link).searchParams.get("v");
        return (
          <Card key={index} sx={{ mb: 3 }}>
            <CardMedia
              component="iframe"
              src={`https://www.youtube.com/embed/${videoId}`}
              height="360"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={video.title}
            />
            <CardContent>
              <Typography variant="h6">{video.title}</Typography>
              <Typography variant="body2">{video.description}</Typography>
              <Typography variant="caption">
                Published: {video.published}
              </Typography>
            </CardContent>
          </Card>
        );
      })}

      {visibleCount < videos.length && (
        <Box mt={2} display="flex" justifyContent="center">
          <Button onClick={handleLoadMore} variant="contained">
            Load More Videos
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default YouTubeFeed;
