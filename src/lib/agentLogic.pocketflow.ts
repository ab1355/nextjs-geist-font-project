import { Node, Flow } from './pocketflow';
import { AgentTask, AutonomousDecision, CollaborativeDecision, DecisionData, ProcessResult } from './agentLogic';
import { Tool, executeTool, ToolExecutionResult } from "./agentTools";
import type { AgentContext, ToolExecutionContext } from "../models/AgentContext";
import { storeExperience } from "./learningEngine";
import { makeAutonomousDecision, makeCollaborativeDecision } from './agentLogic';

// Shared store for the agent logic flow
interface AgentFlowState {
    agentName: string;
    task: AgentTask;
    decisionData?: DecisionData;
    decision?: AutonomousDecision | CollaborativeDecision;
    toolContext?: ToolExecutionContext;
    result?: ProcessResult;
}

class DecisionNode extends Node<AgentFlowState> {
    async exec(prepRes: unknown): Promise<AutonomousDecision | CollaborativeDecision> {
        const state = prepRes as AgentFlowState;
        if (state.decisionData) {
            // For now, we'll just make an autonomous decision.
            // Collaborative decision can be added later.
            return makeAutonomousDecision(state.task, state.decisionData);
        }
        throw new Error("Decision data is not available");
    }

    async post(shared: AgentFlowState, prepRes: unknown, execRes: unknown): Promise<string> {
        shared.decision = execRes as AutonomousDecision | CollaborativeDecision;
        if (shared.decision.decision_outcome === 'denied') {
            return 'denied';
        }
        return 'approved';
    }
}

class FailureHandlerNode extends Node<AgentFlowState> {
    async exec(prepRes: unknown): Promise<ProcessResult> {
        const state = prepRes as AgentFlowState;
        const result = {
            success: false,
            message: `Task "${state.task.title}" was denied.`,
        };
        await storeExperience(state.agentName, state.task, state.decision!, "failure");
        return result;
    }

    async post(shared: AgentFlowState, prepRes: unknown, execRes: unknown): Promise<string> {
        shared.result = execRes as ProcessResult;
        return 'done';
    }
}

class TaskWithToolNode extends Node<AgentFlowState> {
    async prep(shared: AgentFlowState): Promise<AgentFlowState> {
        return shared;
    }

    async exec(prepRes: unknown): Promise<ProcessResult> {
        const state = prepRes as AgentFlowState;
        const toolResult = await executeTool(state.toolContext!.tool.name, state.toolContext!.input);
        const result = {
            success: toolResult.success,
            message: `Task "${state.task.title}" processed with tool ${state.toolContext!.tool.name}. ${toolResult.message || ''}`,
            toolResult,
            context: state.toolContext,
        };
        await storeExperience(state.agentName, state.task, state.decision!, result.success ? "success" : "failure");
        return result;
    }

    async post(shared: AgentFlowState, prepRes: unknown, execRes: unknown): Promise<string> {
        shared.result = execRes as ProcessResult;
        return 'done';
    }
}

class TaskWithoutToolNode extends Node<AgentFlowState> {
    async exec(prepRes: unknown): Promise<ProcessResult> {
        const state = prepRes as AgentFlowState;
        // Simulate a 10% chance of failing the task
        if (Math.random() < 0.1) {
            const result = {
                success: false,
                message: `Agent ${state.agentName} encountered an error while processing "${state.task.title}".`,
            };
            await storeExperience(state.agentName, state.task, state.decision!, "failure");
            return result;
        } else {
            const result = {
                success: true,
                message: `Agent ${state.agentName} has successfully completed "${state.task.title}".`,
            };
            await storeExperience(state.agentName, state.task, state.decision!, "success");
            return result;
        }
    }

    async post(shared: AgentFlowState, prepRes: unknown, execRes: unknown): Promise<string> {
        shared.result = execRes as ProcessResult;
        return 'done';
    }
}

class TaskRouterNode extends Node<AgentFlowState> {
    async prep(shared: AgentFlowState): Promise<AgentFlowState> {
        return shared;
    }

    async exec(prepRes: unknown): Promise<"with_tool" | "without_tool"> {
        const state = prepRes as AgentFlowState;
        if (state.toolContext && state.toolContext.tool) {
            return "with_tool";
        }
        return "without_tool";
    }

    async post(shared: AgentFlowState, prepRes: unknown, execRes: unknown): Promise<string> {
        return execRes as "with_tool" | "without_tool";
    }
}


export function createAgentTaskFlow(): Flow<AgentFlowState> {
    const decisionNode = new DecisionNode();
    const taskRouterNode = new TaskRouterNode();
    const taskWithToolNode = new TaskWithToolNode();
    const taskWithoutToolNode = new TaskWithoutToolNode();
    const failureHandlerNode = new FailureHandlerNode();

    decisionNode.on('approved', taskRouterNode);
    decisionNode.on('denied', failureHandlerNode);

    taskRouterNode.on('with_tool', taskWithToolNode);
    taskRouterNode.on('without_tool', taskWithoutToolNode);

    const flow = new Flow(decisionNode);
    return flow;
}

export async function processAgentTaskWithPocketFlow(
    agentName: string,
    task: AgentTask,
    decisionData?: DecisionData,
    toolContext?: ToolExecutionContext
): Promise<ProcessResult> {
    const flow = createAgentTaskFlow();
    const sharedState: AgentFlowState = {
        agentName,
        task,
        decisionData,
        toolContext,
    };
    await flow.run(sharedState);
    return sharedState.result!;
}
