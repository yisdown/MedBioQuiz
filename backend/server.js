const express = require('express');
const cors = require('cors');
const path = require('path');

// Import all biology questions
const questionsData = require('./data');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper: Shuffle array
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ===================== API ROUTES =====================

// 1. Get all categories
app.get('/api/categories', (req, res) => {
  const categories = Object.keys(questionsData);
  res.json(categories);
});

// 2. Get questions by category
app.get('/api/questions', (req, res) => {
  const { category, limit = 10 } = req.query;
  
  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }
  
  const questions = questionsData[category];
  
  if (!questions) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  const shuffled = shuffleArray([...questions]);
  const selected = shuffled.slice(0, parseInt(limit));
  
  res.json({
    category,
    total: questions.length,
    questions: selected
  });
});

// 3. Get random questions from ALL categories
app.get('/api/random', (req, res) => {
  const { limit = 10 } = req.query;
  
  const allQuestions = [];
  for (const [category, questions] of Object.entries(questionsData)) {
    for (const question of questions) {
      allQuestions.push({
        ...question,
        category
      });
    }
  }
  
  const shuffled = shuffleArray(allQuestions);
  const selected = shuffled.slice(0, parseInt(limit));
  
  res.json({
    total: allQuestions.length,
    questions: selected
  });
});

// 4. Get question by ID
app.get('/api/questions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  for (const [category, questions] of Object.entries(questionsData)) {
    const question = questions.find(q => q.id === id);
    if (question) {
      return res.json({
        ...question,
        category
      });
    }
  }
  
  res.status(404).json({ error: 'Question not found' });
});

// 5. Search questions
app.get('/api/search', (req, res) => {
  const { q, limit = 20 } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  const results = [];
  const searchLower = q.toLowerCase();
  
  for (const [category, questions] of Object.entries(questionsData)) {
    for (const question of questions) {
      if (question.question.toLowerCase().includes(searchLower)) {
        results.push({
          ...question,
          category
        });
      }
    }
  }
  
  res.json({
    query: q,
    total: results.length,
    results: results.slice(0, parseInt(limit))
  });
});

// 6. Get statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    categories: Object.keys(questionsData).length,
    totalQuestions: 0,
    categoryBreakdown: {}
  };
  
  for (const [category, questions] of Object.entries(questionsData)) {
    stats.totalQuestions += questions.length;
    stats.categoryBreakdown[category] = questions.length;
  }
  
  res.json(stats);
});

// 7. Health check
app.get('/health', (req, res) => {
  const total = Object.values(questionsData).reduce(
    (acc, arr) => acc + arr.length, 0
  );
  
  res.json({
    status: 'OK',
    categories: Object.keys(questionsData).length,
    totalQuestions: total,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\nBiology Quiz API running on http://localhost:${PORT}`);
  console.log(`Categories: ${Object.keys(questionsData).join(', ')}`);
  console.log(`Total questions: ${Object.values(questionsData).reduce((acc, arr) => acc + arr.length, 0)}`);
  console.log('\nAPI Endpoints:');
  console.log(`   GET /api/categories`);
  console.log(`   GET /api/questions?category=NAME&limit=10`);
  console.log(`   GET /api/random?limit=10`);
  console.log(`   GET /api/questions/:id`);
  console.log(`   GET /api/search?q=term`);
  console.log(`   GET /api/stats`);
  console.log(`   GET /health\n`);
});