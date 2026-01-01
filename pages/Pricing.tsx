import React, { useState } from 'react';
import { Check, CreditCard, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from '../App';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { UserProfile } from '../types';

const tiers = [
  {
    name: 'Basic Accountability',
    id: 'BASIC',
    priceMonthly: 20,
    calls: 50,
    features: [
      '50 Human Calls per month',
      'Task Dashboard',
      'Email Reminders',
      'Basic Statistics',
    ],
  },
  {
    name: 'Pro Discipline',
    id: 'PRO',
    priceMonthly: 40,
    calls: 100,
    features: [
      '100 Human Calls per month',
      'Priority Scheduling',
      'Detailed Performance Analytics',
      'Rollover unused calls',
      'Dedicated Verification Agent',
    ],
  },
];

interface PricingProps {
  user: UserProfile | null;
  refreshUser?: () => Promise<void>;
}

export default function Pricing({ user, refreshUser }: PricingProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = (tier: any) => {
    // If not logged in, redirect to auth (in a real app), here we assume user might be null but we handle it
    if (!user) {
       navigate('/auth');
       return;
    }
    setSelectedTier(tier);
    setShowPayment(true);
  };

  const processFakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate Network Request
    setTimeout(async () => {
      setProcessing(false);
      setShowPayment(false);
      
      // Attempt to update backend if logged in
      if (isSupabaseConfigured && supabase && user) {
        const { error } = await supabase.from('profiles').update({
             tier: selectedTier.id,
             calls_remaining: selectedTier.calls
        }).eq('id', user.id);
        
        if (refreshUser) await refreshUser();
      }
      
      alert(`Success! You have subscribed to ${selectedTier.name}.`);
      navigate('/dashboard');
    }, 2000);
  };

  // If user is already subscribed, show a different view
  if (user && user.tier !== 'NONE' && user.tier !== undefined) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
         <div className="max-w-md w-full text-center space-y-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Active Subscription</h1>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-indigo-500">
               <p className="text-gray-500 dark:text-gray-400 mb-2">Current Plan</p>
               <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{user.tier === 'BASIC' ? 'Basic Accountability' : 'Pro Discipline'}</h2>
               <p className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">{user.calls_remaining} <span className="text-base font-medium text-gray-500">calls left</span></p>
               
               <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                  You are all set for this month. Need more?
               </p>
               
               <button 
                 onClick={() => navigate('/dashboard')}
                 className="w-full bg-indigo-600 text-white py-3 rounded-md font-bold hover:bg-indigo-700 transition-colors"
               >
                 Go to Dashboard & Top Up
               </button>
            </div>
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center justify-center">
               <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-950 min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:flex sm:flex-col sm:align-center">
        {user && (
          <div className="mb-8">
             <Link to="/dashboard" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center">
               <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
             </Link>
          </div>
        )}
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white sm:text-center">Pricing Plans</h1>
        <p className="mt-5 text-xl text-gray-500 dark:text-gray-400 sm:text-center">
          Invest in your productivity. No free tier, because free commitments don't work.
        </p>
      </div>
      <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
        {tiers.map((tier) => (
          <div key={tier.name} className="border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300">
            <div className="p-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{tier.name}</h2>
              <p className="mt-4">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${tier.priceMonthly}</span>
                <span className="text-base font-medium text-gray-500 dark:text-gray-400">/mo</span>
              </p>
              <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold">{tier.calls} scheduled calls</p>
              <button
                onClick={() => handleSubscribe(tier)}
                className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700 shadow-md"
              >
                Subscribe to {tier.name}
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h3 className="text-xs font-medium text-gray-900 dark:text-gray-200 tracking-wide uppercase">What's included</h3>
              <ul className="mt-6 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 max-w-2xl mx-auto text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Need more calls? Top up anytime for $0.50 per call inside the app.
        </p>
      </div>

      {/* Fake Payment Modal */}
      {showPayment && selectedTier && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80 transition-opacity" onClick={() => setShowPayment(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-gray-200 dark:border-gray-700">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 sm:mx-0 sm:h-10 sm:w-10">
                    <CreditCard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Secure Checkout
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        You are subscribing to <span className="font-bold text-gray-800 dark:text-gray-200">{selectedTier.name}</span> for <span className="font-bold text-gray-800 dark:text-gray-200">${selectedTier.priceMonthly}/mo</span>.
                      </p>
                      
                      <form onSubmit={processFakePayment} className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Card Number</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                              type="text"
                              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="0000 0000 0000 0000"
                              defaultValue="4242 4242 4242 4242"
                              required
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <Lock className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Expiry</label>
                            <input
                              type="text"
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="MM/YY"
                              defaultValue="12/25"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">CVC</label>
                            <input
                              type="text"
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="123"
                              defaultValue="123"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <button
                            type="submit"
                            disabled={processing}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
                          >
                            {processing ? (
                              <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Processing...
                              </>
                            ) : (
                              `Pay $${selectedTier.priceMonthly}`
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowPayment(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}