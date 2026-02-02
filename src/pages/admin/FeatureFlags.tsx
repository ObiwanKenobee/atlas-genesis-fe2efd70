import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

type Flags = Record<string, boolean>;

const ADMIN_TOKEN_KEY = 'admin_token';

const FeatureFlagsAdmin: React.FC = () => {
  const [flags, setFlags] = useState<Flags>({});
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(sessionStorage.getItem(ADMIN_TOKEN_KEY));
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: any = {};
      if (token) headers['X-Admin-Token'] = token;
      const res = await fetch('/api/admin/flags', { headers });
      if (!res.ok) {
        throw new Error(`Failed to load flags: ${res.status}`);
      }
      const data = await res.json();
      setFlags(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load flags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchFlags();
  }, [token]);

  const saveToken = (t: string) => {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, t);
    setToken(t);
  };

  const clearToken = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
  };

  const toggleFlag = async (key: string) => {
    const current = !!flags[key];
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['X-Admin-Token'] = token;
      const res = await fetch(`/api/admin/flags/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ value: !current })
      });
      if (!res.ok) throw new Error('Failed to update flag');
      const updated = await res.json();
      setFlags((prev) => ({ ...prev, ...updated }));
    } catch (err: any) {
      setError(err.message || 'Update failed');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Feature Flags</h1>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Admin token</label>
          {token ? (
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-2 py-1 rounded">****{token.slice(-6)}</code>
              <button className="ml-2 text-sm text-red-500" onClick={clearToken}>Clear</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input type="password" placeholder="Enter admin token" id="adminToken" className="input" />
              <button
                onClick={() => {
                  const v = (document.getElementById('adminToken') as HTMLInputElement).value;
                  saveToken(v);
                }}
                className="btn"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="bg-white shadow rounded p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {loading ? (
              <div>Loading…</div>
            ) : (
              Object.keys(flags).map((k) => (
                <div key={k} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{k}</div>
                    <div className="text-sm text-gray-500">{String(flags[k])}</div>
                  </div>
                  <div>
                    <button
                      onClick={() => toggleFlag(k)}
                      className={`px-3 py-1 rounded ${flags[k] ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                    >
                      {flags[k] ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FeatureFlagsAdmin;
