import React from "react";
import "./canvasEditor.css";

const Toolbar = ({ setTool, addShape, saveCanvas }) => {
  return (
    <>
      <button className="tool-button" onClick={() => setTool("rectangle")}>Rectangle</button>
      <button className="tool-button" onClick={() => setTool("circle")}>Circle</button>
      <button className="tool-button" onClick={() => setTool("line")}>Line</button>
      <button className="tool-button" onClick={() => setTool("text")}>Text</button>
      <button className="tool-button" onClick={() => setTool("pen")}>Pen</button>
      <button className="tool-button" onClick={() => setTool("eraser")}>Eraser</button>
      <button 
        className="tool-button" 
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
