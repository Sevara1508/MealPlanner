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

// export so server.js can mount this router
module.exports = router