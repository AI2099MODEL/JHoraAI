const fs = require('fs');

let content = fs.readFileSync('src/components/AstroChat.tsx', 'utf-8');

content = content.replace(
`                    <h1 className="text-2xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent font-sans">
                      JHora AI Assistant
                                       <p className="text-neutral-700 text-xs max-w-md leading-relaxed font-medium mb-6">
                      Your intelligent Vedic & KP astrological assistant. Ask any question about your chart, dasha, transit trends, or remedies.
                    </p>
                  </div>
                ) : (  ) : (`,
`                    <h1 className="text-2xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent font-sans">
                      JHora AI Assistant
                    </h1>
                    <p className="text-neutral-700 text-xs max-w-md leading-relaxed font-medium mb-6">
                      Your intelligent Vedic & KP astrological assistant. Ask any question about your chart, dasha, transit trends, or remedies.
                    </p>
                  </div>
                ) : (`
);

fs.writeFileSync('src/components/AstroChat.tsx', content);
