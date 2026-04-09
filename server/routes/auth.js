const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Database = require('better-sqlite3')
const path = require('path')

// ── DB setup (creates file automatically) ──
const db = new Database(path.join(__dirname, '../db/mealplanner.db'))
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' })

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing)
    return res.status(409).json({ message: 'Email already in use' })

  const hashed = await bcrypt.hash(password, 12)
  const result = db
    .prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
    .run(name, email, hashed)

  const token = jwt.sign({ id: result.lastInsertRowid, email }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.cookie('token', token, COOKIE_OPTIONS)
  res.status(201).json({ user: { id: result.lastInsertRowid, name, email } })
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user) return res.status(401).json({ message: 'Invalid email or password' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ message: 'Invalid email or password' })

  const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.cookie('token', token, COOKIE_OPTIONS)
  res.json({ user: { id: user.id, name: user.name, email: user.email } })
})

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out' })
})

// Get current user (restores session on refresh)
router.get('/me', (req, res) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ message: 'Not authenticated' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(decoded.id)
    res.json({ user })
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
})

module.exports = router