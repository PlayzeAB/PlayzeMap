import { LayerGroup, MapLayer } from '../types/map';

export const baseMapLayers: MapLayer[] = [
  {
    id: 'osm',
    title: 'OpenStreetMap',
    type: 'base' as const,
    visible: true,
    opacity: 1,
    source: {
      type: 'OSM' as const
    }
  },
  {
    id: 'satellite',
    title: 'Satellite',
    type: 'base' as const,
    visible: false,
    opacity: 1,
    source: {
      type: 'XYZ' as const,
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      attribution: '© Google Satellite'
    }
  },
  {
    id: 'terrain',
    title: 'Terrain',
    type: 'base' as const,
    visible: false,
    opacity: 1,
    source: {
      type: 'XYZ' as const,
      url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
      attribution: 'Map tiles by Stamen Design'
    }
  }
];
// Project-specific layer definitions
export const projectLayers: MapLayer[] = [

  {
    id: 'vaghallare',
    title: 'Väghållare',
    type: 'overlay' as const,
    visible: true,
    opacity: 0.7,
    source: {
      type: 'WMS' as const,
      url: 'https://geo-netinfo.trafikverket.se/mapservice/wms.axd/NetInfo',
      params: {
        LAYERS: 'CR,BS',
        VERSION: '1.1.1',
        FORMAT: 'image/png',
        TRANSPARENT: true,
        SRS: 'EPSG:3006'  // Lägg till denna rad
      }
    }
  }
];

// Layer group configurations
export const layerGroups: LayerGroup[] = [
  {
    id: 'base',
    title: 'Base Maps',
    expanded: true,
    layers: baseMapLayers
  },
  {
    id: 'project',
    title: 'Projekt',
    expanded: true,
    layers: projectLayers
  }
];

// Map configuration settings
export const mapConfig = {
  center: {
    lon: 141115,
    lat: 7448818,
  },
  defaultZoom: 11,
  markerStyle: {
    radius: 6,
    fillColor: 'red',
    strokeColor: 'white',
    strokeWidth: 2
  }
} as const;

export type MapConfigType = typeof mapConfig;