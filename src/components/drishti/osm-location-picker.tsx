'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

interface LocationPickerProps {
  onLocationSelect: (latlng: { lat: number; lng: number; address?: string }) => void;
  locationQuery: string;
}

export default function OSMLocationPicker({ onLocationSelect, locationQuery }: LocationPickerProps) {
  const [position, setPosition] = useState<{lat: number, lng: number}>({ lat: 51.505, lng: -0.09 });
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const lastGeocodeTime = useRef<number>(0);

  // Load Leaflet only on client side
  useEffect(() => {
    setIsClient(true);
    
    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      // Fix Leaflet default icon issues
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Initialize map when container is ready
      if (mapContainerRef.current && !mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView([position.lat, position.lng], 13);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add marker
        const marker = L.marker([position.lat, position.lng]).addTo(map);

        // Handle map clicks
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          const newPos = { lat, lng };
          setPosition(newPos);
          onLocationSelect(newPos);
          
          // Update marker position
          marker.setLatLng([lat, lng]);
        });

        mapInstanceRef.current = map;
      }
    });
  }, []);

  // Update map position when position changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([position.lat, position.lng], 13);
    }
  }, [position]);

  // Geocoding using Nominatim (OpenStreetMap's free geocoding service)
  const geocode = async (query: string) => {
    if (!query) return;
    
    // Add rate limiting
    const now = Date.now();
    if (now - lastGeocodeTime.current < 2000) { // 2 second delay
      console.log('Rate limiting geocoding request...');
      return;
    }
    lastGeocodeTime.current = now;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
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
        const result = data[0];
        const newLocation = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: result.display_name
        };
        setPosition(newLocation);
        onLocationSelect(newLocation);
      } else {
        setError('Location not found');
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
      setError('Search temporarily unavailable. Please click on map instead.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!locationQuery) return;

    geocode(locationQuery);
  }, [locationQuery, onLocationSelect]);

  if (!isClient) {
    return (
      <div className="w-full h-64 rounded-lg bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="w-full h-80 rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg z-0">
        <div 
          ref={mapContainerRef}
          style={{ height: '100%', width: '100%', minHeight: '320px' }}
          className="z-0"
        />
      </div>
      <div className="text-sm text-muted-foreground text-center p-3 bg-blue-50 rounded-md border border-blue-200">
        {position ? `📍 Selected: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : '🗺️ Click map to select camera location'}
      </div>
      <div className="text-xs text-muted-foreground text-center p-2 bg-amber-50 rounded border border-amber-200">
        💡 <strong>Tip:</strong> Click anywhere on the map to place your camera at that location
      </div>
    </div>
  );
}
