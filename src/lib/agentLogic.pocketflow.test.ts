import { createAgentTaskFlow, processAgentTaskWithPocketFlow } from './agentLogic.pocketflow';
import { AgentTask, DecisionData } from './agentLogic';
import { Tool } from './agentTools';

async function runTest() {
    console.log("Running test for PocketFlow agent logic...");

    // Test case 1: A simple task without a tool that should succeed
    console.log("\n--- Test Case 1: Simple task, should succeed ---");
    const task1: AgentTask = { title: "Test Task 1", description: "A simple test task" };
    const decisionData1: DecisionData = {
        decision_parameter: "test",
        decision_threshold: "low",
        risk_assessment: { risk_type: "none", risk_level: "low" },
        impact_analysis: { impact_area: "none", impact_level: "minor" },
    };
    const result1 = await processAgentTaskWithPocketFlow("TestAgent", task1, decisionData1);
    console.log("Result 1:", result1);
    if (result1.success) {
        console.log("Test Case 1 PASSED");
    } else {
        console.error("Test Case 1 FAILED");
    }

    // Test case 2: A task with a tool
    console.log("\n--- Test Case 2: Task with a tool ---");
    const task2: AgentTask = { title: "Test Task 2", description: "A test task with a tool" };
    const decisionData2: DecisionData = {
        decision_parameter: "test",
        decision_threshold: "low",
        risk_assessment: { risk_type: "none", risk_level: "low" },
        impact_analysis: { impact_area: "none", impact_level: "minor" },
    };
    const tool: Tool = { name: "Data Verification", description: "", endpoint: "", iconURL: "", category: "data" };
    const result2 = await processAgentTaskWithPocketFlow("TestAgent", task2, decisionData2, { tool, input: {} });
    console.log("Result 2:", result2);
    if (result2.success && result2.toolResult?.success) {
        console.log("Test Case 2 PASSED");
    } else {
        console.error("Test Case 2 FAILED");
    }

    // Test case 3: A task that should be denied
    console.log("\n--- Test Case 3: Task should be denied ---");
    const task3: AgentTask = { title: "Test Task 3", description: "A risky test task" };
    const decisionData3: DecisionData = {
        decision_parameter: "test",
        decision_threshold: "high",
        risk_assessment: { risk_type: "financial", risk_level: "high" },
        impact_analysis: { impact_area: "revenue", impact_level: "significant" },
    };
    const result3 = await processAgentTaskWithPocketFlow("TestAgent", task3, decisionData3);
    console.log("Result 3:", result3);
    if (!result3.success && result3.message.includes("denied")) {
        console.log("Test Case 3 PASSED");
    } else {
        console.error("Test Case 3 FAILED");
    }
}

runTest();
