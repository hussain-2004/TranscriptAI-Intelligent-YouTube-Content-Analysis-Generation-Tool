/**
 * VideoAnalysisSummary Component
 * 
 * Purpose:
 * Displays a concise 6-point summary of a video analysis in a popup modal.
 * 
 * Props:
 * - videoTitle: Title of the analyzed video
 * - summaryPoints: Array of summary points
 * - loading: Boolean indicating if analysis is loading
 * - onClose: Function to call when closing the summary
 * - targetLanguage: Selected language for translation
 * - setTargetLanguage: Function to update selected language
 * - translatedPoints: Translated summary points
 * - translating: Boolean indicating if translation is in progress
 * - onTranslate: Function to handle translation
 * - onDownload: Function to handle PDF download
 * - onSave: Function to handle saving the analysis
 * - canSave: Boolean indicating if saving is allowed
 * - saving: Boolean indicating if saving is in progress
 * 
 * Outputs:
 * - Modal popup with card-based display of video summary points
 */

import React from 'react'
import { LANGUAGES } from '../constants/languages'

function VideoAnalysisSummary({ 
  videoTitle, 
  summaryPoints, 
  loading, 
  onClose,
  targetLanguage = 'English',
  setTargetLanguage,
  translatedPoints,
  translating,
  onTranslate,
  onDownload,
  onSave,
  canSave,
  saving
}) {
  if (!loading && (!summaryPoints || summaryPoints.length === 0)) {
    return null
  }
  
  // Determine which points to display - translated or original
  const displayPoints = translatedPoints && translatedPoints.length > 0 
    ? translatedPoints 
    : summaryPoints || [];
  
  return (
    <div className="modal-overlay">
      <div className="analysis-modal-content">
        <div className="analysis-modal-header">
          <h3>{loading ? 'Analyzing Video...' : `Video Analysis: ${videoTitle}`}</h3>
          <div className="modal-actions">
            {!loading && (
              <>
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
                    className="translate-button"
                  >
                    {translating ? 'Translating...' : `Translate to ${targetLanguage}`}
                  </button>
                </div>
                <button 
                  className="download-button"
                  onClick={() => onDownload(displayPoints, videoTitle)}
                >
                  Download PDF
                </button>
                {canSave && (
                  <button 
                    className="save-button"
                    onClick={() => onSave()}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save to Collection'}
                  </button>
                )}
              </>
            )}
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Generating key points from video transcript...</p>
            <p className="loading-subtext">This may take a moment depending on video length.</p>
          </div>
        ) : translating ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Translating to {targetLanguage}...</p>
          </div>
        ) : (
          <div className="summary-points-grid">
            {displayPoints.map((point, index) => (
              <div key={index} className="summary-point-card">
                <div className="point-number">{index + 1}</div>
                <p>{point}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoAnalysisSummary 