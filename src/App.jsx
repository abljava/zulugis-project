import React, { useState } from 'react';
import MapView from './components/MapView';
import { AVAILABLE_LAYERS } from './config';

function App() {
  const [layer, setLayer] = useState('example:demo');
  console.log(AVAILABLE_LAYERS);
  console.log(layer);

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='p-4'>
        <h1 className='text-2xl font-bold mb-2'>Карта ZuluServer (WMS)</h1>
        <p className='mb-4 text-gray-600'>
          Слой: {AVAILABLE_LAYERS.find(l => l.name === layer)?.title || layer}
        </p>
      </div>
       <div className='p-4'>
         <label htmlFor='layers' className='block text-sm font-medium text-gray-700 mb-2'>
           Выберите слой:
         </label>
         <select 
           name='layers' 
           id='layers'
           value={layer}
           onChange={(e) => setLayer(e.target.value)}
           className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
         >
           {AVAILABLE_LAYERS.map((layerOption) => (
             <option key={layerOption.name} value={layerOption.name}>
               {layerOption.title}
             </option>
           ))}
         </select>
       </div>
      <MapView layer={layer} />
    </div>
  );
}

export default App;
