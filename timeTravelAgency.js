const axios = require('axios');
const fs = require('fs').promises;
require('dotenv').config();

async function writeToLog(message) {
    await fs.appendFile('time_travel_brochure.log', message + '\n');
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
        max_tokens: 250,
        temperature: 0.7
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

async function historianAgent(era) {
    await logOutput(`\nActivating Historian Agent for ${era}...`);
    const prompt = `You are a historian specializing in ${era}. Provide a brief overview of this era, highlighting key events, figures, and cultural aspects that would be interesting to time-traveling tourists. Focus on unique experiences they could have.`;
    return generateText(prompt, "Historian Agent");
}

async function attractionDesignerAgent(eraInfo) {
    await logOutput("\nActivating Attraction Designer Agent...");
    const prompt = `You are a creative tourism expert. Based on this historical information: "${eraInfo}", design three unique attractions or experiences for time-traveling tourists. Be specific and imaginative.`;
    return generateText(prompt, "Attraction Designer Agent");
}

async function safetyAdvisorAgent(era, attractions) {
    await logOutput("\nActivating Safety Advisor Agent...");
    const prompt = `You are a time travel safety expert. Given this era (${era}) and these attractions: "${attractions}", provide three essential safety tips for tourists to ensure they have a safe trip without disrupting the timeline.`;
    return generateText(prompt, "Safety Advisor Agent");
}

async function marketingAgent(era, attractions, safetyTips) {
    await logOutput("\nActivating Marketing Agent...");
    const prompt = `You are a tourism marketing specialist. Create a catchy slogan and a brief, exciting paragraph for a brochure about time-traveling to ${era}. Include these attractions: "${attractions}" and mention safety: "${safetyTips}". Make it appealing and fun!`;
    return generateText(prompt, "Marketing Agent");
}

async function createTimeTravelBrochure(era) {
    try {
        await logOutput(`\n=== Creating a time travel brochure for ${era} ===\n`);
        
        const historicalInfo = await historianAgent(era);
        const attractions = await attractionDesignerAgent(historicalInfo);
        const safetyTips = await safetyAdvisorAgent(era, attractions);
        const marketingContent = await marketingAgent(era, attractions, safetyTips);
        
        await logOutput("\n=== Time Travel Brochure Creation Complete! ===");
        await logOutput("Combine the outputs above to create your full brochure.");
    } catch (error) {
        const errorMessage = `Error in creating brochure: ${error}`;
        console.error(errorMessage);
        await writeToLog(errorMessage);
    }
}

// Example usage
const historicalEra = "Buenos Aires, Argentina, 1920s";
createTimeTravelBrochure(historicalEra);