import React, { useState } from 'react';
import {
  Compass,
  Maximize,
  RotateCcw,
  Ruler,
  MapPin,
  Move,
  Grid,
  MinusCircle,
  PlusCircle
} from 'lucide-react';

interface MapToolboxProps {
  onToolSelect: (toolId: string) => void;
  activeControl: string | null;
}

const MapToolbox: React.FC<MapToolboxProps> = ({ onToolSelect, activeControl }) => {
  const [expanded, setExpanded] = useState(true);

  const tools = [
    { id: 'zoom-in', icon: <PlusCircle size={20} />, label: 'Zoom In' },
    { id: 'zoom-out', icon: <MinusCircle size={20} />, label: 'Zoom Out' },
    { id: 'rotate', icon: <RotateCcw size={20} />, label: 'Reset Rotation' },
    { id: 'fullscreen', icon: <Maximize size={20} />, label: 'Fullscreen' },
    { id: 'measure-line', icon: <Ruler size={20} />, label: 'Measure Distance' },
    { id: 'measure-area', icon: <Grid size={20} />, label: 'Measure Area' },
    { id: 'drag-pan', icon: <Move size={20} />, label: 'Pan' },
    { id: 'marker', icon: <MapPin size={20} />, label: 'Add Marker' },
  ];

  return (
    <div className="absolute left-4 top-20 z-10">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header/Toggle Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-2 bg-gray-800 text-white flex items-center justify-between hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center">
            <Compass size={20} className="mr-2" />
            <span className="text-sm font-medium">Map Tools</span>
          </div>
          <span className="text-xs text-gray-400">
            {expanded ? 'Collapse' : 'Expand'}
          </span>
        </button>

        {/* Tools Grid */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            expanded ? 'max-h-[400px]' : 'max-h-0'
          }`}
        >
          <div className="grid grid-cols-2 gap-1 p-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onToolSelect(tool.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-md transition-all duration-200 ${
                  activeControl === tool.id
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={tool.label}
              >
                {tool.icon}
                <span className="text-xs mt-1 font-medium">{tool.label}</span>
              </button>
            ))}
          </div>

          {/* Help Text */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Press ESC to cancel active tool
            </div>
          </div>
        </div>

        {/* Tool Info Panel - Shows when a tool is active */}
        {activeControl && expanded && (
          <div className="px-3 py-2 bg-blue-50 border-t border-blue-100">
            <div className="text-xs text-blue-600">
              {activeControl === 'measure-line' && (
                "Click to start measuring. Double-click to finish."
              )}
              {activeControl === 'measure-area' && (
                "Click to draw area. Double-click to finish."
              )}
              {activeControl === 'marker' && (
                "Click on the map to place a marker."
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Buttons (Always Visible) */}
      <div className={`mt-2 flex flex-col gap-2 ${expanded ? 'opacity-0 h-0' : 'opacity-100'}`}>
        <button
          onClick={() => onToolSelect('zoom-in')}
          className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          title="Zoom In"
        >
          <PlusCircle size={20} className="text-gray-700" />
        </button>
        <button
          onClick={() => onToolSelect('zoom-out')}
          className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          title="Zoom Out"
        >
          <MinusCircle size={20} className="text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default MapToolbox;