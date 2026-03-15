'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Camera, AlertTriangle } from 'lucide-react';

interface MJpegCameraStreamProps {
  streamUrl: string;
  cameraName: string;
  onStatusChange?: (status: 'Online' | 'Offline') => void;
}

export default function MJpegCameraStream({ streamUrl, cameraName, onStatusChange }: MJpegCameraStreamProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if stream is actively loading
  const checkStreamHealth = useCallback(() => {
    if (!imgRef.current || !streamUrl) return;

    const currentTime = Date.now();
    const timeSinceLastLoad = currentTime - lastLoadTime;
    
    // If no image load in last 10 seconds, consider stream offline
    if (timeSinceLastLoad > 10000 && isOnline) {
      console.log(`❌ Stream health check failed for ${streamUrl} - no load in ${timeSinceLastLoad}ms`);
      setIsOnline(false);
      setError(`Stream stopped responding: ${streamUrl}`);
      if (onStatusChange) onStatusChange('Offline');
    }
  }, [streamUrl, lastLoadTime, isOnline, onStatusChange]);

  // Start health monitoring
  useEffect(() => {
    if (isOnline && streamUrl) {
      checkIntervalRef.current = setInterval(checkStreamHealth, 5000); // Check every 5 seconds
    } else {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [isOnline, streamUrl, checkStreamHealth]);

  useEffect(() => {
    if (!streamUrl) return;

    setIsLoading(true);
    setError(null);
    setIsOnline(false);
    setLastLoadTime(0);

    const img = imgRef.current;
    if (!img) return;

    // Handle image load success
    const handleLoad = () => {
      console.log(`✅ MJPEG stream loaded: ${streamUrl}`);
      setIsLoading(false);
      setError(null);
      setIsOnline(true);
      setLastLoadTime(Date.now());
      if (onStatusChange) onStatusChange('Online');
    };

    // Handle image load error
    const handleError = (e: any) => {
      console.error(`❌ MJPEG stream failed: ${streamUrl}`, e);
      setError(`Stream failed: ${streamUrl}`);
      setIsLoading(false);
      setIsOnline(false);
      if (onStatusChange) onStatusChange('Offline');
    };

    // Set up event listeners
    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    // Start loading the stream
    img.src = streamUrl;

    // Cleanup
    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [streamUrl, onStatusChange]);

  // Auto-refresh the stream every 5 seconds to keep it alive and detect health
  useEffect(() => {
    if (!isOnline || !streamUrl) return;

    const interval = setInterval(() => {
      if (imgRef.current) {
        const currentSrc = imgRef.current.src;
        // Force refresh by adding timestamp
        const newSrc = currentSrc.split('?')[0] + '?t=' + Date.now();
        imgRef.current.src = newSrc;
        console.log(`🔄 Refreshing MJPEG stream: ${streamUrl}`);
        setLastLoadTime(Date.now()); // Update load time when we try to refresh
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOnline, streamUrl]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {cameraName}
          </span>
          <div className="flex gap-2">
            {isOnline ? (
              <Badge variant="online">Live</Badge>
            ) : (
              <Badge variant="offline">Offline</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* MJPEG Stream Display */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-sm font-medium">Stream Offline</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
          
          <img
            ref={imgRef}
            src={streamUrl}
            alt={cameraName}
            className="w-full h-full object-contain"
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        </div>

        {/* Stream Info */}
        <div className="text-xs text-muted-foreground p-3 bg-blue-50 rounded">
          <p>💡 <strong>Stream Status:</strong> {isOnline ? 'Online and streaming' : 'Offline - Stream stopped'}</p>
          <p>🔗 <strong>URL:</strong> {streamUrl}</p>
          <p>🔄 <strong>Health Check:</strong> Monitoring every 5 seconds</p>
        </div>
      </CardContent>
    </Card>
  );
}
