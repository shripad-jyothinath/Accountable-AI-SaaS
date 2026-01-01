import React, { useState, useEffect } from 'react';
import { Database, Save, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { setupSupabase, isSupabaseConfigured, disconnectSupabase, activeUrl } from '../supabaseClient';
import { useNavigate } from '../App';

export default function Setup() {
  const [url, setUrl] = useState(activeUrl || '');
  const [key, setKey] = useState('');
  const [autoFetching, setAutoFetching] = useState(false);
  const [fetchMessage, setFetchMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If we have a URL but no Key, try to fetch the config from the Edge Function
    if (url && !isSupabaseConfigured && !key) {
      attemptAutoDiscovery(url);
    }
  }, []);

  const attemptAutoDiscovery = async (targetUrl: string) => {
    // Clean URL to ensure no trailing slash
    const cleanUrl = targetUrl.replace(/\/$/, "");
    const functionUrl = `${cleanUrl}/functions/v1/get-public-config`;

    setAutoFetching(true);
    setFetchMessage('Checking server for keys...');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const res = await fetch(functionUrl, { 
        method: 'POST', // Edge functions often accept POST for bodies, or GET. Trying simple fetch.
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.anonKey) {
          setKey(data.anonKey);
          setFetchMessage('Keys found automatically!');
          // Optional: Auto-save if you want immediate redirect
          // setupSupabase(targetUrl, data.anonKey); 
        } else {
          setFetchMessage('Server reachable, but keys not returned.');
        }
      } else {
        setFetchMessage('Could not retrieve keys automatically. Server may require auth or is sleeping.');
      }
    } catch (e) {
      setFetchMessage('Auto-discovery failed. Please enter key manually.');
    } finally {
      setAutoFetching(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && key) {
      setupSupabase(url, key);
    }
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure? This will remove the connection to your Supabase project.")) {
      disconnectSupabase();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Database className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Connect Backend</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your Supabase credentials to enable live data.
          </p>
        </div>

        {isSupabaseConfigured ? (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Database className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  <strong>Connected!</strong> Your app is currently linked to a Supabase project.
                </p>
                <button 
                  onClick={handleDisconnect}
                  className="mt-3 text-sm font-medium text-red-600 hover:text-red-500 underline"
                >
                  Disconnect & Reset
                </button>
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                  >
                    Go to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSave}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">Project URL</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    id="url"
                    name="url"
                    type="url"
                    required
                    className="flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-none rounded-l-md sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://xyz.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                   <button
                    type="button"
                    onClick={() => attemptAutoDiscovery(url)}
                    disabled={autoFetching || !url}
                    className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100 disabled:opacity-50"
                    title="Try to fetch config from server"
                  >
                    {autoFetching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="key" className="block text-sm font-medium text-gray-700">Anon Key (Public)</label>
                <input
                  id="key"
                  name="key"
                  type="text"
                  required
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
              </div>
            </div>
            
            {fetchMessage && (
               <div className={`text-xs flex items-center ${fetchMessage.includes('found') ? 'text-green-600' : 'text-gray-500'}`}>
                 {fetchMessage.includes('found') && <Check className="w-3 h-3 mr-1" />}
                 {fetchMessage}
               </div>
            )}

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-xs text-yellow-700">
              <p className="flex items-start">
                <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                These keys are saved to your browser's Local Storage. Do not use this method on shared public computers.
              </p>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Save className="mr-2 w-4 h-4" />
                Save & Connect
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}