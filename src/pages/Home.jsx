import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "../index.css";

function Home() {
  const navigate = useNavigate();

  const createCanvas = async () => {
    const docRef = await addDoc(collection(db, "canvases"), {
      data: null // initially empty
    });
    navigate(`/canvas/${docRef.id}`);
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="hero-section">
          <h1 className="hero-title">Canvas Editor</h1>
          <p className="hero-subtitle">
            Create, design, and collaborate on beautiful 2D canvases in real-time
          </p>
        </div>
        
        <div className="cta-section">
          <button className="primary-button" onClick={createCanvas}>
            <span className="button-icon">✨</span>
            Create New Canvas
          </button>
        </div>

        <div className="features-section">
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Draw & Design</h3>
            <p>Intuitive tools for creative expression</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">☁️</div>
            <h3>Cloud Sync</h3>
            <p>Your work saved securely in the cloud</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>Share Easily</h3>
            <p>Collaborate with shareable links</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
