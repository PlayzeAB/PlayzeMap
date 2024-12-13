import MapComponent from './components/MapComponent';
import { mapConfig } from './config/mapConfig';
import 'ol/ol.css';

function App() {
  return (
    <div className="w-full h-screen">
      <MapComponent config={mapConfig} />
    </div>
  );
}

export default App;