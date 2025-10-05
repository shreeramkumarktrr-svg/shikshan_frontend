import DebugPanel from '../components/DebugPanel';

function Debug() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Debug Dashboard</h1>
        <p className="text-gray-600">Diagnose issues with school management features</p>
      </div>
      
      <DebugPanel />
    </div>
  );
}

export default Debug;