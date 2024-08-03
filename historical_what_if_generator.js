const axios = require('axios');
const fs = require('fs').promises;
require('dotenv').config();

async function writeToLog(message) {
    await fs.appendFile('historical_what_if.log', message + '\n');
}

async function logOutput(message) {
    console.log(message);
    await writeToLog(message);
}

async function generateText(prompt, agentName) {
    const url = process.env.API_URL || 'http://localhost:11434/api/generate';
    const data = {
        model: process.env.MODEL_NAME || 'llama3.1:latest',
        prompt: prompt,
        stream: false,
        max_tokens: 400,
        temperature: 0.8
    };
    
    try {
        const response = await axios.post(url, data);
        await logOutput(`\n--- ${agentName} output ---`);
        await logOutput(response.data.response);
        await logOutput(`--- End of ${agentName} output ---\n`);
        return response.data.response;
    } catch (error) {
        const errorMessage = `Error with ${agentName}: ${error}`;
        console.error(errorMessage);
        await writeToLog(errorMessage);
        throw error;
    }
}

async function historicalEventSelectorAgent() {
    await logOutput("\nActivating Historical Event Selector Agent...");
    const prompt = `As a historical expert, your task is to select a significant historical event and propose an alternative outcome. Choose an event that had a major impact on world history. Provide:

1. The original historical event and its date
2. A brief description of what actually happened
3. An alternative outcome - what could have happened differently
4. The immediate consequences of this change

Choose an event that would lead to interesting and far-reaching changes in history. Be creative but plausible in your alternative outcome.`;

    return generateText(prompt, "Historical Event Selector Agent");
}

async function immediateAftermathAgent(event) {
    await logOutput("\nActivating Immediate Aftermath Agent...");
    const prompt = `As a historical analyst, your task is to explore the immediate aftermath of this alternative historical event:

${event}

Describe the short-term consequences (within 5 years) of this change. Consider:

1. Political changes (shifts in power, new alliances, conflicts)
2. Social impacts (changes in public opinion, social movements)
3. Economic effects (market reactions, trade changes)
4. Technological developments (accelerated or hindered progress in certain areas)

Provide a coherent narrative of how the world might have changed in the immediate aftermath of this alternative event. Be creative but try to maintain historical plausibility.`;

    return generateText(prompt, "Immediate Aftermath Agent");
}

async function longTermConsequencesAgent(event, aftermath) {
    await logOutput("\nActivating Long-Term Consequences Agent...");
    const prompt = `As a futurist historian, your task is to project the long-term consequences of this alternative historical timeline:

Original Event and Change:
${event}

Immediate Aftermath:
${aftermath}

Describe the potential state of the world 50-100 years after the event. Consider:

1. Geopolitical landscape (major world powers, international relations)
2. Technological advancements (how technology might have developed differently)
3. Social and cultural changes (major ideologies, cultural movements)
4. Environmental impacts (changes in climate policies, resource management)
5. One or two major events that might have occurred as a result of this altered timeline

Create a vivid but plausible picture of this alternate future. Feel free to be creative while maintaining a logical connection to the original change and its immediate aftermath.`;

    return generateText(prompt, "Long-Term Consequences Agent");
}

async function narrativeCrafterAgent(event, aftermath, longTerm) {
    await logOutput("\nActivating Narrative Crafter Agent...");
    const prompt = `As a historical fiction author, your task is to craft a compelling narrative set in the alternate timeline we've created:

Original Event and Change:
${event}

Immediate Aftermath:
${aftermath}

Long-Term Consequences:
${longTerm}

Create a short story synopsis (about 250 words) set in this alternate world. Your synopsis should:

1. Introduce a main character living in this altered timeline
2. Describe a conflict or challenge they face that's unique to this world
3. Highlight how the changed historical event has shaped their life and society
4. End with a cliffhanger or thought-provoking question

Your story should bring this alternate history to life, making it feel real and relatable while showcasing the major differences from our actual timeline.`;

    return generateText(prompt, "Narrative Crafter Agent");
}

async function historicalWhatIfGenerator() {
    try {
        await logOutput("\n=== Welcome to the Historical 'What If' Scenario Generator ===\n");
        
        const event = await historicalEventSelectorAgent();
        const aftermath = await immediateAftermathAgent(event);
        const longTerm = await longTermConsequencesAgent(event, aftermath);
        const narrative = await narrativeCrafterAgent(event, aftermath, longTerm);
        
        await logOutput("\n=== Historical 'What If' Scenario Generation Complete ===");
        await logOutput("Explore the fascinating alternate timeline created above!");
        
    } catch (error) {
        const errorMessage = `Error in historical 'What If' scenario generation: ${error}`;
        console.error(errorMessage);
        await writeToLog(errorMessage);
    }
}

// Run the historical 'What If' scenario generator
historicalWhatIfGenerator();
