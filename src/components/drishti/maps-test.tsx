'use client';

import { useEffect, useState } from 'react';

export default function MapsTest() {
  const [apiKeyStatus, setApiKeyStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setApiKeyStatus('invalid');
      setError('API key is missing from environment variables');
      return;
    }

    // Test the API key by making a simple geocoding request
    const testGeocoding = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=${apiKey}`
        );
        const data = await response.json();
        
        if (data.status === 'OK') {
          setApiKeyStatus('valid');
        } else if (data.status === 'REQUEST_DENIED') {
          setApiKeyStatus('invalid');
          setError(`API Key Error: ${data.error_message || 'Invalid API key or insufficient permissions'}`);
        } else {
          setApiKeyStatus('invalid');
          setError(`API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
        }
      } catch (err) {
        setApiKeyStatus('invalid');
        setError(`Network Error: ${err instanceof Error ? err.message : 'Failed to test API'}`);
      }
    };

    testGeocoding();
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">Google Maps API Status</h3>
      {apiKeyStatus === 'loading' && (
        <p className="text-yellow-600">Testing API key...</p>
      )}
      {apiKeyStatus === 'valid' && (
        <p className="text-green-600">✅ API key is working correctly!</p>
      )}
      {apiKeyStatus === 'invalid' && (
        <div>
          <p className="text-red-600">❌ API key issue:</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      )}
    </div>
  );
}
