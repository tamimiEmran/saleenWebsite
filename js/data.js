// Data storage (in memory)
let articles = [];
let currentConfession = '';
let probability = 30; // Default to 30% instead of 50%
let confessionHistory = []; // Store confession history

// Sample confessions
const confessions = [
    "I sometimes eat your snacks and pretend I don't know where they went",
    "I secretly love it when you sing in the shower",
    "I've been saving screenshots of our cute conversations",
    "I think about you every morning when I wake up",
    "I pretend to be asleep sometimes just to hear you whisper sweet things",
    "I've planned our future together in my head a thousand times",
    "I love the way you laugh at your own jokes",
    "I keep the notes you write me in a special box",
    "I sometimes watch you sleep because you look so peaceful",
    "I've told my friends embarrassing stories about us (but only the cute ones)",
    "I practice what I'm going to say to you before important conversations",
    "I love how excited you get about little things",
    "I've been learning about your hobbies secretly to surprise you",
    "I think you're most beautiful when you're not trying to be",
    "I've written poems about you that I'm too shy to share"
];

// Concept suggestions
let concepts = [
    "symbols", "metaphors", "narratives", 'marriage as codependency', 'emotional disregulation', "Life as simulation"
];

let selectedConcepts = [];
// Grievance submissions
let grievances = [];