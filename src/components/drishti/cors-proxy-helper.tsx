'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, ExternalLink, Copy } from 'lucide-react';

export default function CORSProxyHelper() {
  const [originalURL] = useState('http://100.70.131.126:8080/video');
  
  // CORS proxy services that can help
  const proxyServices = [
    {
      name: 'CORS Proxy (Free)',
      url: 'https://cors-anywhere.herokuapp.com/',
      description: 'Free proxy service - add your URL after',
      format: 'https://cors-anywhere.herokuapp.com/YOUR_URL'
    },
    {
      name: 'CORS.io Proxy',
      url: 'https://cors.io/?',
      description: 'Another free proxy service',
      format: 'https://cors.io/?YOUR_URL'
    },
    {
      name: 'AllOrigins Proxy',
      url: 'https://allorigins.win/raw?url=',
      description: 'Simple proxy for cross-origin requests',
      format: 'https://allorigins.win/raw?url=YOUR_URL'
    }
  ];

  const getProxyURL = (proxy: any, original: string) => {
    return proxy.url + encodeURIComponent(original);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const testInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          CORS Proxy Solutions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Problem Explanation */}
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Why This Happens
          </h4>
          <div className="text-sm space-y-1">
            <p>• Your phone camera doesn't send <strong>CORS headers</strong></p>
            <p>• Browser blocks cross-origin requests for security</p>
            <p>• Direct browser access works, but app access fails</p>
            <p>• <strong>Not your fault</strong> - common camera issue</p>
          </div>
        </div>

        {/* Solutions */}
        <div>
          <h4 className="font-medium mb-3">🛠️ Try These Solutions:</h4>
          
          {/* Solution 1: Enable CORS */}
          <div className="p-3 border rounded-lg mb-3">
            <h5 className="font-medium mb-2">1. Enable CORS in IP Webcam App</h5>
            <div className="text-sm space-y-1">
              <p>• Open IP Webcam app → Settings (☰)</p>
              <p>• Look for "CORS" or "Web Access"</p>
              <p>• Enable "Allow CORS" or "Web Headers"</p>
              <p>• Restart camera server</p>
            </div>
          </div>

          {/* Solution 2: Use Proxy */}
          <div className="p-3 border rounded-lg mb-3">
            <h5 className="font-medium mb-2">2. Use CORS Proxy (Quick Fix)</h5>
            <div className="text-sm space-y-2">
              {proxyServices.map((proxy) => (
                <div key={proxy.name} className="p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium mb-1">{proxy.name}</div>
                  <div className="text-xs text-gray-600 mb-2">{proxy.description}</div>
                  <div className="font-mono text-xs bg-white p-2 rounded border mb-2">
                    {proxy.format}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => copyToClipboard(getProxyURL(proxy, originalURL))}
                      variant="outline"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => testInNewTab(getProxyURL(proxy, originalURL))}
                      variant="outline"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solution 3: Alternative Apps */}
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium mb-2">3. Try Different Camera Apps</h5>
            <div className="text-sm space-y-1">
              <p>• <strong>AlfredCamera</strong> - Better CORS support</p>
              <p>• <strong>IP Webcam Plus</strong> - Web-friendly</p>
              <p>• <strong>EpocCam</strong> (iPhone) - Good web integration</p>
            </div>
          </div>
        </div>

        {/* Quick Test URLs */}
        <div>
          <h4 className="font-medium mb-2">🧪 Quick Test URLs:</h4>
          <div className="space-y-2">
            {proxyServices.slice(0, 2).map((proxy) => {
              const testURL = getProxyURL(proxy, originalURL);
              return (
                <div key={proxy.name} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                  <code className="text-xs font-mono flex-1 truncate">{testURL}</code>
                  <Badge variant="secondary">Test This</Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-gray-50 rounded">
          <p>💡 <strong>Pro Tip:</strong> Try proxy URLs first - they bypass CORS issues</p>
          <p>💡 <strong>Easiest Fix:</strong> Enable CORS in IP Webcam app settings</p>
          <p>💡 <strong>If All Fails:</strong> Try AlfredCamera app instead</p>
        </div>
      </CardContent>
    </Card>
  );
}
