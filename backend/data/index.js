const fs = require('fs');
const path = require('path');

function loadAllBiologyQuestions() {
  const questions = {};
  const dataDir = __dirname;
  
  const files = fs.readdirSync(dataDir);
  
  for (const file of files) {
    if (file === 'index.js') continue;
    if (!file.endsWith('.json')) continue;
    
    const categoryName = path.basename(file, '.json');
    const displayName = categoryName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const filePath = path.join(dataDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    questions[displayName] = data;
    console.log(`✅ Loaded ${data.length} questions from ${displayName}`);
  }
  
  return questions;
}

const questionsData = loadAllBiologyQuestions();

const totalQuestions = Object.values(questionsData).reduce(
  (acc, arr) => acc + arr.length, 0
);

console.log('\nBIOLOGY QUIZ DATABASE STATISTICS');
console.log('═'.repeat(50));
console.log(`Categories: ${Object.keys(questionsData).length}`);
console.log(`Total Questions: ${totalQuestions}`);
console.log('═'.repeat(50));

module.exports = questionsData;