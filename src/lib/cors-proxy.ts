// Simple CORS proxy for camera streams
// This creates a proxy that adds CORS headers to camera streams

export async function createProxyStream(streamUrl: string) {
  try {
    // Try different proxy services in order
    const proxyServices = [
      {
        name: 'CORS Anywhere',
        url: `https://cors-anywhere.herokuapp.com/${streamUrl.replace(/^https?:\/\//, '')}`
      },
      {
        name: 'AllOrigins',
        url: `https://allorigins.win/raw?url=${encodeURIComponent(streamUrl)}`
      },
      {
        name: 'CORS.io',
        url: `https://cors.io/?${streamUrl}`
      }
    ];

    // Try each proxy service
    for (const proxy of proxyServices) {
      try {
        console.log(`Trying proxy: ${proxy.name}`);
        const response = await fetch(proxy.url, {
          method: 'HEAD',
          mode: 'no-cors'
        });
        
        // If we get any response, return this proxy URL
        if (response.ok || response.status === 0) {
          console.log(`✅ Proxy ${proxy.name} works:`, proxy.url);
          return proxy.url;
        }
      } catch (error) {
        console.log(`❌ Proxy ${proxy.name} failed:`, error);
        continue;
      }
    }

    // If all proxies fail, return the first one as fallback
    console.log('⚠️ Using first proxy as fallback');
    return proxyServices[0].url;
    
  } catch (error) {
    console.error('Proxy creation failed:', error);
    return `https://cors-anywhere.herokuapp.com/${streamUrl.replace(/^https?:\/\//, '')}`;
  }
}

// Get working proxy URL for a camera stream
export async function getWorkingProxyUrl(originalUrl: string): Promise<string> {
  const proxyUrl = await createProxyStream(originalUrl);
  return proxyUrl;
}
