export type LayerSource = 
  | { type: 'OSM' }
  | { type: 'XYZ'; url: string; attribution?: string }
  | { type: 'GeoJSON'; url: string }
  | { 
      type: 'WMS'; 
      url: string; 
      params: {
        LAYERS: string;
        VERSION: string;
        FORMAT: string;
        TRANSPARENT: boolean;
        [key: string]: string | boolean | number;
      }
    };

export interface MapLayer {
  id: string;
  title: string;
  type: 'base' | 'overlay';
  visible: boolean;
  opacity?: number;
  source: LayerSource;
}

export interface LayerGroup {
  id: string;
  title: string;
  expanded?: boolean;
  layers: MapLayer[];
}