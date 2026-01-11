// Sight Word Adventure - Main Application Logic

// ============================================
// Data Management & Storage
// ============================================

// Chapter definitions - organizing sight words into progressive learning chapters
const CHAPTERS = [
    {
        id: 1,
        name: "Starting Out",
        description: "The most common and essential sight words",
        words: ['the', 'and', 'a', 'to', 'in', 'I', 'is', 'it', 'you', 'of']
    },
    {
        id: 2,
        name: "Simple Actions",
        description: "Basic action words we use every day",
        words: ['go', 'see', 'can', 'we', 'my', 'he', 'she', 'me', 'up', 'at']
    },
    {
        id: 3,
        name: "More Basics",
        description: "Building on what you know",
        words: ['was', 'on', 'they', 'but', 'had', 'all', 'are', 'for', 'his', 'her']
    },
    {
        id: 4,
        name: "Common Verbs",
        description: "Action words for everyday activities",
        words: ['look', 'come', 'get', 'said', 'with', 'do', 'make', 'run', 'play', 'help']
    },
    {
        id: 5,
        name: "Question Words",
        description: "Words that help us ask questions",
        words: ['what', 'who', 'where', 'when', 'why', 'how', 'which', 'an', 'as', 'be']
    },
    {
        id: 6,
        name: "Direction & Place",
        description: "Words about where things are",
        words: ['here', 'there', 'out', 'down', 'up', 'into', 'over', 'under', 'from', 'about']
    },
    {
        id: 7,
        name: "More Actions",
        description: "Learning more things we can do",
        words: ['jump', 'walk', 'stop', 'find', 'put', 'take', 'give', 'think', 'say', 'know']
    },
    {
        id: 8,
        name: "People & Things",
        description: "Words about us and our world",
        words: ['him', 'them', 'us', 'this', 'that', 'these', 'those', 'some', 'any', 'many']
    },
    {
        id: 9,
        name: "Describing Words",
        description: "Words that tell us about size and quality",
        words: ['big', 'little', 'good', 'bad', 'old', 'new', 'long', 'short', 'small', 'very']
    },
    {
        id: 10,
        name: "Numbers",
        description: "Counting words from one to ten",
        words: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
    },
    {
        id: 11,
        name: "Connecting Ideas",
        description: "Words that join thoughts together",
        words: ['or', 'if', 'so', 'not', 'yes', 'no', 'by', 'then', 'than', 'now']
    },
    {
        id: 12,
        name: "More Describing",
        description: "Even more ways to describe things",
        words: ['much', 'more', 'most', 'few', 'lots', 'only', 'just', 'other', 'every', 'each']
    },
    {
        id: 13,
        name: "Around & About",
        description: "More directional and location words",
        words: ['around', 'off', 'away', 'back', 'again', 'soon', 'right', 'left', 'before', 'after']
    },
    {
        id: 14,
        name: "Belonging",
        description: "Words about possession and ownership",
        words: ['our', 'your', 'their', 'my', 'his', 'her', 'me', 'us', 'them', 'its']
    },
    {
        id: 15,
        name: "Helping Verbs",
        description: "Words that help other verbs",
        words: ['has', 'have', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'must']
    },
    {
        id: 16,
        name: "Being & Doing",
        description: "More forms of verbs",
        words: ['been', 'being', 'want', 'like', 'let', 'went', 'made', 'came', 'call', 'ask']
    },
    {
        id: 17,
        name: "Advanced Connectors",
        description: "Complex connecting words",
        words: ['because', 'also', 'too', 'both', 'either', 'neither', 'while', 'until', 'since', 'well']
    },
    {
        id: 18,
        name: "Time & Frequency",
        description: "Words about when things happen",
        words: ['always', 'never', 'once', 'time', 'day']
    },
    {
        id: 19,
        name: "Ways & Means",
        description: "Words about how we do things",
        words: ['use', 'way', 'work', 'live', 'best']
    }
];

// Build flat word list with chapter assignments for backward compatibility
const DEFAULT_WORDS = [];
CHAPTERS.forEach(chapter => {
    DEFAULT_WORDS.push(...chapter.words);
});

