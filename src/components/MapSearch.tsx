import React, { useState } from 'react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { fromLonLat } from 'ol/proj';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface MapSearchProps {
  onSelectLocation: (coords: number[]) => void;
}

const MapSearch: React.FC<MapSearchProps> = ({ onSelectLocation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=5`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLocation = (result: SearchResult) => {
    const coords = fromLonLat([parseFloat(result.lon), parseFloat(result.lat)]);
    onSelectLocation(coords);
    setSearchTerm(result.display_name);
    setResults([]);
    setIsExpanded(false);
  };

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 p-2">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-2">
          <div className="flex items-center bg-gray-50 rounded-md">
            <label htmlFor="location-search" className="sr-only">
              Search location
            </label>
            <input
              type="text"
              id="location-search"
              name="location-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="Search location..."
              className="flex-1 px-3 py-2 bg-transparent outline-none text-gray-900"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setResults([]);
                }}
                className="p-2 text-gray-500 hover:text-gray-700"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="p-2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
              aria-label="Search"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <SearchIcon size={16} />
              )}
            </button>
          </div>
        </div>

        {isExpanded && results.length > 0 && (
          <div className="border-t">
            <ul className="max-h-60 overflow-y-auto" role="listbox">
              {results.map((result, index) => (
                <li
                  key={index}
                  role="option"
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-900"
                  onClick={() => handleSelectLocation(result)}
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSelectLocation(result);
                    }
                  }}
                >
                  <div className="text-sm">{result.display_name}</div>
                  <div className="text-xs text-gray-500">{result.type}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSearch;