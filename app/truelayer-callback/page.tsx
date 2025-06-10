"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function TrueLayerCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing TrueLayer connection...');

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push('/sign-in');
      return;
    }

    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setStatus('error');
      setMessage(`Error: ${error} - ${errorDescription || 'Unknown error'}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received from TrueLayer');
      return;
    }

    // Exchange the code for access token
    const exchangeToken = async () => {
      try {
        const response = await fetch('/api/truelayer/exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setStatus('success');
        setMessage('Bank connection successful! Redirecting to accounts...');
        
        // Redirect to accounts page after successful connection
        setTimeout(() => {
          router.push('/accounts');
        }, 2000);

      } catch (error) {
        console.error('Error exchanging token:', error);
        setStatus('error');
        setMessage(`Failed to connect bank account: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    exchangeToken();
  }, [isLoaded, user, searchParams, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connecting Your Bank
              </h2>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="rounded-full h-12 w-12 bg-green-100 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-900 mb-2">
                Connection Successful!
              </h2>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="rounded-full h-12 w-12 bg-red-100 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-900 mb-2">
                Connection Failed
              </h2>
            </>
          )}
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {status === 'error' && (
            <button
              onClick={() => router.push('/accounts')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Accounts
            </button>
          )}
        </div>
      </div>
    </div>
  );
}