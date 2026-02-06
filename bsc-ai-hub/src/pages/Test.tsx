import React from 'react';

export default function TestPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      <div className="p-8 bg-white rounded shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">System Recovered</h1>
        <p className="mb-4">If you see this, the React configuration is working.</p>
        <div className="flex items-center justify-center gap-2 text-gray-500">
             <span>Typing Test:</span>
             <span className="inline-flex gap-0.5 ml-1 items-baseline">
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce opacity-70" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce opacity-70" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce opacity-70" style={{ animationDelay: '300ms' }} />
             </span>
        </div>
      </div>
    </div>
  );
}