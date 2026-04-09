const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

dotenv.config({ path: '../.env' })

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())
app.use(cookieParser())

const recipeRoutes = require('./routes/recipes')
app.use('/api/recipes', recipeRoutes)
app.use('/api/auth', require('./routes/auth'))

const PORT = process.env.PORT || 3001

app.get('/', (req, res) => {
  res.send('working')
})

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})