import React, { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Users, DollarSign, TrendingUp } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const MOCK_REVENUE_DATA = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 7800 },
  { name: 'May', revenue: 9000 },
  { name: 'Jun', revenue: 12000 },
];

const MOCK_CONVERSION_DATA = [
  { name: 'Jan', rate: 2.1 },
  { name: 'Feb', rate: 2.4 },
  { name: 'Mar', rate: 2.8 },
  { name: 'Apr', rate: 3.2 },
  { name: 'May', rate: 3.5 },
  { name: 'Jun', rate: 4.0 },
];

export default function Admin({ credentials }: { credentials?: any }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    mrr: 0,
    conversionRate: 0,
    recentSignups: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (isSupabaseConfigured && supabase) {
        try {
          // Invoke the Edge Function 'get-admin-stats'
          // We must pass the credentials (if they exist) to authenticate the request
          const { data, error } = await supabase.functions.invoke('get-admin-stats', {
            body: credentials ? { username: credentials.username, password: credentials.password } : {}
          });
          
          if (data && !error) {
            setStats(data);
          } else {
            console.error("Function error:", error);
            // Fallback to mock if function fails (e.g. not deployed)
            setMockData();
          }
        } catch (e) {
          console.error("Invoke exception:", e);
          setMockData();
        }
      } else {
        setMockData();
      }
      setLoading(false);
    }

    fetchStats();
  }, [credentials]);

  const setMockData = () => {
    setStats({
      totalUsers: 1248,
      mrr: 42380,
      conversionRate: 4,
      recentSignups: [
        { email: 'demo_user_1@example.com', tier: 'PRO', created_at: new Date().toISOString() },
        { email: 'demo_user_2@example.com', tier: 'BASIC', created_at: new Date().toISOString() },
        { email: 'demo_user_3@example.com', tier: 'PRO', created_at: new Date().toISOString() },
      ]
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Overview</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Subscribers</dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {loading ? '...' : stats.totalUsers.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">MRR (Monthly Recurring)</dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {loading ? '...' : `$${stats.mrr.toLocaleString()}`}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {loading ? '...' : `${stats.conversionRate}%`}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Revenue Growth</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Paywall Conversion Rate (%)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CONVERSION_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rate" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       {/* User Table Preview */}
       <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Signups</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            {stats.recentSignups.map((user, i) => (
              <div key={i} className={i % 2 === 0 ? 'bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6' : 'bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'}>
                <dt className="text-sm font-medium text-gray-500">{user.email}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between">
                  <span>{user.tier} Tier</span>
                  <span className="text-gray-500 text-xs">{new Date(user.created_at).toLocaleDateString()}</span>
                </dd>
              </div>
            ))}
            {stats.recentSignups.length === 0 && (
              <div className="px-4 py-5 text-gray-500 text-sm">No recent signups found.</div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}