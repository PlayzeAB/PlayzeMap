import { useState } from 'react';
import { ChevronDown, ChevronRight, Layers, Eye, EyeOff } from 'lucide-react';

interface LegendProps {
  url: string;
  title: string;
  isVisible: boolean;
}

const Legend: React.FC<LegendProps> = ({ url, title, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="mt-2 px-4 py-2">
      <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
        <span>Legend: {title}</span>
      </div>
      <img 
        src={url} 
        alt={`Legend for ${title}`}
        className="max-w-full h-auto"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    </div>
  );
};

interface LayerGroup {
  id: string;
  title: string;
  expanded?: boolean;
  layers: {
    id: string;
    title: string;
    visible: boolean;
    opacity?: number;
    type: 'base' | 'overlay';
    legendUrl?: string;
  }[];
}

interface LayerMenuProps {
  groups: LayerGroup[];
  onLayerToggle: (groupId: string, layerId: string) => void;
  onOpacityChange: (groupId: string, layerId: string, opacity: number) => void;
}

const LayerMenu: React.FC<LayerMenuProps> = ({ 
  groups, 
  onLayerToggle, 
  onOpacityChange 
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(groups.map(g => [g.id, g.expanded ?? false]))
  );
  
  const [showLegends, setShowLegends] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const toggleLegend = (layerId: string) => {
    setShowLegends(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  return (
    <div className="absolute right-4 top-4 w-72 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-800 text-white p-3 flex items-center gap-2">
        <Layers size={20} />
        <span className="font-semibold">Layers</span>
      </div>
      
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {groups.map(group => (
          <div key={group.id} className="border-b border-gray-200 last:border-b-0">
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              aria-expanded={expandedGroups[group.id]}
              aria-controls={`group-${group.id}-content`}
            >
              <span className="font-medium text-gray-700">{group.title}</span>
              {expandedGroups[group.id] ? (
                <ChevronDown size={20} className="text-gray-500" />
              ) : (
                <ChevronRight size={20} className="text-gray-500" />
              )}
            </button>
            
            <div
              id={`group-${group.id}-content`}
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                expandedGroups[group.id] ? 'max-h-[1000px]' : 'max-h-0'
              }`}
            >
              {group.layers.map(layer => (
                <div key={layer.id} className="px-4 py-2 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        id={`layer-${layer.id}`}
                        name={`layer-${layer.id}`}
                        checked={layer.visible}
                        onChange={() => onLayerToggle(group.id, layer.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">{layer.title}</span>
                    </label>
                    {layer.legendUrl && (
                      <button
                        onClick={() => toggleLegend(layer.id)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label={`Toggle legend for ${layer.title}`}
                      >
                        {showLegends[layer.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                  
                  {layer.visible && (
                    <div className="pl-6 pr-2">
                      <div className="flex items-center gap-2">
                        <label htmlFor={`opacity-${layer.id}`} className="sr-only">
                          Opacity for {layer.title}
                        </label>
                        <span className="text-xs text-gray-500">0%</span>
                        <input
                          type="range"
                          id={`opacity-${layer.id}`}
                          name={`opacity-${layer.id}`}
                          min="0"
                          max="100"
                          value={(layer.opacity ?? 1) * 100}
                          onChange={(e) => {
                            onOpacityChange(group.id, layer.id, parseInt(e.target.value) / 100);
                          }}
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-gray-500">100%</span>
                      </div>
                    </div>
                  )}

                  {layer.legendUrl && showLegends[layer.id] && (
                    <Legend
                      url={layer.legendUrl}
                      title={layer.title}
                      isVisible={layer.visible}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerMenu;