// Sight Word Adventure - Main Application Logic

// ============================================
// Data Management & Storage
// ============================================

// Default word list (common sight words for early readers)
const DEFAULT_WORDS = [
    'the', 'and', 'a', 'to', 'said', 'in', 'he', 'I', 'of', 'it',
    'was', 'you', 'they', 'on', 'she', 'is', 'for', 'at', 'his', 'but',
    'that', 'with', 'all', 'we', 'can', 'are', 'up', 'had', 'my', 'her'
];

// Word states
const WORD_STATES = {
    NEW: 'new',
    LEARNING: 'learning',
    MASTERED: 'mastered',
    DISABLED: 'disabled'
};

// Storage keys
const STORAGE_KEYS = {
    WORDS: 'sightWords',
    STATS: 'appStats',
    CHALLENGE_DECK: 'challengeDeck'
};

// Initialize app data structure
function initializeAppData() {
    // Initialize words if not exists
    if (!localStorage.getItem(STORAGE_KEYS.WORDS)) {
        const initialWords = DEFAULT_WORDS.map(word => ({
            text: word,
            state: WORD_STATES.NEW,
            correctCount: 0,
            missedCount: 0,
            lastPracticed: null,
            sessionMisses: 0
        }));
        localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(initialWords));
    }

    // Initialize stats if not exists
    if (!localStorage.getItem(STORAGE_KEYS.STATS)) {
        const initialStats = {
            totalSessions: 0,
            totalPoints: 0,
            totalWordsCorrect: 0,
            totalWordsMissed: 0
        };
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(initialStats));
    }

    // Initialize challenge deck if not exists
    if (!localStorage.getItem(STORAGE_KEYS.CHALLENGE_DECK)) {
        localStorage.setItem(STORAGE_KEYS.CHALLENGE_DECK, JSON.stringify([]));
    }
}

// Get all words
function getWords() {
    const words = localStorage.getItem(STORAGE_KEYS.WORDS);
    return words ? JSON.parse(words) : [];
}

// Save words
function saveWords(words) {
    localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
}

// Get stats
function getStats() {
    const stats = localStorage.getItem(STORAGE_KEYS.STATS);
    return stats ? JSON.parse(stats) : null;
}

// Save stats
function saveStats(stats) {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
}

// Get challenge deck
function getChallengeDeck() {
    const deck = localStorage.getItem(STORAGE_KEYS.CHALLENGE_DECK);
    return deck ? JSON.parse(deck) : [];
}

// Save challenge deck
function saveChallengeDeck(deck) {
    localStorage.setItem(STORAGE_KEYS.CHALLENGE_DECK, JSON.stringify(deck));
}

// Add word to challenge deck
function addToChallengeDeck(wordText) {
    const deck = getChallengeDeck();
    if (!deck.includes(wordText)) {
        deck.push(wordText);
        saveChallengeDeck(deck);
    }
}

// Remove word from challenge deck
function removeFromChallengeDeck(wordText) {
    let deck = getChallengeDeck();
    deck = deck.filter(w => w !== wordText);
    saveChallengeDeck(deck);
}

// ============================================
// Session Management
// ============================================

let currentSession = {
    words: [],
    currentIndex: 0,
    correctCount: 0,
    missedCount: 0,
    streak: 0,
    points: 0
};

const SESSION_SIZE = 10;
const POINTS_PER_WORD = 10;
const CHALLENGE_THRESHOLD = 2; // Misses needed to add to challenge deck

// Create a new session
function createSession() {
    const words = getWords().filter(w => w.state !== WORD_STATES.DISABLED);
    const challengeDeck = getChallengeDeck();
    
    let sessionWords = [];
    
    // First, add words from challenge deck (prioritize)
    const challengeWords = words.filter(w => challengeDeck.includes(w.text));
    sessionWords.push(...challengeWords.slice(0, Math.min(5, challengeWords.length)));
    
    // Then fill with other words (prefer learning and new)
    const remainingWords = words.filter(w => !challengeDeck.includes(w.text));
    const learningWords = remainingWords.filter(w => w.state === WORD_STATES.LEARNING);
    const newWords = remainingWords.filter(w => w.state === WORD_STATES.NEW);
    const masteredWords = remainingWords.filter(w => w.state === WORD_STATES.MASTERED);
    
    const remainingSlots = SESSION_SIZE - sessionWords.length;
    const otherWords = [...learningWords, ...newWords, ...masteredWords];
    
    // Shuffle for variety
    for (let i = otherWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherWords[i], otherWords[j]] = [otherWords[j], otherWords[i]];
    }
    
    sessionWords.push(...otherWords.slice(0, remainingSlots));
    
    currentSession = {
        words: sessionWords.slice(0, SESSION_SIZE),
        currentIndex: 0,
        correctCount: 0,
        missedCount: 0,
        streak: 0,
        points: 0
    };
    
    // Reset session misses only for words in this session
    const allWords = getWords();
    currentSession.words.forEach(sessionWord => {
        const wordIndex = allWords.findIndex(w => w.text === sessionWord.text);
        if (wordIndex !== -1) {
            allWords[wordIndex].sessionMisses = 0;
        }
    });
    saveWords(allWords);
    
    return currentSession;
}

