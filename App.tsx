import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Menu, X, LogOut, LayoutDashboard, ShieldCheck, BarChart3, Lock, Database } from 'lucide-react';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { UserProfile, SubscriptionTier } from './types';

// Pages
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import BlogPost from './pages/BlogPost';
import Setup from './pages/Setup';

// --- Custom Router Implementation ---
const RouterContext = createContext<{ path: string; params: Record<string, string> }>({ path: '/', params: {} });

export function HashRouter({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const onHashChange = () => {
      const newPath = window.location.hash.slice(1) || '/';
      setPath(newPath);
    };
    window.addEventListener('hashchange', onHashChange);
    // Ensure initial hash
    if (!window.location.hash) {
      window.location.hash = '/';
    }
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <RouterContext.Provider value={{ path, params: {} }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useLocation() {
  const { path } = useContext(RouterContext);
  return { pathname: path };
}

export function useNavigate() {
  return (to: string) => {
    window.location.hash = to;
  };
}

export function useParams<T = any>() {
  const { params } = useContext(RouterContext);
  return params as any;
}

export function Link({ to, children, className, onClick, ...props }: any) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick(e);
    window.location.hash = to;
  };
  
  return (
    <a href={`#${to}`} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

export function Navigate({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  }, [to, navigate]);
  return null;
}

export function Routes({ children }: { children: React.ReactNode }) {
  const { path: currentPath } = useContext(RouterContext);
  let matchedElement = null;
  let params = {};

  React.Children.forEach(children, (child) => {
    if (matchedElement) return;
    if (!React.isValidElement(child)) return;
    
    const { path: routePath, element } = child.props as any;
    if (!routePath) return;

    if (routePath === currentPath) {
      matchedElement = element;
      return;
    }
    
    if (routePath.includes(':')) {
       const routeParts = routePath.split('/');
       const pathParts = currentPath.split('/');
       
       if (routeParts.length === pathParts.length) {
         const newParams: Record<string, string> = {};
         let match = true;
         for (let i = 0; i < routeParts.length; i++) {
           if (routeParts[i].startsWith(':')) {
             newParams[routeParts[i].slice(1)] = pathParts[i];
           } else if (routeParts[i] !== pathParts[i]) {
             match = false;
             break;
           }
         }
         if (match) {
           matchedElement = element;
           params = newParams;
         }
       }
    }
  });

  if (matchedElement) {
    return (
      <RouterContext.Provider value={{ path: currentPath, params }}>
        {matchedElement}
      </RouterContext.Provider>
    );
  }
  return null;
}

export function Route({ path, element }: { path: string, element: React.ReactNode }) {
  return null;
}
// ------------------------------------

const MOCK_USER: UserProfile = {
  id: 'mock-1',
  email: 'demo@accountable.com',
  tier: SubscriptionTier.BASIC,
  calls_remaining: 12,
  is_admin: true, 
  created_at: new Date().toISOString()
};

const Navbar = ({ user, adminCredentials, onLogout }: { user: UserProfile | null, adminCredentials?: any, onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isLanding = location.pathname === '/';
  const navClass = isLanding 
    ? "absolute w-full z-50 bg-transparent" 
    : "bg-white border-b border-gray-100 sticky top-0 z-50";
    
  const textClass = isLanding ? "text-white" : "text-gray-900";
  const subTextClass = isLanding ? "text-gray-200 hover:text-white" : "text-gray-500 hover:text-gray-700";
  const iconClass = isLanding ? "text-white" : "text-indigo-600";
  const borderClass = isLanding ? "border-white" : "border-indigo-500";

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <ShieldCheck className={`h-8 w-8 ${iconClass} transition-transform group-hover:scale-110`} />
              <span className={`ml-2 text-xl font-bold ${textClass}`}>Accountable</span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link to="/" className={`${location.pathname === '/' ? `${borderClass} font-semibold` : 'border-transparent font-medium'} ${textClass} inline-flex items-center px-1 pt-1 border-b-2 text-sm transition-colors`}>
                Home
              </Link>
              <Link to="/pricing" className={`${location.pathname === '/pricing' ? `${borderClass} font-semibold` : 'border-transparent font-medium'} ${textClass} inline-flex items-center px-1 pt-1 border-b-2 text-sm transition-colors`}>
                Pricing
              </Link>
              {user && (
                <Link to="/dashboard" className={`${location.pathname === '/dashboard' ? `${borderClass} font-semibold` : 'border-transparent font-medium'} ${textClass} inline-flex items-center px-1 pt-1 border-b-2 text-sm transition-colors`}>
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user || adminCredentials ? (
              <div className="flex items-center space-x-4">
                {(user?.is_admin || adminCredentials) && (
                  <Link to="/admin" className={`${subTextClass} flex items-center gap-1 text-sm font-medium`}>
                    <BarChart3 className="w-4 h-4" /> Admin
                  </Link>
                )}
                {user && (
                  <span className={`text-sm font-medium ${textClass}`}>
                    {user.calls_remaining} calls left
                  </span>
                )}
                <button
                  onClick={onLogout}
                  className={`p-1 rounded-full ${isLanding ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'} transition-colors focus:outline-none`}
                >
                  <span className="sr-only">Log out</span>
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth" className={`${textClass} hover:opacity-80 px-3 py-2 rounded-md text-sm font-medium transition-opacity`}>
                  Log in
                </Link>
                <Link to="/pricing" className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5">
                  Get Started
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${textClass} hover:bg-white/10 focus:outline-none`}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className={`sm:hidden ${isLanding ? 'bg-black/90 backdrop-blur-md' : 'bg-white'} border-t border-gray-200`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" onClick={() => setIsOpen(false)} className="block pl-3 pr-4 py-2 border-l-4 border-indigo-500 text-base font-medium text-indigo-500 bg-indigo-50/10">Home</Link>
            <Link to="/pricing" onClick={() => setIsOpen(false)} className={`block pl-3 pr-4 py-2 border-l-4 border-transparent ${isLanding ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-base font-medium`}>Pricing</Link>
            {(user || adminCredentials) && (
              <>
                {user && <Link to="/dashboard" onClick={() => setIsOpen(false)} className={`block pl-3 pr-4 py-2 border-l-4 border-transparent ${isLanding ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-base font-medium`}>Dashboard</Link>}
                {(user?.is_admin || adminCredentials) && <Link to="/admin" onClick={() => setIsOpen(false)} className={`block pl-3 pr-4 py-2 border-l-4 border-transparent ${isLanding ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-base font-medium`}>Admin</Link>}
              </>
            )}
          </div>
          <div className="pt-4 pb-4 border-t border-gray-700">
            {(user || adminCredentials) ? (
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <User className="h-10 w-10 rounded-full bg-indigo-100 p-2 text-indigo-500" />
                </div>
                <div className="ml-3">
                  <div className={`text-base font-medium ${isLanding ? 'text-white' : 'text-gray-800'}`}>{user?.email || 'Administrator'}</div>
                  {user && <div className={`text-sm font-medium ${isLanding ? 'text-gray-400' : 'text-gray-500'}`}>{user.calls_remaining} calls remaining</div>}
                </div>
                <button onClick={onLogout} className="ml-auto flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="px-4 space-y-2">
                <Link to="/auth" className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  Sign In / Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [adminCredentials, setAdminCredentials] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (sessionUser: any) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (data) {
        setUser(data);
      } else {
        // Fallback for demo if trigger failed or doesn't exist yet
        setUser({
          id: sessionUser.id,
          email: sessionUser.email || '',
          tier: SubscriptionTier.NONE,
          calls_remaining: 0,
          is_admin: false,
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // If Supabase is not configured, load mock user for demo purposes if they "logged in" locally
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('mock_user_session');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      setLoading(false);
      return;
    }

    if (supabase) {
      // Check active session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
           fetchProfile(session.user);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          fetchProfile(session.user);
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('mock_user_session');
    }
    setUser(null);
    setAdminCredentials(null);
    window.location.hash = '/';
  };

  const handleMockLogin = (email: string) => {
    const mockUser = { ...MOCK_USER, email };
    localStorage.setItem('mock_user_session', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const handleAdminLogin = (creds: any) => {
    setAdminCredentials(creds);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900">
        <Navbar user={user} adminCredentials={adminCredentials} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/setup" element={<Setup />} />
            <Route 
              path="/auth" 
              element={(!user && !adminCredentials) ? <Auth onMockLogin={handleMockLogin} onAdminLogin={handleAdminLogin} /> : <Navigate to={adminCredentials ? "/admin" : "/dashboard"} />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/admin" 
              element={(user?.is_admin || adminCredentials) ? <Admin credentials={adminCredentials} /> : <Navigate to="/dashboard" />} 
            />
          </Routes>
        </main>
        <footer className="bg-black text-slate-400 py-12 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center text-white mb-4">
                <ShieldCheck className="h-6 w-6 text-indigo-500" />
                <span className="ml-2 text-lg font-bold">Accountable</span>
              </div>
              <p className="text-sm">
                Real humans, real calls, real results. Stop procrastinating and start doing.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <p className="text-sm">support@accountable.com</p>
              <p className="text-sm mt-2">123 Productivity Lane,<br/>San Francisco, CA</p>
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
}