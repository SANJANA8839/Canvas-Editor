import { useParams } from "react-router-dom";
import CanvasEditor from "../components/CanvasEditor";
import "../components/canvasEditor.css";

function CanvasPage() {
  const { canvasId } = useParams();

  return (
    <div className="canvas-editor-container">
      <div className="canvas-header">
        <p className="canvas-subtitle"> Start doing your own creativity  </p>
      </div>
      
      <div className="canvas-editor-content">
        <CanvasEditor canvasId={canvasId} />
      </div>
    </div>
  );
}

export default CanvasPage;
