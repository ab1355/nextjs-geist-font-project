import { NextResponse } from 'next/server';
import { getAvailableTools, executeTool } from '@/lib/agentTools';

export async function GET() {
  try {
    const tools = await getAvailableTools();
    return NextResponse.json({ tools });
  } catch (error: any) {
    console.error('Error fetching tools:', error);
    return NextResponse.json(
      { error: 'Failed to load tools', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { toolName, parameters } = await request.json();

    if (!toolName) {
      return NextResponse.json(
        { error: 'Tool name is required' },
        { status: 400 }
      );
    }

    const result = await executeTool(toolName, parameters);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error executing tool:', error);
    return NextResponse.json(
      { error: 'Tool execution failed', details: error.message },
      { status: 500 }
    );
  }
}
