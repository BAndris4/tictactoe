import Table from "./components/Table";
import { GameProvider } from "./context/GameContext";

function App() {
  return (
    <GameProvider>
      <Table/>
    </GameProvider>
  );
}

export default App
