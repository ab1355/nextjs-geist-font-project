import { NextResponse } from 'next/server';
import {
  processAgentTaskWithPocketFlow as processAgentTask,
  makeAutonomousDecision,
  makeCollaborativeDecision,
  AutonomousDecision,
  CollaborativeDecision,
  AgentTask,
  DecisionData
} from "@/lib/agentLogic.pocketflow";
import { queryLLM } from '@/lib/llmClient';
import { LLMConfig } from '@/models/LLMConfig';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (!action || !payload) {
      return NextResponse.json({ error: 'Action and payload are required' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'delegateTask':
        const { task, agent, llmConfig, decisionData, collaborative, consensus_type, participants, oversight_type, toolContext } = payload;

        if (llmConfig) {
            try {
              const llmResponse = await queryLLM(
                `Task: ${task.title}\nDescription: ${task.description}`,
                llmConfig
              );
              task.description = `${task.description}\nLLM Analysis: ${llmResponse.text}`;
            } catch (error) {
              console.error("LLM processing error:", error);
            }
        }

        let decision: AutonomousDecision | CollaborativeDecision;
        if (collaborative) {
            decision = await makeCollaborativeDecision(
              { title: task.title, description: task.description },
              decisionData,
              {
                consensus_type: consensus_type || "voting",
                participants: participants || [],
              },
              {
                oversight_type: oversight_type || "review",
              }
            );
        } else {
            decision = await makeAutonomousDecision(
              { title: task.title, description: task.description },
              decisionData
            );
        }

        const processResult = await processAgentTask(agent.name, task, decisionData, toolContext);
        result = { ...processResult, decision };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error in agent action:`, error);
    return NextResponse.json(
      { error: 'Agent action failed', details: error.message },
      { status: 500 }
    );
  }
}
