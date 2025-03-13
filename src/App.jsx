/**
 * Main App Component
 * 
 * Purpose:
 * Orchestrates the application flow and manages state.
 * 
 * Components:
 * - Header: For navigation between features
 * - TranscriptInput: For entering YouTube URLs
 * - ViewOptions: For selecting different viewing options
 * - ErrorDisplay: For showing errors
 * - ContentModal: For displaying content in a modal
 * - YouTubeSearch: For searching YouTube videos
 * - Collections: For displaying saved videos
 * - ContentGenerator: For generating content using Gemini AI
 * 
 * Services:
 * - transcriptService: For fetching transcripts
 * - geminiService: For AI analysis and translation
 * - serpApiService: For searching YouTube videos
 * - databaseService: For saving videos to the database
 */

import { useState, useEffect } from 'react'
import './App.css'

// Import components
import Header from './components/Header'
import TranscriptInput from './components/TranscriptInput'
import ViewOptions from './components/ViewOptions'
import ErrorDisplay from './components/ErrorDisplay'
import ContentModal from './components/ContentModal'
import YouTubeSearch from './components/YouTubeSearch'
import Collections from './components/Collections'
import ContentGenerator from './components/ContentGenerator'
import { AuthProvider } from './contexts/AuthContext'

// Import services
import { fetchTranscript } from './services/transcriptService'
import { 
  analyzeTranscript, 
  translateText, 
  generateSummary, 
  generateDetailedNotes,
  generatePDF,
  generateVideoKeyPoints
} from './services/geminiService'
import { searchYouTube } from './services/serpApiService'
import { saveVideoToCollection } from './services/databaseService'

