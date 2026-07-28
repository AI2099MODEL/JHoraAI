const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add menu item
content = content.replace(
  `        // Journey / My Page tabs\n        { id: "daily",`,
  `        // Journey / My Page tabs\n        { id: "birth", label: "Birth", description: "Birth Details & Cast Settings.", systemId: "ai_assistant", category: "JOURNEY" },\n        { id: "daily",`
);

// 2. Add the birth page
const birthCard = fs.readFileSync('birth_card.tsx', 'utf-8');

const birthBlock = `          ) : activeMenu === "birth" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key="birth"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
${birthCard}
              </motion.div>
            </AnimatePresence>
          ) : activeMenu === "dashboard" ? (`

content = content.replace(
  `          ) : activeMenu === "dashboard" ? (`,
  birthBlock
);

fs.writeFileSync('src/App.tsx', content);
