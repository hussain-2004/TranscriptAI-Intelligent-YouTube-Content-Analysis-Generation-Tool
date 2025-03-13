/**
 * AnalysisDisplay Component
 * 
 * Purpose:
 * Displays the analysis results from the transcript.
 * 
 * Props:
 * - summary: The analysis text to display
 * 
 * Outputs:
 * - Formatted display of the analysis results
 */

function AnalysisDisplay({ summary }) {
  if (!summary) return null
  
  return (
    <div className="summary">
      {summary.split('\n').map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </div>
  )
}

export default AnalysisDisplay 