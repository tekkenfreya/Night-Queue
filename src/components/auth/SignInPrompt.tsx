'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SignInPromptProps {
  message?: string;
  redirectTo?: string;
  showModal?: boolean;
  onClose?: () => void;
}

export function SignInPrompt({ 
  message = "Sign in to add movies to your watchlist", 
  redirectTo,
  showModal = false,
  onClose 
}: SignInPromptProps) {
  const router = useRouter();
  
  const handleSignIn = () => {
    const loginUrl = redirectTo 
      ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/login';
    router.push(loginUrl);
  };

  if (showModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-netflix-gray rounded-lg p-6 max-w-md w-full border border-gray-600">
          <h3 className="text-xl font-bold text-white mb-4">Sign In Required</h3>
          <p className="text-gray-300 mb-6">{message}</p>
          
          <div className="flex gap-3">
            <button
              onClick={handleSignIn}
              className="flex-1 bg-netflix-red hover:bg-netflix-red/90 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Sign In
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-netflix-gray/50 border border-gray-600 rounded-lg p-6 text-center">
      <div className="text-4xl mb-4">🔒</div>
      <h3 className="text-xl font-bold text-white mb-2">Sign In Required</h3>
      <p className="text-gray-300 mb-4">{message}</p>
      <Link
        href={redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : '/login'}
        className="inline-block bg-netflix-red hover:bg-netflix-red/90 text-white font-medium py-2 px-6 rounded transition-colors"
      >
        Sign In Now
      </Link>
    </div>
  );
}