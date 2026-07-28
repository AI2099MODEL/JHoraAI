const fs = require('fs');
let content = fs.readFileSync('src/components/AstroChat.tsx', 'utf-8');

// Add activeSubmenuId to AstroChatProps
if (!content.includes('activeSubmenuId?: string;')) {
    content = content.replace(
        '  birthSettingsContent?: React.ReactNode;',
        '  birthSettingsContent?: React.ReactNode;\n  activeSubmenuId?: string;'
    );
}

// Update state initialization
if (content.includes('const [activeSubmenuPanel, setActiveSubmenuPanel] = useState<string | null>(null);')) {
    content = content.replace(
        'const [activeSubmenuPanel, setActiveSubmenuPanel] = useState<string | null>(null);',
        'const [activeSubmenuPanel, setActiveSubmenuPanel] = useState<string | null>(props.activeSubmenuId || null);\n\n  useEffect(() => {\n    if (props.activeSubmenuId && props.activeSubmenuId !== activeSubmenuPanel) {\n      setActiveSubmenuPanel(props.activeSubmenuId);\n    }\n  }, [props.activeSubmenuId]);'
    );
}

fs.writeFileSync('src/components/AstroChat.tsx', content);
