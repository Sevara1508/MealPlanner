// express for routing, axios for making http requests to spoonacular
const express = require('express')
const axios = require('axios')

// create a router instance instead of using the main app directly
const router = express.Router()

const Database = require('better-sqlite3')
const path = require('path')
const jwt = require('jsonwebtoken')
const db = new Database(path.join(__dirname, '../db/mealplanner.db'))

// ── Tables ──
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

db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    recipe_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    user_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

// helper — returns full decoded payload, or null
function getUser(req) {
  const token = req.cookies?.token
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}

// ── Search ──
router.get('/search', async (req, res) => {
  const query = req.query.query

  try {
    const response = await axios.get(
      'https://api.spoonacular.com/recipes/complexSearch',
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          query: query,
          number: 5,
          addRecipeInformation: true,
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

// ── Favorites ──

router.get('/favorites/all', (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Not logged in' })

  const rows = db.prepare('SELECT * FROM favorites WHERE user_id = ?').all(userId)
  res.json(rows)
})

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

router.delete('/favorites/:recipeId', (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Not logged in' })

  db.prepare('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?')
    .run(userId, req.params.recipeId)
  res.json({ success: true })
})

// ── Reviews ──

// GET all reviews for a recipe (public)
router.get('/:id/reviews', (req, res) => {
  const rows = db.prepare(
    'SELECT id, user_name, rating, comment, created_at FROM reviews WHERE recipe_id = ? ORDER BY created_at DESC'
  ).all(req.params.id)

  const avg = rows.length
    ? Math.round((rows.reduce((sum, r) => sum + r.rating, 0) / rows.length) * 10) / 10
    : null

  res.json({ reviews: rows, averageRating: avg, count: rows.length })
})

// POST submit/update a review (auth required)
router.post('/:id/reviews', (req, res) => {
  const userPayload = getUser(req)
  if (!userPayload) return res.status(401).json({ error: 'Not logged in' })

  const { rating, comment } = req.body
  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ error: 'Rating must be between 1 and 5' })

  const userRow = db.prepare('SELECT name FROM users WHERE id = ?').get(userPayload.id)
  if (!userRow) return res.status(401).json({ error: 'User not found' })

  const existing = db.prepare(
    'SELECT id FROM reviews WHERE user_id = ? AND recipe_id = ?'
  ).get(userPayload.id, req.params.id)

  if (existing) {
    db.prepare(
      'UPDATE reviews SET rating = ?, comment = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(rating, comment || '', existing.id)
  } else {
    db.prepare(
      'INSERT INTO reviews (user_id, recipe_id, rating, comment, user_name) VALUES (?, ?, ?, ?, ?)'
    ).run(userPayload.id, req.params.id, rating, comment || '', userRow.name)
  }

  res.json({ success: true })
})

// ── Single recipe — keep LAST so it doesn't swallow other routes ──
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

module.exports = router