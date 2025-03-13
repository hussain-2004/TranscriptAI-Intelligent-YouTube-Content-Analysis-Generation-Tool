/**
 * ErrorDisplay Component
 * 
 * Purpose:
 * Displays error messages to the user.
 * 
 * Props:
 * - error: The error message to display
 * 
 * Outputs:
 * - Formatted error message
 */

function ErrorDisplay({ error }) {
  if (!error) return null
  
  return (
    <div className="error">{error}</div>
  )
}

export default ErrorDisplay 