# 🧠 Knowledge Graph Explorer

An interactive web application for creating, exploring, and interacting with knowledge graphs through AI-powered conversations.

## Features

- **Interactive Knowledge Graph Visualization**: Create and manipulate nodes and connections
- **AI-Powered Chat**: Chat with individual nodes using OpenAI GPT or Google Gemini
- **Node Connection**: Select a node and add connected nodes automatically
- **Chat History**: Browse and search past conversations
- **Multi-AI Support**: Switch between different AI models and services
- **Data Persistence**: All data stored locally in your browser

## Live Demo

🌐 **[View Live Demo](https://sampathl.github.io/knowledge_graph/)**

## Local Development

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/knowledge-graph.git
cd knowledge-graph
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3001`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:gh-pages` - Build for GitHub Pages deployment
- `npm run deploy` - Deploy to GitHub Pages

## Deployment to GitHub Pages

### Automatic Deployment (Recommended)

1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy to GitHub Pages
3. Your app will be available at `https://sampathl.github.io/knowledge_graph/`

### Manual Deployment

1. Build the project:
```bash
npm run build:gh-pages
```

2. Deploy to GitHub Pages:
```bash
npm run deploy
```

## Configuration

### AI Services Setup

1. Go to the "API Settings" page
2. Enter your API keys for OpenAI and/or Google Gemini
3. Select your preferred models
4. Enable the services you want to use

### API Keys

- **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/)
- **Google Gemini**: Get your API key from [Google AI Studio](https://makersuite.google.com/)

## Usage

1. **Add Nodes**: Type a topic name and click "Add Node"
2. **Connect Nodes**: Select a node, then add a new node to automatically connect them
3. **Chat with Nodes**: Click on any node to start a conversation about that topic
4. **Explore Connections**: Use the AI to discover related topics and add them to your graph

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **React Force Graph 2D** - Graph visualization
- **Webpack** - Module bundling
- **GitHub Pages** - Hosting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC License
