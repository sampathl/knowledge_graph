import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { GraphViewer } from './components/GraphViewer';
import { ChatHistory } from './components/ChatHistory';
import { APISettings } from './components/APISettings';
import { Settings } from './components/Settings';
import { AppState, GraphNode, ChatSession, AIService, AppSettings } from './types';
import { storage } from './utils/storage';
import './App.css';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Graph View', icon: '🔗' },
    { path: '/chat-history', label: 'Chat History', icon: '💬' },
    { path: '/api-settings', label: 'API Settings', icon: '🔑' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>🧠 Knowledge Graph Explorer</h1>
      </div>
      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link 
              to={item.path} 
              className={location.pathname === item.path ? 'active' : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    graph: { nodes: [], edges: [] },
    selectedNode: null,
    chatSessions: [],
    aiServices: [],
    settings: {
      theme: 'light',
      autoSave: true,
      defaultAIService: 'openai'
    }
  });

  // Load initial data from storage
  useEffect(() => {
    const loadInitialData = () => {
      const graphData = storage.graph.load();
      const chatHistory = storage.chat.load();
      const aiServices = storage.aiServices.load();
      const settings = storage.settings.load();

      setAppState(prev => ({
        ...prev,
        graph: graphData,
        chatSessions: chatHistory,
        aiServices: aiServices.length > 0 ? aiServices : [
          { name: 'openai', apiKey: '', model: 'gpt-3.5-turbo', isEnabled: false },
          { name: 'gemini', apiKey: '', model: 'gemini-pro', isEnabled: false }
        ],
        settings
      }));
    };

    loadInitialData();
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    if (appState.settings.autoSave) {
      storage.graph.save(appState.graph);
      storage.chat.save(appState.chatSessions);
      storage.aiServices.save(appState.aiServices);
      storage.settings.save(appState.settings);
    }
  }, [appState]);

  const updateGraph = (newGraph: typeof appState.graph) => {
    setAppState(prev => ({ ...prev, graph: newGraph }));
  };

  const updateSelectedNode = (node: GraphNode | null) => {
    setAppState(prev => ({ ...prev, selectedNode: node }));
  };

  const addChatSession = (session: ChatSession) => {
    setAppState(prev => ({
      ...prev,
      chatSessions: [...prev.chatSessions, session]
    }));
  };

  const updateAIServices = (services: AIService[]) => {
    setAppState(prev => ({ ...prev, aiServices: services }));
  };

  const updateSettings = (newSettings: AppSettings) => {
    setAppState(prev => ({ ...prev, settings: newSettings }));
  };

  return (
    <Router>
      <div className={`app ${appState.settings.theme}`}>
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <GraphViewer
                  graph={appState.graph}
                  selectedNode={appState.selectedNode}
                  onGraphUpdate={updateGraph}
                  onNodeSelect={updateSelectedNode}
                  onChatSession={addChatSession}
                  aiServices={appState.aiServices}
                  defaultService={appState.settings.defaultAIService}
                />
              } 
            />
            <Route 
              path="/chat-history" 
              element={
                <ChatHistory
                  chatSessions={appState.chatSessions}
                  onChatSession={addChatSession}
                />
              } 
            />
            <Route 
              path="/api-settings" 
              element={
                <APISettings
                  aiServices={appState.aiServices}
                  onAIServicesUpdate={updateAIServices}
                  defaultService={appState.settings.defaultAIService}
                />
              } 
            />
            <Route 
              path="/settings" 
              element={
                <Settings
                  settings={appState.settings}
                  onSettingsUpdate={updateSettings}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
