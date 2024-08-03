// File: flashcard-app.js

const readline = require('readline');
const fs = require('fs').promises;

// Spaced Repetition Algorithm (SM-2)
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

class Flashcard {
    constructor(front, back) {
        this.front = front;
        this.back = back;
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

class FlashcardApp {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.deck = null;
    }

    async start() {
        console.log('Welcome to the Language Learning Flashcard App!');
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
        console.log('2. Add new card');
        console.log('3. Exit');
        this.rl.question('Choose an option: ', (answer) => {
            switch (answer) {
                case '1':
                    this.reviewCards();
                    break;
                case '2':
                    this.addNewCard();
                    break;
                case '3':
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

    ask(question) {
        return new Promise((resolve) => {
            this.rl.question(question + ' ', resolve);
        });
    }

    exit() {
        console.log('Thank you for using the Language Learning Flashcard App. Goodbye!');
        this.rl.close();
    }
}

// Run the app
const app = new FlashcardApp();
app.start();