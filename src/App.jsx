import React, { useState } from 'react';
import MapView from './components/MapView';
import { AVAILABLE_LAYERS } from './config';

function App() {
  const [selectedLayers, setSelectedLayers] = useState(['example:demo']);
  
  const handleLayerToggle = (layerName) => {
    setSelectedLayers(prev => 
      prev.includes(layerName) 
        ? prev.filter(l => l !== layerName)
        : [...prev, layerName]
    );
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='p-4'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Доступные слои:
        </label>
        <div className='flex flex-col gap-2'>
          {AVAILABLE_LAYERS.map((layerOption) => (
            <div key={layerOption.name} className='flex items-center space-x-3'>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={selectedLayers.includes(layerOption.name)}
                  onChange={() => handleLayerToggle(layerOption.name)}
                  className='sr-only'
                />
                <div className={`relative w-12 h-5 rounded-full transition-all duration-300 ease-in-out ${
                  selectedLayers.includes(layerOption.name) 
                    ? 'bg-gray-400 shadow-md' 
                    : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
                    selectedLayers.includes(layerOption.name) ? 'translate-x-6' : 'translate-x-0'
                  }`}>
                    <div className={`w-full h-full rounded-full transition-all duration-200 ${
                      selectedLayers.includes(layerOption.name) 
                        ? 'bg-gray-300 opacity-30' 
                        : 'bg-gray-200'
                    }`}></div>
                  </div>
                </div>
              </label>
              <span className='text-sm font-normal text-gray-700'>{layerOption.title}</span>
            </div>
          ))}
        </div>
      </div>
      <MapView layers={selectedLayers} />
    </div>
  );
}

export default App;
