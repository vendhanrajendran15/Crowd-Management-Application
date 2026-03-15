'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Pause, AlertTriangle, ExternalLink, Copy } from 'lucide-react';

interface DirectStreamTestProps {
  originalUrl: string;
  cameraName: string;
}

export default function DirectStreamTest({ originalUrl, cameraName }: DirectStreamTestProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Test different URL formats
  const urlVariants = [
    originalUrl,
    originalUrl.replace('/video', '/stream'),
    originalUrl.replace('/video', '/mjpeg'),
    originalUrl.replace('/video', '/live'),
    originalUrl.replace('/video', '/'),
    originalUrl + '?type=mjpeg',
  ];

  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const currentTestUrl = urlVariants[currentUrlIndex];

  const playStream = async () => {
    if (!videoRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      videoRef.current.src = currentTestUrl;
      
      videoRef.current.onloadedmetadata = () => {
        console.log(`✅ Video metadata loaded for: ${currentTestUrl}`);
        setIsLoading(false);
        setIsPlaying(true);
        setError(null);
      };
      
      videoRef.current.oncanplay = () => {
        console.log(`✅ Video can play for: ${currentTestUrl}`);
        setIsLoading(false);
        setIsPlaying(true);
        setError(null);
      };
      
      videoRef.current.onerror = (e) => {
        console.error(`❌ Video error for: ${currentTestUrl}`, e);
        setError(`Failed to load: ${currentTestUrl}`);
        setIsLoading(false);
        setIsPlaying(false);
      };
      
      await videoRef.current.play();
      
    } catch (err) {
      console.error('Play error:', err);
      setError('Could not play stream. Try next URL variant.');
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

  const tryNextUrl = () => {
    stopStream();
    const nextIndex = (currentUrlIndex + 1) % urlVariants.length;
    setCurrentUrlIndex(nextIndex);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const testInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{cameraName}</span>
          <div className="flex gap-2">
            {isPlaying ? (
              <Badge variant="online">Live</Badge>
            ) : (
              <Badge variant="offline">Testing</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Variants */}
        <div className="p-3 bg-muted rounded-lg space-y-2">
          <div className="text-sm font-medium mb-2">Testing URL Variants:</div>
          {urlVariants.map((url, index) => (
            <div 
              key={index} 
              className={`p-2 rounded border text-xs font-mono ${
                index === currentUrlIndex 
                  ? 'bg-green-100 border-green-300' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <code className="flex-1 truncate">{url}</code>
                <div className="flex gap-1">
                  {index === currentUrlIndex && (
                    <Badge variant="secondary" className="text-xs">Testing</Badge>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => testInNewTab(url)}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(url)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Element */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-sm font-medium">Stream Test Failed</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
          
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            muted
            playsInline
            crossOrigin="anonymous"
            preload="metadata"
            controls={false}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isPlaying ? (
            <Button onClick={playStream} disabled={isLoading}>
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? 'Testing...' : `Test ${currentTestUrl.split('/').pop() || 'stream'}`}
            </Button>
          ) : (
            <Button onClick={stopStream} variant="secondary">
              <Pause className="h-4 w-4 mr-2" />
              Stop Test
            </Button>
          )}
          
          <Button onClick={tryNextUrl} variant="outline" size="sm">
            Try Next URL
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-blue-50 rounded">
          <p>💡 <strong>How this works:</strong></p>
          <p>• Tests different URL paths for your camera</p>
          <p>• Click "Try Next URL" if current one fails</p>
          <p>• Test in browser first, then use working URL</p>
          <p>• Your camera supports different stream formats</p>
        </div>
      </CardContent>
    </Card>
  );
}
