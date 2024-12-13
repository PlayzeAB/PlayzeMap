import { useEffect, useRef, useState, useCallback } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { Layer } from 'ol/layer';
import { unByKey } from 'ol/Observable';
import GeoJSON from 'ol/format/GeoJSON';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { get as getProjection } from 'ol/proj';
import BaseLayer from 'ol/layer/Base';
import { EventsKey } from 'ol/events';

import LayerMenu from './LayerMenu';
import MapToolbox from './MapToolbox';
import MapSearch from './MapSearch';
import { MapControls } from '../utils/MapControls';
import { Map as MapIcon } from 'lucide-react';
import { layerGroups as initialLayerGroups, mapConfig } from '../config/mapConfig';
import { LayerGroup } from '../types/map';

// Define projections
proj4.defs("EPSG:5857","+proj=tmerc +lat_0=0 +lon_0=23.25 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
proj4.defs("EPSG:3006","+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
register(proj4);

interface MapComponentProps {
  config: typeof mapConfig;
}

const MapComponent: React.FC<MapComponentProps> = ({ config }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [vectorSource] = useState(new VectorSource());
  const [activeControl, setActiveControl] = useState<string | null>(null);
  const [mapControls, setMapControls] = useState<MapControls | null>(null);
  const [layerGroups, setLayerGroups] = useState<LayerGroup[]>(initialLayerGroups);
  const [clickListener, setClickListener] = useState<EventsKey | null>(null);

  const handleLayerToggle = useCallback((_groupId: string, layerId: string) => {
    if (!map) return;

    map.getLayers().forEach((layer: BaseLayer) => {
      if (layer.get('layerId') === layerId) {
        (layer as Layer).setVisible(!(layer as Layer).getVisible());
      }
    });

    setLayerGroups(prevGroups => 
      prevGroups.map(group => ({
        ...group,
        layers: group.layers.map(layer => ({
          ...layer,
          visible: layer.id === layerId ? !layer.visible : layer.visible
        }))
      }))
    );
  }, [map]);

  const handleOpacityChange = useCallback((_groupId: string, layerId: string, opacity: number) => {
    if (!map) return;

    map.getLayers().forEach((layer: BaseLayer) => {
      if (layer.get('layerId') === layerId) {
        (layer as Layer).setOpacity(opacity);
      }
    });

    setLayerGroups(prevGroups => 
      prevGroups.map(group => ({
        ...group,
        layers: group.layers.map(layer => ({
          ...layer,
          opacity: layer.id === layerId ? opacity : layer.opacity
        }))
      }))
    );
  }, [map]);

  const handleToolSelect = useCallback((toolId: string) => {
    if (!mapControls) return;

    // Clear previous control
    if (activeControl === 'measure-line' || activeControl === 'measure-area') {
      mapControls.clearMeasurements();
    }

    // Clear previous click listener
    if (clickListener) {
      unByKey(clickListener);
      setClickListener(null);
    }

    // Set new control
    switch (toolId) {
      case 'zoom-in':
        mapControls.zoomIn();
        break;
      case 'zoom-out':
        mapControls.zoomOut();
        break;
      case 'rotate':
        mapControls.resetRotation();
        break;
      case 'fullscreen':
        mapControls.toggleFullscreen(mapRef.current!);
        break;
      case 'measure-line':
        mapControls.measureDistance();
        break;
      case 'measure-area':
        mapControls.measureArea();
        break;
      case 'marker':
        if (map) {
          const newClickListener = map.on('click', (event) => {
            const coordinate = event.coordinate;
            const feature = new Feature({
              geometry: new Point(coordinate)
            });
            vectorSource.addFeature(feature);
          });
          setClickListener(newClickListener);
        }
        break;
    }

    setActiveControl(toolId);
  }, [map, mapControls, activeControl, clickListener, vectorSource]);

  useEffect(() => {
    if (!mapRef.current) {
      console.warn('mapRef.current is null');
      return;
    }

    console.log('Initializing map...');

    const layers = layerGroups.flatMap(group => 
      group.layers.map(layerConfig => {
        switch (layerConfig.source.type) {
          case 'OSM':
            return new TileLayer({
              source: new OSM(),
              visible: layerConfig.visible,
              opacity: layerConfig.opacity,
              properties: { layerId: layerConfig.id }
            });
          case 'XYZ':
            return new TileLayer({
              source: new XYZ({
                url: layerConfig.source.url,
                attributions: layerConfig.source.attribution,
              }),
              visible: layerConfig.visible,
              opacity: layerConfig.opacity,
              properties: { layerId: layerConfig.id }
            });
          case 'GeoJSON':
            return new VectorLayer({
              source: new VectorSource({
                url: layerConfig.source.url,
                format: new GeoJSON({
                  dataProjection: layerConfig.id === 'utredning-area' ? 'EPSG:3006' : 'EPSG:5857',
                  featureProjection: 'EPSG:5857'
                }),
              }),
              style: new Style({
                fill: new Fill({
                  color: layerConfig.id === 'utredning-area' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)',
                }),
                stroke: new Stroke({
                  color: layerConfig.id === 'utredning-area' ? '#00ff00' : '#ff0000',
                  width: 2,
                }),
              }),
              visible: layerConfig.visible,
              opacity: layerConfig.opacity,
              properties: { layerId: layerConfig.id }
            });
          default:
            return undefined;
        }
      }).filter((layer): layer is TileLayer<any> | VectorLayer<any> => layer !== undefined)
    );

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Circle({
          radius: config.markerStyle.radius,
          fill: new Fill({ color: config.markerStyle.fillColor }),
          stroke: new Stroke({
            color: config.markerStyle.strokeColor,
            width: config.markerStyle.strokeWidth,
          }),
        }),
      }),
    });

    const projection = getProjection('EPSG:5857');
    if (!projection) {
      console.error('Failed to get projection EPSG:5857');
      return;
    }

    const newMap = new Map({
      target: mapRef.current,
      layers: [...layers, vectorLayer],
      view: new View({
        projection: projection,
        center: [config.center.lon, config.center.lat],
        zoom: config.defaultZoom,
      }),
    });

    console.log('Map created:', newMap);

    setMap(newMap);
    setMapControls(new MapControls(newMap));

    return () => {
      if (clickListener) {
        unByKey(clickListener);
      }
      newMap.setTarget(undefined);
    };
  }, [config, vectorSource]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeControl) {
        if (mapControls) {
          mapControls.clearMeasurements();
        }
        setActiveControl(null);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [activeControl, mapControls]);

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center shadow-lg z-20 relative">
        <div className="flex items-center">
          <MapIcon className="mr-2" size={24} />
          <h1 className="text-xl font-semibold">Playze Map Tools</h1>
        </div>
      </div>

      <div className="relative flex-1">
        <div ref={mapRef} className="w-full h-full" />
        
        <MapSearch 
          onSelectLocation={(coords) => {
            if (!map) return;
            
            const feature = new Feature({
              geometry: new Point(coords)
            });
            vectorSource.addFeature(feature);
            
            map.getView().animate({
              center: coords,
              zoom: 14,
              duration: 1000
            });
          }}
        />
        
        <MapToolbox 
          onToolSelect={handleToolSelect}
          activeControl={activeControl}
        />
        
        <LayerMenu
          groups={layerGroups}
          onLayerToggle={handleLayerToggle}
          onOpacityChange={handleOpacityChange}
        />
      </div>
    </div>
  );
};

export default MapComponent;