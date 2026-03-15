
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, Video, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addCamera, uploadVideo } from '@/lib/firebase-service';
import { useDrishti } from '@/lib/drishti-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';

const OSMLocationPicker = dynamic(() => import('./osm-location-picker'), { 
    ssr: false,
    loading: () => <div className="w-full h-64 rounded-lg bg-muted animate-pulse" />,
});

const OSMTest = dynamic(() => import('./osm-test'), { 
    ssr: false,
});

const CameraURLHelper = dynamic(() => import('./camera-url-helper'), { 
    ssr: false,
});

const PhoneCameraGuide = dynamic(() => import('./phone-camera-guide'), { 
    ssr: false,
});

const NetworkTest = dynamic(() => import('./network-test'), { 
    ssr: false,
});

const CORSProxyHelper = dynamic(() => import('./cors-proxy-helper'), { 
    ssr: false,
});

const SimpleCameraStream = dynamic(() => import('./simple-camera-stream'), { 
    ssr: false,
});

const MJpegCameraStream = dynamic(() => import('./mjpeg-camera-stream'), { 
    ssr: false,
});

export default function CameraAddForm() {
  const { eventId } = useDrishti();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [cameraName, setCameraName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingStream, setIsAddingStream] = useState(false);
  const { toast } = useToast();

  // Helper function to check if all required fields are filled
  const isFormValid = () => {
    return cameraName.trim() !== '' && 
           locationName.trim() !== '' && 
           streamUrl.trim() !== '';
  };

  // Get missing fields for better error messages
  const getMissingFields = () => {
    const missing = [];
    if (!cameraName.trim()) missing.push('Camera Name');
    if (!locationName.trim()) missing.push('Location Name');
    if (!streamUrl.trim()) missing.push('Stream URL');
    return missing;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      if (!cameraName) {
        setCameraName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const resetForm = () => {
    setCameraName('');
    setLocationName('');
    setCoordinates(null);
    setVideoFile(null);
    setStreamUrl('');
  };

  const handleLocationSelect = (latlng: {lat: number, lng: number}) => {
    setCoordinates(latlng);
  }

  const handleUpload = async () => {
    const missingFields = getMissingFields();
    if (missingFields.length > 0 || !videoFile) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: `Please provide: ${missingFields.join(', ')}${!videoFile ? ', Video File' : ''}`,
        });
        return;
    };

    setIsUploading(true);
    try {
      const videoUrl = await uploadVideo(videoFile, eventId);
      const newCamera = {
        name: cameraName,
        location: locationName,
        status: 'Online' as const,
        lastSeen: new Date().toISOString(),
        coordinates: coordinates!, // We know this is not null due to validation
        zone: 'Uploaded',
        streamImage: videoUrl,
        eventId: eventId,
      };
      await addCamera(newCamera, eventId);
      
      toast({
        title: 'Upload Successful',
        description: 'Your video has been added as a new camera source.',
      });
      resetForm();
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Could not upload the video. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleAddStream = async () => {
    const missingFields = getMissingFields();
    if (missingFields.length > 0 || !streamUrl) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: `Please provide: ${missingFields.join(', ')}${!streamUrl ? ', Stream URL' : ''}`,
        });
        return;
    }

    setIsAddingStream(true);
    try {
      // Use default coordinates if none set (Coimbatore center)
      const defaultCoords = { lat: 11.0168, lng: 76.9558 };
      const finalCoords = coordinates || defaultCoords;
      
      const newCamera = {
        name: cameraName,
        location: locationName,
        status: 'Online' as const,
        lastSeen: new Date().toISOString(),
        coordinates: finalCoords,
        zone: 'Stream',
        streamImage: streamUrl,
        eventId: eventId,
      };
      await addCamera(newCamera, eventId);
      
      toast({
        title: 'Stream Added',
        description: 'The stream has been added as a new camera source.',
      });
      resetForm();
    } catch (error) {
      console.error('Failed to add stream:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Add Stream',
        description: 'Could not add the camera stream. Please check the URL and try again.',
      });
    } finally {
      setIsAddingStream(false);
    }
  };

  const handleStreamStatusChange = (status: 'Online' | 'Offline') => {
    // This will update the camera status in the grid
    console.log(`Stream status changed to: ${status}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Camera Stream</CardTitle>
        <CardDescription>
          Add your phone camera with MJPEG stream support
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="stream" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
            <TabsTrigger value="stream">Add Stream URL</TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="camera-name">Camera Name</Label>
                <Input 
                  id="camera-name" 
                  placeholder="e.g., Phone Camera Chennai"
                  value={cameraName}
                  onChange={(e) => setCameraName(e.target.value)}
                  disabled={isUploading || isAddingStream}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location-name">Location Name</Label>
                <Input 
                  id="location-name" 
                  placeholder="e.g., Chennai"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  disabled={isUploading || isAddingStream}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Set Camera Location on Map</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-2">
                <OSMLocationPicker 
                  onLocationSelect={handleLocationSelect} 
                  locationQuery={locationName}
                />
              </div>
              {coordinates && (
                <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                  📍 Location selected: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </div>
              )}
            </div>
          </div>

          <TabsContent value="upload" className="space-y-6 pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-muted p-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Video className="h-8 w-8" />
                <p>{videoFile ? videoFile.name : "Select a video file to upload"}</p>
              </div>
              <Label htmlFor="video-upload" className="cursor-pointer">
                <div className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                  <Upload className="h-4 w-4" />
                  <span>{videoFile ? 'Change Video' : 'Choose Video'}</span>
                </div>
              </Label>
              <Input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleUpload} disabled={!isFormValid() || !videoFile || isUploading}>
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {isUploading ? 'Uploading...' : 'Upload and Add Camera'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="stream" className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="stream-url">Stream URL</Label>
              <Input 
                id="stream-url" 
                placeholder="e.g., http://100.89.113.251:8080/videofeed"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                disabled={isAddingStream}
              />
            </div>
            
            {/* MJPEG Stream Testing */}
            {streamUrl && (
              <MJpegCameraStream 
                streamUrl={streamUrl} 
                cameraName={cameraName || 'Test Camera'} 
                onStatusChange={handleStreamStatusChange}
              />
            )}
            
            <div className="flex justify-end">
              <Button onClick={handleAddStream} disabled={!isFormValid() || !streamUrl || isAddingStream}>
                {isAddingStream ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LinkIcon className="mr-2 h-4 w-4" />
                )}
                {isAddingStream ? 'Adding...' : 'Add Camera Stream'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
