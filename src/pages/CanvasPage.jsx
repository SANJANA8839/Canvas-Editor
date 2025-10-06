import { useParams } from "react-router-dom";
import CanvasEditor from "../components/CanvasEditor";

function CanvasPage() {
  const { canvasId } = useParams();

  return (
    <div>
      <h2>Canvas ID: {canvasId}</h2>
      <CanvasEditor canvasId={canvasId} />
    </div>
  );
}

export default CanvasPage;
