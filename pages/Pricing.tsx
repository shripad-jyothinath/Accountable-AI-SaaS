import React from 'react';
import { Check } from 'lucide-react';
import { Link } from '../App';

const tiers = [
  {
    name: 'Basic Accountability',
    href: '#',
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
    href: '#',
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

export default function Pricing() {
  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:flex-col sm:align-center">
        <h1 className="text-5xl font-extrabold text-gray-900 sm:text-center">Pricing Plans</h1>
        <p className="mt-5 text-xl text-gray-500 sm:text-center">
          Invest in your productivity. No free tier, because free commitments don't work.
        </p>
      </div>
      <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
        {tiers.map((tier) => (
          <div key={tier.name} className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">{tier.name}</h2>
              <p className="mt-4">
                <span className="text-4xl font-extrabold text-gray-900">${tier.priceMonthly}</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              <p className="mt-2 text-sm text-indigo-600 font-semibold">{tier.calls} scheduled calls</p>
              <Link
                to="/auth"
                className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700"
              >
                Subscribe to {tier.name}
              </Link>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
              <ul className="mt-6 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 max-w-2xl mx-auto text-center">
        <p className="text-gray-500">
          Need more calls? Top up anytime for $0.50 per call inside the app.
        </p>
      </div>
    </div>
  );
}