/**
 * ContentModal Component
 * 
 * Purpose:
 * Displays content in a modal popup with translation and download options.
 * 
 * Props:
 * - isOpen: Boolean indicating if the modal is open
 * - onClose: Function to call when the modal is closed
 * - title: Title of the modal
 * - content: Content to display in the modal
 * - targetLanguage: Currently selected language
 * - setTargetLanguage: Function to update the selected language
 * - onTranslate: Function to call when the translate button is clicked
 * - translating: Boolean indicating if translation is in progress
 * - translatedContent: Translated content to display
 * - onDownload: Function to call when the download button is clicked
 * - onSave: Function to call when the save button is clicked
 * - canSave: Boolean indicating if the save button should be enabled
 * - saving: Boolean indicating if saving is in progress
 * - videoUrl: URL of the video for saving
 * 
 * Outputs:
 * - Modal with content, translation controls, and download button
 */

import React from 'react';
import { LANGUAGES } from '../constants/languages';

function ContentModal({ 
  isOpen, 
  onClose, 
  title, 
  content,
  targetLanguage,
  setTargetLanguage,
  onTranslate,
  translating,
  translatedContent,
  onDownload,
  onSave,
  canSave,
  saving,
  videoUrl
}) {
  if (!isOpen) return null;
  
  const displayContent = translatedContent || content;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <div className="modal-actions">
            <div className="language-selector">
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="language-select"
                disabled={translating}
              >
                {LANGUAGES.map(language => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
              <button
                onClick={onTranslate}
                disabled={translating || targetLanguage === 'English'}
                className="translate-button modal-button"
              >
                {translating ? 'Translating...' : `Translate`}
              </button>
            </div>
            {canSave && (
              <button 
                className="save-button modal-button"
                onClick={() => onSave(title, displayContent, videoUrl)}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button 
              className="download-button modal-button"
              onClick={() => onDownload(displayContent, title)}
              title="Download PDF"
            >
              <span className="download-icon">⬇️</span>
            </button>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="modal-body">
          {translating ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Translating to {targetLanguage}...</p>
            </div>
          ) : (
            <div 
              className="content" 
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentModal; 