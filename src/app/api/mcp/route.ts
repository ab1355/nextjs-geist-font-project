import { NextResponse } from 'next/server';

export async function GET() {
  const mcpServers = [
    { name: 'MCP Server 1', status: 'Online' },
    { name: 'MCP Server 2', status: 'Offline' },
    { name: 'MCP Server 3', status: 'Online' },
  ];
  return NextResponse.json(mcpServers);
}
