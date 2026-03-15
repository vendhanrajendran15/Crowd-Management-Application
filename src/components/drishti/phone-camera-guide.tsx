'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Smartphone, Wifi, Settings } from 'lucide-react';

export default function PhoneCameraGuide() {
  const [phoneIP, setPhoneIP] = useState('100.70.2.194'); // Your current IP

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const androidSteps = [
    {
      app: 'IP Webcam',
      url: 'https://play.google.com/store/apps/details?id=com.pas.webcam',
      steps: [
        'Install IP Webcam from Play Store',
        'Open the app and grant camera permissions',
        'Scroll down and tap "Start Server"',
        'Note the IP address shown (usually at top)',
        'Use the URL format: http://YOUR_IP:8080/video'
      ]
    },
    {
      app: 'AlfredCamera',
      url: 'https://play.google.com/store/apps/details?id=com.ivuu',
      steps: [
        'Install AlfredCamera from Play Store',
        'Sign up for a free account',
        'Set up phone as a camera device',
        'Get the stream URL from the app',
        'Use the provided stream URL'
      ]
    }
  ];

  const iphoneSteps = [
    {
      app: 'EpocCam',
      url: 'https://apps.apple.com/us/app/epoccam-webcamera-for-pc-mac/id337748235',
      steps: [
        'Install EpocCam from App Store',
        'Install EpocCam drivers on your computer',
        'Connect phone and computer to same WiFi',
        'Open EpocCam app on iPhone',
        'Use the connection URL provided'
      ]
    },
    {
      app: 'AlfredCamera',
      url: 'https://apps.apple.com/us/app/alfredcamera-home-security/id453780327',
      steps: [
        'Install AlfredCamera from App Store',
        'Sign up for free account',
        'Set up as camera device',
        'Get stream URL from app settings',
        'Use the provided URL'
      ]
    }
  ];

  const commonURLs = [
    'http://' + phoneIP + ':8080/video',
    'http://' + phoneIP + ':8080/stream',
    'http://' + phoneIP + ':8080/mjpeg',
    'http://' + phoneIP + ':8080/live'
  ];

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Phone Camera Setup Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current IP */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="h-4 w-4" />
            <span className="font-medium">Your Phone IP: {phoneIP}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Make sure your phone and computer are on the same WiFi network
          </p>
        </div>

        {/* Android Section */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            🤖 Android Phone Setup
          </h4>
          <div className="space-y-3">
            {androidSteps.map((app) => (
              <div key={app.app} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{app.app}</h5>
                  <Button size="sm" variant="outline" asChild>
                    <a href={app.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <ol className="text-sm space-y-1">
                  {app.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-medium">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* iPhone Section */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            🍎 iPhone Setup
          </h4>
          <div className="space-y-3">
            {iphoneSteps.map((app) => (
              <div key={app.app} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{app.app}</h5>
                  <Button size="sm" variant="outline" asChild>
                    <a href={app.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <ol className="text-sm space-y-1">
                  {app.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-medium">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* Common URLs */}
        <div>
          <h4 className="font-medium mb-3">Common Stream URLs to Try:</h4>
          <div className="space-y-2">
            {commonURLs.map((url) => (
              <div key={url} className="flex items-center gap-2 p-2 bg-muted rounded">
                <code className="text-sm flex-1 font-mono">{url}</code>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(url)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Troubleshooting Tips
          </h4>
          <ul className="text-sm space-y-1">
            <li>• Make sure both devices on same WiFi</li>
            <li>• Check firewall isn't blocking the connection</li>
            <li>• Try different port numbers (8080, 80, 8081)</li>
            <li>• Test URL in browser first</li>
            <li>• Some apps require username/password</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
