import TextEditor from "./TextEditor";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={`/${uuidV4()}`} />} />
        <Route path="/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
