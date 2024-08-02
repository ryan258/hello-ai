const axios = require('axios');
const fs = require('fs').promises;
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function writeToLog(message) {
    await fs.appendFile('dream_interpretation_dialogue.log', message + '\n');
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
        max_tokens: 300,
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

async function dreamGeneratorAgent() {
    await logOutput("\nActivating Dream Generator Agent...");
    const prompt = `You are a surreal dream generator. Create a vivid and bizarre dream scenario. Include unusual imagery, impossible situations, and strange juxtapositions. The dream should be abstract and open to interpretation. Describe the dream in 3-5 sentences.`;
    return generateText(prompt, "Dream Generator Agent");
}

async function dreamInterpreterAgent(dream) {
    await logOutput("\nActivating Dream Interpreter Agent...");
    const prompt = `You are a psychological dream interpreter. Analyze the following dream from a Jungian perspective, considering archetypes, symbols, and the collective unconscious. Provide insights into the dreamer's potential psychological state and underlying emotions. Dream: "${dream}"

Provide your interpretation in the following format:
1. Key Symbols: (List and briefly explain 2-3 main symbols)
2. Archetypal Themes: (Identify 1-2 relevant archetypes)
3. Emotional Undertones: (Describe the potential emotional state of the dreamer)
4. Possible Interpretations: (Offer 2-3 potential meanings or messages from the unconscious)
5. Questions for Reflection: (Suggest 2 questions for the dreamer to ponder)`;
    return generateText(prompt, "Dream Interpreter Agent");
}

async function dialogueAgent(dream, interpretation, question) {
    await logOutput("\nActivating Dialogue Agent...");
    const prompt = `You are a wise and empathetic dream dialogue agent. You have access to a dreamer's surreal dream and its psychological interpretation. The dreamer has asked a follow-up question about their dream or its interpretation. Provide a thoughtful, insightful response that encourages self-reflection and deeper understanding.

Dream: "${dream}"

Interpretation: "${interpretation}"

Dreamer's Question: "${question}"

Respond to the dreamer's question, drawing on the dream content and interpretation as needed. Be supportive and encouraging, and feel free to ask additional probing questions to help the dreamer gain more insights.`;
    return generateText(prompt, "Dialogue Agent");
}

function askQuestion(query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function dreamAnalysisSession() {
    try {
        await logOutput("\n=== Starting Dream Analysis Session ===\n");
        
        const dream = await dreamGeneratorAgent();
        const interpretation = await dreamInterpreterAgent(dream);
        
        await logOutput("\n=== Initial Dream Analysis Complete ===");
        await logOutput("You can now ask questions about your dream or its interpretation.");
        
        let continueDialogue = true;
        while (continueDialogue) {
            const question = await askQuestion("\nAsk a question about your dream (or type 'exit' to end): ");
            if (question.toLowerCase() === 'exit') {
                continueDialogue = false;
            } else {
                const response = await dialogueAgent(dream, interpretation, question);
                await logOutput("\nDream Interpreter's Response:");
                await logOutput(response);
            }
        }
        
        await logOutput("\n=== Dream Analysis Session Complete! ===");
        rl.close();
    } catch (error) {
        const errorMessage = `Error in dream analysis session: ${error}`;
        console.error(errorMessage);
        await writeToLog(errorMessage);
        rl.close();
    }
}

// Run the dream analysis session
dreamAnalysisSession();