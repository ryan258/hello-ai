const axios = require('axios');
require('dotenv').config(); // If you decide to use environment variables

async function generateText(prompt) {
    if (!prompt || prompt.trim().length === 0) {
        throw new Error('Prompt cannot be empty');
    }

    const url = process.env.API_URL || 'http://localhost:11434/api/generate';
    const data = {
        model: process.env.MODEL_NAME || 'llama3.1:latest',
        prompt: prompt,
        stream: false,
        max_tokens: 100, // Example of additional parameter
        temperature: 0.7 // Example of additional parameter
    };
    
    try {
        const response = await axios.post(url, data);
        return response.data.response;
    } catch (error) {
        console.error('Error:', error);
        throw error; // Re-throw the error for the caller to handle
    }
}

// Example usage
const prompt = "Explain the concept of machine learning in simple terms.";
generateText(prompt)
    .then(result => console.log(result))
    .catch(error => console.error('Failed to generate text:', error));