import { BrowserRouter, Route, Routes } from "react-router-dom";
import Game from "./views/Game";
import Register from "./views/Register";
import Login from "./views/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/game" element={<Game />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
