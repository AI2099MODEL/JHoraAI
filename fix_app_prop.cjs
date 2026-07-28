const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('activeSubmenuId={activeSubmenuId}')) {
    content = content.replace(
        'birthSettingsContent={birthSettingsNode}',
        'birthSettingsContent={birthSettingsNode}\n                    activeSubmenuId={activeSubmenuId}'
    );
}

fs.writeFileSync('src/App.tsx', content);