// Handle word response
function handleWordResponse(correct) {
    const currentWord = currentSession.words[currentSession.currentIndex];
    const words = getWords();
    const wordIndex = words.findIndex(w => w.text === currentWord.text);
    
    if (wordIndex !== -1) {
        const word = words[wordIndex];
        
        if (correct) {
            word.correctCount++;
            currentSession.correctCount++;
            currentSession.streak++;
            currentSession.points += POINTS_PER_WORD;
            
            // Update word state based on performance
            if (word.correctCount >= 5 && word.state !== WORD_STATES.MASTERED) {
                word.state = WORD_STATES.MASTERED;
                removeFromChallengeDeck(word.text);
            } else if (word.state === WORD_STATES.NEW) {
                word.state = WORD_STATES.LEARNING;
            }
        } else {
            word.missedCount++;
            word.sessionMisses++;
            currentSession.missedCount++;
            currentSession.streak = 0;
            
            // Add to challenge deck if missed multiple times
            if (word.sessionMisses >= CHALLENGE_THRESHOLD) {
                addToChallengeDeck(word.text);
            }
            
            // Keep in learning state if struggling
            if (word.state === WORD_STATES.MASTERED && word.missedCount > 2) {
                word.state = WORD_STATES.LEARNING;
            }
        }
        
        word.lastPracticed = new Date().toISOString();
        words[wordIndex] = word;
        saveWords(words);
    }
}

// Complete session
function completeSession() {
    const stats = getStats();
    stats.totalSessions++;
    stats.totalWordsCorrect += currentSession.correctCount;
    stats.totalWordsMissed += currentSession.missedCount;
    stats.totalPoints += currentSession.points;
    saveStats(stats);
}

// ============================================
// Toast Notification System
// ============================================

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// Text-to-Speech
// ============================================

function speakWord(word) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.8; // Slower for children
        utterance.pitch = 1.1; // Slightly higher pitch
        utterance.volume = 1;
        
        window.speechSynthesis.speak(utterance);
    }
}

// ============================================
// UI Management
// ============================================

// Screen elements
const screens = {
    welcome: document.getElementById('welcome-screen'),
    learning: document.getElementById('learning-screen'),
    summary: document.getElementById('summary-screen'),
    dashboard: document.getElementById('dashboard-screen')
};

// Show specific screen
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    if (screens[screenName]) {
        screens[screenName].classList.remove('hidden');
    }
}

// ============================================
// Welcome Screen
// ============================================

document.getElementById('start-session-btn').addEventListener('click', () => {
    createSession();
    showLearningScreen();
});

document.getElementById('parent-dashboard-btn').addEventListener('click', () => {
    showDashboardScreen();
});

// ============================================
// Learning Screen
// ============================================

function showLearningScreen() {
    showScreen('learning');
    displayCurrentWord();
}

function displayCurrentWord() {
    const { words, currentIndex } = currentSession;
    
    if (currentIndex >= words.length) {
        showSummaryScreen();
        return;
    }
    
    const word = words[currentIndex];
    const wordDisplay = document.getElementById('word-display');
    const feedbackIcon = document.getElementById('feedback-icon');
    
    // Update word display
    wordDisplay.textContent = word.text;
    feedbackIcon.textContent = '';
    
    // Update progress
    document.getElementById('word-counter').textContent = `Word ${currentIndex + 1} of ${words.length}`;
    document.getElementById('streak-counter').textContent = `🔥 Streak: ${currentSession.streak}`;
    
    const progressPercent = ((currentIndex) / words.length) * 100;
    document.getElementById('progress-fill').style.width = `${progressPercent}%`;
    
    // Auto-speak word after 5 seconds
    setTimeout(() => {
        if (currentSession.currentIndex === currentIndex) {
            speakWord(word.text);
        }
    }, 5000);
}

document.getElementById('got-it-btn').addEventListener('click', () => {
    handleWordResponse(true);
    showFeedback(true);
    setTimeout(() => {
        currentSession.currentIndex++;
        displayCurrentWord();
    }, 1500);
});

document.getElementById('need-help-btn').addEventListener('click', () => {
    const word = currentSession.words[currentSession.currentIndex];
    speakWord(word.text);
    handleWordResponse(false);
    showFeedback(false);
    setTimeout(() => {
        currentSession.currentIndex++;
        displayCurrentWord();
    }, 1500);
});

document.getElementById('hear-word-btn').addEventListener('click', () => {
    const word = currentSession.words[currentSession.currentIndex];
    speakWord(word.text);
});

function showFeedback(correct) {
    const feedbackIcon = document.getElementById('feedback-icon');
    if (correct) {
        feedbackIcon.textContent = '✓';
        feedbackIcon.style.color = '#4CAF50';
    } else {
        feedbackIcon.textContent = '○';
        feedbackIcon.style.color = '#FF9800';
    }
}

// ============================================
// Summary Screen
// ============================================