// Helper function to get chapter ID for a word
function getWordChapterId(wordText) {
    for (const chapter of CHAPTERS) {
        if (chapter.words.includes(wordText)) {
            return chapter.id;
        }
    }
    return null; // For custom words added by users
}

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
    CHALLENGE_DECK: 'challengeDeck',
    CHAPTERS: 'chapterStates'
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
            sessionMisses: 0,
            chapterId: getWordChapterId(word)
        }));
        localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(initialWords));
    } else {
        // Migration: Add chapterId to existing words if not present
        const words = getWords();
        let needsUpdate = false;
        words.forEach(word => {
            if (word.chapterId === undefined) {
                word.chapterId = getWordChapterId(word.text);
                needsUpdate = true;
            }
        });
        if (needsUpdate) {
            saveWords(words);
        }
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

    // Initialize chapter states if not exists
    if (!localStorage.getItem(STORAGE_KEYS.CHAPTERS)) {
        const initialChapterStates = CHAPTERS.map(chapter => ({
            id: chapter.id,
            unlocked: chapter.id === 1 // Only first chapter unlocked by default
        }));
        localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(initialChapterStates));
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

// Get chapter states
function getChapterStates() {
    const states = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
    return states ? JSON.parse(states) : [];
}

// Save chapter states
function saveChapterStates(states) {
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(states));
}

// Get unlocked chapters
function getUnlockedChapters() {
    const chapterStates = getChapterStates();
    return chapterStates.filter(c => c.unlocked).map(c => c.id);
}

// Toggle chapter lock/unlock
function toggleChapterLock(chapterId) {
    const chapterStates = getChapterStates();
    const chapterState = chapterStates.find(c => c.id === chapterId);
    if (chapterState) {
        chapterState.unlocked = !chapterState.unlocked;
        saveChapterStates(chapterStates);
    }
}

// Get chapter progress
function getChapterProgress(chapterId) {
    const words = getWords();
    const chapter = CHAPTERS.find(c => c.id === chapterId);
    if (!chapter) return { total: 0, mastered: 0, learning: 0, new: 0 };
    
    const chapterWords = words.filter(w => w.chapterId === chapterId);
    const mastered = chapterWords.filter(w => w.state === WORD_STATES.MASTERED).length;
    const learning = chapterWords.filter(w => w.state === WORD_STATES.LEARNING).length;
    const newWords = chapterWords.filter(w => w.state === WORD_STATES.NEW).length;
    
    return {
        total: chapterWords.length,
        mastered: mastered,
        learning: learning,
        new: newWords
    };
}

