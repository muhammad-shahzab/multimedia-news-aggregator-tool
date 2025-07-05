import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

export default function NewsFeed() {
  const { token } = useContext(AuthContext);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    async function fetchRSS() {
      try {
        const res = await axios.get("http://localhost:5000/api/rssfeed", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setArticles(res.data);
      } catch (err) {
        console.error(err);
        alert("Error loading RSS feed");
      }
    }

    fetchRSS();
  }, [token]);

  return (
    <div>
      <h2>Your Personalized RSS News</h2>
      {articles.map((article, idx) => (
        <div key={idx} style={{border:"1px solid #ccc", margin:"10px", padding:"10px"}}>
          <h3>{article.title}</h3>
          {article.image && (
            <img src={article.image} alt="" style={{maxWidth:"100%"}} />
          )}
          <p>{article.contentSnippet}</p>
          <p><em>{article.pubDate}</em></p>
          <a href={article.link} target="_blank" rel="noreferrer">
            Read full article
          </a>
        </div>
      ))}
    </div>
  );
}
