const { parse } = require('url')
const next = require('next')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Function to read secrets or use environment variables
const getEnvVariables = () => {
  if (dev) {
    // For local development, use environment variables directly
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  } else {
    // For production, attempt to read from secrets
    try {
      return {
        NEXT_PUBLIC_SUPABASE_URL: fs.readFileSync('/run/secrets/supabase_url', 'utf8').trim(),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: fs.readFileSync('/run/secrets/supabase_key', 'utf8').trim()
      }
    } catch (error) {
      console.error('Error reading secrets:', error)
      // Fallback to environment variables if secrets are not available
      return {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    }
  }
}

// Set environment variables
const envVars = getEnvVariables()
process.env.NEXT_PUBLIC_SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Import Supabase client (this will also test the connection)
require('./utils/supabaseClient')

app.prepare().then(() => {
  require('http').createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})