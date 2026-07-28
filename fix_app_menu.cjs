const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The lines we want to replace have category: "JHORA", category: "KP STELLAR", etc.
content = content.replace(/category: "JHORA"/g, 'category: "SETTINGS"');
content = content.replace(/category: "KP STELLAR"/g, 'category: "SETTINGS"');
content = content.replace(/category: "TAJIKA"/g, 'category: "SETTINGS"');
content = content.replace(/category: "LAL KITAB"/g, 'category: "SETTINGS"');
content = content.replace(/category: "DEPLOYMENT"/g, 'category: "SETTINGS"');

fs.writeFileSync('src/App.tsx', content);
