import React, { useState } from 'react';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { AIService } from '../types';
import { validateAPIKey } from '../utils/aiService';
import './APISettings.css';

interface APISettingsProps {
  aiServices: AIService[];
  onAIServicesUpdate: (services: AIService[]) => void;
  defaultService: 'openai' | 'gemini';
}

export const APISettings: React.FC<APISettingsProps> = ({
  aiServices,
  onAIServicesUpdate,
  defaultService
}) => {
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [tempServices, setTempServices] = useState<AIService[]>(aiServices);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Toggle key visibility
  const toggleKeyVisibility = (serviceName: string) => {
    setShowKeys(prev => ({
      ...prev,
      [serviceName]: !prev[serviceName]
    }));
  };

  // Update service configuration
  const updateService = (serviceName: string, updates: Partial<AIService>) => {
    setTempServices(prev => 
      prev.map(service => 
        service.name === serviceName 
          ? { ...service, ...updates }
          : service
      )
    );
  };

  // Validate API key
  const validateServiceKey = (service: AIService) => {
    if (!service.apiKey) return 'no-key';
    if (validateAPIKey(service.name, service.apiKey)) return 'valid';
    return 'invalid';
  };

  // Get validation status
  const getValidationStatus = (service: AIService) => {
    const status = validateServiceKey(service);
    switch (status) {
      case 'valid':
        return { icon: CheckCircle, color: 'success', text: 'Valid API Key' };
      case 'invalid':
        return { icon: AlertCircle, color: 'error', text: 'Invalid API Key' };
      default:
        return { icon: AlertCircle, color: 'warning', text: 'No API Key' };
    }
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Validate all enabled services have valid keys
      const enabledServices = tempServices.filter(service => service.isEnabled);
      const invalidServices = enabledServices.filter(service => !validateAPIKey(service.name, service.apiKey));

      if (invalidServices.length > 0) {
        throw new Error(`Invalid API keys for: ${invalidServices.map(s => s.name).join(', ')}`);
      }

      // Update parent state
      onAIServicesUpdate(tempServices);
      
      setSaveMessage({
        type: 'success',
        text: 'API settings saved successfully!'
      });

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);

    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save settings'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to original values
  const handleReset = () => {
    setTempServices(aiServices);
    setSaveMessage(null);
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(tempServices) !== JSON.stringify(aiServices);

  return (
    <div className="api-settings">
      <div className="api-settings-header">
        <h2>🔑 API Settings</h2>
        <p>Configure your AI service API keys for OpenAI and Gemini</p>
      </div>

      {saveMessage && (
        <div className={`save-message ${saveMessage.type}`}>
          {saveMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{saveMessage.text}</span>
        </div>
      )}

      <div className="api-services">
        {tempServices.map((service) => {
          const validationStatus = getValidationStatus(service);
          const StatusIcon = validationStatus.icon;

          return (
            <div key={service.name} className="api-service-card">
              <div className="service-header">
                <div className="service-info">
                  <h3>{service.name === 'openai' ? 'OpenAI' : 'Gemini'}</h3>
                  <p className="service-description">
                    {service.name === 'openai' 
                      ? 'Access to GPT models for intelligent conversations'
                      : 'Google\'s Gemini AI for advanced reasoning'
                    }
                  </p>
                </div>
                <div className="service-status">
                  <StatusIcon 
                    size={24} 
                    className={`status-icon ${validationStatus.color}`}
                  />
                  <span className="status-text">{validationStatus.text}</span>
                </div>
              </div>

              <div className="service-config">
                <div className="form-group">
                  <label className="label">API Key</label>
                  <div className="api-key-input">
                    <Key size={20} className="key-icon" />
                    <input
                      type={showKeys[service.name] ? 'text' : 'password'}
                      className="input"
                      placeholder={`Enter your ${service.name} API key`}
                      value={service.apiKey}
                      onChange={(e) => updateService(service.name, { apiKey: e.target.value })}
                    />
                    <button
                      type="button"
                      className="toggle-key-button"
                      onClick={() => toggleKeyVisibility(service.name)}
                    >
                      {showKeys[service.name] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <small className="help-text">
                    {service.name === 'openai' 
                      ? 'Get your API key from OpenAI platform (starts with sk-)'
                      : 'Get your API key from Google AI Studio'
                    }
                  </small>
                </div>

                <div className="form-group">
                  <label className="label">Model</label>
                  <select
                    className="input"
                    value={service.model || ''}
                    onChange={(e) => updateService(service.name, { model: e.target.value })}
                  >
                    {service.name === 'openai' ? (
                      <>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      </>
                    ) : (
                      <>
                        <option value="gemini-pro">Gemini Pro</option>
                        <option value="gemini-pro-vision">Gemini Pro Vision</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="service-toggle">
                    <input
                      type="checkbox"
                      checked={service.isEnabled}
                      onChange={(e) => updateService(service.name, { isEnabled: e.target.checked })}
                    />
                    <span className="toggle-label">Enable {service.name === 'openai' ? 'OpenAI' : 'Gemini'}</span>
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="api-settings-actions">
        <button
          className="button secondary"
          onClick={handleReset}
          disabled={!hasUnsavedChanges}
        >
          Reset Changes
        </button>
        <button
          className="button"
          onClick={handleSave}
          disabled={isSaving || !hasUnsavedChanges}
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="api-settings-info">
        <h4>ℹ️ Important Notes:</h4>
        <ul>
          <li>API keys are stored locally in your browser and never sent to our servers</li>
          <li>Only enabled services will be available for chat</li>
          <li>Make sure to use valid API keys to avoid errors during conversations</li>
          <li>You can switch between services in the main chat interface</li>
        </ul>
      </div>
    </div>
  );
};
