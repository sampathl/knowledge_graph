import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Plus, MessageCircle } from 'lucide-react';
import { GraphNode, ChatMessage, ChatSession, AIService } from '../types';
import { aiServiceDispatcher, validateAPIKey } from '../utils/aiService';
import { generateId } from '../utils/helpers';
import './NodeChat.css';

interface NodeChatProps {
  node: GraphNode;
  onClose: () => void;
  onChatSession: (session: ChatSession) => void;
  aiService: AIService | undefined;
  onAddRelatedNode: (topic: string) => void;
}

export const NodeChat: React.FC<NodeChatProps> = ({
  node,
  onClose,
  onChatSession,
  aiService,
  onAddRelatedNode
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [showRelatedTopics, setShowRelatedTopics] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !aiService || !aiService.isEnabled) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      nodeId: node.id,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation context
      const conversationMessages = [
        { role: 'user' as const, content: `You are an AI assistant helping explore the topic: "${node.label}". Provide informative responses and suggest related topics that could be connected to this subject.` },
        ...messages.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user' as const, content: inputMessage.trim() }
      ];

      const response = await aiServiceDispatcher.chat(aiService, conversationMessages);
      
      const assistantMessage: ChatMessage = {
        id: generateId(),
        nodeId: node.id,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        relatedTopics: response.relatedTopics
      };

      setMessages(prev => [...prev, assistantMessage]);
      setRelatedTopics(response.relatedTopics);
      setShowRelatedTopics(true);

      // Create chat session
      const chatSession: ChatSession = {
        id: generateId(),
        nodeId: node.id,
        messages: [...messages, userMessage, assistantMessage],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      onChatSession(chatSession);

    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: ChatMessage = {
        id: generateId(),
        nodeId: node.id,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API key and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Add related topic as new node
  const handleAddTopic = (topic: string) => {
    onAddRelatedNode(topic);
    setShowRelatedTopics(false);
  };

  // Check if AI service is properly configured
  const isAIConfigured = aiService && aiService.isEnabled && validateAPIKey(aiService.name, aiService.apiKey);

  return (
    <div className="node-chat">
      <div className="chat-header">
        <div className="chat-node-info">
          <MessageCircle size={20} />
          <h3>{node.label}</h3>
        </div>
        <button className="close-button" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <MessageCircle size={48} />
            <h4>Start exploring "{node.label}"</h4>
            <p>Ask me anything about this topic and I'll help you discover connections!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {showRelatedTopics && relatedTopics.length > 0 && (
        <div className="related-topics">
          <h4>Related Topics:</h4>
          <div className="topics-list">
            {relatedTopics.map((topic, index) => (
              <button
                key={index}
                className="topic-button"
                onClick={() => handleAddTopic(topic)}
              >
                <Plus size={16} />
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-input-section">
        {!isAIConfigured ? (
          <div className="ai-not-configured">
            <p>⚠️ AI service not configured. Please set up your API keys in Settings.</p>
          </div>
        ) : (
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask about this topic..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
