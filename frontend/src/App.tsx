import { BrowserRouter, Route, Routes } from "react-router-dom";
import Game from "./views/Game";
import Register from "./views/Register";
import Login from "./views/Login";
import Landing from "./views/Landing";
import History from "./views/History";
import Social from "./views/Social";
import Profile from "./views/Profile";

import { ToastProvider } from "./context/ToastContext";
import { NotificationProvider } from "./context/NotificationContext";
import { GameProvider } from "./context/GameContext";
import MatchFoundModal from "./components/modals/MatchFoundModal";
import Tutorial from "./views/Tutorial";
import ForgotPassword from "./views/ForgotPassword";
import ResetPassword from "./views/ResetPassword";

function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <GameProvider>
          <BrowserRouter>
            <MatchFoundModal />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/game/:id?" element={<Game />} />
              <Route path="/history" element={<History />} />
              <Route path="/social" element={<Social />} />
              <Route path="/profile/:username?" element={<Profile />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/tutorial" element={<Tutorial />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </BrowserRouter>
        </GameProvider>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;
