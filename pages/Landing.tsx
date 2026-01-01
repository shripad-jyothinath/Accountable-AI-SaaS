import React from 'react';
import { Link } from '../App';
import { Phone, Clock, Shield, ArrowRight, Play } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogs';

export default function Landing() {
  return (
    <div className="flex flex-col bg-black">
      {/* 3D Hero Section with Video Background */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-60"
          >
            {/* Using a high-quality abstract network video for the "Connected" and "3D" feel */}
            <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-network-of-lines-and-dots-17924-large.mp4" type="video/mp4" />
          </video>
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-2xl">
            <span className="block mb-2">Stop Snoozing.</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-300">
              Start Doing.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-200 mb-10 leading-relaxed shadow-black drop-shadow-md">
            The only productivity tool that stares back. <br/>
            Real humans call you to verify your work. No bots. No excuses.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/pricing"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.5)]"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-white/10 backdrop-blur-md border border-white/20 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-white/20"
            >
              Log In
            </Link>
          </div>

          {/* Floating 3D-ish Elements (CSS only) */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { label: "Real Human Callers", val: "100%" },
              { label: "Task Completion Rate", val: "94%" },
              { label: "Procrastination Killed", val: "Total" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 transform hover:-translate-y-2 transition-transform duration-300">
                <p className="text-3xl font-bold text-white mb-1">{stat.val}</p>
                <p className="text-indigo-200 text-sm uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Section - Dark Mode 3D Cards */}
      <div className="py-24 bg-gradient-to-b from-black to-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-indigo-400 font-semibold tracking-wide uppercase text-sm">How it works</h2>
            <p className="mt-2 text-4xl font-extrabold text-white sm:text-5xl">
              Accountability that <span className="text-indigo-500">actually works</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                name: 'Schedule a Task',
                description: 'Add your critical task to the dashboard and set a deadline time.',
                icon: Clock,
                color: "from-blue-500 to-indigo-600"
              },
              {
                name: 'Receive a Call',
                description: 'A real human calls you at the deadline to verify completion.',
                icon: Phone,
                color: "from-indigo-500 to-purple-600"
              },
              {
                name: 'Proof Required',
                description: 'You must verbally confirm or send photo proof. No cheating allowed.',
                icon: Shield,
                color: "from-purple-500 to-pink-600"
              },
            ].map((feature, idx) => (
              <div key={feature.name} className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-r ${feature.color} rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200`}></div>
                <div className="relative bg-gray-900 ring-1 ring-white/10 rounded-2xl p-8 h-full flex flex-col items-center text-center hover:bg-gray-800 transition-colors">
                  <div className={`flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r ${feature.color} text-white mb-6 shadow-lg`}>
                    <feature.icon className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.name}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Section - Light/Clean contrast */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              The Science of Accountability
            </h2>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
              Why working alone is failing you, and why human connection is the solution.
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {BLOG_POSTS.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="flex flex-col rounded-2xl shadow-lg overflow-hidden bg-white hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
                <div className="flex-shrink-0 relative h-48">
                  <img className="h-full w-full object-cover" src={post.image} alt={post.title} />
                  <div className="absolute top-4 left-4">
                     <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 shadow-sm">
                      Productivity
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-base text-gray-500 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center text-sm text-gray-500 font-medium">
                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span>{post.readTime} read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-indigo-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-20"
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-1.2.1&auto=format&fit=crop&w=2830&q=80"
            alt="People working"
          />
          <div className="absolute inset-0 bg-indigo-900/80 mix-blend-multiply" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
            Ready to get serious?
          </h2>
          <p className="text-lg leading-6 text-indigo-100 mb-8">
            Join thousands of high-performers who use human verification to crush their goals.
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-indigo-700 bg-white hover:bg-indigo-50 shadow-xl hover:scale-105 transition-transform"
          >
            See Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}