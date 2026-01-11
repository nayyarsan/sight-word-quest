# Sight Word Adventure 🌟

A Progressive Web App (PWA) to help children learn sight words through gamified practice with a parent dashboard for tracking progress.

## Features

### For Children 👧👦
- **Large, readable word display** - Easy to read for young learners
- **Countdown timer** - Visual 5-second countdown before words are spoken
- **Audio support** - Automatic word pronunciation after countdown
- **Speech recognition** - Say the word aloud and get instant validation (Chrome/Edge)
- **Simple controls** - "I got it right" and "I need help" buttons
- **Instant feedback** - Visual checkmarks and animations
- **Gamification** - Points, streaks, and encouraging end-of-session summaries
- **Progressive learning** - Words automatically move from new → learning → mastered

### For Parents 👪
- **Progress tracking** - See total words mastered and sessions completed
- **Challenge Deck** - Automatically identifies words that need more practice
- **Word management** - Add custom words (names, school lists, etc.) with Enter key
- **Word filtering** - View words by status (new, learning, mastered)
- **Enable/disable words** - Customize which words appear in sessions

### Technical Features 🛠️
- **100% offline capable** - Works without internet after first load
- **No installation required** - Runs in any modern browser
- **Installable as PWA** - Can be added to home screen like a native app
- **Data persistence** - All progress saved locally in browser
- **Responsive design** - Works on phones, tablets, and desktops
- **No accounts needed** - Privacy-first, no sign-ups or tracking

## Quick Start

### Option 1: Open the files directly
1. Clone this repository
2. Open `index.html` in your browser
3. Start learning!

### Option 2: Use a local server (recommended for PWA features)
```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx http-server -p 8080

# PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

### Option 3: Deploy to a hosting service

Deploy to any static hosting service:

**GitHub Pages:**
1. Push to GitHub
2. Go to Settings → Pages
3. Select branch and save
4. Access at `https://[username].github.io/[repo-name]`

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy
```

**Vercel:**
```bash
npm install -g vercel
vercel
```

## How It Works

### Learning Flow
1. Child starts a session (10 words)
2. Each word is displayed prominently
3. After 5 seconds, the word is spoken automatically
4. Child indicates if they got it right or need help
5. Progress is tracked and visual feedback shown
6. Session ends with a summary of performance

### Challenge Deck System
- Words missed 2+ times in a session are added to the Challenge Deck
- Next session prioritizes Challenge Deck words (up to 5)
- Helps children focus on words they're struggling with
- Parents can see which words need attention in the dashboard

### Word States
- **New**: Word hasn't been practiced yet
- **Learning**: Word is being practiced (1-4 correct answers)
- **Mastered**: Word has been answered correctly 5+ times

## Default Word List

The app includes 170+ high-frequency sight words compiled from trusted sources (Dolch, Fry, and Oxford word lists), organized by category:

**Most Common Words:** the, and, a, to, said, in, he, I, of, it, was, you, they, on, she, is, for, at, his, but, that, with, all, we, can, are, up, had, my, her

**Common Verbs & Actions:** see, look, go, come, get, make, do, run, jump, play, help, walk, stop, find, put, take, give, think, say, know

**Question Words & Connectors:** who, what, where, when, why, how, which, an, as, be, by, or, if, so, no, yes, not, then, than, now

**Prepositions & Directional Words:** from, into, over, under, out, down, around, off, up, about, there, here, away, back, again, soon, right, left, before, after

**Pronouns & Possessives:** him, them, this, these, those, some, any, many, our, your, their, us, me

**Size & Quantity Descriptors:** big, little, small, long, short, old, new, good, bad, very, much, more, most, few, lots, only, just, other, every, each

**Numbers:** one through ten

**Modals & Auxiliaries:** has, have, does, did, will, would, could, should, may, must, been, being

**And many more...**

You can add unlimited custom words through the Parent Dashboard.

## Browser Compatibility

Works in all modern browsers that support:
- localStorage
- Web Speech API (for text-to-speech and speech recognition)
- Service Workers (for PWA features)

**Speech Recognition Feature:**
- ✅ **Chrome/Edge 90+**: Full support for speech recognition
- ✅ **Chrome Mobile**: Full support for speech recognition
- ⚠️ **Firefox 88+**: Limited or no speech recognition support
- ⚠️ **Safari 14+**: Limited or no speech recognition support
- ℹ️ The speech recognition button will automatically hide if not supported
- ℹ️ Fallback buttons ("I got it right" / "I need help") are always available

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Data Storage

All data is stored locally in your browser using `localStorage`:
- Word lists and states
- Progress statistics
- Challenge Deck
- Session history

**Note**: Clearing browser data will reset all progress.

## Privacy

This app:
- ✅ Stores all data locally on your device
- ✅ Works completely offline
- ✅ Requires no account or login
- ✅ Collects no analytics
- ✅ Makes no network requests (after initial load)

## Development

### File Structure
```
sight-word-quest/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── app.js              # Application logic and state management
├── manifest.json       # PWA manifest
├── sw.js               # Service worker for offline support
├── icon-192.png        # PWA icon (192x192)
└── icon-512.png        # PWA icon (512x512)
```

### Technologies Used
- Pure HTML5, CSS3, JavaScript (no frameworks)
- Web Speech API for text-to-speech
- Service Workers for offline functionality
- localStorage for data persistence

## Contributing

Contributions are welcome! This is a personal project to help children learn sight words.

## License

See LICENSE file for details.

## Acknowledgments

Built with ❤️ to help children develop their reading skills through engaging, interactive practice.
