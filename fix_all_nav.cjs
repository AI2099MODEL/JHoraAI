const fs = require('fs');
let content = fs.readFileSync('src/components/AstroChat.tsx', 'utf-8');

content = content.replace(
    /onNavigateMenu\?\.(\([^)]+\))/g,
    'onNavigateMenu?.(sub.id.startsWith("jhora_") || sub.id.startsWith("kp_") || sub.id.startsWith("tajika_") || sub.id.startsWith("lalkitab_") || ["theme", "api_keys", "offline_mode", "table_index", "raw_json", "api_inspector", "request_log", "response_log", "dto_viewer", "room_database_viewer", "plugin_manager", "performance", "cache_manager", "github_ota", "google_drive", "google_calendar", "google_gmail", "google_keep", "google_contacts", "language", "account_settings", "preferences", "kp_documentation"].includes(sub.id) ? "astro" : "ai_assistant", sub.id)'
);

fs.writeFileSync('src/components/AstroChat.tsx', content);
