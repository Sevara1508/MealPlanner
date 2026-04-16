![Recipeek Banner](Recipeek_Banner.png)

---

## Meal Planner Website

**Recipeek** is a meal planning and recipe discovery web application designed to help users browse recipes, organize meals, and manage their weekly food planning in one place. The platform combines recipe browsing, filtering, favourites, ratings, comments, and weekly planning tools into a single user-friendly interface.

This project was developed as a group web development project.

---

## Features

- User login and logout
- Recipe browsing page
- Homepage with trending recipes
- Meal planner page
- Weekly planning feature
- Recipe filtering options
- Favourite recipes feature
- Ratings and comments feature
- Dark and light mode
- Interactive D3 chart feature
- Responsive navigation bar
- Styled user interface with animations and hover effects
- Generate and export grocery list from weekly plan

---

## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### API
- Spoonacular API

### Other Tools
- D3.js

---

## Project Structure

```bash
MealPlanner/
│
├── client/
├── server/
├── group_members.html
├── contributions.txt
├── readme.txt
├── ai-prompts.txt
└── README.md
```
---

## Environment Variables Setup (IMPORTANT)

This project requires a **Spoonacular API key** to run properly.

### Step 1: Create a Spoonacular Account
- Go to https://spoonacular.com/food-api  
- Sign up for a **free account**
- Confirm your email address
- Navigate to Profile & API Key and generate and copy your API key

### Step 2: Create a `.env` File
Create a file named `.env` in the **root of the project** (same level as `client/` and `server` folders).

### Step 3: Add Your API Key
Inside the `.env` file, add the following:

```bash
SPOONACULAR_API_KEY=your_api_key_here
PORT=3001
JWT_SECRET=mySuperSecretKey123!

⚠️ Replace `your_api_key_here` with your actual Spoonacular API key.

### Important Notes
- Each user must generate their own API key for the application to work  
- Do **not** share your API key publicly  
- Do **not** commit your `.env` file to version control (e.g. GitHub)
  
---

## How To Run

### Installations
- Node.js
- npm

### Set-up
1) Clone the repository
2) Open the project folder
3) Open the terminal and move into the client folder
4) Install client dependencies
```bash
npm install
```
5) Start the client
```bash
npm run dev
```
6) Open a secondary terminal and move into the server folder
7) Install server dependencies
```bash
npm install
```
8) Start the server
```bash
node server.js
```
9) Open the local host link shown in the terminal
