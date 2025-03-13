/**
 * TranscriptDisplay Component
 * 
 * Purpose:
 * Displays the fetched transcript and provides a button to analyze it.
 * 
 * Props:
 * - transcript: The transcript text to display
 * - onGetInsights: Function to call when the "Get Insights" button is clicked
 * - analyzing: Boolean indicating if analysis is in progress
 * 
 * Outputs:
 * - Displays the transcript
 * - Provides UI to trigger analysis
 */

function TranscriptDisplay({ transcript, onGetInsights, analyzing }) {
  if (!transcript) return null
  
  return (
    <div className="transcript-container">
      <div className="header">
        <h2>Transcript:</h2>
        <button
          onClick={onGetInsights}
          disabled={analyzing}
          className="insight-button"
        >
          {analyzing ? 'Analyzing...' : 'Get Insights'}
        </button>
      </div>
      <pre className="transcript">{transcript}</pre>
    </div>
  )
}

export default TranscriptDisplay 