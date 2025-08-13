// Local Storage Utilities
export const STORAGE_KEYS = {
  GRAPH_DATA: 'knowledge_graph_data',
  CHAT_HISTORY: 'chat_history',
  AI_SERVICES: 'ai_services',
  SETTINGS: 'app_settings',
} as const;

// Simple localStorage wrapper
export const localStorage = {
  get: (key: string): any => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  set: (key: string, value: any): void => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: (): void => {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Graph Data Storage
export const graphStorage = {
  save: (graphData: any): void => {
    localStorage.set(STORAGE_KEYS.GRAPH_DATA, graphData);
  },

  load: (): any => {
    return localStorage.get(STORAGE_KEYS.GRAPH_DATA) || { nodes: [], edges: [] };
  }
};

// Chat History Storage
export const chatStorage = {
  save: (chatHistory: any[]): void => {
    localStorage.set(STORAGE_KEYS.CHAT_HISTORY, chatHistory);
  },

  load: (): any[] => {
    return localStorage.get(STORAGE_KEYS.CHAT_HISTORY) || [];
  },

  addChat: (chat: any): void => {
    const chats = chatStorage.load();
    chats.push(chat);
    chatStorage.save(chats);
  }
};

// AI Services Storage
export const aiServicesStorage = {
  save: (services: any[]): void => {
    localStorage.set(STORAGE_KEYS.AI_SERVICES, services);
  },

  load: (): any[] => {
    return localStorage.get(STORAGE_KEYS.AI_SERVICES) || [];
  }
};

// Settings Storage
export const settingsStorage = {
  save: (settings: any): void => {
    localStorage.set(STORAGE_KEYS.SETTINGS, settings);
  },

  load: (): any => {
    return localStorage.get(STORAGE_KEYS.SETTINGS) || {
      theme: 'light',
      autoSave: true,
      defaultAIService: 'openai'
    };
  }
};

// Export all storage utilities
export const storage = {
  graph: graphStorage,
  chat: chatStorage,
  aiServices: aiServicesStorage,
  settings: settingsStorage,
  localStorage
};
