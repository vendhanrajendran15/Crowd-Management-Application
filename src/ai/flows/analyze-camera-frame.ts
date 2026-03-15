export type AnalyzeCameraFrameOutput = {
  crowdCount: number;
  peoplePositions: { x: number; y: number }[];
  newAlerts: any[];
};

// Client-side function using Next.js API route as proxy
export async function analyzeCameraFrameClient(input: {
  frameDataUri: string;
}): Promise<AnalyzeCameraFrameOutput> {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frameDataUri: input.frameDataUri }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('API route error', res.status);
      return { crowdCount: 0, peoplePositions: [], newAlerts: [] };
    }

    return await res.json();
  } catch (err) {
    console.error('API route failed', err);
    return { crowdCount: 0, peoplePositions: [], newAlerts: [] };
  }
}
