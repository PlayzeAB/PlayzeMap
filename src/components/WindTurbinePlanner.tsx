import { useEffect, useState } from 'react';
import { Wind, Leaf, Users, PiggyBank, Building2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Style, Stroke, RegularShape } from 'ol/style';
import Map from 'ol/Map';

interface WindTurbine {
  id: number;
  coordinate: number[];
  windSpeed: number;
  height: number;
  rotorDiameter: number;
  bladeAngle: number;
  airDensity: number;
  efficiency: number;
}

const defaultConfig = {
  windSpeed: 15,
  height: 200,
  rotorDiameter: 90,
  bladeAngle: 0,
  airDensity: 1.225,
  efficiency: 0.4
};

const calculatePower = (config: typeof defaultConfig): number => {
  const sweptArea = Math.PI * Math.pow(config.rotorDiameter/2, 2);
  return 0.5 * config.airDensity * sweptArea * Math.pow(config.windSpeed, 3) * 
         config.efficiency * (1 - config.bladeAngle/15) / 1000000;
};

interface WindTurbinePlannerProps {
  map: Map | null;
}

const WindTurbinePlanner = ({ map }: WindTurbinePlannerProps) => {
  const [turbines, setTurbines] = useState<WindTurbine[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [vectorSource] = useState(new VectorSource());
  const [vectorLayer] = useState(new VectorLayer({
    source: vectorSource,
    style: (feature) => {
      const styles = [];
      
      // Vertikalt torn
      styles.push(new Style({
        image: new RegularShape({
          points: 2,
          radius: 12,
          stroke: new Stroke({
            color: '#4b5563',
            width: 2
          }),
          angle: 0
        })
      }));

      // Rotation för bladen
      const rotation = (feature.get('timestamp') || Date.now()) / 2000;
      const bladeLength = 12;

      // Tre blad med exakt 120 graders mellanrum
      [0, 1, 2].forEach(i => {
        styles.push(
          new Style({
            image: new RegularShape({
              points: 2,
              radius: bladeLength,
              stroke: new Stroke({
                color: '#4b5563',
                width: 2
              }),
              rotation: rotation + (i * Math.PI * 2 / 3),
              displacement: [0, -12]
            })
          })
        );
      });

      return styles;
    }
  }));

  useEffect(() => {
    if (!map) return;
    
    map.addLayer(vectorLayer);
    
    const clickListener = map.on('click', (event) => {
      const coordinate = event.coordinate;
      const newTurbine: WindTurbine = {
        id: Date.now(),
        coordinate,
        ...defaultConfig
      };
      
      const feature = new Feature({
        geometry: new Point(coordinate),
        timestamp: Date.now()
      });
      feature.set('turbineId', newTurbine.id);
      vectorSource.addFeature(feature);
      
      setTurbines(prev => [...prev, newTurbine]);
    });

    const animate = () => {
      vectorSource.getFeatures().forEach(feature => {
        feature.set('timestamp', Date.now());
      });
      vectorLayer.changed();
      requestAnimationFrame(animate);
    };
    const animation = requestAnimationFrame(animate);
    
    return () => {
      map.removeLayer(vectorLayer);
      map.un('click', clickListener.listener);
      cancelAnimationFrame(animation);
    };
  }, [map]);

  const totalPower = turbines.reduce((sum, turbine) => sum + calculatePower(turbine), 0);
  const annualProduction = totalPower * 8760 * 0.35;
  const co2Savings = annualProduction * 0.5;
  const jobs = totalPower * 0.3 * 2.5;
  const localRevenue = turbines.length * 150000;

  return (
    <div className="absolute left-4 bottom-4 w-72 bg-white rounded-lg shadow-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-gray-800 text-white p-3 flex items-center justify-between hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wind size={20} />
          <span className="font-semibold">Vindkraftplanerare</span>
        </div>
        {expanded ? (
          <ChevronDown size={20} className="text-gray-400" />
        ) : (
          <ChevronRight size={20} className="text-gray-400" />
        )}
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expanded ? 'max-h-[600px]' : 'max-h-0'
        }`}
      >
        <div className="p-3 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-blue-700">
            Klicka på kartan för att placera ut vindkraftverk
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-3">
          <div className="bg-gray-50 p-2 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Wind className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">Antal verk</span>
            </div>
            <div className="text-center font-semibold">{turbines.length}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">Total effekt</span>
            </div>
            <div className="text-center font-semibold">{totalPower.toFixed(1)} MW</div>
          </div>
        </div>

        <div className="p-3 space-y-2 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-blue-600" />
              <span className="text-sm">CO₂-besparing</span>
            </div>
            <span className="text-sm font-medium">{co2Savings.toFixed(0)} ton/år</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Arbetstillfällen</span>
            </div>
            <span className="text-sm font-medium">{jobs.toFixed(0)} st</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Lokala intäkter</span>
            </div>
            <span className="text-sm font-medium">{(localRevenue / 1000000).toFixed(1)} MSEK/år</span>
          </div>
        </div>

        <div className="p-3 border-t border-gray-100">
          <button 
            onClick={() => {
              vectorSource.clear();
              setTurbines([]);
            }}
            className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-md 
                      hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Rensa alla turbiner</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WindTurbinePlanner;