import React, { useEffect, useRef, useState } from "react";
// import { fabric } from "fabric";
import * as fabric from "fabric";
import Toolbar from "./Toolbar";
import "./canvasEditor.css";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const CanvasEditor = ({ canvasId }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [textValue, setTextValue] = useState("");
  const [objectColor, setObjectColor] = useState("#ff0000");
  const [isLoading, setIsLoading] = useState(true);

  // We've moved the loadCanvasData functionality directly into the useEffect

  useEffect(() => {
    // Don't initialize the canvas until the ref is available
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    console.log("Initializing canvas with ID:", canvasId);
    
    // Make sure we have a clean start
    const canvasElement = canvasRef.current;
    
    // Create a new canvas instance
    const initCanvas = new fabric.Canvas(canvasElement);
    
    // Configure the canvas after creation
    initCanvas.setWidth(800);
    initCanvas.setHeight(500);
    initCanvas.backgroundColor = "#fff";
    initCanvas.selection = true;
    
    // Force a render to initialize properly
    initCanvas.renderAll();
    
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
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && initCanvas.getActiveObject()) {
        initCanvas.remove(initCanvas.getActiveObject());
        initCanvas.renderAll();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Set the canvas in state
    setCanvas(initCanvas);
    
    // Function to load canvas data
    const loadCanvasFromFirestore = async () => {
      if (!canvasId) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Loading canvas data for canvasId:", canvasId);
        const canvasDocRef = doc(db, "canvases", canvasId);
        const docSnap = await getDoc(canvasDocRef);
        
        if (docSnap.exists() && docSnap.data().data) {
          const savedData = docSnap.data().data;
          
          // Load objects based on the format
          if (savedData.version && savedData.objects) {
            console.log("Loading canvas with", savedData.objects.length, "objects");
            
            // Set canvas dimensions
            if (savedData.canvasProps) {
              const width = savedData.canvasProps.width || 800;
              const height = savedData.canvasProps.height || 500;
              const bgColor = savedData.canvasProps.backgroundColor || '#fff';
              
              // Set dimensions
              initCanvas.setWidth(width);
              initCanvas.setHeight(height);
              initCanvas.backgroundColor = bgColor;
            }
            
            // Load objects using proper approach
            const objects = savedData.objects || [];
            
            // Load each object individually to avoid issues
            objects.forEach(objData => {
              try {
                let obj;
                
                switch (objData.type) {
                  case 'rect':
                    obj = new fabric.Rect(objData);
                    break;
                  case 'circle':
                    obj = new fabric.Circle(objData);
                    break;
                  case 'path':
                    obj = new fabric.Path(objData.path, objData);
                    break;
                  case 'line':
                    obj = new fabric.Line(objData.points || [0, 0, 100, 100], objData);
                    break;
                  case 'textbox':
                    obj = new fabric.Textbox(objData.text || "Text", objData);
                    break;
                  case 'text':
                    obj = new fabric.Text(objData.text || "Text", objData);
                    break;
                  default:
                    console.log("Unknown object type:", objData.type);
                }
                
                if (obj) {
                  initCanvas.add(obj);
                }
              } catch (error) {
                console.error("Error adding object:", error);
              }
            });
            
            // Render the canvas
            initCanvas.renderAll();
          } else {
            // Original format - try direct loading
            try {
              initCanvas.loadFromJSON(savedData, () => {
                console.log("Canvas loaded (original format)");
                initCanvas.renderAll();
              });
            } catch (error) {
              console.error("Error loading from original format:", error);
            }
          }
        } else {
          console.log("No saved canvas found for ID:", canvasId);
        }
      } catch (error) {
        console.error("Error loading canvas:", error);
      }
      
      // Always set loading to false when done
      setTimeout(() => {
        initCanvas.renderAll();
        setIsLoading(false);
      }, 300);
    };
    
    // Load canvas data after a delay to ensure proper initialization
    setTimeout(loadCanvasFromFirestore, 500);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (initCanvas) {
        initCanvas.dispose();
      }
    };
  }, [canvasId]);

  // Canvas rendering after initialization
  useEffect(() => {
    if (!canvas) return;
    
    // Function to ensure canvas is properly rendered
    const ensureCanvasRendered = () => {
      try {
        // Force recalculation of object coordinates
        canvas.calcOffset();
        
        // Make sure all objects are visible
        canvas.getObjects().forEach(obj => {
          obj.visible = true;
        });
        
        // Render all objects
        canvas.renderAll();
        
        console.log("Canvas rendered with", canvas.getObjects().length, "objects");
      } catch (error) {
        console.error("Error rendering canvas:", error);
      }
    };
    
    // Execute immediately
    ensureCanvasRendered();
    
    // Also execute after delays to catch any async operations
    const renderTimers = [300, 1000].map(delay => 
      setTimeout(ensureCanvasRendered, delay)
    );
    
    // Clean up timers
    return () => {
      renderTimers.forEach(clearTimeout);
    };
  }, [canvas]);

  // Add auto-save functionality when canvas changes
  useEffect(() => {
    if (!canvas || !canvasId) return;

    // Set up object modification events for auto-save
    const autoSaveHandler = () => {
      console.log("Canvas changed, auto-saving...");
      // Debounce the auto-save to prevent too many Firestore writes
      const saveData = canvas.toJSON();
      localStorage.setItem(`canvasData_${canvasId}_autosave`, JSON.stringify(saveData));
    };

    // Events that should trigger auto-save
    canvas.on('object:added', autoSaveHandler);
    canvas.on('object:removed', autoSaveHandler);
    canvas.on('object:modified', autoSaveHandler);
    canvas.on('path:created', autoSaveHandler);

    return () => {
      // Clean up event listeners
      if (canvas) {
        canvas.off('object:added', autoSaveHandler);
        canvas.off('object:removed', autoSaveHandler);
        canvas.off('object:modified', autoSaveHandler);
        canvas.off('path:created', autoSaveHandler);
      }
    };
  }, [canvas, canvasId]);

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
    
    // Create a text object with explicit properties for better serialization
    const text = new fabric.Textbox('Double click to edit', {
      left: 50,
      top: 50,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: objectColor,
      width: 200,
      editable: true,
      selectable: true,
      // Only include essential properties
      includeDefaultValues: false
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
        // Create a fresh pencil brush with simplified properties
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = 5;
        canvas.freeDrawingBrush.color = objectColor;
        canvas.freeDrawingBrush.decimate = 8; // Simplify paths for better serialization
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
  const saveCanvas = async () => {
    if (!canvas || !canvasId) return;
    
    try {
      // Make sure all objects are properly rendered and captured
      canvas.renderAll();
      
      // Manually capture the objects to avoid serialization issues
      const objects = canvas.getObjects().map(obj => {
        // Get base properties common to all objects
        const baseProps = {
          type: obj.type,
          left: obj.left,
          top: obj.top,
          width: obj.width,
          height: obj.height,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle,
          opacity: obj.opacity,
          visible: true,
        };
        
        // Add specific properties based on object type
        if (obj.type === 'rect') {
          return {
            ...baseProps,
            fill: obj.fill || '#000000',
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            rx: obj.rx,
            ry: obj.ry,
          };
        } 
        else if (obj.type === 'circle') {
          return {
            ...baseProps,
            fill: obj.fill || '#000000',
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            radius: obj.radius,
          };
        }
        else if (obj.type === 'line') {
          return {
            ...baseProps,
            stroke: obj.stroke || '#000000',
            strokeWidth: obj.strokeWidth || 1,
            x1: obj.x1,
            y1: obj.y1,
            x2: obj.x2,
            y2: obj.y2,
            points: [obj.x1, obj.y1, obj.x2, obj.y2],
          };
        }
        else if (obj.type === 'path') {
          // Simplify paths to prevent issues
          let pathData = obj.path;
          if (pathData && pathData.length > 100) {
            pathData = pathData.filter((_, index) => index % 2 === 0);
          }
          
          return {
            ...baseProps,
            path: pathData,
            stroke: obj.stroke || '#000000',
            strokeWidth: obj.strokeWidth || 1,
            fill: null,
          };
        }
        else if (obj.type === 'textbox' || obj.type === 'text') {
          return {
            ...baseProps,
            text: obj.text || 'Text',
            fontSize: obj.fontSize || 20,
            fontFamily: obj.fontFamily || 'Arial',
            fontWeight: obj.fontWeight || 'normal',
            fill: obj.fill || '#000000',
            textAlign: obj.textAlign || 'left',
          };
        }
        else {
          // For other object types
          return baseProps;
        }
      });
      
      // Format data for storage
      const simplifiedData = {
        version: 2,
        canvasProps: {
          width: canvas.getWidth(),
          height: canvas.getHeight(),
          backgroundColor: canvas.backgroundColor || '#fff'
        },
        objects: objects
      };
      
      // Save to Firestore
      const canvasDocRef = doc(db, "canvases", canvasId);
      
      await updateDoc(canvasDocRef, {
        data: simplifiedData,
        lastModified: new Date(),
        objectCount: objects.length
      });
      
      console.log("Canvas saved with", objects.length, "objects");
      alert("Canvas saved successfully!");
    } catch (error) {
      console.error("Error saving canvas:", error);
      alert("Failed to save canvas. Please try again.");
    }
  };

  // Debug function to force canvas reload
  const debugForceReload = () => {
    if (!canvas) return;
    
    console.log("Forcing canvas reload...");
    console.log("Current objects:", canvas.getObjects().length);
    
    // Re-render canvas
    canvas.renderAll();
  };

  return (
    <div className="canvas-editor-main">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading your canvas...</p>
        </div>
      )}
      
      <div className="toolbar">
        <Toolbar 
          setTool={setTool} 
          addShape={addShape} 
          saveCanvas={saveCanvas}
        />
        <button 
          className="tool-button" 
          onClick={debugForceReload}
          style={{ display: 'none' }} // Hidden for normal usage
        >
          Force Reload
        </button>
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
        <canvas 
          ref={canvasRef} 
          style={{ 
            touchAction: "none",
            width: "800px", 
            height: "500px",
            visibility: "visible",
            opacity: 1
          }} 
          width="800" 
          height="500"
          id="fabricCanvas"
        />
      </div>
      
      <div className="tips-section">
        <div className="tips-title">Confused? Don't worry!</div>
        <div className="tips-title">These tips can guide you:</div>
        <ul className="tips-list">
          <li>Select objects by clicking on them</li>
          <li>Resize and rotate objects using the corner handles</li>
          <li>Choose your favorite color using the color picker</li>
          <li>Press Delete key to remove selected objects</li>
        </ul>
      </div>
    </div>
  );
};

export default CanvasEditor;
