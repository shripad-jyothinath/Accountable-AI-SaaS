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
import { Users, DollarSign, TrendingUp, CheckCircle, Clock, RefreshCw } from 'lucide-react';
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

// Corresponds to the 'admin_task_overview' View structure
interface AdminTaskView {
  task_id: string;
  title: string;
  description?: string;
  status: string;
  scheduled_at: string;
  end_at?: string;
  user_id: string;
  user_email: string;
  whatsapp_number?: string;
}

export default function Admin({ credentials }: { credentials?: any }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    mrr: 0,
    conversionRate: 0,
    recentSignups: [] as any[]
  });
  
  const [adminTasks, setAdminTasks] = useState<AdminTaskView[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Helper to construct body with credentials if they exist
  const getAuthBody = (extras: any = {}) => {
    return {
      ...(credentials ? { username: credentials.username, password: credentials.password } : {}),
      ...extras
    };
  };

  // 1. Fetch Stats
  useEffect(() => {
    async function fetchStats() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.functions.invoke('get-admin-stats', {
            body: getAuthBody({ action: 'stats' })
          });
          
          if (data && !error) {
            setStats(data);
          } else {
            setMockData();
          }
        } catch (e) {
          setMockData();
        }
      } else {
        setMockData();
      }
      setLoading(false);
    }
    fetchStats();
  }, [credentials]);

  // 2. Fetch Tasks Polling
  useEffect(() => {
    fetchLiveTasks(); // Initial fetch
    const intervalId = setInterval(fetchLiveTasks, 5000);
    return () => clearInterval(intervalId);
  }, [credentials]);

  const fetchLiveTasks = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('get-admin-stats', {
          body: getAuthBody({ action: 'tasks' })
        });

        if (data && !error) {
          setAdminTasks(data as AdminTaskView[]);
          setLastRefreshed(new Date());
        }
      } catch (e) {
        console.error("Error fetching admin tasks:", e);
      }
    }
  };

  const handleVerifyTask = async (taskId: string) => {
    if (isSupabaseConfigured && supabase) {
      // Optimistic Update
      setAdminTasks(prev => prev.map(t => t.task_id === taskId ? { ...t, status: 'verified' } : t));
      
      const { error } = await supabase.functions.invoke('get-admin-stats', {
        body: getAuthBody({ action: 'verify_task', taskId })
      });
        
      if (error) {
        alert("Failed to verify task. Check console.");
        console.error(error);
        fetchLiveTasks(); // Revert on error
      }
    } else {
       // Mock action
       setAdminTasks(prev => prev.map(t => t.task_id === taskId ? { ...t, status: 'verified' } : t));
    }
  };

  const setMockData = () => {
    setStats({
      totalUsers: 1248,
      mrr: 42380,
      conversionRate: 4,
      recentSignups: []
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Command Center</h1>
         <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Live Sync: {lastRefreshed.toLocaleTimeString()}
         </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Subscribers</dt>
                <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {loading ? '...' : stats.totalUsers.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">MRR</dt>
                <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {loading ? '...' : `$${stats.mrr.toLocaleString()}`}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Conversion Rate</dt>
                <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {loading ? '...' : `${stats.conversionRate}%`}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Live Task Manager */}
      <div className="mb-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-100 dark:border-gray-700">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
             <Clock className="w-5 h-5 mr-2 text-indigo-500" />
             Live Task Monitor
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Auto-refreshing (5s)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-750">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Schedule</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {adminTasks.map((task) => (
                <tr key={task.task_id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{task.user_email}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{task.whatsapp_number || 'No WhatsApp'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white font-semibold">{task.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">{task.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{new Date(task.scheduled_at).toLocaleTimeString()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                       End: {task.end_at ? new Date(task.end_at).toLocaleTimeString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${task.status === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                        task.status === 'missed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {task.status === 'pending' && (
                      <button 
                        onClick={() => handleVerifyTask(task.task_id)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold flex items-center justify-end w-full"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {adminTasks.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No tasks found.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Revenue Growth</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Paywall Conversion Rate (%)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CONVERSION_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                   itemStyle={{ color: '#e5e7eb' }}
                />
                <Bar dataKey="rate" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}