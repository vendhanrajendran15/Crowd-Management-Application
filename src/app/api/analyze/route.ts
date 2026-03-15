import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch('http://127.0.0.1:8001/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Vision backend error', response.status);
      return NextResponse.json(
        { crowdCount: 0, peoplePositions: [], newAlerts: [] },
        { status: 200 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Vision backend failed', error);
    return NextResponse.json(
      { crowdCount: 0, peoplePositions: [], newAlerts: [] },
      { status: 200 }
    );
  }
}
