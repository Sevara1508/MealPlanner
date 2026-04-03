// express for routing, axios for making http requests to spoonacular
const express = require('express')
const axios = require('axios')

// create a router instance instead of using the main app directly
const router = express.Router()

// search route — expects a ?query= param in the url e.g. /search?query=pasta
router.get('/search', async (req, res) => {
  const query = req.query.query // grab the search term from the url

  try {
    // hit the spoonacular api with the search term
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY, // pulled from .env, never hardcode this
        query: query,
        number: 10 // limits results to 10 recipes
      }
    })

    // send the spoonacular response straight back to the client
    res.json(response.data)
  } catch (error) {
    // log the actual api error if there is one, otherwise log the generic message
    console.error(error.response?.data || error.message)
    res.status(500).json({ error: 'failed to fetch recipes' })
  }
})

// export so server.js can mount this router
module.exports = router