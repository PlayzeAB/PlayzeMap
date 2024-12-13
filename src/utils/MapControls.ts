import Map from 'ol/Map';
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import { getArea, getLength } from 'ol/sphere';
import { LineString, Polygon } from 'ol/geom';
import Overlay from 'ol/Overlay';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';

export class MapControls {
  private map: Map;
  private measureSource: VectorSource;
  private measureLayer: VectorLayer<VectorSource>;
  private draw: Draw | null;
  private measureTooltipElement: HTMLElement | null;
  private measureTooltip: Overlay | null;

  constructor(map: Map) {
    this.map = map;
    this.measureSource = new VectorSource();
    this.measureLayer = new VectorLayer({
      source: this.measureSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2,
        }),
        image: new Circle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33',
          }),
        }),
      }),
    });
    this.draw = null;
    this.measureTooltipElement = null;
    this.measureTooltip = null;

    this.map.addLayer(this.measureLayer);
  }

  zoomIn(): void {
    const view = this.map.getView();
    const zoom = view.getZoom();
    if (zoom !== undefined) {
      view.animate({
        zoom: zoom + 1,
        duration: 250,
      });
    }
  }

  zoomOut(): void {
    const view = this.map.getView();
    const zoom = view.getZoom();
    if (zoom !== undefined) {
      view.animate({
        zoom: zoom - 1,
        duration: 250,
      });
    }
  }

  resetRotation(): void {
    const view = this.map.getView();
    view.animate({
      rotation: 0,
      duration: 250,
    });
  }

  toggleFullscreen(element: HTMLElement): void {
    if (!document.fullscreenElement) {
      element.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  private formatLength(line: LineString): string {
    const length = getLength(line);
    let output: string;
    if (length > 100) {
      output = `${Math.round((length / 1000) * 100) / 100} km`;
    } else {
      output = `${Math.round(length * 100) / 100} m`;
    }
    return output;
  }

  private formatArea(polygon: Polygon): string {
    const area = getArea(polygon);
    let output: string;
    if (area > 10000) {
      output = `${Math.round((area / 1000000) * 100) / 100} km²`;
    } else {
      output = `${Math.round(area * 100) / 100} m²`;
    }
    return output;
  }

  private createMeasureTooltip(): void {
    if (this.measureTooltipElement) {
      this.measureTooltipElement.parentNode?.removeChild(this.measureTooltipElement);
    }
    this.measureTooltipElement = document.createElement('div');
    this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    this.measureTooltip = new Overlay({
      element: this.measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center',
      stopEvent: false,
      insertFirst: false,
    });
    this.map.addOverlay(this.measureTooltip);
  }

  measureDistance(): void {
    this.clearMeasurements();
    this.createMeasureTooltip();

    this.draw = new Draw({
      source: this.measureSource,
      type: 'LineString',
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2,
        }),
      }),
    });

    this.map.addInteraction(this.draw);

    let listener: ((evt: { feature: Feature<Geometry> }) => void) | null = null;

    this.draw.on('drawstart', () => {
      this.measureSource.clear();
      listener = (evt: { feature: Feature<Geometry> }) => {
        const geom = evt.feature.getGeometry();
        if (geom instanceof LineString && this.measureTooltipElement) {
          const output = this.formatLength(geom);
          this.measureTooltipElement.innerHTML = output;
          this.measureTooltip?.setPosition(geom.getLastCoordinate());
        }
      };
      if (listener) this.draw?.on('drawstart', listener);
    });

    this.draw.on('drawend', () => {
      if (this.measureTooltipElement) {
        this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
      }
      if (this.measureTooltip) {
        this.measureTooltip.setOffset([0, -7]);
      }
      if (listener) {
        this.draw?.un('drawstart', listener);
      }
      this.createMeasureTooltip();
    });
  }

  measureArea(): void {
    this.clearMeasurements();
    this.createMeasureTooltip();

    this.draw = new Draw({
      source: this.measureSource,
      type: 'Polygon',
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2,
        }),
      }),
    });

    this.map.addInteraction(this.draw);

    let listener: ((evt: { feature: Feature<Geometry> }) => void) | null = null;

    this.draw.on('drawstart', () => {
      this.measureSource.clear();
      listener = (evt: { feature: Feature<Geometry> }) => {
        const geom = evt.feature.getGeometry();
        if (geom instanceof Polygon && this.measureTooltipElement) {
          const output = this.formatArea(geom);
          this.measureTooltipElement.innerHTML = output;
          this.measureTooltip?.setPosition(geom.getInteriorPoint().getCoordinates());
        }
      };
      if (listener) this.draw?.on('drawstart', listener);
    });

    this.draw.on('drawend', () => {
      if (this.measureTooltipElement) {
        this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
      }
      if (this.measureTooltip) {
        this.measureTooltip.setOffset([0, -7]);
      }
      if (listener) {
        this.draw?.un('drawstart', listener);
      }
      this.createMeasureTooltip();
    });
  }

  clearMeasurements(): void {
    this.measureSource.clear();
    this.map.removeInteraction(this.draw!);
    if (this.measureTooltipElement) {
      this.measureTooltipElement.parentNode?.removeChild(this.measureTooltipElement);
    }
    if (this.measureTooltip) {
      this.map.removeOverlay(this.measureTooltip);
    }
    this.measureTooltipElement = null;
    this.measureTooltip = null;
    this.draw = null;
  }
}