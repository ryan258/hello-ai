// This program helps you learn new words and phrases using flashcards and a smart computer helper.

const readline = require('readline');
const fs = require('fs').promises;
const axios = require('axios');
require('dotenv').config();

// This part helps us decide when to show you each flashcard again
class SpacedRepetition {
    static calculateInterval(repetitions, easiness, interval) {
        if (repetitions === 0) return 1;
        if (repetitions === 1) return 6;
        return Math.round(interval * easiness);
    }

    static updateEasiness(easiness, quality) {
        return Math.max(1.3, easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    }
}

// This is what each flashcard looks like in our program
class Flashcard {
    constructor(front, back) {
        this.front = front; // The question side of the card
        this.back = back;   // The answer side of the card
        this.easiness = 2.5;
        this.interval = 0;
        this.repetitions = 0;
        this.nextReview = new Date();
    }

    review(quality) {
        this.easiness = SpacedRepetition.updateEasiness(this.easiness, quality);
        if (quality >= 3) {
            this.interval = SpacedRepetition.calculateInterval(this.repetitions, this.easiness, this.interval);
            this.repetitions++;
        } else {
            this.repetitions = 0;
            this.interval = 1;
        }
        this.nextReview = new Date(Date.now() + this.interval * 24 * 60 * 60 * 1000);
    }
}

// This is like a box that holds all of your flashcards
class FlashcardDeck {
    constructor(name) {
        this.name = name;
        this.cards = [];
    }

    addCard(front, back) {
        this.cards.push(new Flashcard(front, back));
    }

    getNextCard() {
        const now = new Date();
        return this.cards.find(card => card.nextReview <= now) || null;
    }

    async save() {
        await fs.writeFile(`${this.name}.json`, JSON.stringify(this.cards, null, 2));
    }

    static async load(name) {
        try {
            const data = await fs.readFile(`${name}.json`, 'utf8');
            const deck = new FlashcardDeck(name);
            deck.cards = JSON.parse(data).map(card => Object.assign(new Flashcard(), card));
            return deck;
        } catch (error) {
            if (error.code === 'ENOENT') {
                return new FlashcardDeck(name);
            }
            throw error;
        }
    }
}

// This part talks to the smart computer to get new flashcard ideas
async function generateText(prompt, agentName) {
    const url = process.env.API_URL || 'http://localhost:11434/api/generate';
    const data = {
        model: process.env.MODEL_NAME || 'llama3.1:latest',
        prompt: prompt,
        stream: false,
        max_tokens: 300,
        temperature: 0.7
    };
    
    try {
        const response = await axios.post(url, data);
        console.log(`\n--- ${agentName} output ---`);
        console.log(response.data.response);
        console.log(`--- End of ${agentName} output ---\n`);
        return response.data.response;
    } catch (error) {
        console.error(`Error with ${agentName}:`, error);
        throw error;
    }
}

// This helper creates new vocabulary flashcards
class VocabularyGeneratorAgent {
    static async generate(language, topic, count) {
        const prompt = `Generate ${count} vocabulary words or phrases in ${language} related to the topic "${topic}". 
        For each word or phrase, provide:
        1. The word or phrase in ${language}
        2. Its English translation
        3. A brief example sentence in ${language}
        Format each entry as: "${language} word/phrase | English translation | Example sentence"`;

        const response = await generateText(prompt, "Vocabulary Generator Agent");
        const lines = response.split('\n').filter(line => line.trim() !== '');
        
        let flashcards = [];
        let currentCard = {};

        for (const line of lines) {
            if (line.includes('|')) {
                // This line contains the main flashcard information
                const parts = line.split('|').map(part => part.trim());
                if (parts.length >= 2) {
                    currentCard = {
                        front: parts[0],
                        back: parts[1],
                        example: parts[2] || ''
                    };
                    flashcards.push(currentCard);
                }
            } else if (line.startsWith('Translation:') && currentCard.example) {
                // This line contains the translation of the example sentence
                currentCard.example += ' ' + line;
            }
        }

        return flashcards.filter(card => card.front && card.back);
    }
}

// This helper creates new grammar exercise flashcards
class GrammarExerciseGeneratorAgent {
    static async generate(language, grammarPoint, count) {
        const prompt = `Create ${count} grammar exercise flashcards for ${language} focusing on "${grammarPoint}".
        For each flashcard, provide:
        1. A sentence in English that tests the grammar point
        2. The correct translation in ${language}
        Format each entry as: "English sentence | Correct ${language} translation"`;

        const response = await generateText(prompt, "Grammar Exercise Generator Agent");
        const lines = response.split('\n').filter(line => line.trim() !== '');
        return lines.map(line => {
            const parts = line.split('|').map(part => part.trim());
            if (parts.length === 2) {
                return parts;
            } else {
                console.log(`Skipping improperly formatted line: ${line}`);
                return null;
            }
        }).filter(item => item !== null);
    }
}

// This is the main part of our program that runs everything
class FlashcardApp {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.deck = null;
    }

