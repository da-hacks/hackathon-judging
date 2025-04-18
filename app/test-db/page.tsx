'use client';

import { useState, useEffect } from 'react';
import { testConnection } from '@/lib/db-client';

export default function TestDbPage() {
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await testConnection();
      setResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      
      <button
        onClick={handleTestConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Result:</h2>
          <pre className="p-4 bg-gray-100 rounded overflow-auto">{result}</pre>
        </div>
      )}
    </div>
  );
} 