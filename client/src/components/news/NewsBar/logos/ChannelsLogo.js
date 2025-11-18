import bbc from "./bbc-news-logo.png";
import cnn from "./cnn-logo.png";
import guardian from "./guardian-logo.png";
import aljazeera from "./aljazeera.png";
import dawn from "./Dawn.png";
import espn from "./espn-logo.png";
import geo from "./geo-news-logo.png";
import nyt from "./nyt-logo.png";
import tribune from "./tribune-logo.png";
import jang from "./jang-logo.png";
import defaultLogo from "./default.png";

const logos = { bbc, cnn, guardian, aljazeera, dawn, espn, geo, nyt, tribune, jang };

export const ChannelLogo = ({ channelName, size = 40 }) => {
  const key = channelName?.toLowerCase()?.replace(/\s+/g, "");
  const logo = logos[key] || defaultLogo;

  return (
    <img
      src={logo}
      alt={channelName}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        borderRadius: "8px",
        backgroundColor: "white",
      }}
    />
  );
};




// Map channel names to their logos
const channelLogoMap = {
  "BBC News": bbc,
  "CNN": cnn,
  "The Guardian": guardian,
  "Al Jazeera English": aljazeera,
  "ESPN": espn,
  "Geo News": geo,
  "The New York Times": nyt,
  "Tribune": tribune,
  "Jang": jang,
};

export const getChannelLogo = (channelName) => {
  return channelLogoMap[channelName] || defaultLogo;
};


