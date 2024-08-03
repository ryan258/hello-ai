const axios = require('axios');
const fs = require('fs').promises;
require('dotenv').config();

async function writeToLog(message) {
    await fs.appendFile('human_ai_creativity.log', message + '\n');
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
        max_tokens: 500,
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

async function creativeFieldAnalystAgent() {
    await logOutput("\nActivating Creative Field Analyst Agent...");
    const prompt = `As a Creative Field Analyst, your task is to examine how AI impacts different creative industries. Please provide an analysis that includes:

1. An overview of 3-4 creative industries significantly impacted by AI (e.g., visual arts, music, writing, fashion design)
2. For each industry:
   a) Current AI technologies being used
   b) How these technologies are changing creative processes
   c) Potential future developments in AI for this industry
3. General trends in how AI is reshaping creativity across industries
4. Potential challenges and opportunities for human creators in an AI-enhanced creative landscape

Be specific in your analysis, providing examples where possible. Your insights will be used to inform the development of human-AI creative partnerships.`;

    return generateText(prompt, "Creative Field Analyst Agent");
}

async function collaborationModelDesignerAgent(industryAnalysis) {
    await logOutput("\nActivating Collaboration Model Designer Agent...");
    const prompt = `As a Collaboration Model Designer, your task is to develop frameworks for human-AI creative partnerships based on the following industry analysis:

${industryAnalysis}

Please create a collaboration model that includes:

1. A general framework for human-AI creative partnerships applicable across industries
2. Specific collaboration strategies for 2-3 of the industries mentioned in the analysis
3. Roles and responsibilities for both human creators and AI in the creative process
4. Methods for integrating AI tools at different stages of creation (ideation, production, refinement)
5. Strategies for maintaining human creative vision while leveraging AI capabilities
6. Approaches to handle potential conflicts or challenges in the collaboration
7. Ideas for training and preparation for both humans and AI to work effectively together

Your model should be innovative yet practical, considering both current AI capabilities and potential future developments.`;

    return generateText(prompt, "Collaboration Model Designer Agent");
}

async function noveltyEvaluationAgent(industryAnalysis, collaborationModel) {
    await logOutput("\nActivating Novelty Evaluation Agent...");
    const prompt = `As a Novelty Evaluation Agent, your task is to assess the uniqueness of human-AI creative outputs. Consider the following industry analysis and collaboration model:

Industry Analysis:
${industryAnalysis}

Collaboration Model:
${collaborationModel}

Based on this information, please provide:

1. A framework for evaluating the novelty of human-AI collaborative creations, including:
   a) Criteria for assessing uniqueness in different creative fields
   b) Methods to compare human-AI outputs with purely human or purely AI creations
   c) Approaches to distinguish between technical novelty and creative novelty
2. Potential challenges in evaluating novelty in human-AI collaborations
3. Ideas for how this evaluation framework could be implemented (e.g., AI-powered evaluation tools, human expert panels)
4. Thoughts on how focusing on novelty might impact the creative process and outcomes
5. Suggestions for balancing novelty with other important aspects of creativity (e.g., meaningfulness, craftsmanship)

Your evaluation framework should be adaptable to different creative fields and sensitive to the unique aspects of human-AI collaboration.`;

    return generateText(prompt, "Novelty Evaluation Agent");
}

async function humanAICreativityCollaborator() {
    try {
        await logOutput("\n=== Welcome to the Human-AI Creativity Collaborator System ===\n");
        
        const industryAnalysis = await creativeFieldAnalystAgent();
        const collaborationModel = await collaborationModelDesignerAgent(industryAnalysis);
        const noveltyEvaluation = await noveltyEvaluationAgent(industryAnalysis, collaborationModel);
        
        await logOutput("\n=== Human-AI Creativity Collaboration Analysis Complete ===");
        await logOutput("Explore the insights on AI's impact on creative industries, collaboration models, and novelty evaluation above!");
        
    } catch (error) {
        const errorMessage = `Error in Human-AI Creativity Collaborator system: ${error}`;
        console.error(errorMessage);
        await writeToLog(errorMessage);
    }
}

// Run the Human-AI Creativity Collaborator system
humanAICreativityCollaborator();