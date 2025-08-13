import React, { useState, useMemo } from 'react';
import { Search, MessageCircle, Clock, Hash } from 'lucide-react';
import { ChatSession, ChatMessage } from '../types';
import { formatRelativeTime, truncateText } from '../utils/helpers';
import './ChatHistory.css';

interface ChatHistoryProps {
  chatSessions: ChatSession[];
  onChatSession: (session: ChatSession) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  chatSessions,
  onChatSession
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [filterByNode, setFilterByNode] = useState<string>('all');

  // Get unique node IDs for filtering
  const nodeIds = useMemo(() => {
    const ids = new Set<string>();
    chatSessions.forEach(session => {
      if (session.nodeId) ids.add(session.nodeId);
    });
    return Array.from(ids);
  }, [chatSessions]);

  // Filter and search chat sessions
  const filteredSessions = useMemo(() => {
    return chatSessions.filter(session => {
      const matchesSearch = searchQuery === '' || 
        session.messages.some(msg => 
          msg.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesNode = filterByNode === 'all' || 
        session.nodeId === filterByNode;
      
      return matchesSearch && matchesNode;
    });
  }, [chatSessions, searchQuery, filterByNode]);

  // Get node label by ID
  const getNodeLabel = (nodeId: string) => {
    // This would typically come from the graph data
    // For now, we'll use the nodeId as a fallback
    return nodeId || 'Unknown Node';
  };

  // Get preview of conversation
  const getConversationPreview = (session: ChatSession) => {
    const lastMessage = session.messages[session.messages.length - 1];
    if (!lastMessage) return 'No messages';
    
    return truncateText(lastMessage.content, 100);
  };

  // Get message count
  const getMessageCount = (session: ChatSession) => {
    return session.messages.length;
  };

  // Handle session selection
  const handleSessionSelect = (session: ChatSession) => {
    setSelectedSession(session);
  };

  // Handle session deletion (placeholder for future implementation)
  const handleDeleteSession = (sessionId: string) => {
    // This would typically update the parent state
    console.log('Delete session:', sessionId);
  };

  return (
    <div className="chat-history">
      <div className="chat-history-header">
        <h2>💬 Chat History</h2>
        <p>Review your conversations and explore past discussions</p>
      </div>

      <div className="chat-history-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section">
          <select
            className="filter-select"
            value={filterByNode}
            onChange={(e) => setFilterByNode(e.target.value)}
          >
            <option value="all">All Nodes</option>
            {nodeIds.map(nodeId => (
              <option key={nodeId} value={nodeId}>
                {getNodeLabel(nodeId)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="chat-history-content">
        <div className="sessions-list">
          {filteredSessions.length === 0 ? (
            <div className="no-sessions">
              <MessageCircle size={48} />
              <h3>No conversations yet</h3>
              <p>Start chatting with nodes in the graph to see your history here!</p>
            </div>
          ) : (
            filteredSessions.map(session => (
              <div
                key={session.id}
                className={`session-item ${selectedSession?.id === session.id ? 'selected' : ''}`}
                onClick={() => handleSessionSelect(session)}
              >
                <div className="session-header">
                  <div className="session-node">
                    <Hash size={16} />
                    <span>{getNodeLabel(session.nodeId || '')}</span>
                  </div>
                  <div className="session-meta">
                    <span className="message-count">
                      <MessageCircle size={14} />
                      {getMessageCount(session)}
                    </span>
                    <span className="session-time">
                      <Clock size={14} />
                      {formatRelativeTime(session.updatedAt)}
                    </span>
                  </div>
                </div>
                
                <div className="session-preview">
                  {getConversationPreview(session)}
                </div>

                <div className="session-actions">
                  <button
                    className="button secondary small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChatSession(session);
                    }}
                  >
                    Continue Chat
                  </button>
                  <button
                    className="button secondary small danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedSession && (
          <div className="session-detail">
            <div className="session-detail-header">
              <h3>Conversation Details</h3>
              <button
                className="close-detail"
                onClick={() => setSelectedSession(null)}
              >
                ×
              </button>
            </div>
            
            <div className="session-detail-content">
              <div className="session-info">
                <p><strong>Node:</strong> {getNodeLabel(selectedSession.nodeId || '')}</p>
                <p><strong>Started:</strong> {selectedSession.createdAt.toLocaleString()}</p>
                <p><strong>Last Updated:</strong> {selectedSession.updatedAt.toLocaleString()}</p>
                <p><strong>Messages:</strong> {selectedSession.messages.length}</p>
              </div>
              
              <div className="session-messages">
                <h4>Messages:</h4>
                {selectedSession.messages.map((message, index) => (
                  <div key={index} className={`detail-message ${message.role}`}>
                    <div className="message-role">{message.role === 'user' ? 'You' : 'AI'}</div>
                    <div className="message-content">{message.content}</div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
