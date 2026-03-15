'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function NetworkTest() {
  const [testIP, setTestIP] = useState('100.70.2.194');
  const [testResults, setTestResults] = useState<Record<string, 'testing' | 'success' | 'error' | 'idle'>>({});
  const [isScanning, setIsScanning] = useState(false);

  const commonPorts = [8080, 80, 8081, 8000, 5000, 3000];
  const possibleIPs = [
    '100.70.2.194',
    '192.168.1.100',
    '192.168.0.100',
    '192.168.1.1',
    '192.168.0.1',
  ];

  const testConnection = async (ip: string, port: number) => {
    const key = `${ip}:${port}`;
    setTestResults(prev => ({ ...prev, [key]: 'testing' }));

    try {
      // Test with fetch - this will timeout if no response
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`http://${ip}:${port}`, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors'
      });

      clearTimeout(timeoutId);
      setTestResults(prev => ({ ...prev, [key]: 'success' }));
    } catch (error) {
      // Expected to fail due to CORS, but timeout means no connection
      if (error instanceof Error && error.name === 'AbortError') {
        setTestResults(prev => ({ ...prev, [key]: 'error' }));
      } else {
        // Some response received (even if error due to CORS)
        setTestResults(prev => ({ ...prev, [key]: 'success' }));
      }
    }
  };

  const scanNetwork = async () => {
    setIsScanning(true);
    setTestResults({});

    // Test all combinations
    const tests = [];
    for (const ip of possibleIPs) {
      for (const port of commonPorts) {
        tests.push(testConnection(ip, port));
      }
    }

    await Promise.allSettled(tests);
    setIsScanning(false);
  };

  const testSingleIP = async () => {
    for (const port of commonPorts) {
      await testConnection(testIP, port);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-600" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'testing':
        return 'bg-yellow-100 border-yellow-300';
      case 'success':
        return 'bg-green-100 border-green-300';
      case 'error':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Network Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Test */}
        <div>
          <label className="text-sm font-medium">Test Specific IP:</label>
          <div className="flex gap-2 mt-1">
            <Input 
              value={testIP} 
              onChange={(e) => setTestIP(e.target.value)}
              placeholder="Enter IP address"
              className="font-mono"
            />
            <Button onClick={testSingleIP} disabled={isScanning}>
              Test IP
            </Button>
          </div>
        </div>

        {/* Network Scan */}
        <div>
          <Button onClick={scanNetwork} disabled={isScanning} className="w-full">
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning Network...
              </>
            ) : (
              '🔍 Scan Entire Network (Find Your Phone)'
            )}
          </Button>
        </div>

        {/* Results */}
        {Object.keys(testResults).length > 0 && (
          <div>
            <label className="text-sm font-medium">Test Results:</label>
            <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
              {Object.entries(testResults).map(([key, status]) => {
                const [ip, port] = key.split(':');
                return (
                  <div key={key} className={`flex items-center gap-2 p-2 border rounded ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                    <code className="text-sm font-mono flex-1">{ip}:{port}</code>
                    <Badge variant={status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}>
                      {status === 'success' ? 'Found' : status === 'error' ? 'No Response' : status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-blue-50 rounded">
          <p>💡 <strong>Tips:</strong></p>
          <p>• Make sure phone and computer on same WiFi</p>
          <p>• Camera app must be running on phone</p>
          <p>• Try IP Webcam app for Android</p>
          <p>• Green results mean device is responding</p>
          <p>• Use found IP:port combinations in camera URL</p>
        </div>
      </CardContent>
    </Card>
  );
}
