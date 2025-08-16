'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ConfirmPage() {
  const [message, setMessage] = useState('Confirming your email...');
  const router = useRouter();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const supabase = createClient();
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setMessage('Error confirming email. Please try again.');
          return;
        }

        if (data.session) {
          setMessage('Email confirmed successfully! Redirecting...');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setMessage('Please check your email and click the confirmation link.');
        }
      } catch (error) {
        setMessage('Error confirming email. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Email Confirmation</h1>
        <p className="text-gray-300">{message}</p>
      </div>
    </div>
  );
}