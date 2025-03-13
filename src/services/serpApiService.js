/**
 * SerpAPI YouTube Search Service
 * 
 * Purpose:
 * Handles search requests to the SerpAPI YouTube engine via our proxy server.
 * 
 * Functions:
 * - searchYouTube: Searches YouTube using SerpAPI
 * 
 * This service can be replaced if the API provider changes.
 */

// Instead of directly calling SerpAPI or using CORS-Anywhere,
// we'll use our local proxy server endpoint
const PROXY_URL = 'http://localhost:3001/api/youtube-search';

export async function searchYouTube(query, options = {}) {
  try {
    console.log(`Searching for: ${query}`);
    
    const response = await fetch(`${PROXY_URL}?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Search failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Search results:', data);
    return data;
  } catch (error) {
    console.error('Error searching YouTube:', error);
    throw new Error(error.message || 'Failed to search YouTube');
  }
} 