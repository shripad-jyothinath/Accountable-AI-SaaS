import React, { useState, useEffect } from 'react';
import { UserProfile, Task } from '../types';
import { Plus, PhoneCall, CheckCircle, Clock, Calendar } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

interface DashboardProps {
  user: UserProfile;
}

const MOCK_TASKS: Task[] = [
  { id: '1', user_id: '1', title: 'Finish Q3 Report', scheduled_at: '2023-10-27T14:00:00', status: 'pending' },
  { id: '2', user_id: '1', title: 'Gym Workout', scheduled_at: '2023-10-26T18:00:00', status: 'verified' },
  { id: '3', user_id: '1', title: 'Clean Garage', scheduled_at: '2023-10-25T10:00:00', status: 'missed' },
];

export default function Dashboard({ user }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      setLoadingTasks(true);
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: false })
        .then(({ data, error }) => {
          if (data) {
            setTasks(data as Task[]);
          }
          setLoadingTasks(false);
        });
    } else {
      setTasks(MOCK_TASKS);
    }
  }, [user.id]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('tasks').insert([
        {
          user_id: user.id,
          title: newTaskTitle,
          scheduled_at: newTaskTime,
          status: 'pending'
        }
      ]).select();

      if (data) {
        setTasks([data[0] as Task, ...tasks]);
        setShowModal(false);
        setNewTaskTitle('');
        setNewTaskTime('');
      } else if (error) {
        alert("Error creating task: " + error.message);
      }
    } else {
      // Fallback for mock mode
      const task: Task = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: user.id,
        title: newTaskTitle,
        scheduled_at: newTaskTime,
        status: 'pending'
      };
      setTasks([task, ...tasks]);
      setShowModal(false);
      setNewTaskTitle('');
      setNewTaskTime('');
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user.email}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => alert("Redirecting to payment processor for top-up...")}
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Top Up Calls
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Schedule Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PhoneCall className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Calls Remaining</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{user.calls_remaining}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Verified Tasks</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {tasks.filter(t => t.status === 'verified').length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Verification</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                       {tasks.filter(t => t.status === 'pending').length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Scheduled Calls</h3>
        </div>
        {loadingTasks ? (
          <div className="p-8 text-center text-gray-500">Loading tasks...</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <li key={task.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">{task.title}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        {new Date(task.scheduled_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {tasks.length === 0 && (
              <li className="px-4 py-10 text-center text-gray-500">
                No tasks scheduled. Add one to get started!
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShowModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Schedule New Task Call
                  </h3>
                  <div className="mt-2">
                    <form onSubmit={handleAddTask} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Task Description</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="e.g. Finish Monthly Report"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Call Time</label>
                        <input
                          type="datetime-local"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={newTaskTime}
                          onChange={(e) => setNewTaskTime(e.target.value)}
                        />
                      </div>
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Schedule
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                          onClick={() => setShowModal(false)}
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
    </div>
  );
}

function X(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  )
}