const axios = require('axios');
const fs = require('fs').promises;
require('dotenv').config();

async function writeToLog(message) {
    await fs.appendFile('historical_figure_debate.log', message + '\n');
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

async function debateTopicAgent() {
    await logOutput("\nActivating Debate Topic Agent...");
    const prompt = `You are a debate organizer tasked with selecting a modern issue for historical figures to debate. Choose a contemporary topic that would provoke interesting discussions from various historical perspectives. The topic should be:

1. Relevant to current global challenges
2. Complex enough to have multiple valid viewpoints
3. Applicable across different time periods and cultures

Provide:
1. The debate topic (1 sentence)
2. A brief explanation of why this topic is significant and controversial (2-3 sentences)
3. Three key aspects or questions related to this topic that the debaters should address`;

    return generateText(prompt, "Debate Topic Agent");
}

async function historicalFigureSelector(topic) {
    await logOutput("\nActivating Historical Figure Selector Agent...");
    const prompt = `As a historical expert, your task is to select three historical figures to debate the following modern topic:

${topic}

Choose figures who would have diverse and interesting perspectives on this issue. For each historical figure:

1. Provide their name and brief title/description
2. Explain why they would be interested in this topic
3. Suggest one unique perspective or argument they might bring to the debate

Select figures from different time periods, cultures, or fields of expertise to ensure a dynamic debate.`;

    return generateText(prompt, "Historical Figure Selector Agent");
}

async function debateAgent(topic, figures, currentFigure) {
    await logOutput(`\nActivating Debate Agent for ${currentFigure}...`);
    const prompt = `You are role-playing as ${currentFigure} in a debate on the following modern topic:

${topic}

The other participants in this debate are:
${figures}

Based on your historical knowledge, personal beliefs, and experiences, provide your opening statement for this debate. Your statement should:

1. Introduce yourself and your background briefly
2. Present your stance on the debate topic
3. Offer 2-3 key arguments or points supporting your position
4. Address potential counterarguments from the other historical figures
5. Conclude with a powerful statement that encapsulates your view

Maintain the speaking style, values, and worldview of ${currentFigure} throughout your statement. Remember, you're addressing a modern issue from your historical perspective.`;

    return generateText(prompt, `${currentFigure} Debate Agent`);
}

async function moderatorAgent(topic, figures, statements) {
    await logOutput("\nActivating Moderator Agent...");
    const prompt = `You are a skilled debate moderator tasked with summarizing and analyzing a debate between historical figures on a modern topic. 

Debate Topic:
${topic}

Participants:
${figures}

Debate Statements:
${statements}

Please provide:

1. A brief summary of each participant's main arguments (2-3 sentences each)
2. Analysis of how each figure's historical context influenced their perspective
3. Identification of any common ground or stark differences between the debaters
4. A thought-provoking question that emerged from the debate, relevant to modern audiences
5. Your conclusion on how this historical perspective enriches our understanding of the modern issue

Aim for an impartial, insightful analysis that highlights the value of examining contemporary issues through a historical lens.`;

    return generateText(prompt, "Moderator Agent");
}

async function historicalFigureDebate() {
    try {
        await logOutput("\n=== Welcome to the Historical Figure Debate ===\n");
        
        const topic = await debateTopicAgent();
        const figures = await historicalFigureSelector(topic);
        
        // Extract figure names from the selector output
        const figureNames = figures.match(/\d\.\s([^\n]+)/g).map(name => name.replace(/^\d\.\s/, '').split(' - ')[0]);
        
        const statements = [];
        for (const figure of figureNames) {
            const statement = await debateAgent(topic, figures, figure);
            statements.push(statement);
        }
        
        const analysis = await moderatorAgent(topic, figures, statements.join("\n\n"));
        
        await logOutput("\n=== Historical Figure Debate Concluded ===");
        await logOutput("Thank you for attending this unique historical perspective on a modern issue!");
        
    } catch (error) {
        const errorMessage = `Error in historical figure debate: ${error}`;
        console.error(errorMessage);
        await writeToLog(errorMessage);
    }
}
historicalFigureDebate();
