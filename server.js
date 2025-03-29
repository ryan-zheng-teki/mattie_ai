const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Optional: API endpoint to get a list of available problems
// This could be used to dynamically generate navigation
app.get('/api/problems', (req, res) => {
  const problemsDir = path.join(__dirname, 'public', 'problems');
  const problems = [];
  
  // Read the problems directory
  fs.readdir(problemsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load problems' });
    }
    
    // Filter for HTML files
    const htmlFiles = files.filter(file => file.endsWith('.html'));
    
    // Get problem metadata from each file
    htmlFiles.forEach(file => {
      const name = file.replace('.html', '');
      const url = `/problems/${file}`;
      
      problems.push({
        id: name,
        name: name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        url: url
      });
    });
    
    res.json(problems);
  });
});
// Fallback route: serve index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
