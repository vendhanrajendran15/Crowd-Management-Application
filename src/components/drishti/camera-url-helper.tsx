'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink } from 'lucide-react';

export default function CameraURLHelper() {
  const [baseURL] = useState('http://100.70.2.194:8080');
  
  const commonPaths = [
    '/video',
    '/stream',
    '/mjpeg',
    '/live',
    '/cam.mjpeg',
    '/snapshot',
    '/feed',
    '/',
    '/api/video',
    '/cgi-bin/video.cgi',
  ];

  // Test streams that definitely work
  const testStreams = [
    {
      name: 'Big Buck Bunny (Test Video)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'MP4'
    },
    {
      name: 'Elephant Dream (Test Video)', 
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'MP4'
    },
    {
      name: 'Sintel (Test Video)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      type: 'MP4'
    }
  ];

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">📹 Camera URL Helper</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Streams Section */}
        <div>
          <label className="text-sm font-medium">🧪 Test with Working Streams First:</label>
          <div className="space-y-2 mt-2">
            {testStreams.map((stream) => (
              <div key={stream.name} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                <div className="flex-1">
                  <div className="font-medium text-sm">{stream.name}</div>
                  <code className="text-xs font-mono text-gray-600">{stream.url}</code>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => copyToClipboard(stream.url)}
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => openInNewTab(stream.url)}
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            💡 Try these first to confirm your app works with known-good streams
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Your Camera Base URL:</label>
          <div className="flex gap-2 mt-1">
            <Input value={baseURL} readOnly className="font-mono text-sm" />
            <Button 
              size="sm" 
              onClick={() => copyToClipboard(baseURL)}
              variant="outline"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Try these complete URLs for your camera:</label>
          <div className="space-y-2 mt-2">
            {commonPaths.map((path) => {
              const fullURL = baseURL + path;
              return (
                <div key={path} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <code className="text-sm flex-1 font-mono">{fullURL}</code>
                  <Button 
                    size="sm" 
                    onClick={() => copyToClipboard(fullURL)}
                    variant="outline"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => openInNewTab(fullURL)}
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Step 1:</strong> Test the green streams above - they should work</p>
          <p>💡 <strong>Step 2:</strong> If test streams work, your app is fine</p>
          <p>💡 <strong>Step 3:</strong> Then try your camera URLs below</p>
          <p>💡 <strong>Phone Camera:</strong> Use IP Webcam app for Android</p>
          <p>💡 <strong>Network:</strong> Make sure phone and computer on same WiFi</p>
        </div>
      </CardContent>
    </Card>
  );
}