// Main App component that doesn't directly use useAuth
function AppContent({ 
  // Pass all necessary props from the wrapper component
  user,
  activeTab,
  setActiveTab,
  // Other props here...
}) {
  // Tab state
  const [videoUrl, setVideoUrl] = useState('')
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalContent, setModalContent] = useState('')
  
  // Translation states
  const [targetLanguage, setTargetLanguage] = useState('Hindi')
  const [translating, setTranslating] = useState(false)
  const [translatedContent, setTranslatedContent] = useState('')
  
  // Processing states
  const [processing, setProcessing] = useState(false)
  
  // Content states
  const [summaryContent, setSummaryContent] = useState('')
  const [detailedNotesContent, setDetailedNotesContent] = useState('')

  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  // New states for video analysis
  const [analyzing, setAnalyzing] = useState(false)
  const [videoAnalysis, setVideoAnalysis] = useState(null)

  // Add this new state variable
  const [analyzedVideos, setAnalyzedVideos] = useState({})

  // Add these state variables for video analysis translation
  const [translatingVideoAnalysis, setTranslatingVideoAnalysis] = useState(false);
  const [translatedVideoPoints, setTranslatedVideoPoints] = useState(null);

  // Add a saving state
  const [saving, setSaving] = useState(false)

  // Add functions to handle saving from different sources
  const handleSaveTranscriptContent = async (title, content, videoUrl) => {
    if (!user) {
      alert('Please sign in to save to your collection');
      return;
    }
    
    setSaving(true);
    
    try {
      // Extract video ID from URL
      let videoId;
      try {
        const urlObj = new URL(videoUrl);
        videoId = urlObj.searchParams.get('v');
      } catch (err) {
        // For cases where URL might not be a full YouTube URL
        videoId = 'unknown';
      }
      
      // Format content into points for consistency
      const formattedContent = formatContentToPoints(content, title);
      
      // Get thumbnail if possible
      const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
      
      // Determine the content type from the title
      const contentType = title.includes('Summary') ? 'summary' : 
                         title.includes('Notes') ? 'notes' : 'transcript';
      
      // Extract title from the videoUrl if not a full video object
      const videoTitle = title.includes(':') ? title.split(':')[1].trim() : 'Untitled Video';
      
      // Create the base video data
      const videoToSave = {
        videoId,
        title: videoTitle,
        points: formattedContent,
        language: targetLanguage,
        thumbnail,
        link: videoUrl,
        savedAt: new Date(),
        type: contentType,
        // Store the actual content
        transcript: contentType === 'transcript' ? content : null,
        summary: contentType === 'summary' ? content : null,
        notes: contentType === 'notes' ? content : null
      };
      
      // If we already have other content (like transcript, summary, or notes), add it
      if (transcript && contentType !== 'transcript') {
        videoToSave.transcript = transcript;
      }
      
      if (summaryContent && contentType !== 'summary') {
        videoToSave.summary = summaryContent;
      }
      
      if (detailedNotesContent && contentType !== 'notes') {
        videoToSave.notes = detailedNotesContent;
      }
      
      await saveVideoToCollection(user.uid, videoToSave);
      alert('Saved to your collection!');
    } catch (err) {
      console.error('Error saving content:', err);
      setError('Failed to save to collection');
    } finally {
      setSaving(false);
    }
  };

  // Function to handle saving direct from search results
  const handleSaveSearchVideo = async (video) => {
    if (!user) {
      alert('Please sign in to save to your collection');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      // Extract video ID from URL
      let videoId;
      try {
        videoId = new URL(video.link).searchParams.get('v');
      } catch (err) {
        videoId = 'unknown';
      }
      
      // Create simplified points that tell user to analyze for full summary
      const points = [
        "This video was saved from search results.",
        "Analyze the video to see a full summary.",
        "Click on the title to watch on YouTube.",
        `Title: ${video.title}`,
        video.description ? `Description: ${video.description.substring(0, 100)}...` : "No description available.",
        video.views ? `Views: ${video.views}` : "View count unavailable."
      ];
      
      const videoToSave = {
        videoId,
        title: video.title,
        points,
        language: 'English',
        thumbnail: video.thumbnail?.static || video.thumbnail,
        link: video.link,
        savedAt: new Date(),
        type: 'search'
      };
      
      // Now also fetch and store transcript, summary, and notes if possible
      try {
        setError('Fetching transcript and generating content...');
        const videoTranscript = await fetchTranscript(video.link);
        videoToSave.transcript = videoTranscript;
        
        // Generate and store summary and notes
        const [summary, notes] = await Promise.all([
          generateSummary(videoTranscript),
          generateDetailedNotes(videoTranscript)
        ]);
        
        videoToSave.summary = summary;
        videoToSave.notes = notes;
        
        setError('');
      } catch (transcriptErr) {
        console.error('Error fetching additional content:', transcriptErr);
        // Continue saving even without transcript
      }
      
      await saveVideoToCollection(user.uid, videoToSave);
      alert('Video saved to your collection!');
    } catch (err) {
      console.error('Error saving video:', err);
      setError('Failed to save to collection');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to format content into points
  const formatContentToPoints = (content, title) => {
    // If the content is already in points format, use it
    if (Array.isArray(content)) {
      return content;
    }
    
    // Otherwise, try to extract key sections
    const sections = content.split(/<h2>|<h3>/).filter(Boolean);
    if (sections.length >= 6) {
      return sections.slice(0, 6).map(section => {
        // Clean
        return section.replace(/<\/?[^>]+>/g, '').trim();
      });
    }
    
    return content.split(/\n/).filter(Boolean).slice(0, 6).map(section => section.trim());
  };

  // Handler functions
  const handleFetch = async () => {
    setLoading(true)
    setError('')
    setTranscript('')
    setModalContent('')
    setTranslatedContent('')
    
    // Reset processing states
    setProcessing(true)

    if (!videoUrl) {
      setError('Please enter a YouTube URL')
      setLoading(false)
      setProcessing(false)
      return
    }

    try {
      console.log('Fetching transcript for:', videoUrl)
      const content = await fetchTranscript(videoUrl)
      setTranscript(content)
      
      // Start generating summary and detailed notes in parallel
      console.log('Generating summary and detailed notes...')
      
      // Use Promise.all to run both operations concurrently
      const [summary, detailedNotes] = await Promise.all([
        generateSummary(content),
        generateDetailedNotes(content)
      ])
      
      // Store the generated content in state
      setSummaryContent(summary)
      setDetailedNotesContent(detailedNotes)
      
      console.log('Content generation complete')
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Failed to fetch transcript or generate content')
    } finally {
      setLoading(false)
      setProcessing(false)
    }
  }

  const handleViewSummary = () => {
    if (!transcript) {
      setError('No transcript available')
      return
    }

    setModalTitle('Video Summary')
    
    if (summaryContent) {
      // Use pre-generated content if available
      setModalContent(summaryContent)
      setIsModalOpen(true)
      setTranslatedContent('')
    } else {
      // Fall back to generating on demand if needed
      setProcessing(true)
      setError('')
      
      generateSummary(transcript)
        .then(summary => {
          setSummaryContent(summary)
          setModalContent(summary)
          setIsModalOpen(true)
        })
        .catch(err => {
          setError(err.message || 'Failed to generate summary')
        })
        .finally(() => {
          setProcessing(false)
        })
    }
  }

  const handleViewDetailedNotes = () => {
    if (!transcript) {
      setError('No transcript available')
      return
    }

    setModalTitle('Detailed Notes')
    
    if (detailedNotesContent) {
      // Use pre-generated content if available
      setModalContent(detailedNotesContent)
      setIsModalOpen(true)
      setTranslatedContent('')
    } else {
      // Fall back to generating on demand if needed
      setProcessing(true)
      setError('')
      
      generateDetailedNotes(transcript)
        .then(notes => {
          setDetailedNotesContent(notes)
          setModalContent(notes)
          setIsModalOpen(true)
        })
        .catch(err => {
          setError(err.message || 'Failed to generate detailed notes')
        })
        .finally(() => {
          setProcessing(false)
        })
    }
  }

  const handleViewTranscript = () => {
    if (!transcript) {
      setError('No transcript available');
      return;
    }

    setModalTitle('Plain Transcript');
    setModalContent(transcript);
    setIsModalOpen(true);
    setTranslatedContent('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTranslating(false)
    setTranslatedContent('')
  }

  const handleTranslate = async () => {
    if (!modalContent) {
      setError('No content available to translate')
      return
    }

    setTranslating(true)
    setError('')

    try {
      const translated = await translateText(modalContent, targetLanguage)
      setTranslatedContent(translated)
    } catch (err) {
      setError(err.message || 'Failed to translate content')
    } finally {
      setTranslating(false)
    }
  }

  const handleDownload = () => {
    const content = translatedContent || modalContent
    generatePDF(content, modalTitle)
  }

  const handleYouTubeSearch = async (query) => {
    setSearchLoading(true)
    setSearchError('')
    
    try {
      const data = await searchYouTube(query)
      setSearchResults(data)
      setSearchQuery(query)
    } catch (err) {
      setSearchError(err.message || 'Search failed')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleAnalyzeVideo = async (videoUrl, videoTitle) => {
    // Extract video ID from URL
    let videoId;
    try {
      videoId = new URL(videoUrl).searchParams.get('v');
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }
    } catch (err) {
      setError('Invalid YouTube URL format');
      return;
    }
    
    // Check if we've already analyzed this video
    if (analyzedVideos[videoId]) {
      setVideoAnalysis(analyzedVideos[videoId]);
      return;
    }
    
    setAnalyzing(true);
    setVideoAnalysis(null);
    setError('');
    
    try {
      // Fetch transcript
      const transcript = await fetchTranscript(`https://www.youtube.com/watch?v=${videoId}`);
      
      // Generate key points
      const points = await generateVideoKeyPoints(transcript);
      
      // Store analysis results
      const analysisResult = {
        title: videoTitle,
        points: points,
        videoId: videoId
      };
      
      // Update state
      setVideoAnalysis(analysisResult);
      
      // Cache the results
      setAnalyzedVideos(prev => ({
        ...prev,
        [videoId]: analysisResult
      }));
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze video');
    } finally {
      setAnalyzing(false);
    }
  }

  const handleCloseAnalysis = () => {
    setVideoAnalysis(null)
  }

  // Add this function to handle translation of video analysis points
  const handleTranslateVideoAnalysis = async () => {
    if (targetLanguage === 'English' || !videoAnalysis) {
      return;
    }
    
    setTranslatingVideoAnalysis(true);
    setTranslatedVideoPoints(null);
    
    try {
      const translated = await Promise.all(
        videoAnalysis.points.map(point => 
          translateText(point, targetLanguage)
        )
      );
      
      setTranslatedVideoPoints(translated);
    } catch (err) {
      console.error('Translation error:', err);
      setError(err.message || 'Failed to translate');
    } finally {
      setTranslatingVideoAnalysis(false);
    }
  };

  // Add this function to generate PDF for video analysis
  const handleDownloadVideoAnalysis = (points, title) => {
    const content = `
      <div style="font-family: Arial, sans-serif;">
        ${points.map((point, index) => `
          <div style="margin-bottom: 15px; display: flex; align-items: flex-start;">
            <div style="background-color: #3a86ff; color: white; width: 30px; height: 30px; 
                 border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                 font-weight: bold; margin-right: 15px; flex-shrink: 0;">
              ${index + 1}
            </div>
            <p style="margin: 0; color: #333; line-height: 1.5; font-size: 16px;">
              ${point}
            </p>
          </div>
        `).join('')}
      </div>
    `;
    
    generatePDF(content, `Video Analysis: ${title}`);
  };

  const handleGenerateSummary = async () => {
    if (!transcript) return
    
    setProcessing(true)
    setError('')
    
    try {
      const summary = await generateSummary(transcript)
      setModalTitle('Summary')
      setModalContent(summary)
      setIsModalOpen(true)
    } catch (err) {
      console.error('Error generating summary:', err)
      setError(err.message || 'Failed to generate summary')
    } finally {
      setProcessing(false)
    }
  }

  const handleGenerateNotes = async () => {
    if (!transcript) return
    
    setProcessing(true)
    setError('')
    
    try {
      const notes = await generateDetailedNotes(transcript)
      setModalTitle('Detailed Notes')
      setModalContent(notes)
      setIsModalOpen(true)
    } catch (err) {
      console.error('Error generating notes:', err)
      setError(err.message || 'Failed to generate notes')
    } finally {
      setProcessing(false)
    }
  }

  // Add this function to handle saving video analysis
  const handleSaveVideoAnalysis = async (analysisData) => {
    if (!user) {
      alert('Please sign in to save to your collection');
      return;
    }
    
    if (!analysisData || !analysisData.videoId) {
      console.error('Missing analysis data or videoId');
      setError('Cannot save: Missing video information');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      const videoToSave = {
        videoId: analysisData.videoId,
        title: analysisData.title || 'Untitled Video',
        points: analysisData.points || [],
        language: targetLanguage,
        thumbnail: `https://img.youtube.com/vi/${analysisData.videoId}/mqdefault.jpg`,
        link: `https://www.youtube.com/watch?v=${analysisData.videoId}`,
        savedAt: new Date(),
        type: 'analysis'
      };
      
      // Now, let's also fetch and store the transcript, summary, and notes
      // First check if we've already analyzed this video and have a transcript
      let videoTranscript = '';
      
      // Get transcript if we don't have it
      try {
        setError('Fetching transcript and generating content...');
        videoTranscript = await fetchTranscript(`https://www.youtube.com/watch?v=${analysisData.videoId}`);
        videoToSave.transcript = videoTranscript;
        
        // Generate and store summary and notes
        const [summary, notes] = await Promise.all([
          generateSummary(videoTranscript),
          generateDetailedNotes(videoTranscript)
        ]);
        
        videoToSave.summary = summary;
        videoToSave.notes = notes;
        
        setError('');
      } catch (transcriptErr) {
        console.error('Error fetching additional content:', transcriptErr);
        // Continue with saving even if we can't get the transcript
        // The analysis points are already available
      }
      
      await saveVideoToCollection(user.uid, videoToSave);
      alert('Analysis saved to your collection!');
    } catch (err) {
      console.error('Error saving analysis:', err);
      setError('Failed to save to collection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {activeTab === 'transcribe' ? (
          <div className="container">
            <TranscriptInput 
              onAnalyze={handleFetch}
              videoUrl={videoUrl}
              setVideoUrl={setVideoUrl}
              loading={loading}
              hasTranscript={!!transcript}
              onViewSummary={handleViewSummary}
              onViewDetailedNotes={handleViewDetailedNotes}
              onViewTranscript={handleViewTranscript}
            />
            
            <ErrorDisplay error={error} />
            
            {processing && !isModalOpen && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Generating content, please wait...</p>
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
              onSave={handleSaveTranscriptContent}
              canSave={!!user}
              saving={saving}
              videoUrl={videoUrl}
            />
          </div>
        ) : activeTab === 'search' ? (
          <YouTubeSearch 
            query={searchQuery}
            setQuery={setSearchQuery}
            results={searchResults}
            loading={searchLoading}
            error={searchError}
            onSearch={handleYouTubeSearch}
            onAnalyzeVideo={handleAnalyzeVideo}
            videoAnalysis={videoAnalysis}
            analyzing={analyzing}
            onCloseAnalysis={handleCloseAnalysis}
            targetLanguage={targetLanguage}
            setTargetLanguage={setTargetLanguage}
            translatedPoints={translatedVideoPoints}
            translating={translatingVideoAnalysis}
            onTranslate={handleTranslateVideoAnalysis}
            onDownload={handleDownloadVideoAnalysis}
            onSave={handleSaveVideoAnalysis}
            canSave={!!user}
            saving={saving}
          />
        ) : activeTab === 'generator' ? (
          <ContentGenerator />
        ) : (
          <Collections />
        )}
      </main>
    </div>
  )
}

// Wrapper component that uses AuthContext and passes user to AppContent
import { useAuth } from './contexts/AuthContext'

function App() {
  const [activeTab, setActiveTab] = useState('transcribe')
  const { user } = useAuth(); // Get user from auth context
  
  return (
    <AppContent 
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      // Pass any other necessary props
    />
  )
}

// Modify your export to wrap the App with AuthProvider
export default function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
