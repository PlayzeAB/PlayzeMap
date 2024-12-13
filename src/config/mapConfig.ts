import { LayerGroup, MapLayer } from '../types/map';

// Base map layer definitions
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
      id: 'project-area',
      title: 'Projektområde',
      type: 'overlay' as const,
      visible: true,
      opacity: 1,
      source: {
        type: 'GeoJSON' as const,
        url: '/data/project_area.geojson' // Make sure this path is correct
      }
    },
    {
      id: 'utredning-area',
      title: 'Utredningsområde',
      type: 'overlay' as const,
      visible: true,
      opacity: 1,
      source: {
        type: 'GeoJSON' as const,
        url: '/data/utredning_omrade.geojson' // Make sure this path is correct
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

// Export type for the config
export type MapConfigType = typeof mapConfig;