// Check if next chapter should be unlocked
function checkAndUnlockNextChapter() {
    const chapterStates = getChapterStates();
    
    for (let i = 0; i < CHAPTERS.length - 1; i++) {
        const currentChapter = CHAPTERS[i];
        const currentState = chapterStates.find(c => c.id === currentChapter.id);
        const nextState = chapterStates.find(c => c.id === currentChapter.id + 1);
        
        // If current chapter is unlocked and next is locked
        if (currentState && currentState.unlocked && nextState && !nextState.unlocked) {
            const progress = getChapterProgress(currentChapter.id);
            // Unlock next chapter if 80% of current chapter is mastered
            if (progress.total > 0 && (progress.mastered / progress.total) >= 0.8) {
                nextState.unlocked = true;
                saveChapterStates(chapterStates);
                showToast(`🎉 Chapter ${nextState.id} "${CHAPTERS[i + 1].name}" unlocked!`, 'success');
            }
        }
    }
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
    const allWords = getWords();
    const unlockedChapterIds = getUnlockedChapters();
    
    // Filter words: enabled words from unlocked chapters only
    const words = allWords.filter(w => 
        w.state !== WORD_STATES.DISABLED && 
        (w.chapterId === null || unlockedChapterIds.includes(w.chapterId))
    );
    
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
    const allWordsForUpdate = getWords();
    currentSession.words.forEach(sessionWord => {
        const wordIndex = allWordsForUpdate.findIndex(w => w.text === sessionWord.text);
        if (wordIndex !== -1) {
            allWordsForUpdate[wordIndex].sessionMisses = 0;
        }
    });
    saveWords(allWordsForUpdate);
    
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
    
    // Check if any new chapters should be unlocked
    checkAndUnlockNextChapter();
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
    updateChaptersDisplay();
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

function updateChaptersDisplay() {
    const container = document.getElementById('chapters-list');
    if (!container) return;
    
    const chapterStates = getChapterStates();
    
    container.innerHTML = '';
    
    CHAPTERS.forEach(chapter => {
        const state = chapterStates.find(c => c.id === chapter.id);
        const isUnlocked = state ? state.unlocked : false;
        const progress = getChapterProgress(chapter.id);
        
        const chapterCard = document.createElement('div');
        chapterCard.className = `chapter-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        const header = document.createElement('div');
        header.className = 'chapter-header';
        
        const title = document.createElement('div');
        title.className = 'chapter-title';
        
        const lockIcon = document.createElement('span');
        lockIcon.className = 'chapter-lock-icon';
        lockIcon.textContent = isUnlocked ? '🔓' : '🔒';
        
        const name = document.createElement('span');
        name.textContent = `Chapter ${chapter.id}: ${chapter.name}`;
        
        title.appendChild(lockIcon);
        title.appendChild(name);
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn btn-secondary chapter-toggle-btn';
        toggleBtn.textContent = isUnlocked ? 'Lock' : 'Unlock';
        toggleBtn.addEventListener('click', () => {
            toggleChapterLock(chapter.id);
            updateChaptersDisplay();
            updateDashboardStats();
        });
        
        header.appendChild(title);
        header.appendChild(toggleBtn);
        
        const description = document.createElement('div');
        description.className = 'chapter-description';
        description.textContent = chapter.description;
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'chapter-progress';
        
        const progressText = document.createElement('div');
        progressText.className = 'chapter-progress-text';
        progressText.textContent = `Progress: ${progress.mastered}/${progress.total} mastered`;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'chapter-progress-bar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'chapter-progress-fill';
        const progressPercent = progress.total > 0 ? (progress.mastered / progress.total) * 100 : 0;
        progressFill.style.width = `${progressPercent}%`;
        
        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressText);
        progressContainer.appendChild(progressBar);
        
        const stats = document.createElement('div');
        stats.className = 'chapter-stats';
        stats.innerHTML = `
            <span class="stat-badge stat-new">New: ${progress.new}</span>
            <span class="stat-badge stat-learning">Learning: ${progress.learning}</span>
            <span class="stat-badge stat-mastered">Mastered: ${progress.mastered}</span>
        `;
        
        // Add recommendation if needed
        if (isUnlocked && progress.total > 0) {
            const recommendation = getChapterRecommendation(chapter.id, progress);
            if (recommendation) {
                const recDiv = document.createElement('div');
                recDiv.className = 'chapter-recommendation';
                recDiv.textContent = `💡 ${recommendation}`;
                chapterCard.appendChild(recDiv);
            }
        }
        
        chapterCard.appendChild(header);
        chapterCard.appendChild(description);
        chapterCard.appendChild(progressContainer);
        chapterCard.appendChild(stats);
        
        container.appendChild(chapterCard);
    });
}

function getChapterRecommendation(chapterId, progress) {
    const masteredPercent = progress.total > 0 ? (progress.mastered / progress.total) * 100 : 0;
    
    if (masteredPercent >= 80) {
        return "Great progress! Keep practicing to master all words.";
    } else if (masteredPercent >= 50) {
        return "You're doing well! Practice the remaining words to unlock the next chapter.";
    } else if (masteredPercent >= 20) {
        return "Keep going! Regular practice will help you progress faster.";
    } else if (progress.learning > 0) {
        return "Just getting started! Try practicing these words daily.";
    } else if (chapterId > 1 && masteredPercent < 20) {
        return "Having trouble? Consider reviewing previous chapters.";
    }
    return null;
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
    
    // Find chapter name if word has a chapter
    let chapterInfo = '';
    if (word.chapterId) {
        const chapter = CHAPTERS.find(c => c.id === word.chapterId);
        if (chapter) {
            chapterInfo = ` | Chapter ${chapter.id}: ${chapter.name}`;
        }
    } else {
        chapterInfo = ' | Custom Word';
    }
    
    stats.textContent = `Correct: ${word.correctCount} | Missed: ${word.missedCount}${chapterInfo}`;
    
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
