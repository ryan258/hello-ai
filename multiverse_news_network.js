const axios = require('axios');
const fs = require('fs').promises;
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function writeToLog(message) {
    await fs.appendFile('multiverse_news_network.log', message + '\n');
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
        max_tokens: 350,
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

async function alternateHistoryAgent() {
    await logOutput("\nActivating Alternate History Agent...");
    const prompt = `You are an alternate history expert. Create a brief description of a parallel universe where a major historical event had a different outcome. Specify:
1. The divergence point (what historical event changed)
2. A brief overview of how this change affected the course of history
3. The current year in this universe
4. Two major differences in technology, culture, or geopolitics compared to our universe

Keep your response concise, focusing on the most impactful changes.`;
    return generateText(prompt, "Alternate History Agent");
}

async function newsReporterAgent(universeDescription) {
    await logOutput("\nActivating News Reporter Agent...");
    const prompt = `You are a news reporter in the following parallel universe:

${universeDescription}

Based on this alternate history, report on three current events in this universe. Each news item should:
1. Have a catchy headline
2. Contain a brief 2-3 sentence summary of the news
3. Reflect the unique aspects of this parallel universe
4. Be diverse in topic (e.g., politics, technology, culture, environment)

Present your report as a news bulletin, maintaining a professional journalistic tone while capturing the essence of this alternate reality.`;
    return generateText(prompt, "News Reporter Agent");
}

async function commentaryAgent(universeDescription, newsReport) {
    await logOutput("\nActivating Commentary Agent...");
    const prompt = `You are a multiversal political commentator with knowledge of various parallel universes. You've just received this report from an alternate universe:

Universe Description:
${universeDescription}

News Report:
${newsReport}

Provide a brief commentary on these events. Your commentary should:
1. Analyze one major difference between this universe and our own
2. Speculate on potential future developments in this alternate reality
3. Offer a thought-provoking question about the nature of historical change

Keep your commentary concise and insightful, suitable for a multiversal audience.`;
    return generateText(prompt, "Commentary Agent");
}

async function multiverseNewsSession() {
    try {
        await logOutput("\n=== Welcome to the Multiverse News Network ===\n");
        
        const universeDescription = await alternateHistoryAgent();
        const newsReport = await newsReporterAgent(universeDescription);
        const commentary = await commentaryAgent(universeDescription, newsReport);
        
        await logOutput("\n=== Multiverse News Broadcast Complete ===");
        await logOutput("Thank you for tuning into the Multiverse News Network!");
        
    } catch (error) {
        const errorMessage = `Error in multiverse news session: ${error}`;
        console.error(errorMessage);
        await writeToLog(errorMessage);
    } finally {
        rl.close();
    }
}

// Run the multiverse news session
multiverseNewsSession();