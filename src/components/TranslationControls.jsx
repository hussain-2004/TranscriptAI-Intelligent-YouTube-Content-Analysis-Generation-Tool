/**
 * TranslationControls Component
 * 
 * Purpose:
 * Provides UI for selecting a language and triggering translation.
 * 
 * Props:
 * - targetLanguage: Currently selected language
 * - setTargetLanguage: Function to update the selected language
 * - onTranslate: Function to call when the translate button is clicked
 * - translating: Boolean indicating if translation is in progress
 * 
 * Outputs:
 * - Language selection dropdown
 * - Translation button
 */

function TranslationControls({ targetLanguage, setTargetLanguage, onTranslate, translating }) {
  return (
    <div className="translation-controls">
      <select 
        value={targetLanguage}
        onChange={(e) => setTargetLanguage(e.target.value)}
        className="language-select"
      >
        <option value="Hindi">Hindi</option>
        <option value="Telugu">Telugu</option>
        <option value="Tamil">Tamil</option>
        <option value="Kannada">Kannada</option>
      </select>
      <button
        onClick={onTranslate}
        disabled={translating}
        className="translate-button"
      >
        {translating ? 'Translating...' : `Translate to ${targetLanguage}`}
      </button>
    </div>
  )
}

export default TranslationControls 