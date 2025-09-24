import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleKey = searchParams.get('moduleKey');
    
    let url = `${API_BASE_URL}/training/leaderboard`;
    if (moduleKey) {
      url += `?moduleKey=${moduleKey}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch leaderboard' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}