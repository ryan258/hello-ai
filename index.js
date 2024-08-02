const axios = require('axios');
require('dotenv').config();

async function generateText(prompt, agentName) {
    const url = process.env.API_URL || 'http://localhost:11434/api/generate';
    const data = {
        model: process.env.MODEL_NAME || 'llama3.1:latest',
        prompt: prompt,
        stream: false,
        max_tokens: 150,
        temperature: 0.7
    };
    
    try {
        const response = await axios.post(url, data);
        console.log(`${agentName} says: ${response.data.response}`);
        return response.data.response;
    } catch (error) {
        console.error(`Error with ${agentName}:`, error);
        throw error;
    }
}

async function researchAgent(topic) {
    const prompt = `You are a research agent. Your task is to provide a brief summary of the following topic: ${topic}. Focus on key points and recent developments.`;
    return generateText(prompt, "Research Agent");
}

async function writingAgent(research) {
    const prompt = `You are a writing agent. Based on the following research, create a short blog post introduction. Research: ${research}`;
    return generateText(prompt, "Writing Agent");
}

async function runAgentSystem(topic) {
    try {
        console.log("Starting multi-agent task...");
        const research = await researchAgent(topic);
        console.log("Research DONE!");
        const blogIntro = await writingAgent(research);
        console.log("Blog introduction:", blogIntro);
        console.log("Multi-agent task completed successfully!");
    } catch (error) {
        console.error("Error in agent system:", error);
    }
}

// Example usage
const topic = "Unsolved mysteries regarding the societal impacts of AI";
runAgentSystem(topic);