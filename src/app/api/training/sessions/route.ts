import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('API Route - Start Training:', {
      body,
      API_BASE_URL
    });
    
    const response = await fetch(`${API_BASE_URL}/training/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      return NextResponse.json(
        { success: false, message: `Failed to create training session: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Backend response data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Training sessions API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');
    
    if (sessionId) {
      const response = await fetch(`${API_BASE_URL}/training/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { success: false, message: 'Failed to fetch training session' },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: 'Session ID required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Training sessions GET API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}