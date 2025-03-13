import express from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001
const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6IjEifQ.eyJpc3MiOiJuYWRsZXMiLCJpYXQiOiIxNzQxNzg1NjAzIiwicHVycG9zZSI6ImFwaV9hdXRoZW50aWNhdGlvbiIsInN1YiI6IjA1MzIzM2M1MzBhYTQ3M2FiMTA1MDFiNmY4NTM1ZGQ5In0.WFJJ8fmQok-0yTc0hUaH2EBU0Fl8GohBxthXZfKWq3k'

app.get('/api/transcript', async (req, res) => {
  const { url } = req.query

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    console.log('Making request to Supadata API...')
    console.log('URL:', url)
    
    const response = await axios.get('https://api.supadata.ai/v1/youtube/transcript', {
      params: {
        url,
        text: true
      },
      headers: {
        'x-api-key': API_KEY,
        'Accept': 'application/json'
      },
      validateStatus: function (status) {
        return status < 500 // Resolve only if status code is less than 500
      }
    })

    if (response.status !== 200) {
      console.error('API Error:', response.data)
      return res.status(response.status).json({
        error: response.data.message || 'Error fetching transcript'
      })
    }
    
    res.json(response.data)
  } catch (error) {
    console.error('Server Error:', error.message)
    if (error.response) {
      console.error('API Response:', error.response.data)
    }
    
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || error.message || 'Internal Server Error'
    })
  }
})

// YouTube Search Proxy endpoint
app.get('/api/youtube-search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const API_KEY = 'bf3cf3bcbbeaea2193ed7101aa27ffafe26a2b8a754bb2a04adc3b970bb54096';
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'youtube',
        search_query: query,
        api_key: API_KEY
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to SerpAPI:', error);
    res.status(500).json({ 
      error: 'Failed to fetch search results',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 