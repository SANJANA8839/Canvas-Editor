import React, { useEffect, useRef, useState } from "react";
// import { fabric } from "fabric";
import * as fabric from "fabric";
import Toolbar from "./Toolbar";
import "./canvasEditor.css";

const CanvasEditor = ({ canvasId }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [textValue, setTextValue] = useState("");
  const [objectColor, setObjectColor] = useState("#ff0000");

  useEffect(() => {
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      height: 500,
      width: 800,
      backgroundColor: "#fff",
      selection: true, // objects select/move
    });
    
    // Initialize drawing brush
    initCanvas.freeDrawingBrush = new fabric.PencilBrush(initCanvas);
    initCanvas.freeDrawingBrush.width = 5;
    initCanvas.freeDrawingBrush.color = "black";
    
    // Set up selection events
    initCanvas.on('selection:created', (e) => {
      setSelectedObject(e.selected[0]);
      if (e.selected[0].type === 'textbox') {
        setTextValue(e.selected[0].text);
      }
      if (e.selected[0].fill && typeof e.selected[0].fill === 'string') {
        setObjectColor(e.selected[0].fill);
      }
    });
    
    initCanvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected[0]);
      if (e.selected[0].type === 'textbox') {
        setTextValue(e.selected[0].text);
      }
      if (e.selected[0].fill && typeof e.selected[0].fill === 'string') {
        setObjectColor(e.selected[0].fill);
      }
    });
    
    initCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
      setTextValue("");
    });
    
    // Set up keyboard delete event
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' && initCanvas.getActiveObject()) {
        initCanvas.remove(initCanvas.getActiveObject());
        initCanvas.renderAll();
      }
    });
    
    setCanvas(initCanvas);

    return () => {
      document.removeEventListener('keydown', () => {});
      initCanvas.dispose();
    };
  }, []);

  // ---- Shape Functions ----
  const addShape = (type) => {
    if (!canvas) return;
    canvas.isDrawingMode = false; // Pen/eraser off

    let shape;
    switch (type) {
      case "rectangle":
        shape = new fabric.Rect({
          width: 100,
          height: 100,
          fill: "red",
          left: 50,
          top: 50,
          selectable: true,
        });
        break;
      case "circle":
        shape = new fabric.Circle({
          radius: 50,
          fill: "blue",
          left: 100,
          top: 100,
          selectable: true,
        });
        break;
      case "line":
        shape = new fabric.Line([50, 50, 200, 200], {
          stroke: "green",
          strokeWidth: 5,
          selectable: true,
        });
        break;
      default:
        return;
    }

    canvas.add(shape);
    canvas.renderAll();
  };

  // ---- Text Tool Function ----
  const addText = () => {
    if (!canvas) return;
    canvas.isDrawingMode = false;
    
    const text = new fabric.Textbox('Double click to edit', {
      left: 50,
      top: 50,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: objectColor,
      width: 200,
      editable: true
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };
  
  // ---- Delete Selected Object ----
  const deleteSelected = () => {
    if (!canvas) return;
    if (canvas.getActiveObject()) {
      canvas.remove(canvas.getActiveObject());
      canvas.renderAll();
      setSelectedObject(null);
      setTextValue("");
    }
  };
  
  // ---- Update Text Value ----
  const updateTextValue = () => {
    if (!canvas || !selectedObject || selectedObject.type !== 'textbox') return;
    
    selectedObject.set({ text: textValue });
    canvas.renderAll();
  };
  
  // ---- Update Object Color ----
  const updateObjectColor = (color) => {
    setObjectColor(color);
    
    if (!canvas || !selectedObject) return;
    
    if (selectedObject.type === 'path') {
      selectedObject.set({ stroke: color });
    } else {
      selectedObject.set({ fill: color });
    }
    
    canvas.renderAll();
  };

  // ---- Tool Toggle Function ----
  const setTool = (tool) => {
    if (!canvas) return;

    // First disable drawing mode to reset
    canvas.isDrawingMode = false;

    switch (tool) {
      case "text":
        addText();
        break;
      case "pen":
        // Create a fresh pencil brush
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = 5;
        canvas.freeDrawingBrush.color = objectColor;
        canvas.isDrawingMode = true;
        console.log("Pen mode activated");
        break;
      case "eraser":
        // For eraser, we use the same brush but with background color
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = 20;
        canvas.freeDrawingBrush.color = canvas.backgroundColor || "#fff";
        canvas.isDrawingMode = true;
        console.log("Eraser mode activated");
        break;
      case "delete":
        deleteSelected();
        break;
      case "rectangle":
      case "circle":
      case "line":
        addShape(tool);
        break;
      default:
        // Selection mode
        break;
    }
    
    // Force a re-render to update the canvas
    canvas.renderAll();
  };

  // ---- Save Function ----
  const saveCanvas = () => {
    if (!canvas) return;
    const data = canvas.toJSON();
    localStorage.setItem("canvasData", JSON.stringify(data));
    alert("Canvas saved!");
  };

  return (
    <div className="canvas-editor-main">
      <div className="toolbar">
        <Toolbar setTool={setTool} addShape={addShape} saveCanvas={saveCanvas} />
      </div>
      
      {/* Color Picker and Delete Button */}
      <div className="controls-section">
        <div className="color-picker-container">
          <label className="color-label">
            Color
            <input 
              type="color" 
              className="color-input"
              value={objectColor} 
              onChange={(e) => updateObjectColor(e.target.value)} 
              title="Choose a color"
            />
          </label>
        </div>
        
        {/* Delete button */}
        <button 
          className="delete-button"
          onClick={deleteSelected} 
          disabled={!selectedObject}
        >
          Delete Selected
        </button>
      </div>
      
      {/* Text editing */}
      {selectedObject && selectedObject.type === 'textbox' && (
        <div className="controls-section text-editor">
          <input
            type="text"
            className="text-input"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
          />
          <button className="update-text-button" onClick={updateTextValue}>Update Text</button>
        </div>
      )}
      
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ touchAction: "none" }} />
      </div>
      
      <div className="tips-section">
        <div className="tips-title"> confused? Don't worry !</div>
        <div className="tips-title">these tips can guide you :  </div>
        <ul className="tips-list">
          <li>Select objects by clicking on them</li>
          <li>Resize and rotate  objects using the corner handles</li>
          <li>Choose your favorite color using color icon</li>
          <li>Press Delete key to remove selected objects</li>
        </ul>
      </div>
    </div>
  );
};

export default CanvasEditor;
