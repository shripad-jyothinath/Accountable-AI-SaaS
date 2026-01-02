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
  user?: UserProfile | null;
  refreshUser?: () => Promise<void>;
}

export default function Pricing({ user, refreshUser }: PricingProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = (tier: any) => {
    // If not logged in, redirect to Auth with return instruction
    if (!user) {
      localStorage.setItem('redirect_after_login', '/pricing');
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
      
      const isTopUp = selectedTier === 'TOPUP';
      
      // Attempt to update backend if logged in (Optimistic)
      if (isSupabaseConfigured && supabase && user) {
        
        // 1. Fetch latest profile to ensure we add to current balance correctly
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('calls_remaining')
          .eq('id', user.id)
          .single();

        const currentCalls = currentProfile?.calls_remaining || user.calls_remaining || 0;
        
        const updateData: any = {};
        let addedCalls = 0;

        if (isTopUp) {
           addedCalls = 10;
           updateData.calls_remaining = currentCalls + addedCalls;
        } else {
           // Buying a plan: Update Tier AND add the plan's calls to existing balance
           updateData.tier = selectedTier.id;
           addedCalls = selectedTier.calls;
           updateData.calls_remaining = currentCalls + addedCalls;
        }

        await supabase.from('profiles').update(updateData).eq('id', user.id);
        
        if (refreshUser) {
          await refreshUser();
        }
        
        alert(isTopUp ? "Top Up Successful! 10 calls added." : `Success! Subscribed to ${selectedTier.name}. ${selectedTier.calls} calls added to your balance.`);
      } else {
        alert("Payment Successful (Mock Mode)");
      }
      
      navigate('/dashboard');
    }, 2000);
  };

  // Determine if user has an active subscription (Basic or Pro)
  const hasPlan = user && user.tier !== 'NONE';

  return (
    <div className="bg-gray-100 dark:bg-gray-950 min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      
      {/* Back Button for Dashboard Users */}
      {user && (
        <div className="max-w-7xl mx-auto mb-8">
           <Link to="/dashboard" className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
             <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
           </Link>
        </div>
      )}

      <div className="sm:flex sm:flex-col sm:align-center">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white sm:text-center">
          {hasPlan ? 'Manage Subscription' : 'Pricing Plans'}
        </h1>
        <p className="mt-5 text-xl text-gray-500 dark:text-gray-400 sm:text-center">
          {hasPlan ? 'You are currently subscribed. Need more calls?' : 'Invest in your productivity. No free tier, because free commitments don\'t work.'}
        </p>
      </div>

      {hasPlan ? (
         // Logged in with plan view - Hide Upgrade Options, Show Status & Top Up
         <div className="mt-12 max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
             <div className="p-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Plan</h3>
                   <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">Active</span>
                </div>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                   {user.tier}
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                   You have <strong>{user.calls_remaining}</strong> calls remaining.
                </p>
                <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-8">
                   <h4 className="text-sm font-medium text-gray-900 dark:text-white">Running low?</h4>
                   <button 
                     onClick={() => { setSelectedTier('TOPUP'); setShowPayment(true); }}
                     className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                   >
                     Top Up 10 Calls ($5.00)
                   </button>
                </div>
             </div>
         </div>
      ) : (
         // Standard Pricing Table (Only shown if Tier is NONE)
         <>
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
        </>
      )}

      {/* Fake Payment Modal */}
      {showPayment && (selectedTier || selectedTier === 'TOPUP') && (
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
                        {selectedTier === 'TOPUP' ? (
                           <>Top Up: <span className="font-bold text-gray-800 dark:text-gray-200">10 Calls</span> for <span className="font-bold text-gray-800 dark:text-gray-200">$5.00</span></>
                        ) : (
                           <>Subscribing to <span className="font-bold text-gray-800 dark:text-gray-200">{selectedTier.name}</span> for <span className="font-bold text-gray-800 dark:text-gray-200">${selectedTier.priceMonthly}/mo</span></>
                        )}
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
                               selectedTier === 'TOPUP' ? 'Pay $5.00' : `Pay $${selectedTier.priceMonthly}`
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
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-50 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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