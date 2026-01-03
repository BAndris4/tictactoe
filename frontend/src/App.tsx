import { BrowserRouter, Route, Routes } from "react-router-dom";
import Game from "./views/Game";
import Register from "./views/Register";
import Login from "./views/Login";
import Landing from "./views/Landing";
import History from "./views/History";
import Social from "./views/Social";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/game/:id?" element={<Game />} />
        <Route path="/history" element={<History />} />
        <Route path="/social" element={<Social />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
