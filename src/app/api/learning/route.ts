import { NextResponse } from 'next/server';
import { getLearningInsights, getBehaviorProfile, getExperienceStats } from '@/lib/learningEngine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'insights':
        const topic = searchParams.get('topic');
        if (!topic) {
          return NextResponse.json({ error: 'Topic parameter is required for insights' }, { status: 400 });
        }
        result = await getLearningInsights(topic);
        break;

      case 'profile':
        const agentName = searchParams.get('agentName');
        if (!agentName) {
          return NextResponse.json({ error: 'agentName parameter is required for profile' }, { status: 400 });
        }
        result = getBehaviorProfile(agentName);
        break;

      case 'stats':
        const agentNameToStats = searchParams.get('agentName');
        if (!agentNameToStats) {
            return NextResponse.json({ error: 'agentName parameter is required for stats' }, { status: 400 });
        }
        result = getExperienceStats(agentNameToStats);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in learning API:', error);
    return NextResponse.json(
      { error: 'Learning API request failed', details: error.message },
      { status: 500 }
    );
  }
}
