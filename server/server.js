// ===== SERVER SETUP =====
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

// Load environment variables from the root .env file
dotenv.config({ path: '../.env' })

const app = express()

// Allow requests from the Vue frontend, with cookies included
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

// Parse incoming JSON request bodies
app.use(express.json())

// Parse cookies from incoming requests (used for JWT auth)
app.use(cookieParser())

// ===== ROUTES =====
const recipeRoutes = require('./routes/recipes')
app.use('/api/recipes', recipeRoutes)
app.use('/api/auth', require('./routes/auth'))

// ===== START SERVER =====
const PORT = process.env.PORT || 3001

// Health check route
app.get('/', (req, res) => {
  res.send('working')
})

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})
