'use client';

import React, { useState } from 'react';

// Interface simples para teste
interface Gazette {
  territory_id: string;
  territory_name: string;
  date: string;
  url: string;
}

export default function HomePage() {
  const [gazettes, setGazettes] = useState<Gazette[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/gazettes?territory_ids=5208707&size=3');
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      setGazettes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          P.I.T.E.R - Dashboard
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Teste de Integração Backend</h2>

          <button
            onClick={testAPI}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md"
          >
            {loading ? 'Carregando...' : 'Testar API Querido Diário'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Erro: {error}
            </div>
          )}
        </div>

        {gazettes.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Diários Oficiais Encontrados:</h3>
            <div className="space-y-3">
              {gazettes.map((gazette, index) => (
                <div key={index} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{gazette.territory_name}</h4>
                      <p className="text-sm text-gray-600">Data: {gazette.date}</p>
                      <p className="text-xs text-gray-500">ID: {gazette.territory_id}</p>
                    </div>
                    <a
                      href={gazette.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Ver PDF →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}