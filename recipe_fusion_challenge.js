const axios = require('axios');
const fs = require('fs').promises;
require('dotenv').config();

async function writeToLog(message) {
    await fs.appendFile('recipe_fusion_challenge.log', message + '\n');
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

async function cuisineSelectorAgent() {
    await logOutput("\nActivating Cuisine Selector Agent...");
    const prompt = `As a global culinary expert, your task is to select two distinct cuisines for a fusion recipe challenge. Choose cuisines that have interesting contrasts but also potential for harmonious combination. For each cuisine:

1. Name the cuisine
2. Briefly describe its key characteristics (flavors, ingredients, cooking methods)
3. Mention one or two signature dishes from this cuisine

Select cuisines that are from different parts of the world and have distinct flavor profiles. Aim for an intriguing and unexpected pairing.`;

    return generateText(prompt, "Cuisine Selector Agent");
}

async function fusionConceptAgent(cuisines) {
    await logOutput("\nActivating Fusion Concept Agent...");
    const prompt = `As a creative culinary fusion expert, your task is to develop a concept for a fusion dish combining elements from the following cuisines:

${cuisines}

Create a unique fusion concept that:
1. Combines key elements from both cuisines in a harmonious way
2. Respects the culinary traditions of both cultures while creating something new
3. Balances flavors, textures, and cooking methods from both cuisines

Provide:
1. A catchy name for your fusion dish
2. A brief description of the concept (2-3 sentences)
3. The main ingredients you'll use from each cuisine
4. Any innovative cooking techniques you'll employ to blend the cuisines`;

    return generateText(prompt, "Fusion Concept Agent");
}

async function recipeCreatorAgent(concept) {
    await logOutput("\nActivating Recipe Creator Agent...");
    const prompt = `As an experienced chef specializing in fusion cuisine, your task is to create a detailed recipe based on the following fusion concept:

${concept}

Provide a complete recipe that includes:
1. A list of all ingredients with precise measurements
2. Step-by-step cooking instructions
3. Estimated preparation and cooking time
4. Serving size
5. Any special equipment needed
6. Suggested presentation or plating tips
7. Optional: A beverage pairing suggestion

Ensure that your recipe is clear, concise, and could be followed by an intermediate home cook.`;

    return generateText(prompt, "Recipe Creator Agent");
}

async function culinaryReviewerAgent(cuisines, concept, recipe) {
    await logOutput("\nActivating Culinary Reviewer Agent...");
    const prompt = `As a renowned food critic and culinary historian, your task is to review and analyze the following fusion recipe:

Original Cuisines:
${cuisines}

Fusion Concept:
${concept}

Recipe:
${recipe}

Please provide:
1. A brief review of the fusion concept and recipe (3-4 sentences)
2. Analysis of how well the dish combines elements from both original cuisines
3. Commentary on the creativity and potential appeal of the dish
4. Any suggestions for improvement or variations
5. A rating out of 10 for both creativity and predicted tastiness

Your review should be insightful, fair, and consider both culinary innovation and respect for the original cuisines.`;

    return generateText(prompt, "Culinary Reviewer Agent");
}

async function recipeFusionChallenge() {
    try {
        await logOutput("\n=== Welcome to the Recipe Fusion Challenge ===\n");
        
        const cuisines = await cuisineSelectorAgent();
        const concept = await fusionConceptAgent(cuisines);
        const recipe = await recipeCreatorAgent(concept);
        const review = await culinaryReviewerAgent(cuisines, concept, recipe);
        
        await logOutput("\n=== Recipe Fusion Challenge Completed ===");
        await logOutput("Bon appétit! Enjoy your unique fusion creation!");
        
    } catch (error) {
        const errorMessage = `Error in recipe fusion challenge: ${error}`;
        console.error(errorMessage);
        await writeToLog(errorMessage);
    }
}

// Run the recipe fusion challenge
recipeFusionChallenge();