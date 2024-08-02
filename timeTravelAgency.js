const axios = require('axios');
require('dotenv').config();

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
        console.log(`${agentName} output:`);
        console.log(response.data.response);
        return response.data.response;
    } catch (error) {
        console.error(`Error with ${agentName}:`, error);
        throw error;
    }
}

async function historianAgent(era) {
    const prompt = `You are a historian specializing in ${era}. Provide a brief overview of this era, highlighting key events, figures, and cultural aspects that would be interesting to time-traveling tourists. Focus on unique experiences they could have.`;
    return generateText(prompt, "Historian Agent");
}

async function attractionDesignerAgent(eraInfo) {
    const prompt = `You are a creative tourism expert. Based on this historical information: "${eraInfo}", design three unique attractions or experiences for time-traveling tourists. Be specific and imaginative.`;
    return generateText(prompt, "Attraction Designer Agent");
}

async function safetyAdvisorAgent(era, attractions) {
    const prompt = `You are a time travel safety expert. Given this era (${era}) and these attractions: "${attractions}", provide three essential safety tips for tourists to ensure they have a safe trip without disrupting the timeline.`;
    return generateText(prompt, "Safety Advisor Agent");
}

async function marketingAgent(era, attractions, safetyTips) {
    const prompt = `You are a tourism marketing specialist. Create a catchy slogan and a brief, exciting paragraph for a brochure about time-traveling to ${era}. Include these attractions: "${attractions}" and mention safety: "${safetyTips}". Make it appealing and fun!`;
    return generateText(prompt, "Marketing Agent");
}

async function createTimeTravelBrochure(era) {
    try {
        console.log(`Creating a time travel brochure for ${era}...`);
        
        const historicalInfo = await historianAgent(era);
        const attractions = await attractionDesignerAgent(historicalInfo);
        const safetyTips = await safetyAdvisorAgent(era, attractions);
        const marketingContent = await marketingAgent(era, attractions, safetyTips);
        
        console.log("\nTime Travel Brochure Complete!");
        console.log("Combine the outputs above to create your full brochure.");
    } catch (error) {
        console.error("Error in creating brochure:", error);
    }
}

// Example usage
const historicalEra = "Ancient Rome, 1st century AD";
createTimeTravelBrochure(historicalEra);