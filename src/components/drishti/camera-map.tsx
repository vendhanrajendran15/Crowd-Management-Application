'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Camera, AlertTriangle, PowerOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Camera as CameraType } from '@/lib/types';

interface CameraMapProps {
  cameras: CameraType[];
  onCameraAlert?: (cameraId: string, isAlert: boolean) => void;
}

export default function CameraMap({ cameras, onCameraAlert }: CameraMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [cameraMarkers, setCameraMarkers] = useState<Map<string, any>>(new Map());
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Load Leaflet only on client side
  useEffect(() => {
    setIsClient(true);
    
    const initMap = async () => {
      const L = await import('leaflet');
      
      // Fix Leaflet default icon issues
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (mapContainerRef.current && !mapInstance) {
        const map = L.map(mapContainerRef.current).setView([11.0168, 76.9558], 12); // Coimbatore center
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        setMapInstance(map);
      }
    };

    initMap();
  }, []);

  // Update camera markers when cameras change
  useEffect(() => {
    if (!mapInstance || !isClient) return;

    const L = require('leaflet');

    // Clear existing markers
    cameraMarkers.forEach(marker => {
      mapInstance.removeLayer(marker);
    });
    const newMarkers = new Map<string, any>();

    // Add markers for each camera
    cameras.forEach(camera => {
      if (camera.coordinates) {
        const { lat, lng } = camera.coordinates;
        
        // Determine camera status and color
        let iconColor = 'black'; // default disabled
        let statusText = 'Disabled';
        
        if (camera.status === 'Online' && camera.streamImage) {
          iconColor = 'green';
          statusText = 'Active';
        }
        
        if (camera.alert) {
          iconColor = 'red';
          statusText = 'Alert';
        }

        // Create custom icon
        const customIcon = L.divIcon({
          className: 'custom-camera-marker',
          html: `
            <div style="
              background-color: ${iconColor};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">
              ${iconColor === 'red' 
                ? '<svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>'
                : '<svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
              }
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance);
        
        // Create popup content
        const popupContent = `
          <div style="min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; font-weight: bold;">${camera.name}</h4>
            <p style="margin: 0 0 8px 0; color: #666;">${camera.location}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="
                background-color: ${iconColor};
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
              ">${statusText}</span>
            </div>
            <div style="display: flex; gap: 4px;">
              <button 
                onclick="window.toggleCameraAlert('${camera.id}')"
                style="
                  background: ${camera.alert ? '#ef4444' : '#22c55e'};
                  color: white;
                  border: none;
                  padding: 4px 8px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                "
              >
                ${camera.alert ? 'Clear Alert' : 'Set Alert'}
              </button>
            </div>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        newMarkers.set(camera.id, marker);
      }
    });

    setCameraMarkers(newMarkers);
  }, [cameras, mapInstance, isClient]);

  // Global function for popup buttons
  useEffect(() => {
    (window as any).toggleCameraAlert = (cameraId: string) => {
      if (onCameraAlert) {
        const camera = cameras.find(c => c.id === cameraId);
        onCameraAlert(cameraId, !camera?.alert);
      }
    };
  }, [cameras, onCameraAlert]);

  if (!isClient) {
    return (
      <div className="w-full h-96 rounded-lg bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Camera Locations</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-black"></div>
              <span className="text-sm">Disabled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm">Alert</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapContainerRef} 
          className="w-full h-96 rounded-lg border"
          style={{ minHeight: '400px' }}
        />
        
        {/* Camera Status Summary */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {cameras.filter(c => c.status === 'Online' && !c.alert).length}
            </div>
            <div className="text-sm text-green-700">Active Cameras</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {cameras.filter(c => c.status !== 'Online').length}
            </div>
            <div className="text-sm text-gray-700">Disabled Cameras</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {cameras.filter(c => c.alert).length}
            </div>
            <div className="text-sm text-red-700">Alert Cameras</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