    async start() {
        console.log('Welcome to the AI-Enhanced Language Learning Flashcard App!');
        await this.loadOrCreateDeck();
        this.mainMenu();
    }

    async loadOrCreateDeck() {
        const deckName = await this.ask('Enter the name of your flashcard deck:');
        this.deck = await FlashcardDeck.load(deckName);
        console.log(`Loaded deck: ${this.deck.name} with ${this.deck.cards.length} cards.`);
    }

    mainMenu() {
        console.log('\n--- Main Menu ---');
        console.log('1. Review cards');
        console.log('2. Add new card manually');
        console.log('3. Generate vocabulary flashcards');
        console.log('4. Generate grammar exercise flashcards');
        console.log('5. Exit');
        this.rl.question('Choose an option: ', (answer) => {
            switch (answer) {
                case '1':
                    this.reviewCards();
                    break;
                case '2':
                    this.addNewCard();
                    break;
                case '3':
                    this.generateVocabularyFlashcards();
                    break;
                case '4':
                    this.generateGrammarFlashcards();
                    break;
                case '5':
                    this.exit();
                    break;
                default:
                    console.log('Invalid option. Please try again.');
                    this.mainMenu();
            }
        });
    }

    async reviewCards() {
        const card = this.deck.getNextCard();
        if (!card) {
            console.log('No cards due for review. Great job!');
            this.mainMenu();
            return;
        }

        console.log(`\nFront: ${card.front}`);
        const answer = await this.ask('Your answer (press Enter to see the back):');
        console.log(`Back: ${card.back}`);
        
        const quality = parseInt(await this.ask('Rate your recall (0-5, 0=complete blackout, 5=perfect recall):'));
        card.review(quality);
        await this.deck.save();

        this.rl.question('Press Enter to continue...', () => {
            this.reviewCards();
        });
    }

    async addNewCard() {
        const front = await this.ask('Enter the front of the card:');
        const back = await this.ask('Enter the back of the card:');
        this.deck.addCard(front, back);
        await this.deck.save();
        console.log('Card added successfully!');
        this.mainMenu();
    }

    async generateVocabularyFlashcards() {
        const language = await this.ask('Enter the target language:');
        const topic = await this.ask('Enter the vocabulary topic:');
        const count = parseInt(await this.ask('How many flashcards do you want to generate?'));

        const flashcards = await VocabularyGeneratorAgent.generate(language, topic, count);
        let addedCount = 0;
        for (const card of flashcards) {
            if (card.front && card.back) {
                const frontContent = card.example 
                    ? `${card.front}\nExample: ${card.example}`
                    : card.front;
                this.deck.addCard(frontContent, card.back);
                addedCount++;
            }
        }

        await this.deck.save();
        console.log(`${addedCount} vocabulary flashcards added successfully!`);
        this.mainMenu();
    }

    async generateGrammarFlashcards() {
        const language = await this.ask('Enter the target language:');
        const grammarPoint = await this.ask('Enter the grammar point to focus on:');
        const count = parseInt(await this.ask('How many flashcards do you want to generate?'));

        const flashcards = await GrammarExerciseGeneratorAgent.generate(language, grammarPoint, count);
        let addedCount = 0;
        for (const [front, back] of flashcards) {
            if (front && back) {
                this.deck.addCard(front, back);
                addedCount++;
            }
        }

        await this.deck.save();
        console.log(`${addedCount} grammar exercise flashcards added successfully!`);
        this.mainMenu();
    }

    ask(question) {
        return new Promise((resolve) => {
            this.rl.question(question + ' ', resolve);
        });
    }

    exit() {
        console.log('Thank you for using the AI-Enhanced Language Learning Flashcard App. Goodbye!');
        this.rl.close();
    }
}

// This starts the whole program
const app = new FlashcardApp();
app.start();