import { useParams, Link } from "react-router-dom";
import CanvasEditor from "../components/CanvasEditor";
import "../components/canvasEditor.css";

function CanvasPage() {
  const { canvasId } = useParams();

  return (
    <div className="canvas-editor-container">
      <div className="canvas-header">
        <p className="canvas-subtitle">Unleash Your Creativity</p>
        <div className="page-navigation">
          <Link to="/" className="home-link">
            ← Back to Home
          </Link>
          {canvasId && (
            <div className="canvas-session-info">
              Canvas ID: {canvasId.substring(0, 8)}...
            </div>
          )}
        </div>
      </div>
      
      <div className="canvas-editor-content">
        <CanvasEditor canvasId={canvasId} />
      </div>
    </div>
  );
}

export default CanvasPage;
