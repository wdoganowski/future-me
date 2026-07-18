# Future Me

Write a letter to your future self, seal it with an unlock date, and let time do the rest. Built with plain HTML, CSS, and JavaScript — no build step, no dependencies.

## Features

- Write a message with your name and a future unlock date/time
- Messages are saved in your browser's `localStorage` and persist across refreshes
- Dashboard of saved letters with a live countdown and progress bar
- Automatic reveal animation the moment a letter unlocks
- Rotating motivational quotes
- Dark / light mode toggle
- Responsive layout for mobile devices

## Setup

No build tools or dependencies are required. Because the app loads `style.css` and `script.js` as separate files, open it through a local web server rather than double-clicking `index.html` (some browsers block local file requests otherwise).

Pick any of the following from the project directory:

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Usage

1. Fill in your name, your message, and the date/time you want it to unlock.
2. Click **Seal Message** — it's saved to `localStorage` and appears in the dashboard below, locked with a live countdown.
3. Leave the tab open or come back later — once the unlock time passes, the letter reveals itself automatically with an animation.
4. Toggle the sun/moon switch in the top bar to switch between light and dark mode.
5. Use **Delete** on any capsule to remove it.

## Project structure

```
index.html   Markup and layout
style.css    Styling, themes, and animations
script.js    Form handling, storage, countdowns, and reveal logic
```

## Data & privacy

All letters are stored only in your browser's `localStorage` — nothing is sent to a server. Clearing your browser data or using a different browser/device will not carry your letters over.
