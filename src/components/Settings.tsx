import React, { useState } from 'react';
import { Palette, Save, RotateCcw, Moon, Sun, HardDrive, Bot } from 'lucide-react';
import { AppSettings } from '../types';
import './Settings.css';

interface SettingsProps {
  settings: AppSettings;
  onSettingsUpdate: (settings: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onSettingsUpdate
}) => {
  const [tempSettings, setTempSettings] = useState<AppSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Update temporary settings
  const updateTempSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setTempSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Update parent state
      onSettingsUpdate(tempSettings);
      
      setSaveMessage({
        type: 'success',
        text: 'Settings saved successfully!'
      });

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);

    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Failed to save settings'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to original values
  const handleReset = () => {
    setTempSettings(settings);
    setSaveMessage(null);
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(tempSettings) !== JSON.stringify(settings);

  return (
    <div className="settings">
      <div className="settings-header">
        <h2>⚙️ Settings</h2>
        <p>Customize your knowledge graph explorer experience</p>
      </div>

      {saveMessage && (
        <div className={`save-message ${saveMessage.type}`}>
          {saveMessage.type === 'success' ? <Save size={20} /> : <RotateCcw size={20} />}
          <span>{saveMessage.text}</span>
        </div>
      )}

      <div className="settings-sections">
        {/* Appearance Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Palette size={24} />
            <h3>Appearance</h3>
          </div>
          
          <div className="setting-item">
            <label className="setting-label">
              <span>Theme</span>
              <small>Choose your preferred color scheme</small>
            </label>
            <div className="theme-options">
              <label className="theme-option">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={tempSettings.theme === 'light'}
                  onChange={(e) => updateTempSetting('theme', e.target.value as 'light' | 'dark')}
                />
                <div className="theme-preview light">
                  <Sun size={16} />
                  <span>Light</span>
                </div>
              </label>
              
              <label className="theme-option">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={tempSettings.theme === 'dark'}
                  onChange={(e) => updateTempSetting('theme', e.target.value as 'light' | 'dark')}
                />
                <div className="theme-preview dark">
                  <Moon size={16} />
                  <span>Dark</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* AI Service Settings */}
        <div className="settings-section">
          <div className="section-header">
            <Bot size={24} />
            <h3>AI Service</h3>
          </div>
          
          <div className="setting-item">
            <label className="setting-label">
              <span>Default AI Service</span>
              <small>Choose which AI service to use by default</small>
            </label>
            <select
              className="setting-select"
              value={tempSettings.defaultAIService}
              onChange={(e) => updateTempSetting('defaultAIService', e.target.value as 'openai' | 'gemini')}
            >
              <option value="openai">OpenAI (GPT)</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>
        </div>

        {/* Data Settings */}
        <div className="settings-section">
          <div className="section-header">
            <HardDrive size={24} />
            <h3>Data & Storage</h3>
          </div>
          
          <div className="setting-item">
            <label className="setting-label">
              <span>Auto-save</span>
              <small>Automatically save changes to local storage</small>
            </label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={tempSettings.autoSave}
                onChange={(e) => updateTempSetting('autoSave', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Export/Import Settings */}
        <div className="settings-section">
          <div className="section-header">
            <RotateCcw size={24} />
            <h3>Data Management</h3>
          </div>
          
          <div className="setting-item">
            <label className="setting-label">
              <span>Export Data</span>
              <small>Download your knowledge graph and chat history</small>
            </label>
            <button className="button secondary">
              Export Data
            </button>
          </div>
          
          <div className="setting-item">
            <label className="setting-label">
              <span>Import Data</span>
              <small>Import knowledge graph from a file</small>
            </label>
            <button className="button secondary">
              Import Data
            </button>
          </div>
          
          <div className="setting-item">
            <label className="setting-label">
              <span>Clear All Data</span>
              <small>Remove all stored data (cannot be undone)</small>
            </label>
            <button className="button secondary danger">
              Clear Data
            </button>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button
          className="button secondary"
          onClick={handleReset}
          disabled={!hasUnsavedChanges}
        >
          <RotateCcw size={18} />
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

      <div className="settings-info">
        <h4>ℹ️ About Settings</h4>
        <ul>
          <li><strong>Theme:</strong> Changes the overall appearance of the application</li>
          <li><strong>Default AI Service:</strong> Sets which AI service to use when starting new conversations</li>
          <li><strong>Auto-save:</strong> Automatically saves your work as you make changes</li>
          <li><strong>Data Management:</strong> Export your work or start fresh with new data</li>
        </ul>
      </div>
    </div>
  );
};
