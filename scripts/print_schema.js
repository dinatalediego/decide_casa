const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'supabase', 'schema.sql');
console.log(fs.readFileSync(p, 'utf8'));
