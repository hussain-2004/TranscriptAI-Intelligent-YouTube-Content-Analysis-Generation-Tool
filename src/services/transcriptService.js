/**
 * Transcript Service
 * 
 * Purpose:
 * Handles fetching transcripts from the backend API.
 * 
 * Functions:
 * - fetchTranscript: Fetches a transcript for a given YouTube URL
 * 
 * This service can be replaced if the API provider changes.
 */

export async function fetchTranscript(videoUrl) {
  const response = await fetch(`http://localhost:3001/api/transcript?url=${encodeURIComponent(videoUrl)}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch transcript')
  }

  if (!data.content) {
    throw new Error('No transcript found for this video')
  }
  
  return data.content
} 