'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function OSMTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testGeocoding = async () => {
    setStatus('testing');
    setMessage('🔍 Testing OpenStreetMap Nominatim service...');
    
    try {
      const response = await fetch(
        'https://nominatim.openstreetmap.org/search?format=json&q=Coimbatore,Tamil%20Nadu,India&limit=1',
        {
          headers: {
            'User-Agent': 'Drishti-Crowd-Management/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        setStatus('success');
        setMessage(`✅ OpenStreetMap working! Found: ${data[0].display_name}`);
      } else {
        setStatus('error');
        setMessage('⚠️ No results found - but service is working');
      }
    } catch (err) {
      setStatus('error');
      setMessage(`❌ Network Error: ${err instanceof Error ? err.message : 'Failed to connect to OpenStreetMap'}`);
    }
  };

  useEffect(() => {
    testGeocoding();
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">OpenStreetMap Status</h3>
      {status === 'testing' && (
        <p className="text-yellow-600">Testing OpenStreetMap connection...</p>
      )}
      {status === 'success' && (
        <div>
          <p className="text-green-600">{message}</p>
          <p className="text-sm text-gray-600 mt-1">
            🗺️ Free maps - No API key required!
          </p>
        </div>
      )}
      {status === 'error' && (
        <div>
          <p className="text-red-600">{message}</p>
          <p className="text-sm text-gray-600 mt-1">
            💡 Check your internet connection
          </p>
        </div>
      )}
    </div>
  );
}