function showSummaryScreen() {
    completeSession();
    showScreen('summary');
    
    document.getElementById('words-attempted').textContent = currentSession.words.length;
    document.getElementById('words-correct').textContent = currentSession.correctCount;
    document.getElementById('words-missed').textContent = currentSession.missedCount;
    document.getElementById('points-earned').textContent = currentSession.points;
}

document.getElementById('finish-session-btn').addEventListener('click', () => {
    showScreen('welcome');
});

// ============================================
// Dashboard Screen
// ============================================

function showDashboardScreen() {
    showScreen('dashboard');
    updateDashboardStats();
    updateChallengeDeckDisplay();
    updateAllWordsDisplay();
}

function updateDashboardStats() {
    const words = getWords();
    const stats = getStats();
    const challengeDeck = getChallengeDeck();
    
    const masteredCount = words.filter(w => w.state === WORD_STATES.MASTERED).length;
    
    document.getElementById('total-mastered').textContent = masteredCount;
    document.getElementById('total-sessions').textContent = stats.totalSessions;
    document.getElementById('challenge-deck-count').textContent = challengeDeck.length;
}

function updateChallengeDeckDisplay() {
    const challengeDeck = getChallengeDeck();
    const words = getWords();
    const container = document.getElementById('challenge-words-list');
    
    if (challengeDeck.length === 0) {
        container.innerHTML = '<p class="empty-message">No words in challenge deck yet!</p>';
        return;
    }
    
    container.innerHTML = '';
    challengeDeck.forEach(wordText => {
        const word = words.find(w => w.text === wordText);
        if (word) {
            const wordItem = createWordListItem(word, true);
            container.appendChild(wordItem);
        }
    });
}

function updateAllWordsDisplay(filter = 'all') {
    const words = getWords();
    const container = document.getElementById('all-words-list');
    
    let filteredWords = words;
    if (filter !== 'all') {
        filteredWords = words.filter(w => w.state === filter);
    }
    
    container.innerHTML = '';
    filteredWords.forEach(word => {
        const wordItem = createWordListItem(word, false);
        container.appendChild(wordItem);
    });
}

function createWordListItem(word, isChallenge) {
    const div = document.createElement('div');
    div.className = 'word-item';
    
    const info = document.createElement('div');
    info.className = 'word-info';
    
    const text = document.createElement('div');
    text.className = 'word-text';
    text.textContent = word.text;
    
    const status = document.createElement('span');
    status.className = `word-status ${word.state}`;
    status.textContent = word.state.charAt(0).toUpperCase() + word.state.slice(1);
    
    const stats = document.createElement('div');
    stats.style.fontSize = '12px';
    stats.style.color = '#999';
    stats.textContent = `Correct: ${word.correctCount} | Missed: ${word.missedCount}`;
    
    info.appendChild(text);
    info.appendChild(status);
    info.appendChild(stats);
    
    const actions = document.createElement('div');
    actions.className = 'word-actions';
    
    if (!isChallenge) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn btn-danger';
        toggleBtn.textContent = word.state === WORD_STATES.DISABLED ? 'Enable' : 'Disable';
        toggleBtn.addEventListener('click', () => {
            toggleWordState(word.text);
        });
        actions.appendChild(toggleBtn);
    }
    
    div.appendChild(info);
    div.appendChild(actions);
    
    return div;
}

function toggleWordState(wordText) {
    const words = getWords();
    const wordIndex = words.findIndex(w => w.text === wordText);
    
    if (wordIndex !== -1) {
        const word = words[wordIndex];
        if (word.state === WORD_STATES.DISABLED) {
            word.state = WORD_STATES.LEARNING;
        } else {
            word.state = WORD_STATES.DISABLED;
            removeFromChallengeDeck(word.text);
        }
        words[wordIndex] = word;
        saveWords(words);
        updateDashboardStats();
        updateChallengeDeckDisplay();
        updateAllWordsDisplay();
    }
}

document.getElementById('back-to-home-btn').addEventListener('click', () => {
    showScreen('welcome');
});

// Add new word
document.getElementById('add-word-btn').addEventListener('click', () => {
    const input = document.getElementById('new-word-input');
    const wordText = input.value.trim().toLowerCase();
    
    if (!wordText) {
        showToast('Please enter a word', 'error');
        return;
    }
    
    const words = getWords();
    if (words.some(w => w.text === wordText)) {
        showToast('This word already exists', 'error');
        return;
    }
    
    const newWord = {
        text: wordText,
        state: WORD_STATES.NEW,
        correctCount: 0,
        missedCount: 0,
        lastPracticed: null,
        sessionMisses: 0
    };
    
    words.push(newWord);
    saveWords(words);
    
    input.value = '';
    updateDashboardStats();
    updateAllWordsDisplay();
    
    showToast(`Word "${wordText}" added successfully!`, 'success');
});

// Word filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const filter = e.target.dataset.filter;
        updateAllWordsDisplay(filter);
    });
});

// ============================================
// Service Worker Registration
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// ============================================
// Initialize App
// ============================================

initializeAppData();
showScreen('welcome');
