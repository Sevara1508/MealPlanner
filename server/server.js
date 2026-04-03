// core server dependencies
const express = require('express')
const cors = require('cors') // allows the vue frontend to talk to this server
const dotenv = require('dotenv')

// load env variables from .env one level up (root of the project)
dotenv.config({ path: '../.env' })

const app = express()

// middleware — runs on every request
app.use(cors()) // lets the client make requests without getting blocked by the browser
app.use(express.json()) // parses incoming json request bodies

// mount the recipe routes — all recipe endpoints live under /api/recipes
const recipeRoutes = require('./routes/recipes')
app.use('/api/recipes', recipeRoutes)

// fall back to 3001 if PORT isn't set in .env
const PORT = process.env.PORT || 3001

// simple health check route to confirm the server is up
app.get('/', (req, res) => {
  res.send('working')
})

// start the server
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})