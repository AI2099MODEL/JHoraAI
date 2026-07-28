const fs = require('fs');
let content = fs.readFileSync('src/components/AstroChat.tsx', 'utf-8');

const regex = /\s*\{\/\* Quick action pills[\s\S]*?<\/div>\s*\)\}\s*/;
content = content.replace(regex, '\n');

fs.writeFileSync('src/components/AstroChat.tsx', content);
