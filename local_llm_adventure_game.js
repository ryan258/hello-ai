const readline = require('readline');
const axios = require('axios');

class LocalLLMAdventureGame {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.url = process.env.API_URL || 'http://localhost:11434/api/generate';
        this.model = process.env.MODEL_NAME || 'llama3.1:latest';
    }

    async generateContent(prompt) {
        try {
            const response = await axios.post(this.url, {
                model: this.model,
                prompt: prompt,
                stream: false
            });
            return response.data.response.trim();
        } catch (error) {
            console.error("Error generating content:", error);
            return null;
        }
    }

    async generateStory() {
        let story = await this.generateContent("Generate a unique starting scenario for an adventure game:");
        console.log(story);
        
        for (let i = 0; i < 3; i++) {  // 3 choices per game
            console.log("\nWhat do you want to do?");
            let choices = await this.generateContent(`Based on the scenario: "${story}", generate three unique choices for the player. Format them as a numbered list.`);
            console.log(choices);
            
            let userChoice = await this.getUserInput("Enter your choice (1-3): ");
            while (!['1', '2', '3'].includes(userChoice)) {
                userChoice = await this.getUserInput("Invalid input. Please enter 1, 2, or 3: ");
            }
            
            let selectedChoice = choices.split('\n')[parseInt(userChoice) - 1];
            console.log(`\nYou chose: ${selectedChoice}`);
            
            let outcome = await this.generateContent(`Based on the scenario: "${story}" and the player's choice: "${selectedChoice}", generate a unique outcome and a new scenario:`);
            console.log(outcome);
            story = outcome;  // Update the story for the next iteration
        }
        
        console.log("\nCongratulations! You've completed your unique adventure!");
    }

    async playGame() {
        console.log("Welcome to the Local LLM-powered Choose Your Own Adventure Game!");
        console.log("In this game, you'll make choices that shape your unique story.");
        console.log("Every game is different, powered by AI storytelling.");
        console.log("Let's begin...\n");
        await this.generateStory();
        
        while (true) {
            let playAgain = await this.getUserInput("\nDo you want to play again? (yes/no): ");
            if (playAgain.toLowerCase() !== 'yes') {
                console.log("Thanks for playing! Goodbye!");
                this.rl.close();
                break;
            }
            console.log("\nStarting a new adventure...\n");
            await this.generateStory();
        }
    }

    getUserInput(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, (answer) => {
                resolve(answer);
            });
        });
    }
}

const game = new LocalLLMAdventureGame();
game.playGame();