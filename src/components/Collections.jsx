import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserVideos, deleteVideo } from '../services/databaseService';
import { fetchTranscript } from '../services/transcriptService';
import { generateSummary, generateDetailedNotes, translateText, generatePDF } from '../services/geminiService';
import ContentModal from './ContentModal';

function Collections() {
  const { user } = useAuth();
  const [savedVideos, setSavedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('savedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [viewLoading, setViewLoading] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [translating, setTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState('');

  useEffect(() => {
    if (!user) {
      setSavedVideos([]);
      setLoading(false);
      return;
    }

    const fetchSavedVideos = async () => {
      try {
        setLoading(true);
        const videos = await getUserVideos(user.uid, sortOption, sortOrder);
        setSavedVideos(videos);
        setError('');
      } catch (err) {
        console.error('Error fetching saved videos:', err);
        setError('Failed to load your collection. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedVideos();
  }, [user, sortOption, sortOrder]);

  const handleDelete = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video from your collection?')) {
      try {
        await deleteVideo(videoId);
        setSavedVideos(savedVideos.filter(video => video.id !== videoId));
      } catch (err) {
        setError('Failed to delete the video. Please try again.');
      }
    }
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleOrderChange = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleViewTranscript = async (video) => {
    if (!video.link) {
      setError('No video link available');
      return;
    }
    
    setViewLoading(true);
    setModalTitle(`Transcript: ${video.title}`);
    setCurrentVideoUrl(video.link);
    
    try {
      // First check if we have the transcript stored directly
      if (video.transcript) {
        setModalContent(video.transcript);
        setIsModalOpen(true);
      } 
      // Then check if we have points from a transcript type save
      else if (video.type === 'transcript' && video.points && video.points.length > 0) {
        setModalContent(video.points.join('\n\n'));
        setIsModalOpen(true);
      } 
      // Otherwise fetch it
      else {
        const transcript = await fetchTranscript(video.link);
        setModalContent(transcript);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching transcript:', err);
      setError('Failed to fetch transcript. Please try again.');
    } finally {
      setViewLoading(false);
    }
  };
  
  const handleViewSummary = async (video) => {
    if (!video.link) {
      setError('No video link available');
      return;
    }
    
    setViewLoading(true);
    setModalTitle(`Summary: ${video.title}`);
    setCurrentVideoUrl(video.link);
    
    try {
      // First check if we have the summary stored directly
      if (video.summary) {
        setModalContent(video.summary);
        setIsModalOpen(true);
      }
      // Then check if we have points from a summary type save
      else if (video.type === 'summary' && video.points && video.points.length > 0) {
        const formattedSummary = `<h2>Video Summary</h2>\n\n${video.points.map(point => `<h3>${point.substring(0, 30)}...</h3>\n${point}`).join('\n\n')}`;
        setModalContent(formattedSummary);
        setIsModalOpen(true);
      } 
      // Check if it's an analysis with points
      else if (video.type === 'analysis' && video.points && video.points.length > 0) {
        const formattedSummary = `<h2>Video Analysis</h2>\n\n${video.points.map((point, index) => `<h3>Key Point ${index + 1}</h3>\n${point}`).join('\n\n')}`;
        setModalContent(formattedSummary);
        setIsModalOpen(true);
      } 
      // Otherwise generate it
      else {
        // First try to use stored transcript
        if (video.transcript) {
          const summary = await generateSummary(video.transcript);
          setModalContent(summary);
          setIsModalOpen(true);
        } else {
          // Otherwise fetch transcript and generate summary
          const transcript = await fetchTranscript(video.link);
          const summary = await generateSummary(transcript);
          setModalContent(summary);
          setIsModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setViewLoading(false);
    }
  };
  
  const handleViewNotes = async (video) => {
    if (!video.link) {
      setError('No video link available');
      return;
    }
    
    setViewLoading(true);
    setModalTitle(`Detailed Notes: ${video.title}`);
    setCurrentVideoUrl(video.link);
    
    try {
      // First check if we have the notes stored directly
      if (video.notes) {
        setModalContent(video.notes);
        setIsModalOpen(true);
      }
      // Then check if we have points from a notes type save
      else if (video.type === 'notes' && video.points && video.points.length > 0) {
        const formattedNotes = `<h2>Detailed Notes</h2>\n\n${video.points.map(point => `<h3>${point.substring(0, 30)}...</h3>\n${point}`).join('\n\n')}`;
        setModalContent(formattedNotes);
        setIsModalOpen(true);
      } 
      // Otherwise generate it
      else {
        // First try to use stored transcript
        if (video.transcript) {
          const notes = await generateDetailedNotes(video.transcript);
          setModalContent(notes);
          setIsModalOpen(true);
        } else {
          // Otherwise fetch transcript and generate notes
          const transcript = await fetchTranscript(video.link);
          const notes = await generateDetailedNotes(transcript);
          setModalContent(notes);
          setIsModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Error generating notes:', err);
      setError('Failed to generate detailed notes. Please try again.');
    } finally {
      setViewLoading(false);
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent('');
    setTranslatedContent('');
    setTranslating(false);
  };
  
  const handleTranslate = async () => {
    if (!modalContent) {
      setError('No content available to translate');
      return;
    }

    setTranslating(true);
    setError('');

    try {
      const translated = await translateText(modalContent, targetLanguage);
      setTranslatedContent(translated);
    } catch (err) {
      setError(err.message || 'Failed to translate content');
    } finally {
      setTranslating(false);
    }
  };
  
  const handleDownload = () => {
    const content = translatedContent || modalContent;
    generatePDF(content, modalTitle);
  };

  if (!user) {
    return (
      <div className="collections-container">
        <h2>My Collections</h2>
        <div className="sign-in-prompt">
          <p>Please sign in to view your collections.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="collections-container">
      <div className="collections-header">
        <h2>My Collections</h2>
        <div className="sort-controls">
          <select 
            value={sortOption} 
            onChange={handleSortChange} 
            className="sort-select"
          >
            <option value="savedAt">Date Added</option>
            <option value="title">Video Title</option>
          </select>
          <button 
            onClick={handleOrderChange} 
            className="sort-order-button"
          >
            {sortOrder === 'desc' ? '↓ Descending' : '↑ Ascending'}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your collection...</p>
        </div>
      ) : savedVideos.length === 0 ? (
        <div className="empty-collection">
          <p>Your collection is empty. Save videos from search or analysis to see them here.</p>
        </div>
      ) : (
        <div className="video-collection-grid">
          {savedVideos.map(video => (
            <div key={video.id} className="saved-video-card">
              <button 
                className="delete-video-button" 
                onClick={() => handleDelete(video.id)}
                aria-label="Delete video"
              >
                ×
              </button>
              
              <div className="video-thumbnail-container">
                <a href={video.link} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} 
                    alt={video.title} 
                    className="video-thumbnail" 
                  />
                </a>
              </div>
              
              <div className="saved-video-info">
                <h3 className="saved-video-title">
                  <a href={video.link} target="_blank" rel="noopener noreferrer">
                    {video.title}
                  </a>
                </h3>
                
                <div className="saved-video-meta">
                  <span>Saved: {new Date(video.savedAt.toDate ? video.savedAt.toDate() : video.savedAt).toLocaleDateString()}</span>
                  {video.type && <span className="video-type">{video.type}</span>}
                </div>
                
                <div className="saved-video-summary">
                  {video.points && video.points.length > 0 && (
                    <>
                      <h4>Key Points:</h4>
                      <ul className="summary-points-list">
                        {video.points.slice(0, 3).map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                        {video.points.length > 3 && (
                          <li className="more-points">...and {video.points.length - 3} more points</li>
                        )}
                      </ul>
                    </>
                  )}
                </div>
                
                <div className="saved-video-actions">
                  <button 
                    className="view-button"
                    onClick={() => handleViewSummary(video)}
                    disabled={viewLoading}
                  >
                    Summary
                  </button>
                  <button 
                    className="view-button"
                    onClick={() => handleViewNotes(video)}
                    disabled={viewLoading}
                  >
                    Notes
                  </button>
                  <button 
                    className="view-button"
                    onClick={() => handleViewTranscript(video)}
                    disabled={viewLoading}
                  >
                    Transcript
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <ContentModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        content={modalContent}
        targetLanguage={targetLanguage}
        setTargetLanguage={setTargetLanguage}
        onTranslate={handleTranslate}
        translating={translating}
        translatedContent={translatedContent}
        onDownload={handleDownload}
        videoUrl={currentVideoUrl}
        canSave={false}
        saving={false}
      />
      
      {viewLoading && !isModalOpen && (
        <div className="loading-overlay">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading content, please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Collections; 