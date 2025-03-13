/**
 * YouTubeSearch Component
 * 
 * Purpose:
 * Provides a search interface for YouTube videos using SerpAPI.
 * 
 * Props:
 * - query: Current search query
 * - setQuery: Function to update the search query
 * - results: Search results
 * - loading: Loading state
 * - error: Error message
 * - onSearch: Function to call when search is initiated
 * - onAnalyzeVideo: Function to call when Analyze button is clicked
 * - videoAnalysis: Current video analysis
 * - analyzing: Boolean indicating if analysis is in progress
 * - onCloseAnalysis: Function to call when closing the analysis summary
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
 * - Search form and results list
 */

import React from 'react'
import SearchResults from './SearchResults'
import VideoAnalysisSummary from './VideoAnalysisSummary'

function YouTubeSearch({ 
  query, 
  setQuery, 
  results, 
  loading, 
  error, 
  onSearch,
  onAnalyzeVideo,
  videoAnalysis,
  analyzing,
  onCloseAnalysis,
  targetLanguage,
  setTargetLanguage,
  translatedPoints,
  translating,
  onTranslate,
  onDownload,
  onSave,
  canSave,
  saving
}) {
  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!query.trim()) {
      // If we wanted to show an error, we could, but parent component handles this
      return
    }
    
    onSearch(query)
  }

  return (
    <div className="youtube-search-container">
      <h2>Search YouTube Videos</h2>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for videos..."
          className="search-input"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="search-button"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {error && <div className="error">{error}</div>}
      
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Searching YouTube...</p>
        </div>
      )}
      
      {(analyzing || videoAnalysis) && (
        <VideoAnalysisSummary
          videoTitle={videoAnalysis?.title || ''}
          summaryPoints={videoAnalysis?.points || []}
          loading={analyzing}
          onClose={onCloseAnalysis}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          translatedPoints={translatedPoints}
          translating={translating}
          onTranslate={onTranslate}
          onDownload={onDownload}
          onSave={() => onSave(videoAnalysis)}
          canSave={canSave}
          saving={saving}
        />
      )}
      
      {results && (
        <SearchResults 
          results={results} 
          onAnalyzeVideo={onAnalyzeVideo} 
          onSaveVideo={onSave}
          canSave={canSave}
        />
      )}
    </div>
  )
}

export default YouTubeSearch 