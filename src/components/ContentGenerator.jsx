import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserVideos } from '../services/databaseService';
import { 
  generateContentFromNotesAndPrompt, 
  translateText, 
  generatePDF 
} from '../services/geminiService';
import ContentModal from './ContentModal';
import { LANGUAGES } from '../constants/languages';

function ContentGenerator() {
  const { user } = useAuth();
  const [savedVideos, setSavedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generating, setGenerating] = useState(false);
  
  // Modal state variables
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('Hindi');
  const [translating, setTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState('');
  
  // Fetch saved videos on component mount
  useEffect(() => {
    if (!user) {
      setSavedVideos([]);
      setLoading(false);
      return;
    }

    const fetchSavedVideos = async () => {
      try {
        setLoading(true);
        const videos = await getUserVideos(user.uid, 'savedAt', 'desc');
        setSavedVideos(videos);
        setError('');
      } catch (err) {
        console.error('Error fetching saved videos:', err);
        setError('Failed to load your videos. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedVideos();
  }, [user]);

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    setError('');
  };

  const handleGenerateContent = async () => {
    if (!selectedVideo) {
      setError('Please select a video first');
      return;
    }

    if (!userInput.trim()) {
      setError('Please enter some input in the text box');
      return;
    }

    setGenerating(true);
    setError('');
    
    try {
      // Get video notes - prioritize stored notes, summary, or points
      let videoNotes = '';
      
      if (selectedVideo.notes) {
        videoNotes = selectedVideo.notes;
      } else if (selectedVideo.summary) {
        videoNotes = selectedVideo.summary;
      } else if (selectedVideo.points && selectedVideo.points.length > 0) {
        videoNotes = selectedVideo.points.join('\n\n');
      } else {
        throw new Error('No notes or summary available for the selected video');
      }
      
      // Generate content using Gemini
      const content = await generateContentFromNotesAndPrompt(videoNotes, userInput);
      setGeneratedContent(content);
    } catch (err) {
      console.error('Error generating content:', err);
      setError(err.message || 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const handleClearContent = () => {
    setGeneratedContent('');
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent)
      .then(() => {
        alert('Content copied to clipboard!');
      })
      .catch(() => {
        setError('Failed to copy content to clipboard');
      });
  };
  
  // Handle enlarge button click
  const handleEnlargeContent = () => {
    console.log('Enlarge button clicked');
    if (generatedContent) {
      setIsModalOpen(true);
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTranslatedContent('');
    setTranslating(false);
  };
  
  const handleTranslate = async () => {
    if (!generatedContent) {
      setError('No content available to translate');
      return;
    }

    setTranslating(true);
    setError('');

    try {
      const translated = await translateText(generatedContent, targetLanguage);
      setTranslatedContent(translated);
    } catch (err) {
      setError(err.message || 'Failed to translate content');
    } finally {
      setTranslating(false);
    }
  };
  
  const handleDownload = () => {
    const content = translatedContent || generatedContent;
    const title = selectedVideo ? `Content based on: ${selectedVideo.title}` : 'Generated Content';
    generatePDF(content, title);
  };

  if (!user) {
    return (
      <div className="content-generator-container">
        <h2>Content Generator</h2>
        <div className="sign-in-prompt">
          <p>Please sign in to use the Content Generator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-generator-container">
      <h2>Content Generator</h2>
      
      <div className="content-generator-layout">
        {/* Left sidebar with saved videos */}
        <div className="saved-videos-sidebar">
          <h3>Your Saved Videos</h3>
          
          {loading ? (
            <div className="loading-container-small">
              <div className="loading-spinner-small"></div>
              <p>Loading videos...</p>
            </div>
          ) : savedVideos.length === 0 ? (
            <div className="no-videos-message">
              <p>No saved videos found. Save videos from the Search or Transcribe tabs.</p>
            </div>
          ) : (
            <div className="video-cards-list">
              {savedVideos.map(video => (
                <div 
                  key={video.id} 
                  className={`video-card-compact ${selectedVideo?.id === video.id ? 'selected' : ''}`}
                  onClick={() => handleSelectVideo(video)}
                >
                  <div className="compact-thumbnail">
                    <img 
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} 
                      alt={video.title} 
                    />
                  </div>
                  <div className="compact-info">
                    <h4>{video.title}</h4>
                    <span className="compact-type">{video.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Right side with input and output */}
        <div className="content-generator-main">
          <div className="selected-video-info">
            {selectedVideo ? (
              <div>
                <h3>Using: {selectedVideo.title}</h3>
                <p className="note-type">Using {selectedVideo.notes ? 'detailed notes' : selectedVideo.summary ? 'summary' : 'key points'} from this video</p>
              </div>
            ) : (
              <p>Select a video from the sidebar to use its notes</p>
            )}
          </div>
          
          <div className="input-output-container">
            <div className="user-input-section">
              <h3>Your Input</h3>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter your content or prompts here. For example: 'Create a blog post about [topic] using concepts from the video' or 'Generate a script for a presentation on [topic] based on the video notes'"
                className="user-input-textarea"
              />
              
              <div className="input-controls">
                <button 
                  onClick={handleGenerateContent}
                  disabled={generating || !selectedVideo || !userInput.trim()}
                  className="generate-button"
                >
                  {generating ? 'Generating...' : 'Generate Content'}
                </button>
                
                <button 
                  onClick={() => setUserInput('')}
                  className="clear-input-button"
                >
                  Clear Input
                </button>
              </div>
            </div>
            
            <div className="generated-content-section">
              <div className="content-header">
                <h3>Generated Content</h3>
                {generatedContent && (
                  <button 
                    onClick={handleEnlargeContent}
                    className="enlarge-button"
                    title="Enlarge content"
                  >
                    Enlarge <span className="enlarge-icon">⤢</span>
                  </button>
                )}
              </div>
              
              {error && <div className="error">{error}</div>}
              
              {generating ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p className="loading-text">Generating content, please wait...</p>
                </div>
              ) : (
                <>
                  <div 
                    className="generated-content-display"
                    dangerouslySetInnerHTML={{ __html: generatedContent }}
                  />
                  
                  {generatedContent && (
                    <div className="output-controls">
                      <button onClick={handleCopyContent} className="copy-button">
                        Copy to Clipboard
                      </button>
                      <button onClick={handleClearContent} className="clear-output-button">
                        Clear Output
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* ContentModal for enlarged view */}
      <ContentModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedVideo ? `Content based on: ${selectedVideo.title}` : 'Generated Content'}
        content={generatedContent}
        targetLanguage={targetLanguage}
        setTargetLanguage={setTargetLanguage}
        onTranslate={handleTranslate}
        translating={translating}
        translatedContent={translatedContent}
        onDownload={handleDownload}
        canSave={false}
        saving={false}
      />
    </div>
  );
}

export default ContentGenerator; 