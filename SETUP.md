# Clipboard Saver

A simple web app that copies text to your clipboard when you press Enter. Built with TypeScript and Vite.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the dev server:
```bash
npm run dev
```

The app will open in your browser at `http://localhost:5173`

## Building

Build the project for production:
```bash
npm run build
```

This generates optimized files in the `dist/` directory.

## Deployment to GitHub Pages

### First-time setup:

1. Ensure your main branch is your primary development branch (should be default on GitHub)

2. In your GitHub repository settings:
   - Go to Settings → Pages
   - Set Source to "GitHub Actions"

3. Commit and push the workflow file:
```bash
git add .github/workflows/deploy.yml
git commit -m 'Add GitHub Pages deployment workflow'
git push origin main
```

### Automatic deployment:

Every time you push to the `main` branch, the GitHub Actions workflow will automatically:
1. Build your TypeScript/Vite project
2. Generate optimized files
3. Deploy to GitHub Pages

Just push your changes:
```bash
git push origin main
```

Your site will be live at `https://sammychien.github.io`

You can monitor deployment progress in the "Actions" tab of your GitHub repository.

## Project Structure

```
src/
├── index.html          # HTML entry point
├── main.ts             # Main TypeScript file
├── clipboard_util.ts   # Clipboard utility functions
└── style.css          # Styles

package.json           # Dependencies and scripts
vite.config.ts        # Vite configuration
tsconfig.json         # TypeScript configuration
```

## How it works

1. User types text in the input field
2. User presses Enter
3. Text is transformed to UPPERCASE using `transformToUppercase()` from `clipboard_util.ts`
4. Text is copied to user's clipboard
5. Success message is displayed
