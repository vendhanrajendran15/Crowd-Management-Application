'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Play, Pause, RefreshCw } from 'lucide-react';

interface SimpleCameraStreamProps {
  streamUrl: string;
  cameraName: string;
}

export default function SimpleCameraStream({ streamUrl, cameraName }: SimpleCameraStreamProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const playStream = async () => {
    if (!videoRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Try different methods to play the stream
      videoRef.current.src = streamUrl;
      
      // Add event listeners
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        setIsLoading(false);
        setIsPlaying(true);
      };
      
      videoRef.current.oncanplay = () => {
        console.log('Video can play');
        setIsLoading(false);
        setIsPlaying(true);
      };
      
      videoRef.current.onerror = (e) => {
        console.error('Video error:', e);
        setError('Stream failed to load. Try a different proxy URL or camera app.');
        setIsLoading(false);
        setIsPlaying(false);
      };
      
      // Try to play
      await videoRef.current.play();
      
    } catch (err) {
      console.error('Play error:', err);
      setError('Could not play stream. Check if camera is running and URL is correct.');
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

  const refreshStream = () => {
    stopStream();
    setTimeout(() => playStream(), 1000);
  };

  // Try to fetch stream info
  const testStream = async () => {
    try {
      const response = await fetch(streamUrl, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      console.log('Stream test response:', response);
    } catch (err) {
      console.log('Stream test failed (expected due to CORS):', err);
    }
  };

  useEffect(() => {
    testStream();
  }, [streamUrl]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{cameraName}</span>
          <div className="flex gap-2">
            {isPlaying ? (
              <Badge variant="online">Live</Badge>
            ) : (
              <Badge variant="offline">Offline</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Element */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-sm font-medium">Stream Error</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <RefreshCw className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
          
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            muted
            playsInline
            crossOrigin="anonymous"
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isPlaying ? (
            <Button onClick={playStream} disabled={isLoading}>
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? 'Loading...' : 'Play Stream'}
            </Button>
          ) : (
            <Button onClick={stopStream} variant="secondary">
              <Pause className="h-4 w-4 mr-2" />
              Stop Stream
            </Button>
          )}
          
          <Button onClick={refreshStream} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stream Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Stream URL:</strong> {streamUrl}</p>
          <p><strong>Status:</strong> {isPlaying ? 'Playing' : 'Stopped'}</p>
          <p><strong>Tips:</strong> If stream fails, try different proxy URLs or camera apps</p>
        </div>
      </CardContent>
    </Card>
  );
}
