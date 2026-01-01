import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { useNavigate } from '../App';
import { AlertCircle, Lock } from 'lucide-react';

interface AuthProps {
  onMockLogin: (email: string) => void;
  onAdminLogin: (creds: any) => void;
}

export default function Auth({ onMockLogin, onAdminLogin }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Admin Easter Egg State
  const [titleClickCount, setTitleClickCount] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const navigate = useNavigate();

  const handleTitleClick = () => {
    const newCount = titleClickCount + 1;
    setTitleClickCount(newCount);
    if (newCount >= 5) {
      setIsAdminMode(true);
      setError(null);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // If no supabase connection, use mock
    if (!isSupabaseConfigured) {
      setTimeout(() => {
        onMockLogin(email);
        navigate('/dashboard');
        setLoading(false);
      }, 1000);
      return;
    }

    // Real Supabase Auth
    try {
      if (!supabase) throw new Error("Supabase client not initialized");
      
      const { data, error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      
      // If sign up, we might wait for email confirmation in a real app
      // Here we assume auto-confirm or immediate login
      if (!error) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
       // Mock admin login
       if (adminUser === 'admin' && adminPass === 'admin') {
         onAdminLogin({ username: adminUser, password: adminPass });
         navigate('/admin');
       } else {
         setError("Invalid mock credentials (try admin/admin)");
       }
       setLoading(false);
       return;
    }

    try {
      // Verify credentials by calling the edge function
      const { data, error } = await supabase.functions.invoke('get-admin-stats', {
        body: { username: adminUser, password: adminPass }
      });

      if (error) {
         // Often invoke returns error object if status != 200
         throw new Error("Invalid Admin Credentials"); 
      }
      
      // If we got data back, credentials are valid
      onAdminLogin({ username: adminUser, password: adminPass });
      navigate('/admin');

    } catch (err: any) {
      console.error(err);
      setError("Unauthorized: Invalid Admin Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 
            className={`mt-6 text-center text-3xl font-extrabold cursor-pointer select-none transition-colors ${isAdminMode ? 'text-indigo-600' : 'text-gray-900'}`}
            onClick={handleTitleClick}
          >
            {isAdminMode ? 'Admin Portal' : (isSignUp ? 'Create your account' : 'Sign in to your account')}
          </h2>
          {!isAdminMode && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          )}
        </div>
        
        {!isSupabaseConfigured && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong className="font-bold">Demo Mode:</strong> Supabase keys not detected. Enter any email/password to simulate login.
                </p>
              </div>
            </div>
          </div>
        )}

        {isAdminMode ? (
          // Admin Login Form
          <form className="mt-8 space-y-6" onSubmit={handleAdminAuth}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="admin-user" className="sr-only">Admin Username</label>
                <input
                  id="admin-user"
                  name="admin-user"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Admin Username"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="admin-pass" className="sr-only">Admin Password</label>
                <input
                  id="admin-pass"
                  name="admin-pass"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Secret Key"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => { setIsAdminMode(false); setTitleClickCount(0); setError(null); }}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                {loading ? 'Verifying...' : 'Access Portal'}
                <Lock className="ml-2 w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          // Standard User Login Form
          <form className="mt-8 space-y-6" onSubmit={handleAuth}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}