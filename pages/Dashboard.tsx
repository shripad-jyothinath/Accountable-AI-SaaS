import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Task } from '../types';
import { Plus, PhoneCall, CheckCircle, Clock, Calendar, X, CreditCard, Lock, Loader2, AlertTriangle, Upload, Bell, Menu, Settings, LogOut, LayoutDashboard, DollarSign, User, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Link, useNavigate } from '../App';

interface DashboardProps {
  user: UserProfile;
  refreshUser: () => Promise<void>;
  onLogout: () => void;
}

const MOCK_TASKS: Task[] = [
  { id: '1', user_id: '1', title: 'Finish Q3 Report', scheduled_at: '2023-10-27T14:00:00', end_at: '2023-10-27T15:00:00', status: 'pending' },
  { id: '2', user_id: '1', title: 'Gym Workout', scheduled_at: '2023-10-26T18:00:00', end_at: '2023-10-26T19:00:00', status: 'verified' },
  { id: '3', user_id: '1', title: 'Clean Garage', scheduled_at: '2023-10-25T10:00:00', end_at: '2023-10-25T12:00:00', status: 'missed' },
];

export default function Dashboard({ user, refreshUser, onLogout }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const navigate = useNavigate();
  
  // UI States
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'tasks' | 'settings'>('tasks');
  
  // Modal States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState<Task | null>(null);

  // Form States
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(60); // minutes
  
  // Settings Form
  const [settingsName, setSettingsName] = useState(user.full_name || '');
  const [settingsWhatsapp, setSettingsWhatsapp] = useState(user.whatsapp_number || '');
  const [savingSettings, setSavingSettings] = useState(false);
  
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [schedulingTask, setSchedulingTask] = useState(false);

  // Notification Tracking
  const notifiedTasksRef = useRef<Set<string>>(new Set());

  // 1. Request Notification Permissions on Mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // 2. Check for upcoming tasks (15 min warning)
  useEffect(() => {
    const checkUpcomingTasks = () => {
      if (!tasks.length) return;
      
      const now = new Date().getTime();
      const fifteenMinutes = 15 * 60 * 1000;

      tasks.forEach(task => {
        // Only notify for pending tasks
        if (task.status !== 'pending') return;
        
        const scheduledTime = new Date(task.scheduled_at).getTime();
        const timeDiff = scheduledTime - now;

        // Condition: Task is in the future, but within 15 minutes, and not yet notified
        if (timeDiff > 0 && timeDiff <= fifteenMinutes && !notifiedTasksRef.current.has(task.id)) {
          // Trigger Notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Upcoming Call: ${task.title}`, {
              body: `Get ready! Your accountability agent calls in ${Math.ceil(timeDiff / 60000)} minutes.`,
              icon: '/vite.svg', // Assuming vite.svg is available as generic icon
              tag: task.id // Prevent duplicate notifications for same ID if browser logic handles it
            });
          }
          
          // Mark as notified so we don't spam
          notifiedTasksRef.current.add(task.id);
        }
      });
    };

    // Check immediately when tasks update
    checkUpcomingTasks();

    // And check every minute
    const interval = setInterval(checkUpcomingTasks, 60000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Nudge Logic: Check for overdue pending tasks
  useEffect(() => {
    const checkOverdueTasks = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.status === 'pending' && task.end_at) {
          const endTime = new Date(task.end_at);
          // If end time has passed (and not processed yet), nudge user
          // Simple logic: If end time was within last minute (to avoid spamming), or just check if < now
          // We will just show the proof modal for the first overdue task found if not already showing one
          if (now > endTime && !showProofModal) {
            setShowProofModal(task);
          }
        }
      });
    };

    // Check nudge every 30s
    const nudgeInterval = setInterval(checkOverdueTasks, 30000);
    return () => clearInterval(nudgeInterval);
  }, [tasks, showProofModal]);

  // Fetch Tasks with Polling
  useEffect(() => {
    fetchTasks(); // Initial load

    // Poll for status updates every 5 seconds
    const pollInterval = setInterval(() => {
      fetchTasks(true); // true = background refresh (no loading spinner)
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [user.id]);

  const fetchTasks = async (isBackground = false) => {
    if (isSupabaseConfigured && supabase) {
      if (!isBackground) setLoadingTasks(true);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (data) {
        setTasks(data as Task[]);
      }
      if (!isBackground) setLoadingTasks(false);
    } else {
      if (!isBackground) setTasks(MOCK_TASKS);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (schedulingTask) return;
    setSchedulingTask(true);
    
    // Calculate End Time
    const start = new Date(newTaskTime);
    const end = new Date(start.getTime() + newTaskDuration * 60000);
    const endIso = end.toISOString();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('tasks').insert([
        {
          user_id: user.id,
          title: newTaskTitle,
          description: newTaskDesc,
          scheduled_at: newTaskTime,
          end_at: endIso,
          status: 'pending'
        }
      ]).select();

      if (data) {
        setTasks([data[0] as Task, ...tasks]);
        setShowTaskModal(false);
        resetForm();
      } else if (error) {
        alert("Error creating task: " + error.message);
      }
    } else {
      // Fallback for mock mode
      const task: Task = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: user.id,
        title: newTaskTitle,
        description: newTaskDesc,
        scheduled_at: newTaskTime,
        end_at: endIso,
        status: 'pending'
      };
      setTasks([task, ...tasks]);
      setShowTaskModal(false);
      resetForm();
    }
    setSchedulingTask(false);
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingPayment(true);
    
    // Simulate DB update
    setTimeout(async () => {
      if (isSupabaseConfigured && supabase) {
         // Add 10 calls
         const newCalls = (user.calls_remaining || 0) + 10;
         await supabase.from('profiles').update({ calls_remaining: newCalls }).eq('id', user.id);
         await refreshUser();
      } else {
         // Mock update locally? We can't update read-only prop user easily, but in mock mode refreshUser might not work perfectly unless App state handles it.
         alert("Top Up Successful! (Mock)");
      }
      
      setProcessingPayment(false);
      setShowPaymentModal(false);
      alert("Top Up Successful! 10 calls added.");
    }, 1500);
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('profiles').update({
        full_name: settingsName,
        whatsapp_number: settingsWhatsapp
      }).eq('id', user.id);

      if (error) {
        alert("Failed to update profile: " + error.message);
      } else {
        await refreshUser();
        alert("Profile updated successfully!");
        setSidebarOpen(false);
        setActiveView('tasks');
      }
    } else {
       alert("Profile updated (Mock)");
       setSidebarOpen(false);
       setActiveView('tasks');
    }
    setSavingSettings(false);
  }

  const handleProofSubmit = () => {
    // Logic to mark task as verified (mock)
    if (showProofModal) {
      const updatedTasks = tasks.map(t => 
        t.id === showProofModal.id ? { ...t, status: 'verified' as const } : t
      );
      setTasks(updatedTasks);
      
      if (isSupabaseConfigured && supabase) {
         supabase.from('tasks').update({ status: 'verified' }).eq('id', showProofModal.id).then();
      }
      setShowProofModal(null);
      alert("Proof submitted! Good job.");
    }
  }

  const resetForm = () => {
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskTime('');
    setNewTaskDuration(60);
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'missed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Custom Dashboard Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <div className="flex items-center">
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none lg:hidden">
                 <Menu className="w-6 h-6" />
              </button>
              <div className="ml-4 lg:ml-0 flex items-center">
                <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              </div>
           </div>
           
           {/* Desktop Navigation / User Info */}
           <div className="hidden lg:flex items-center space-x-4">
               <button onClick={() => setActiveView('tasks')} className={`text-sm font-medium ${activeView === 'tasks' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                 Tasks
               </button>
               <button onClick={() => { setSidebarOpen(true); setActiveView('settings'); }} className={`text-sm font-medium ${activeView === 'settings' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                 Settings
               </button>
               <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
               <span className="text-sm font-bold text-gray-900 dark:text-white">{user.calls_remaining} Calls</span>
               <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
               >
                 Top Up
               </button>
               <div className="relative group ml-3">
                 <button className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                   <User className="w-5 h-5" />
                 </button>
                 {/* Simple Dropdown for Logout */}
                 <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-100 dark:border-gray-700">
                    <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Sign out
                    </button>
                 </div>
               </div>
           </div>
           
           {/* Mobile Top Up */}
           <div className="flex lg:hidden items-center">
              <span className="mr-3 text-sm font-bold text-gray-900 dark:text-white">{user.calls_remaining}</span>
              <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-full"
               >
                 <Plus className="w-5 h-5" />
               </button>
           </div>
        </div>
      </header>

      {/* Sidebar / Slide-over */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl">
             <div className="absolute top-0 right-0 -mr-12 pt-2">
               <button onClick={() => setSidebarOpen(false)} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                 <X className="h-6 w-6 text-white" />
               </button>
             </div>
             
             <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4 mb-8">
                  <ShieldCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Accountable</span>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  <button 
                    onClick={() => { setActiveView('tasks'); setSidebarOpen(false); }}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full ${activeView === 'tasks' ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}`}
                  >
                    <LayoutDashboard className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300" />
                    Tasks
                  </button>
                  <button 
                    onClick={() => { setActiveView('settings'); }} 
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full ${activeView === 'settings' ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}`}
                  >
                    <Settings className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300" />
                    Settings
                  </button>
                  <Link 
                    to="/pricing"
                    onClick={() => setSidebarOpen(false)}
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    <DollarSign className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300" />
                    Pricing & Plans
                  </Link>
                </nav>
             </div>
             <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center w-full">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900">{user.email}</p>
                    <button onClick={onLogout} className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 flex items-center mt-1">
                      <LogOut className="w-3 h-3 mr-1" /> Sign Out
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeView === 'settings' ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl mx-auto">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h2>
             <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                   <input 
                     type="text" 
                     value={settingsName} 
                     onChange={(e) => setSettingsName(e.target.value)}
                     className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp Number</label>
                   <input 
                     type="text" 
                     value={settingsWhatsapp} 
                     onChange={(e) => setSettingsWhatsapp(e.target.value)}
                     className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                   />
                   <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Used for verification calls.</p>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Plan</label>
                   <div className="mt-1 block w-full py-2 px-3 text-gray-500 dark:text-gray-400">
                      {user.tier === 'NONE' ? 'Free / None' : user.tier}
                   </div>
                </div>
                <div className="flex justify-end">
                   <button 
                     type="submit" 
                     disabled={savingSettings}
                     className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center"
                   >
                     {savingSettings && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                     Save Changes
                   </button>
                </div>
             </form>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-medium text-gray-900 dark:text-white">Your Schedule</h2>
               <button
                  onClick={() => setShowTaskModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Schedule Task
               </button>
            </div>
          
            {/* Permission Reminder Banner */}
            {'Notification' in window && Notification.permission === 'default' && (
              <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Bell className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      Enable notifications to get reminded 15 minutes before your accountability call.
                      <button 
                        onClick={() => Notification.requestPermission()} 
                        className="ml-2 font-bold underline hover:text-indigo-900 dark:hover:text-indigo-100"
                      >
                        Enable Now
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Task List */}
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-100 dark:border-gray-700">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Upcoming & Past Calls</h3>
                {loadingTasks && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
              </div>
              {loadingTasks && tasks.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading tasks...</div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tasks.map((task) => (
                    <li key={task.id}>
                      <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{task.title}</p>
                            {task.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>}
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                              {task.status}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                              {new Date(task.scheduled_at).toLocaleString()} 
                              {task.end_at && ` - ${new Date(task.end_at).toLocaleTimeString()}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                  {tasks.length === 0 && (
                    <li className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                      No tasks scheduled. Add one to get started!
                    </li>
                  )}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80 transition-opacity" onClick={() => setShowTaskModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  onClick={() => setShowTaskModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    Schedule New Task Call
                  </h3>
                  <div className="mt-2">
                    <form onSubmit={handleAddTask} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Task Title</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="e.g. Finish Monthly Report"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (What will you do?)</label>
                        <textarea
                          rows={2}
                          required
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Describe the deliverables..."
                          value={newTaskDesc}
                          onChange={(e) => setNewTaskDesc(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                            <input
                              type="datetime-local"
                              required
                              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={newTaskTime}
                              onChange={(e) => setNewTaskTime(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (Minutes)</label>
                            <input
                              type="number"
                              min="15"
                              step="15"
                              required
                              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={newTaskDuration}
                              onChange={(e) => setNewTaskDuration(parseInt(e.target.value))}
                            />
                          </div>
                      </div>
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={schedulingTask}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                          {schedulingTask ? <Loader2 className="animate-spin h-5 w-5" /> : 'Schedule'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-50 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                          onClick={() => setShowTaskModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Up Payment Modal */}
      {showPaymentModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80 transition-opacity" onClick={() => setShowPaymentModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-gray-200 dark:border-gray-700">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                   <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 sm:mx-0 sm:h-10 sm:w-10">
                    <CreditCard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Top Up Calls
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                         Get <span className="font-bold">10 extra calls</span> for <span className="font-bold">$5.00</span>.
                      </p>
                      <form onSubmit={handleTopUp} className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Card Number</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <input type="text" className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" defaultValue="4242 4242 4242 4242" required />
                             <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-gray-400" /></div>
                          </div>
                        </div>
                        <div className="pt-2">
                           <button type="submit" disabled={processingPayment} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:text-sm disabled:opacity-50">
                            {processingPayment ? <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Processing...</> : 'Pay $5.00'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-50 dark:hover:text-white focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proof Submission "Nudge" Modal */}
      {showProofModal && (
         <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
         <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
           <div className="fixed inset-0 bg-red-900/50 backdrop-blur-sm transition-opacity" onClick={() => {}}></div>
           <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
           <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border-2 border-red-500">
             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
               <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
             </div>
             <div className="text-center">
               <h3 className="text-2xl leading-6 font-bold text-gray-900 dark:text-white" id="modal-title">
                 TIME IS UP!
               </h3>
               <div className="mt-2">
                 <p className="text-md text-gray-500 dark:text-gray-300">
                   Your task <strong>"{showProofModal.title}"</strong> was supposed to be finished by {new Date(showProofModal.end_at!).toLocaleTimeString()}.
                 </p>
                 <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Our agent is reviewing your status. Upload your proof immediately.
                 </p>
               </div>
               <div className="mt-6">
                 <button
                   type="button"
                   onClick={handleProofSubmit}
                   className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-3 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                 >
                   <Upload className="mr-2 h-5 w-5" />
                   Upload Proof & Verify
                 </button>
               </div>
             </div>
           </div>
         </div>
       </div>
      )}
    </div>
  );
}