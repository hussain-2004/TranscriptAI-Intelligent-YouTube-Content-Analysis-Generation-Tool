/**
 * ViewOptions Component
 * 
 * Purpose:
 * Provides buttons for different viewing options of the transcript.
 * 
 * Props:
 * - onViewSummary: Function to call when View Summary button is clicked
 * - onViewDetailedNotes: Function to call when View Detailed Notes button is clicked
 * - onViewTranscript: Function to call when View Plain Transcript button is clicked
 * - hasTranscript: Boolean indicating if a transcript is available
 * - loading: Boolean indicating if any process is in progress
 * 
 * Outputs:
 * - Buttons for different viewing options
 */

function ViewOptions({ onViewSummary, onViewDetailedNotes, onViewTranscript, hasTranscript, loading }) {
  return (
    <div className="view-options">
      <button 
        onClick={onViewSummary}
        disabled={!hasTranscript || loading}
        className="view-button"
      >
        View Summary
      </button>
      <button 
        onClick={onViewDetailedNotes}
        disabled={!hasTranscript || loading}
        className="view-button"
      >
        View Detailed Notes
      </button>
      <button 
        onClick={onViewTranscript}
        disabled={!hasTranscript || loading}
        className="view-button"
      >
        View Plain Transcript
      </button>
    </div>
  )
}

export default ViewOptions 