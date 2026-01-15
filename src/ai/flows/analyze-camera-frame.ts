'use server';

export type AnalyzeCameraFrameOutput = {
  crowdCount: number;
  peoplePositions: { x: number; y: number }[];
  newAlerts: any[];
};

export async function analyzeCameraFrame(input: {
  frameDataUri: string;
}): Promise<AnalyzeCameraFrameOutput> {
  try {
    const res = await fetch('http://127.0.0.1:8001/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frameDataUri: input.frameDataUri }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Vision backend error', res.status);
      return { crowdCount: 0, peoplePositions: [], newAlerts: [] };
    }

    return await res.json();
  } catch (err) {
    console.error('Vision backend failed', err);
    return { crowdCount: 0, peoplePositions: [], newAlerts: [] };
  }
}
