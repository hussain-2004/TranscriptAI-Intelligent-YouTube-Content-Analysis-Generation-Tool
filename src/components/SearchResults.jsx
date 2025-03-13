/**
 * SearchResults Component
 * 
 * Purpose:
 * Displays YouTube search results from SerpAPI.
 * 
 * Props:
 * - results: Search results object from SerpAPI
 * - onAnalyzeVideo: Function to call when Analyze button is clicked
 * - onSaveVideo: Function to call when Save to Collection button is clicked
 * - canSave: Boolean indicating whether the user can save videos
 * 
 * Outputs:
 * - Formatted list of search results
 */

import React from 'react'

function SearchResults({ results, onAnalyzeVideo, onSaveVideo, canSave }) {
  if (!results) return null
  
  const { 
    search_information,
    video_results,
    movie_results,
    channel_results,
    playlist_results
  } = results
  
  // Combine video and movie results into one array for display
  const allVideoResults = [
    ...(video_results || []), 
    ...(movie_results || [])
  ]
  
  return (
    <div className="search-results">
      {search_information && (
        <div className="search-info">
          <span>About {search_information.total_results} results</span>
        </div>
      )}
      
      {/* Display video and movie results */}
      {allVideoResults.length > 0 ? (
        <div className="video-results">
          <h3>Videos</h3>
          <div className="results-grid">
            {allVideoResults.map((video, index) => (
              <div key={index} className="video-card">
                <div className="thumbnail-container">
                  <a href={video.link} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={video.thumbnail?.static || video.thumbnail} 
                      alt={video.title} 
                      className="video-thumbnail" 
                    />
                    {video.length && <span className="video-duration">{video.length}</span>}
                  </a>
                </div>
                <div className="video-info">
                  <h4>
                    <a href={video.link} target="_blank" rel="noopener noreferrer">
                      {video.title}
                    </a>
                  </h4>
                  {video.channel && (
                    <div className="channel-info">
                      {video.channel.thumbnail && (
                        <img 
                          src={video.channel.thumbnail} 
                          alt={video.channel.name} 
                          className="channel-thumbnail" 
                        />
                      )}
                      <a 
                        href={video.channel.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="channel-name"
                      >
                        {video.channel.name}
                        {video.channel.verified && (
                          <span className="verified-badge" title="Verified">✓</span>
                        )}
                      </a>
                    </div>
                  )}
                  <div className="video-meta">
                    {video.views && <span>{formatViews(video.views)} views</span>}
                    {video.published_date && (
                      <span>{video.published_date}</span>
                    )}
                  </div>
                  {video.description && (
                    <p className="video-description">{video.description}</p>
                  )}
                  
                  <div className="video-actions">
                    <button 
                      className="analyze-video-button"
                      onClick={() => onAnalyzeVideo(video.link, video.title)}
                    >
                      Analyze Video
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      
      {/* Display playlist results if any */}
      {playlist_results && playlist_results.length > 0 ? (
        <div className="playlist-results">
          <h3>Playlists</h3>
          <div className="results-grid">
            {playlist_results.map((playlist, index) => (
              <div key={index} className="video-card">
                <div className="thumbnail-container">
                  <a href={playlist.link} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={playlist.thumbnail} 
                      alt={playlist.title} 
                      className="video-thumbnail" 
                    />
                    {playlist.video_count && 
                      <span className="playlist-count">{playlist.video_count} videos</span>
                    }
                  </a>
                </div>
                <div className="video-info">
                  <h4>
                    <a href={playlist.link} target="_blank" rel="noopener noreferrer">
                      {playlist.title}
                    </a>
                  </h4>
                  {playlist.channel && (
                    <div className="channel-info">
                      <a 
                        href={playlist.channel.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="channel-name"
                      >
                        {playlist.channel.name}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      
      {/* Display channel results if any */}
      {channel_results && channel_results.length > 0 ? (
        <div className="channel-results">
          <h3>Channels</h3>
          <div className="channel-grid">
            {channel_results.map((channel, index) => (
              <div key={index} className="channel-card">
                <a 
                  href={channel.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="channel-link"
                >
                  <img 
                    src={channel.thumbnail} 
                    alt={channel.title} 
                    className="channel-thumbnail" 
                  />
                  <div className="channel-card-info">
                    <h4>
                      {channel.title}
                      {channel.verified && (
                        <span className="verified-badge" title="Verified">✓</span>
                      )}
                    </h4>
                    {channel.subscribers && (
                      <span className="subscribers">{channel.subscribers} subscribers</span>
                    )}
                    {channel.description && (
                      <p className="channel-description">{channel.description}</p>
                    )}
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      
      {/* Show message if no results */}
      {allVideoResults.length === 0 && 
       (!channel_results || channel_results.length === 0) &&
       (!playlist_results || playlist_results.length === 0) && (
        <div className="no-results">
          <p>No results found. Try a different search query.</p>
        </div>
      )}
    </div>
  )
}

// Helper function to format view counts
function formatViews(views) {
  if (typeof views !== 'number') {
    // If views is already a string (like "10K"), return as is
    return views;
  }
  
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M';
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  } else {
    return views.toString();
  }
}

export default SearchResults 