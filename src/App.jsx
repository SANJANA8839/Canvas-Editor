import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CanvasPage from "./pages/CanvasPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/canvas/:canvasId" element={<CanvasPage />} />
      </Routes>
    </Router>
  );
}

export default App;
