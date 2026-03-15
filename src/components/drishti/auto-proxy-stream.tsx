'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Pause, RefreshCw, Shield } from 'lucide-react';
import { getWorkingProxyUrl } from '@/lib/cors-proxy';

interface AutoProxyStreamProps {
  originalUrl: string;
  cameraName: string;
}

export default function AutoProxyStream({ originalUrl, cameraName }: AutoProxyStreamProps) {
  const [proxyUrl, setProxyUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tryingProxy, setTryingProxy] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Find working proxy when component mounts
  useEffect(() => {
    findWorkingProxy();
  }, [originalUrl]);

  const findWorkingProxy = async () => {
    setTryingProxy(true);
    setIsLoading(true);
    setError(null);
    
    try {
      const workingProxy = await getWorkingProxyUrl(originalUrl);
      setProxyUrl(workingProxy);
      console.log(`✅ Working proxy found: ${workingProxy}`);
    } catch (err) {
      setError('Failed to find working proxy. Try refreshing the page.');
      console.error('Proxy search failed:', err);
    } finally {
      setIsLoading(false);
      setTryingProxy(false);
    }
  };

  const playStream = async () => {
    if (!videoRef.current || !proxyUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      videoRef.current.src = proxyUrl;
      
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded via proxy');
        setIsLoading(false);
        setIsPlaying(true);
        setError(null);
      };
      
      videoRef.current.oncanplay = () => {
        console.log('Video can play via proxy');
        setIsLoading(false);
        setIsPlaying(true);
        setError(null);
      };
      
      videoRef.current.onerror = (e) => {
        console.error('Video error via proxy:', e);
        setError('Stream failed even with proxy. Try finding another proxy.');
        setIsLoading(false);
        setIsPlaying(false);
      };
      
      await videoRef.current.play();
      
    } catch (err) {
      console.error('Play error:', err);
      setError('Could not play stream. Try a different proxy.');
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const stopStream = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
      setIsPlaying(false);
      setError(null);
    }
  };

  const refreshProxy = () => {
    stopStream();
    setProxyUrl('');
    findWorkingProxy();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {cameraName}
          </span>
          <div className="flex gap-2">
            {isPlaying ? (
              <Badge variant="online">Live via Proxy</Badge>
            ) : (
              <Badge variant="offline">Offline</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Original vs Proxy URL */}
        <div className="p-3 bg-muted rounded-lg space-y-2">
          <div className="text-sm">
            <div className="font-medium">Original URL:</div>
            <code className="text-xs text-red-600">{originalUrl}</code>
          </div>
          {proxyUrl && (
            <div className="text-sm">
              <div className="font-medium">Proxy URL:</div>
              <code className="text-xs text-green-600">{proxyUrl}</code>
            </div>
          )}
        </div>

        {/* Video Element */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-4 text-center">
              <Shield className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-sm font-medium">Proxy Stream Error</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
          
          {tryingProxy && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4 text-center">
              <Shield className="h-8 w-8 text-blue-500 mb-2 animate-pulse" />
              <p className="text-sm font-medium">Finding Working Proxy...</p>
              <p className="text-xs">This may take a few seconds</p>
            </div>
          )}
          
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            muted
            playsInline
            crossOrigin="anonymous"
            preload="metadata"
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isPlaying ? (
            <Button onClick={playStream} disabled={isLoading || !proxyUrl}>
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? 'Loading...' : 'Play via Proxy'}
            </Button>
          ) : (
            <Button onClick={stopStream} variant="secondary">
              <Pause className="h-4 w-4 mr-2" />
              Stop Stream
            </Button>
          )}
          
          <Button onClick={refreshProxy} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Find New Proxy
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-blue-50 rounded">
          <p>💡 <strong>How this works:</strong></p>
          <p>• This component automatically finds a working proxy for your camera</p>
          <p>• Proxies bypass browser security issues</p>
          <p>• If one proxy fails, click "Find New Proxy"</p>
          <p>• Your original camera URL: {originalUrl}</p>
        </div>
      </CardContent>
    </Card>
  );
}
