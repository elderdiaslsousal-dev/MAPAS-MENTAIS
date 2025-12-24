import { MindMapProvider, useMindMap } from './store/MindMapContext';
import { Dashboard } from './components/Dashboard';
import { Canvas } from './components/Renderer/Canvas';

function AppContent() {
  const { currentMap } = useMindMap();

  return (
    <>
      {currentMap ? <Canvas /> : <Dashboard />}
    </>
  );
}

function App() {
  return (
    <MindMapProvider>
      <AppContent />
    </MindMapProvider>
  );
}

export default App;
