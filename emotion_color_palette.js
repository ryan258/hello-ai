const axios = require('axios');
const fs = require('fs').promises;
require('dotenv').config();

async function writeToLog(message) {
    await fs.appendFile('emotion_color_palette.log', message + '\n');
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

async function emotionGeneratorAgent() {
    await logOutput("\nActivating Emotion Generator Agent...");
    const prompt = `You are an expert in complex human emotions. Generate a nuanced, compound emotion that combines multiple feelings or states. This emotion should be something beyond basic feelings like "happy" or "sad". Instead, create a rich, layered emotional experience that might be hard to describe with a single word. Provide:

1. A name for this complex emotion (it can be a made-up term)
2. A brief description of what this emotion entails
3. A situation or scenario where someone might experience this emotion

Be creative and aim for depth and uniqueness in your emotion generation.`;
    return generateText(prompt, "Emotion Generator Agent");
}

async function colorPaletteAgent(emotion) {
    await logOutput("\nActivating Color Palette Agent...");
    const prompt = `You are a color theory expert with a deep understanding of the psychological impacts of colors. Given the following complex emotion, create a color palette that represents it:

${emotion}

Your task is to:
1. Select 3-5 colors that together capture the essence of this emotion.
2. Provide the hex codes for these colors.
3. Briefly explain why each color was chosen and how it relates to an aspect of the emotion.
4. Describe how the colors interact with each other to create the overall emotional effect.

Be thoughtful in your color choices, considering both conventional color associations and more nuanced, unexpected connections.`;
    return generateText(prompt, "Color Palette Agent");
}

async function explanationAgent(emotion, palette) {
    await logOutput("\nActivating Explanation Agent...");
    const prompt = `You are an interdisciplinary expert in psychology, art theory, and communication. You've been presented with a complex emotion and a corresponding color palette:

Emotion: ${emotion}

Color Palette: ${palette}

Your task is to provide a comprehensive explanation of this emotion-color association. Include:

1. An analysis of how the color palette captures the nuances of the emotion.
2. Any cultural or historical contexts that might influence the color-emotion association.
3. How this color palette might be used in art, design, or therapy to evoke or represent the emotion.
4. A hypothetical scenario where encountering this color combination might trigger this specific emotional state.
5. Any potential variations or personal interpretations of this color-emotion association.

Aim for a thoughtful, nuanced explanation that bridges the gap between the abstract (emotion) and the visual (color palette).`;
    return generateText(prompt, "Explanation Agent");
}

async function emotionColorPaletteSession() {
    try {
        await logOutput("\n=== Welcome to the Emotion Color Palette Generator ===\n");
        
        const emotion = await emotionGeneratorAgent();
        const palette = await colorPaletteAgent(emotion);
        const explanation = await explanationAgent(emotion, palette);
        
        await logOutput("\n=== Emotion Color Palette Generation Complete ===");
        await logOutput("Explore the complex emotion and its color representation above!");
        
    } catch (error) {
        const errorMessage = `Error in emotion color palette session: ${error}`;
        console.error(errorMessage);
        await writeToLog(errorMessage);
    }
}

// Run the emotion color palette session
emotionColorPaletteSession();