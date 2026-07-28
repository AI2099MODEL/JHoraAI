const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    '                    birthSettingsContent={birthSettingsNode} \n                    onNavigateMenu',
    '                    birthSettingsContent={birthSettingsNode} \n                    activeSubmenuId={activeSubmenuId}\n                    onNavigateMenu'
);

fs.writeFileSync('src/App.tsx', content);
