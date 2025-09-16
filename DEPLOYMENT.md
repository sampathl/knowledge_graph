# GitHub Pages Deployment Guide

## Quick Start

1. **Push to GitHub**: Make sure your code is pushed to the `main` branch
2. **Enable GitHub Pages**: Go to your repository settings → Pages → Source: "GitHub Actions"
3. **Automatic Deployment**: The GitHub Action will automatically deploy when you push to main

## Manual Deployment

If you prefer manual deployment:

```bash
# Build for GitHub Pages
npm run build:gh-pages

# Deploy to GitHub Pages
npm run deploy
```

## URL Structure

Your app will be available at:
- **GitHub Pages**: `https://sampathl.github.io/knowledge_graph/`
- **Local Development**: `http://localhost:3001`

## Important Notes

- The app is configured to work with the `/knowledge_graph/` subpath
- All assets are properly configured for GitHub Pages
- React Router is set up to handle client-side routing
- The build process optimizes for production

## Troubleshooting

### Build Issues
- Make sure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run build`

### GitHub Pages Issues
- Ensure the repository is public
- Check that GitHub Pages is enabled in repository settings
- Verify the GitHub Action ran successfully in the Actions tab

### Local Development
- Use port 3001 to avoid conflicts: `npm run dev`
- The app will automatically open in your browser
