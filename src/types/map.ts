// map.ts
export interface BaseLayerSource {
    type: 'OSM';
  }
  
  export interface XYZLayerSource {
    type: 'XYZ';
    url: string;
    attribution?: string;
  }
  
  export interface WMSLayerSource {
    type: 'WMS';
    url: string;
    params: {
      LAYERS: string;
      FORMAT: string;
      TRANSPARENT: boolean;
      VERSION: string;
      SERVICE: string;
    };
    crossOrigin: string;
  }
  
  export interface VectorLayerSource {
    type: 'GeoJSON';
    url: string;
  }
  
  export type LayerSource = BaseLayerSource | XYZLayerSource | WMSLayerSource | VectorLayerSource;
  
  export interface MapLayer {
    id: string;
    title: string;
    type: 'base' | 'overlay';
    visible: boolean;
    opacity: number;
    source: LayerSource;
    legendUrl?: string;
  }
  
  export interface LayerGroup {
    id: string;
    title: string;
    expanded: boolean;
    layers: MapLayer[];
  }