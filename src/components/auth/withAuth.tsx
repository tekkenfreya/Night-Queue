'use client';

import { useAppSelector } from '@/lib/hooks';
import { SignInPrompt } from './SignInPrompt';
import { ComponentType } from 'react';

interface WithAuthOptions {
  fallback?: ComponentType;
  redirectTo?: string;
  message?: string;
}

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated } = useAppSelector(state => state.user);
    
    if (!isAuthenticated) {
      if (options.fallback) {
        const FallbackComponent = options.fallback;
        return <FallbackComponent />;
      }
      
      return (
        <SignInPrompt
          message={options.message}
          redirectTo={options.redirectTo}
        />
      );
    }
    
    return <Component {...props} />;
  };
}