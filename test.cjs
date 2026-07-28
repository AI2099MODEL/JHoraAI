const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const settingsPanelStart = '                {SETTINGS_SUBMENU_IDS.includes(activeSubmenuId) ? (';
const startIdx = content.indexOf(settingsPanelStart);
console.log('Start index:', startIdx);
