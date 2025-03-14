/**
 * TranscriptInput Component
 * 
 * Purpose:
 * Provides a form for users to input a YouTube URL and initiate transcript fetching.
 * 
 * Props:
 * - onAnalyze: Function to call when the fetch button is clicked
 * - videoUrl: Current URL value
 * - setVideoUrl: Function to update the URL value
 * - loading: Boolean indicating if fetching is in progress
 * - hasTranscript: Boolean indicating if a transcript exists
 * - onViewSummary: Function to call when the "View Summary" button is clicked
 * - onViewDetailedNotes: Function to call when the "View Detailed Notes" button is clicked
 * - onViewTranscript: Function to call when the "View Plain Transcript" button is clicked
 * 
 * Outputs:
 * - User interface for URL input
 * - Triggers transcript fetching process
 */

import { useState } from 'react'

function TranscriptInput({ onAnalyze, videoUrl, setVideoUrl, loading, hasTranscript, onViewSummary, onViewDetailedNotes, onViewTranscript }) {
  return (
    <div className="container">
      <div className="welcome-section">
        <img src="/ytimg.png" alt="YouTube Logo" />
        <p className="welcome-text">
          YouTube Video Summary In Seconds 
          <span role="img" aria-label="smile" style={{ marginLeft: '4px' }}>✨</span>
        </p>
      </div>
      
      <div className="input-section">
        <div className="input-container">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Paste YouTube video URL here"
            className="url-input"
          />
          <button 
            onClick={onAnalyze}
            disabled={loading || !videoUrl}
            className="analyze-button"
          >
            {loading ? 'Fetching...' : 'Fetch'}
          </button>
        </div>
        
        {hasTranscript && (
          <div className="view-options">
            <button 
              onClick={onViewSummary}
              disabled={loading}
              className="view-button"
            >
              View Summary
            </button>
            <button 
              onClick={onViewDetailedNotes}
              disabled={loading}
              className="view-button"
            >
              View Detailed Notes
            </button>
            <button 
              onClick={onViewTranscript}
              disabled={loading}
              className="view-button"
            >
              View Plain Transcript
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TranscriptInput 