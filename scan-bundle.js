const fs = require('fs');
const content = fs.readFileSync('faceglow/assets/index-CGlQ7hi9.js', 'utf8');
const urls = content.match(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/g) || [];
console.log([...new Set(urls)]);
const keys = content.match(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g) || [];
console.log([...new Set(keys)]);
