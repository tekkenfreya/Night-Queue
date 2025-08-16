'use client';

import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Authentication Error</h1>
        <p className="text-gray-300 mb-6">
          Sorry, there was an error confirming your email. This could happen if the link is expired or invalid.
        </p>
        <div className="space-y-4">
          <Link 
            href="/login" 
            className="block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition-colors"
          >
            Try Logging In Again
          </Link>
          <Link 
            href="/" 
            className="block text-gray-400 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}