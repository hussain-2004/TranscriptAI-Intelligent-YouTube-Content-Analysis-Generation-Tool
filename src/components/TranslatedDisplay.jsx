/**
 * TranslatedDisplay Component
 * 
 * Purpose:
 * Displays the translated analysis.
 * 
 * Props:
 * - translatedSummary: The translated text to display
 * - targetLanguage: The language the text was translated to
 * 
 * Outputs:
 * - Formatted display of the translated analysis
 */

function TranslatedDisplay({ translatedSummary, targetLanguage }) {
  if (!translatedSummary) return null
  
  return (
    <div className="translated-container">
      <h2>Translated Analysis ({targetLanguage}):</h2>
      <div className="summary">
        {translatedSummary.split('\n').map((line, index) => {
          // Check if the line contains formatted heading tags
          if (line.includes('<h3>')) {
            return <div key={index} dangerouslySetInnerHTML={{ __html: line }} />;
          }
          return <p key={index}>{line}</p>;
        })}
      </div>
    </div>
  )
}

export default TranslatedDisplay 