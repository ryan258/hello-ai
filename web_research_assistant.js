// Required libraries
const axios = require('axios');  // For making HTTP requests
const cheerio = require('cheerio');  // For parsing HTML
const readline = require('readline');  // For command-line input
const fs = require('fs');  // For file system operations
require('dotenv').config();  // For loading environment variables

// Set up readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to log messages to a file
function logToFile(message) {
    const logStream = fs.createWriteStream('web_research_log.txt', { flags: 'a' });
    logStream.write(`${new Date().toISOString()} - ${message}\n`);
    logStream.end();
}

// Function to generate text using AI model
async function generateText(prompt) {
    // API endpoint for the AI model
    const url = process.env.API_URL || 'http://localhost:11434/api/generate';
    
    // Configuration for the AI request
    const data = {
        model: process.env.MODEL_NAME || 'llama3.1:latest',
        prompt: prompt,
        stream: false,
        max_tokens: 500,
        temperature: 0.7  // Controls randomness: 0 is deterministic, 1 is very random
    };
    
    try {
        // Send POST request to AI model
        const response = await axios.post(url, data);
        return response.data.response;
    } catch (error) {
        console.error('Error generating text:', error);
        logToFile(`Error generating text: ${error}`);
        return null;
    }
}

// Function to fetch and extract content from a webpage
async function fetchWebContent(url) {
    try {
        // Fetch HTML content of the webpage
        const response = await axios.get(url);
        
        // Load HTML content into cheerio for parsing
        const $ = cheerio.load(response.data);
        
        // Extract text content from paragraphs and headers
        const content = $('p, h1, h2, h3, h4, h5, h6').map((_, el) => $(el).text()).get().join(' ');
        
        return content;
    } catch (error) {
        console.error('Error fetching web content:', error);
        logToFile(`Error fetching web content: ${error}`);
        return null;
    }
}

// Function to analyze web content using AI
async function analyzeWebContent(content, topic) {
    // Prepare prompt for AI analysis
    const prompt = `Analyze the following web content about "${topic}" and provide a summary and key insights:
    ${content.substring(0, 3000)}  // Limit content to 3000 characters to avoid token limits
    
    Please include:
    1. A brief summary of the main points
    2. Key insights or takeaways
    3. Any potential biases or limitations in the information
    4. Suggestions for further research`;

    // Generate analysis using AI
    const analysis = await generateText(prompt);
    console.log("\nAI Analysis of Web Content:");
    console.log(analysis);
    logToFile(`AI Analysis of Web Content:\n${analysis}`);
}

// Main function to orchestrate the web research process
async function main() {
    // Get user input for research topic
    const topic = await new Promise(resolve => rl.question("What topic would you like to research? ", resolve));
    
    // Get user input for webpage URL
    const url = await new Promise(resolve => rl.question("Enter a URL to analyze (e.g., a Wikipedia page): ", resolve));

    console.log("\nFetching web content...");
    logToFile(`Fetching web content from URL: ${url}`);
    // Fetch content from the specified URL
    const content = await fetchWebContent(url);

    if (content) {
        console.log("Content fetched successfully. Analyzing...");
        logToFile("Content fetched successfully. Analyzing...");
        // Analyze the fetched content using AI
        await analyzeWebContent(content, topic);
    } else {
        console.log("Failed to fetch content. Please check the URL and try again.");
        logToFile("Failed to fetch content. Please check the URL and try again.");
    }

    // Close the readline interface
    rl.close();
}

// Run the main function
main();