# Product Requirements Document: Sight Word Adventure PWA

**Author:** GitHub Copilot  
**Date:** 2026-01-11  
**Version:** 1.0

---

## 1. Introduction & Vision

### 1.1. Vision
To create a fun, engaging, and effective learning experience that helps young children master sight words, building a strong foundation for reading proficiency.

### 1.2. Problem Statement
Young children, particularly those learning to read, need to memorize a set of common "sight words" that don't always follow standard phonetic rules. Rote memorization can be tedious and unengaging. Parents need a way to support this learning process and track their child's progress effectively.

### 1.3. Solution
A Progressive Web App (PWA) called "Sight Word Adventure" that transforms learning sight words into a delightful game. The app will use visual cues, auditory feedback, and gamification to keep children motivated. A built-in spaced repetition system will ensure that difficult words are revisited, while a parent dashboard will provide insights into the child's learning journey.

## 2. Target Audience

* **Primary User (The Learner):** Children aged 4-7 who are beginning to learn to read. They need a simple, visually stimulating, and forgiving interface that feels like a game, not a test.
* **Secondary User (The Administrator):** Parents or guardians who will set up the app, monitor progress, and potentially customize the word lists. They need a simple, clear interface to view analytics and manage the app's content.

## 3. Core Features

### 3.1. The Learning Loop (Game Mode)
This is the core experience for the child.

* **Word Presentation:** A single sight word is displayed prominently on the screen in a large, clear, child-friendly font.
* **Listening Phase:** The app silently waits for a few seconds (e.g., 5 seconds) for the child to attempt to read the word aloud. The app will use the device's microphone to listen for a response.
* **Auto-Voicing:** If no speech is detected after the waiting period, the app will use text-to-speech to clearly pronounce the word.
* **Input & Feedback:**
  * **Success:** If the child says the word correctly, the app provides immediate positive reinforcement: cheerful sounds, a "correct" animation (e.g., a starburst), and points are awarded. The card is marked as "learned."
  * **Failure:** If the child says the wrong word or the app voices the word, the app provides gentle encouragement. The word is marked as "failed" for the current session.
* **Progression:** A new word is presented, continuing the loop. A session consists of a set number of words (e.g., 10-15 words).

### 3.2. Spaced Repetition & The "Challenge Deck"
The app will intelligently manage which words the child sees.

* **Word States:** Each word in the library will have a status: `new`, `learning`, `mastered`.
* **Challenge Deck:** Any word that is "failed" twice in a row or consistently missed over several sessions is added to a special "Challenge Deck."
* **Next-Day Review:** The next day's session will automatically prioritize words from the "Challenge Deck" to reinforce learning.

### 3.3. Parent Dashboard
A password-protected or separately accessed page for the parent.

* **Progress Overview:** A summary of the child's activity, including:
  * Total words mastered.
  * Number of sessions completed.
  * Average accuracy per session.
* **Word Status Report:** A list of all words, filterable by their status (`new`, `learning`, `mastered`).
* **"Words to Watch":** A clear list of words currently in the "Challenge Deck," allowing the parent to know which words the child is struggling with.
* **Activity Timeline:** A simple chart showing session frequency and duration over the last week/month.

### 3.4. Word Bank Management
Within the Parent Dashboard, parents can:

* View the default list of sight words.
* Add new custom words (e.g., family names, words from a school list).
* Disable specific words they don't want to appear.

## 4. Gamification & Child Psychology

* **Points & Streaks:** Award points for correct answers. Celebrate consecutive correct answers with a "streak" bonus and visual flair.
* **Visual Rewards:** For completing a session or mastering a set number of words, the child earns a sticker or star to place on a "Sticker Book" page. This provides a tangible sense of accomplishment.
* **Friendly Mascot:** A simple, animated character guides the child, offers encouragement ("You can do it!"), and celebrates successes.
* **Positive Reinforcement:** The app's language and feedback are always positive and encouraging. Failure is treated as a learning opportunity, not a mistake. For example, instead of "Wrong," the mascot could say, "Let's try that one again!"
* **Short, Focused Sessions:** Keep learning sessions short (5-10 minutes) to align with a young child's attention span. A visual progress bar shows how many words are left in the session.

## 5. Technical Requirements

* **Platform:** Progressive Web App (PWA). This ensures it's installable on a home screen, works offline, and is accessible via a simple URL without needing an app store.
* **Frontend:** HTML5, CSS3, JavaScript. No complex frameworks are necessary, keeping it lightweight.
* **Web APIs:**
  * **Web Speech API (SpeechSynthesis):** For text-to-speech to voice the words.
  * **Web Speech API (SpeechRecognition):** To listen for and recognize the child's spoken words. A fallback "tap to continue" button should be available if microphone access is denied or fails.
* **Storage:** Browser `localStorage` or `IndexedDB` is sufficient to store the word lists, progress data, and earned rewards on the user's device. No backend database is required for this phase.
* **Deployment:** Can be hosted as a static site on services like GitHub Pages, Netlify, or Vercel.

## 6. Success Metrics

* **Engagement:** Daily/Weekly sessions per user.
* **Efficacy:**
  * Number of words moved from `learning` to `mastered` status per week.
  * Reduction in the size of the "Challenge Deck" over time.
* **Retention:** The child voluntarily asks to use the app.

## 7. Future Enhancements (V2 and beyond)

* **Multiple Child Profiles:** Allow parents to create separate profiles for multiple children.
* **Pre-loaded Word Lists:** Integrate standard sight word lists (e.g., Dolch, Fry) that parents can choose from.
* **Advanced Game Modes:** Introduce new games, like matching the spoken word to a written word from a selection of three.
* **Customizable Themes:** Allow the child to choose different color schemes or mascots.
