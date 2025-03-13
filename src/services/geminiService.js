/**
 * Gemini AI Service
 * 
 * Purpose:
 * Handles interactions with the Gemini AI API.
 * 
 * Functions:
 * - analyzeTranscript: Analyzes a transcript and returns structured insights
 * - translateText: Translates text to a specified language
 * - formatTextWithHeadings: Helper function to format text with proper heading tags
 * 
 * This service can be replaced if the AI provider changes.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import html2pdf from 'html2pdf.js'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyBxlYD0n9j23oHap9zJlEk5KFC8kDwQS64")
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

export async function analyzeTranscript(transcript) {
  try {
    const maxLength = 30000
    const truncatedTranscript = transcript.length > maxLength 
      ? transcript.slice(0, maxLength) + "..." 
      : transcript

    const prompt = `
      Analyze this YouTube video transcript and provide a structured analysis.
      Format the response as a valid JSON object according to this schema:
      {
        "summary": "A concise 2-3 sentence summary",
        "keyPoints": ["Point 1", "Point 2", "Point 3", ...],
        "insights": ["Insight 1", "Insight 2", "Insight 3", ...],
        "topics": "Comma separated list of topics discussed"
      }
      
      Important: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text.
      
      Transcript:
      ${truncatedTranscript}
    `.trim()

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    })

    const response = await result.response
    const text = response.text()
    
    // Try to parse as JSON, or handle as text if parsing fails
    let analysis
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      let jsonText = text
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1]
      }
      
      analysis = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError)
      // Fallback: Create a structured object from the text response
      return `
The model didn't return valid JSON. Here's the raw response:

${text}
      `.trim()
    }

    return `
Summary:
${analysis.summary}

Key Points:
${analysis.keyPoints.map(point => `• ${point}`).join('\n')}

Notable Insights:
${analysis.insights.map(insight => `• ${insight}`).join('\n')}

Topics Discussed:
${analysis.topics}
    `.trim()

  } catch (error) {
    console.error('Error analyzing transcript:', error)
    throw new Error(error.message || 'Failed to analyze transcript')
  }
}

export async function translateText(text, targetLanguage) {
  try {
    const prompt = `
      Translate the following text into ${targetLanguage}:
      
      ${text}
      
      Note: Please preserve the formatting. If there are headings or important terms, 
      you can enclose them in double asterisks like **Heading**.
    `.trim()

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    })

    const response = await result.response
    const translatedText = response.text()
    
    // Format the text to convert **Heading** to <h3>Heading</h3>
    return formatTextWithHeadings(translatedText)
  } catch (error) {
    console.error('Error translating text:', error)
    throw new Error(error.message || 'Failed to translate text')
  }
}

export function formatTextWithHeadings(text) {
  // First replace # Heading with <h2>Heading</h2> for main headings
  let formattedText = text.replace(/^#\s+(.+)$/gm, '<h2>$1</h2>');
  
  // Then replace **Heading** with <h3>Heading</h3> for subheadings
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<h3>$1</h3>');
  
  // Convert bullet points to proper HTML lists
  // Split by lines to process properly
  const lines = formattedText.split('\n');
  let inList = false;
  let processedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line is a bullet point
    if (line.trim().match(/^[•\*\-]\s+(.+)$/)) {
      const content = line.trim().replace(/^[•\*\-]\s+(.+)$/, '$1');
      
      if (!inList) {
        // Start a new list
        processedLines.push('<ul>');
        inList = true;
      }
      
      // Add the list item
      processedLines.push(`  <li>${content}</li>`);
    } else {
      // Close list if we were in one
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      
      // Add the regular line
      processedLines.push(line);
    }
  }
  
  // Close list if we're still in one at the end
  if (inList) {
    processedLines.push('</ul>');
  }
  
  return processedLines.join('\n');
}

export async function generateSummary(transcript) {
  try {
    const maxLength = 30000
    const truncatedTranscript = transcript.length > maxLength 
      ? transcript.slice(0, maxLength) + "..." 
      : transcript

    const prompt = `
      Create a concise summary of this YouTube video transcript.
      Focus on the main points and key takeaways.
      
      Format your response with:
      - Use # for main headings (with a space after #)
      - Use ** for subheadings (like **Subheading**)
      - Use bullet points (- or *) for lists and key points
      
      Transcript:
      ${truncatedTranscript}
    `.trim()

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    })

    const response = await result.response
    const text = response.text()
    
    // Format the text to convert markdown headings to HTML
    return formatTextWithHeadings(text)
  } catch (error) {
    console.error('Error generating summary:', error)
    throw new Error(error.message || 'Failed to generate summary')
  }
}

export async function generateDetailedNotes(transcript) {
  try {
    const maxLength = 30000
    const truncatedTranscript = transcript.length > maxLength 
      ? transcript.slice(0, maxLength) + "..." 
      : transcript

    const prompt = `
      Create detailed educational notes from this YouTube video transcript.
      
      Please follow these formatting guidelines:
      1. Use # for main sections/topics (with a space after #)
      2. Use **Subheading** format for subsections
      3. Elaborate on each important concept thoroughly
      4. For technical terms, provide clear explanations and examples
      5. Include practical applications where relevant
      6. Use bullet points (- or *) for lists and key points
      
      Make the notes comprehensive yet easy to understand for someone studying this topic.
      
      Transcript:
      ${truncatedTranscript}
    `.trim()

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })

    const response = await result.response
    const text = response.text()
    
    // Format the text to convert markdown headings to HTML
    return formatTextWithHeadings(text)
  } catch (error) {
    console.error('Error generating detailed notes:', error)
    throw new Error(error.message || 'Failed to generate detailed notes')
  }
}

// Update the generatePDF function
export function generatePDF(content, title) {
  // Create a hidden element to render the content
  const element = document.createElement('div');
  element.innerHTML = `
    <h1 style="color: #3a86ff; margin-bottom: 20px;">${title}</h1>
    <div>${content}</div>
  `;
  element.style.padding = '20px';
  document.body.appendChild(element);
  
  // Use html2pdf library to generate PDF
  const opt = {
    margin: 1,
    filename: `${title.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  
  html2pdf().set(opt).from(element).save().then(() => {
    // Remove the element after PDF generation
    document.body.removeChild(element);
  }).catch(error => {
    console.error('Error generating PDF:', error);
    // Clean up on error
    document.body.removeChild(element);
    alert('Failed to generate PDF. Please try again.');
  });
}

// Update this function to generate 6 points instead of 5
export async function generateVideoKeyPoints(transcript) {
  try {
    const maxLength = 30000
    const truncatedTranscript = transcript.length > maxLength 
      ? transcript.slice(0, maxLength) + "..." 
      : transcript

    const prompt = `
      Generate exactly 6 key points that summarize this YouTube video transcript.
      
      Requirements:
      1. Each point must be clear, informative, and standalone
      2. Each point must be 15-20 words
      3. Focus on the most important insights from the video
      4. Use simple, direct language
      5. Return only the 6 numbered points, nothing else
      
      Transcript:
      ${truncatedTranscript}
    `.trim()

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 512,
      }
    })

    const response = await result.response
    const text = response.text()
    
    // Parse the points from the response
    const points = text
      .split(/\d+\./)  // Split by numbered list format
      .slice(1)        // Remove any text before the first point
      .map(point => point.trim())
      .filter(point => point.length > 0)
      .slice(0, 6)     // Ensure we only get 6 points
    
    return points
  } catch (error) {
    console.error('Error generating key points:', error)
    throw new Error(error.message || 'Failed to generate key points')
  }
}

export async function generateContentFromNotesAndPrompt(videoNotes, userPrompt) {
  try {
    // Limit the size of notes to avoid token limits
    const maxLength = 30000;
    const truncatedNotes = videoNotes.length > maxLength 
      ? videoNotes.slice(0, maxLength) + "..." 
      : videoNotes;

    const prompt = `
      I need you to create content based on the following YouTube video notes and the user's input.
      
      VIDEO NOTES:
      ${truncatedNotes}
      
      USER INPUT:
      ${userPrompt}
      
      Please generate well-structured content that combines insights from the video with the user's request.
      Format your response with appropriate HTML formatting (use h2, h3, p, ul, li tags as needed).
      Focus on creating valuable content that addresses the user's input while incorporating key information from the video.
    `.trim();

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    const response = await result.response;
    const text = response.text();
    
    // Format the response with HTML tags
    return formatTextWithHeadings(text);
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error(error.message || 'Failed to generate content');
  }
} 