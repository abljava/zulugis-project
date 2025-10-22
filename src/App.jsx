import MapView from './components/MapView'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">Карта ZuluServer (WMS)</h1>
        <p className="mb-4 text-gray-600">Базовый слой: добавить название</p>
      </div>
      <MapView />
    </div>
  )
}

export default App