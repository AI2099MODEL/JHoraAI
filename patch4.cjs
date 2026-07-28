const fs = require('fs');
let content = fs.readFileSync('src/components/AstroChat.tsx', 'utf-8');

const regex = /\s*\/\/\s*Pre-defined quick queries\s*const quickPrompts = \[[\s\S]*?\];\s*/;
content = content.replace(regex, '\n');

fs.writeFileSync('src/components/AstroChat.tsx', content);
