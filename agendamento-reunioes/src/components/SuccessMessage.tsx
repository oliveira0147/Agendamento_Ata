'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SuccessMessageProps {
  message: string;
  redirectTo?: string;
  autoRedirectDelay?: number;
}

export default function SuccessMessage({ 
  message, 
  redirectTo = '/meetings',
  autoRedirectDelay = 3000 
}: SuccessMessageProps) {
  const router = useRouter();

  useEffect(() => {
    if (redirectTo) {
      const timeout = setTimeout(() => {
        router.push(redirectTo);
      }, autoRedirectDelay);

      return () => clearTimeout(timeout);
    }
  }, [router, redirectTo, autoRedirectDelay]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
            <svg 
              className="h-6 w-6 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              Sucesso!
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-4 bg-gray-50 rounded-md p-3">
          <p className="text-sm text-gray-600">
            Você será redirecionado em alguns segundos...
          </p>
        </div>
      </div>
    </div>
  );
} 