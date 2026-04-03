// calls our express backend which then hits spoonacular — keeps the api key off the client
export async function searchRecipes(query) {
    const response = await fetch(`http://localhost:3001/api/recipes/search?query=${query}`)
    const data = await response.json()
    return data.results // spoonacular wraps results in a "results" array, so we unwrap it here
  }