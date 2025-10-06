import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function Home() {
  const navigate = useNavigate();

  const createCanvas = async () => {
    const docRef = await addDoc(collection(db, "canvases"), {
      data: null // initially empty
    });
    navigate(`/canvas/${docRef.id}`);
  };

  return (
    <div>
      <h1>Welcome to Canvas Editor</h1>
      <button onClick={createCanvas}>Create New Canvas</button>
    </div>
  );
}

export default Home;
