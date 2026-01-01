import React from 'react';
import { useParams, Link, Navigate } from '../App';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogs';

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const post = BLOG_POSTS.find(p => p.id === Number(id));

  if (!post) {
    return <Navigate to="/" />;
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen pb-20 transition-colors duration-200">
      {/* Header Image */}
      <div className="w-full h-96 relative">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex flex-col justify-end max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
           <Link to="/" className="text-white/80 hover:text-white flex items-center mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
           </Link>
           <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
             {post.title}
           </h1>
           <div className="flex items-center text-white/90 space-x-6 text-sm md:text-base">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {post.date}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {post.readTime}
              </div>
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div 
          className="prose prose-indigo dark:prose-invert prose-lg mx-auto text-gray-700 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-10">
          <div className="bg-indigo-50 dark:bg-gray-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between shadow-sm">
            <div className="mb-6 md:mb-0 md:mr-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to apply these concepts?</h3>
              <p className="text-gray-600 dark:text-gray-300">Stop reading and start doing with live human verification.</p>
            </div>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}