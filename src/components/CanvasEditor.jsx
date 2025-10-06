import { useEffect, useRef } from "react";
// import { fabric } from "fabric";  
import * as fabric from "fabric";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

function CanvasEditor({ canvasId }) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  useEffect(() => {
    // Check if canvas ref is available
    if (!canvasRef.current) return;

    let fabricCanvas = null;
    let isMounted = true;

    const initCanvas = async () => {
      try {
        // 🔹 Init Fabric Canvas
        fabricCanvas = new fabric.Canvas(canvasRef.current, {
          width: 800,
          height: 600,
          backgroundColor: "#fff",
        });
        
        if (!isMounted) {
          fabricCanvas.dispose();
          return;
        }
        
        fabricCanvasRef.current = fabricCanvas;

        // 🔹 Fetch saved canvas data
        const docRef = doc(db, "canvases", canvasId);
        const snap = await getDoc(docRef);
        
        if (!isMounted) return;
        
        console.log("Firestore data:", snap.exists(), snap.data());
        
        if (snap.exists() && snap.data().data) {
          const savedData = snap.data().data;
          console.log("Loading canvas data:", savedData);
          
          // Load the saved canvas data - use await for v6+
          if (isMounted && fabricCanvas) {
            await fabricCanvas.loadFromJSON(savedData);
            fabricCanvas.renderAll();
            console.log("Canvas loaded successfully");
          }
        } else {
          console.log("No saved data found");
          if (isMounted && fabricCanvas) {
            fabricCanvas.renderAll();
          }
        }
      } catch (err) {
        console.error("Error loading canvas:", err);
        if (isMounted && fabricCanvas) {
          fabricCanvas.renderAll();
        }
      }
    };

    initCanvas();

    return () => {
      isMounted = false;
      if (fabricCanvas) {
        fabricCanvas.dispose();
        fabricCanvas = null;
      }
      fabricCanvasRef.current = null;
    };
  }, [canvasId]);

  // 🔹 Save Canvas to Firestore
  const saveCanvas = async () => {
    if (!fabricCanvasRef.current) return;
    const json = fabricCanvasRef.current.toJSON();
    await setDoc(doc(db, "canvases", canvasId), { data: json });
    alert("Canvas Saved!");
  };

  // 🔹 Add Rectangle
  const addRectangle = () => {
    if (!fabricCanvasRef.current) return;
    const rect = new fabric.Rect({
      width: 100,
      height: 60,
      fill: "red",
      left: 50,
      top: 50,
    });
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.renderAll(); 
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={addRectangle}>Add Rectangle</button>
        <button onClick={saveCanvas}>Save</button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: "1px solid black" }}
      />
    </div>
  );
}

export default CanvasEditor;
