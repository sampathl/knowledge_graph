import { AIService, AIResponse } from '../types';

// AI Service Configuration
export const AI_SERVICE_CONFIG = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'],
    defaultModel: 'gpt-3.5-turbo'
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-pro', 'gemini-pro-vision'],
    defaultModel: 'gemini-pro'
  }
};

// OpenAI Service
export const openAIService = {
  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    apiKey: string,
    model: string = 'gpt-3.5-turbo'
  ): Promise<AIResponse> {
    try {
      const response = await fetch(`${AI_SERVICE_CONFIG.openai.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      // Extract related topics from the response
      const relatedTopics = extractRelatedTopics(content);
      
      return {
        content,
        relatedTopics,
        confidence: 0.8
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
};

// Gemini Service
export const geminiService = {
  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    apiKey: string,
    model: string = 'gemini-pro'
  ): Promise<AIResponse> {
    try {
      // Convert messages to Gemini format
      const geminiMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await fetch(
        `${AI_SERVICE_CONFIG.gemini.baseUrl}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.7
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates[0]?.content?.parts[0]?.text || '';
      
      // Extract related topics from the response
      const relatedTopics = extractRelatedTopics(content);
      
      return {
        content,
        relatedTopics,
        confidence: 0.8
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }
};

// Helper function to extract related topics from AI response
function extractRelatedTopics(content: string): string[] {
  // Simple extraction - look for topics mentioned after certain keywords
  const topicKeywords = ['related to', 'connected to', 'similar to', 'see also', 'topics:', 'concepts:'];
  const topics: string[] = [];
  
  // Extract topics mentioned in the response
  const lines = content.split('\n');
  for (const line of lines) {
    if (topicKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
      // Extract potential topics from this line
      const topicMatches = line.match(/[A-Z][a-zA-Z\s]+(?:,|\.|$)/g);
      if (topicMatches) {
        topics.push(...topicMatches.map(t => t.replace(/[,.]/g, '').trim()));
      }
    }
  }
  
  // If no specific topics found, extract capitalized words as potential topics
  if (topics.length === 0) {
    const capitalizedWords = content.match(/[A-Z][a-zA-Z]+/g) || [];
    topics.push(...capitalizedWords.slice(0, 5)); // Limit to 5 topics
  }
  
  return topics.filter(topic => topic.length > 2).slice(0, 5); // Filter and limit results
}

// Main AI service dispatcher
export const aiServiceDispatcher = {
  async chat(
    service: AIService,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<AIResponse> {
    switch (service.name) {
      case 'openai':
        return openAIService.chat(messages, service.apiKey, service.model);
      case 'gemini':
        return geminiService.chat(messages, service.apiKey, service.model);
      default:
        throw new Error(`Unsupported AI service: ${service.name}`);
    }
  }
};

// Validate API key format
export const validateAPIKey = (service: 'openai' | 'gemini', apiKey: string): boolean => {
  if (!apiKey || apiKey.trim().length === 0) return false;
  
  switch (service) {
    case 'openai':
      return apiKey.startsWith('sk-') && apiKey.length > 20;
    case 'gemini':
      return apiKey.length > 20; // Gemini keys are typically long
    default:
      return false;
  }
};
