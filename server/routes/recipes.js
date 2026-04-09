// express for routing, axios for making http requests to spoonacular
const express = require('express')
const axios = require('axios')

// create a router instance instead of using the main app directly
const router = express.Router()

router.get('/search', async (req, res) => {
  const query = req.query.query

  try {
    const response = await axios.get(
      'https://api.spoonacular.com/recipes/complexSearch',
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          query: query,
          number: 5, // reduce to 5 (helps limit)
          addRecipeInformation: true, // 🔥 THIS IS THE FIX
          addRecipeNutrition: false
        }
      }
    )

    res.json(response.data)
  } catch (error) {
    console.error(error.response?.data || error.message)
    res.status(500).json({ error: 'failed to fetch recipes' })
  }
})

// single recipe route — expects an id param e.g. /api/recipes/123
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
        includeNutrition: true
      }
    })

    res.json(response.data)
  } catch (error) {
    console.error(error.response?.data || error.message)
    res.status(500).json({ error: 'failed to fetch recipe' })
  }
})

const Database = require('better-sqlite3')
const path = require('path')
const jwt = require('jsonwebtoken')
const db = new Database(path.join(__dirname, '../db/mealplanner.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    recipe_id TEXT NOT NULL,
    title TEXT NOT NULL,
    image TEXT,
    UNIQUE(user_id, recipe_id)
  )
`)

// helper — verifies the JWT cookie and returns the user id, or null
function getUserId(req) {
  const token = req.cookies?.token
  if (!token) return null
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded.id
  } catch {
    return null
  }
}

// GET all favorites for logged-in user
router.get('/favorites/all', (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Not logged in' })

  const rows = db.prepare('SELECT * FROM favorites WHERE user_id = ?').all(userId)
  res.json(rows)
})

// POST add a favorite
router.post('/favorites', (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Not logged in' })

  const { recipe_id, title, image } = req.body
  if (!recipe_id || !title) return res.status(400).json({ error: 'Missing fields' })

  try {
    db.prepare(
      'INSERT OR IGNORE INTO favorites (user_id, recipe_id, title, image) VALUES (?, ?, ?, ?)'
    ).run(userId, String(recipe_id), title, image || '')
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to save favorite' })
  }
})

// DELETE remove a favorite
router.delete('/favorites/:recipeId', (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Not logged in' })

  db.prepare('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?')
    .run(userId, req.params.recipeId)
  res.json({ success: true })
})

// export so server.js can mount this router
module.exports = router