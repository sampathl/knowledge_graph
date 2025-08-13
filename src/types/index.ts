// Knowledge Graph Types
export interface GraphNode {
  id: string;
  label: string;
  description?: string;
  x?: number;
  y?: number;
  color?: string;
  size?: number;
  isSelected?: boolean;
  isHighlighted?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  strength?: number;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Chat Types
export interface ChatMessage {
  id: string;
  nodeId?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedTopics?: string[];
}

export interface ChatSession {
  id: string;
  nodeId?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// AI Service Types
export interface AIService {
  name: 'openai' | 'gemini';
  apiKey: string;
  model?: string;
  isEnabled: boolean;
}

export interface AIResponse {
  content: string;
  relatedTopics: string[];
  confidence?: number;
}

// Application State
export interface AppSettings {
  theme: 'light' | 'dark';
  autoSave: boolean;
  defaultAIService: 'openai' | 'gemini';
}

export interface AppState {
  graph: KnowledgeGraph;
  selectedNode: GraphNode | null;
  chatSessions: ChatSession[];
  aiServices: AIService[];
  settings: AppSettings;
}
