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
// Speech Recognition (Non-AI Validation)
// ============================================

let recognition = null;
let isListening = false;

// Initialize speech recognition if available
function initializeSpeechRecognition() {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.log('Speech Recognition not supported in this browser');
        return false;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.lang = 'en-US';
    
    return true;
}

// Calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }
    
    // Calculate distances
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    
    return matrix[len1][len2];
}

// Compare spoken word to target word
function compareWords(spoken, target) {
    // Normalize both words
    spoken = spoken.toLowerCase().trim();
    target = target.toLowerCase().trim();
    
    // Exact match
    if (spoken === target) {
        return { match: true, confidence: 1.0 };
    }
    
    // Calculate similarity using Levenshtein distance
    const distance = levenshteinDistance(spoken, target);
    const maxLength = Math.max(spoken.length, target.length);
    const similarity = 1 - (distance / maxLength);
    
    // Accept if similarity is high enough (80% threshold for children)
    // This allows for minor pronunciation differences
    const match = similarity >= 0.8;
    
    return { match, confidence: similarity };
}

// Start listening for speech
function startSpeechRecognition() {
    if (!recognition || isListening) return;
    
    const speakBtn = document.getElementById('speak-word-btn');
    const targetWord = currentSession.words[currentSession.currentIndex].text;
    
    isListening = true;
    speakBtn.classList.add('listening');
    speakBtn.textContent = '🎤 Listening...';
    
    // Clear countdown when user starts speaking
    clearCountdown();
    
    recognition.onresult = (event) => {
        const results = event.results[0];
        let bestMatch = null;
        let bestConfidence = 0;
        
        // Check all alternatives for best match
        for (let i = 0; i < results.length; i++) {
            const transcript = results[i].transcript;
            const words = transcript.toLowerCase().split(/\s+/);
            
            // Check each word in the transcript
            for (const word of words) {
                const comparison = compareWords(word, targetWord);
                if (comparison.match && comparison.confidence > bestConfidence) {
                    bestMatch = word;
                    bestConfidence = comparison.confidence;
                }
            }
        }
        
        stopSpeechRecognition();
        
        if (bestMatch) {
            // Success! They said the word correctly
            handleWordResponse(true);
            showFeedback(true);
            showToast(`Great job! You said "${bestMatch}"`, 'success');
            setTimeout(proceedToNextWord, 1500);
        } else {
            // Didn't match - encourage them to try again
            const transcript = results[0].transcript;
            showToast(`I heard "${transcript}". Try saying "${targetWord}"`, 'info');
        }
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopSpeechRecognition();
        
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            showToast('Microphone access denied. Please enable it in browser settings.', 'error');
        } else if (event.error === 'no-speech') {
            showToast('No speech detected. Try again!', 'info');
        } else {
            showToast('Speech recognition error. Use the buttons below instead.', 'error');
        }
    };
    
    recognition.onend = () => {
        stopSpeechRecognition();
    };
    
    try {
        recognition.start();
    } catch (error) {
        console.error('Failed to start recognition:', error);
        stopSpeechRecognition();
        showToast('Could not start speech recognition. Use the buttons below.', 'error');
    }
}

// Stop listening
function stopSpeechRecognition() {
    if (!recognition) return;
    
    isListening = false;
    const speakBtn = document.getElementById('speak-word-btn');
    if (speakBtn) {
        speakBtn.classList.remove('listening');
        speakBtn.textContent = '🎤 Say the word';
    }
    
    try {
        recognition.stop();
    } catch (error) {
        // Ignore errors when stopping
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

let countdownInterval = null;

function showLearningScreen() {
    showScreen('learning');
    
    // Check if speech recognition is available and show/hide button accordingly
    const speakBtn = document.getElementById('speak-word-btn');
    const speechAvailable = initializeSpeechRecognition();
    
    if (speechAvailable) {
        speakBtn.style.display = 'block';
    } else {
        speakBtn.style.display = 'none';
    }
    
    displayCurrentWord();
}

function startCountdown(seconds, callback) {
    const timerElement = document.getElementById('countdown-timer');
    timerElement.classList.remove('hidden');
    let remaining = seconds;
    
    timerElement.textContent = remaining;
    
    countdownInterval = setInterval(() => {
        remaining--;
        if (remaining > 0) {
            timerElement.textContent = remaining;
        } else {
            clearInterval(countdownInterval);
            timerElement.classList.add('hidden');
            if (callback) callback();
        }
    }, 1000);
}

function clearCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    const timerElement = document.getElementById('countdown-timer');
    if (timerElement) {
        timerElement.classList.add('hidden');
    }
}

function displayCurrentWord() {
    const { words, currentIndex } = currentSession;
    
    if (currentIndex >= words.length) {
        showSummaryScreen();
        return;
    }
    
    // Clear any existing countdown
    clearCountdown();
    
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
    
    // Start countdown timer and auto-speak word after 5 seconds
    startCountdown(5, () => {
        if (currentSession.currentIndex === currentIndex) {
            speakWord(word.text);
        }
    });
}

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

function proceedToNextWord() {
    currentSession.currentIndex++;
    displayCurrentWord();
}

document.getElementById('got-it-btn').addEventListener('click', () => {
    clearCountdown();
    handleWordResponse(true);
    showFeedback(true);
    setTimeout(proceedToNextWord, 1500);
});

document.getElementById('need-help-btn').addEventListener('click', () => {
    clearCountdown();
    const word = currentSession.words[currentSession.currentIndex];
    speakWord(word.text);
    handleWordResponse(false);
    showFeedback(false);
    setTimeout(proceedToNextWord, 1500);
});

document.getElementById('hear-word-btn').addEventListener('click', () => {
    const word = currentSession.words[currentSession.currentIndex];
    speakWord(word.text);
});

document.getElementById('speak-word-btn').addEventListener('click', () => {
    startSpeechRecognition();
});

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

// Add new word function
function addNewWord() {
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
}

// Add new word - button click
document.getElementById('add-word-btn').addEventListener('click', addNewWord);

// Add new word - Enter key
document.getElementById('new-word-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addNewWord();
    }
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
