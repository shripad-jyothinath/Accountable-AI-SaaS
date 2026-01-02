import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { useNavigate } from '../App';
import { AlertCircle, Lock, Phone } from 'lucide-react';

interface AuthProps {
  onMockLogin: (email: string) => void;
  onAdminLogin: (creds: any) => void;
}

export default function Auth({ onMockLogin, onAdminLogin }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
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

  const handlePostAuthRedirect = () => {
    const redirectPath = localStorage.getItem('redirect_after_login');
    if (redirectPath) {
      localStorage.removeItem('redirect_after_login');
      navigate(redirectPath);
    } else {
      navigate('/dashboard');
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
        handlePostAuthRedirect();
        setLoading(false);
      }, 1000);
      return;
    }

    // Real Supabase Auth
    try {
      if (!supabase) throw new Error("Supabase client not initialized");
      
      const { data, error } = isSignUp
        ? await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              data: {
                whatsapp_number: whatsapp
              }
            }
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      
      // If sign up, we might wait for email confirmation in a real app
      // Here we assume auto-confirm or immediate login
      if (!error) {
        handlePostAuthRedirect();
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
      // 1. Authenticate with Supabase Auth
      // Assumption: Admin is just a user with a special flag
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminUser,
        password: adminPass,
      });

      if (error) throw new Error("Invalid Login Credentials");
      
      if (data.user) {
        // 2. Check Profile for is_admin flag
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile?.is_admin) {
           await supabase.auth.signOut();
           throw new Error("Access Denied: Not an Administrator");
        }

        // Success
        onAdminLogin({ username: adminUser });
        navigate('/admin');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unauthorized");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div>
          <h2 
            className={`mt-2 text-center text-3xl font-extrabold cursor-pointer select-none transition-colors ${isAdminMode ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}
            onClick={handleTitleClick}
          >
            {isAdminMode ? 'Admin Portal' : (isSignUp ? 'Create your account' : 'Sign in to your account')}
          </h2>
          {!isAdminMode && (
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          )}
        </div>
        
        {!isSupabaseConfigured && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
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
                <label htmlFor="admin-user" className="sr-only">Admin Email</label>
                <input
                  id="admin-user"
                  name="admin-user"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Admin Email"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="admin-pass" className="sr-only">Password</label>
                <input
                  id="admin-pass"
                  name="admin-pass"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
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
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 dark:bg-black hover:bg-gray-800 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
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
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${isSignUp ? '' : 'rounded-b-none'}`}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              {isSignUp && (
                <div>
                   <label htmlFor="whatsapp" className="sr-only">WhatsApp Number</label>
                   <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      autoComplete="tel"
                      required
                      className="appearance-none rounded-none relative block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="WhatsApp Number (e.g. +1 555-0100)"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                    />
                   </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${isSignUp ? 'rounded-t-none' : ''}`}
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
                {loading ? 'Processing...' : (isSignUp ? 'Sign Up & Connect' : 'Sign In')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}