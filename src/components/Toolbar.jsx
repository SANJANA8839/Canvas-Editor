import React, { useState } from "react";
import "./canvasEditor.css";

const Toolbar = ({ setTool, addShape, saveCanvas }) => {
  const [activeButton, setActiveButton] = useState(null);

  const handleToolClick = (toolName) => {
    setActiveButton(toolName);
    setTool(toolName);
  };

  return (
    <>
      <button 
        className={`tool-button ${activeButton === "rectangle" ? "active" : ""}`} 
        onClick={() => handleToolClick("rectangle")}
      >
        Rectangle
      </button>
      <button 
        className={`tool-button ${activeButton === "circle" ? "active" : ""}`} 
        onClick={() => handleToolClick("circle")}
      >
        Circle
      </button>
      <button 
        className={`tool-button ${activeButton === "line" ? "active" : ""}`} 
        onClick={() => handleToolClick("line")}
      >
        Line
      </button>
      <button 
        className={`tool-button ${activeButton === "text" ? "active" : ""}`} 
        onClick={() => handleToolClick("text")}
      >
        Text
      </button>
      <button 
        className={`tool-button ${activeButton === "pen" ? "active" : ""}`} 
        onClick={() => handleToolClick("pen")}
      >
        Pen
      </button>
      <button 
        className={`tool-button ${activeButton === "eraser" ? "active" : ""}`} 
        onClick={() => handleToolClick("eraser")}
      >
        Eraser
      </button>
      <button 
        className="tool-button save-button"
        onClick={saveCanvas}
        style={{ 
          backgroundColor: "rgba(14, 165, 233, 0.3)", 
          borderColor: "rgba(14, 165, 233, 0.5)" 
        }}
      >
        Save
      </button>
    </>
  );
};

export default Toolbar;
