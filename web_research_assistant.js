const axios = require('axios');
const cheerio = require('cheerio');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function generateText(prompt) {
    const url = process.env.API_URL || 'http://localhost:11434/api/generate';
    const data = {
        model: process.env.MODEL_NAME || 'llama3.1:latest',
        prompt: prompt,
        stream: false,
        max_tokens: 500,
        temperature: 0.7
    };
    
    try {
        const response = await axios.post(url, data);
        return response.data.response;
    } catch (error) {
        console.error('Error generating text:', error);
        return null;
    }
}

async function fetchWebContent(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        // Extract text content from paragraphs and headers
        const content = $('p, h1, h2, h3, h4, h5, h6').map((_, el) => $(el).text()).get().join(' ');
        
        return content;
    } catch (error) {
        console.error('Error fetching web content:', error);
        return null;
    }
}

async function analyzeWebContent(content, topic) {
    const prompt = `Analyze the following web content about "${topic}" and provide a summary and key insights:
    ${content.substring(0, 3000)}  // Limit content to 3000 characters to avoid token limits
    
    Please include:
    1. A brief summary of the main points
    2. Key insights or takeaways
    3. Any potential biases or limitations in the information
    4. Suggestions for further research`;

    const analysis = await generateText(prompt);
    console.log("\nAI Analysis of Web Content:");
    console.log(analysis);
}

async function main() {
    const topic = await new Promise(resolve => rl.question("What topic would you like to research? ", resolve));
    const url = await new Promise(resolve => rl.question("Enter a URL to analyze (e.g., a Wikipedia page): ", resolve));

    console.log("\nFetching web content...");
    const content = await fetchWebContent(url);

    if (content) {
        console.log("Content fetched successfully. Analyzing...");
        await analyzeWebContent(content, topic);
    } else {
        console.log("Failed to fetch content. Please check the URL and try again.");
    }

    rl.close();
}

main();