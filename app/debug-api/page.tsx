'use client';

import { useState } from 'react';

export default function DebugAPIPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testEndpoint = async (endpoint: string, method: string = 'GET') => {
    const key = `${method}_${endpoint}`;
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await fetch(`/api${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        [key]: {
          status: response.status,
          statusText: response.statusText,
          data,
          success: response.ok
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [key]: {
          error: error instanceof Error ? error.message : String(error),
          success: false
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const endpoints = [
    { path: '/test', method: 'GET', description: 'Test endpoint básico' },
    { path: '/accounts', method: 'GET', description: 'Obtener cuentas (requiere auth)' },
    { path: '/categories', method: 'GET', description: 'Obtener categorías (requiere auth)' },
    { path: '/transactions', method: 'GET', description: 'Obtener transacciones (requiere auth)' },
    { path: '/summary', method: 'GET', description: 'Obtener resumen (requiere auth)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug API Endpoints</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Información importante:</h2>
          <ul className="text-yellow-700 space-y-1">
            <li>• Los endpoints que requieren auth fallarán con 401 si no estás logueado</li>
            <li>• El endpoint <code>/test</code> debería funcionar siempre</li>
            <li>• Si ves errores 500, hay problemas en el servidor</li>
            <li>• Si ves errores de CORS, hay problemas de configuración</li>
          </ul>
        </div>

        <div className="space-y-4">
          {endpoints.map((endpoint) => {
            const key = `${endpoint.method}_${endpoint.path}`;
            const isLoading = loading[key];
            const result = results[key];

            return (
              <div key={key} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium mr-2 ${
                        endpoint.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {endpoint.method}
                      </span>
                      /api{endpoint.path}
                    </h3>
                    <p className="text-gray-600 text-sm">{endpoint.description}</p>
                  </div>
                  <button
                    onClick={() => testEndpoint(endpoint.path, endpoint.method)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Probando...' : 'Probar'}
                  </button>
                </div>

                {result && (
                  <div className="mt-4">
                    <div className={`p-4 rounded ${
                      result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-semibold ${
                          result.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {result.success ? '✅ Éxito' : '❌ Error'}
                        </span>
                        {result.status && (
                          <span className="text-sm font-mono">
                            {result.status} {result.statusText}
                          </span>
                        )}
                      </div>
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(result.data || result.error, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Próximos pasos:</h3>
          <ol className="text-blue-700 space-y-1 list-decimal list-inside">
            <li>Prueba primero el endpoint <code>/test</code> - debe funcionar siempre</li>
            <li>Si el test falla, hay problemas básicos de configuración</li>
            <li>Si el test funciona pero otros fallan, puede ser auth o CORS</li>
            <li>Una vez que funcione, elimina esta página de debug</li>
          </ol>
        </div>
      </div>
    </div>
  );
}