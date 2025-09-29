/**
 * BRANCALONIA TARGETED FIX
 * Fix SOLO per i label problematici senza rompere il resto
 */

console.log("🎯 Brancalonia Targeted Fix - Loading");

// Fix SOLO per il menu Settings
Hooks.on("renderSettings", (app, html, data) => {
  // Usa jQuery se disponibile
  const $html = html.jquery ? html : $(html);

  // Fix SOLO i bottoni del menu settings
  $html.find('button').each(function() {
    const btn = $(this);
    const text = btn.text();

    // Solo se contiene fa-solid
    if (text && text.includes('fa-solid')) {
      // Mappa diretta dei fix
      const fixes = {
        'Configure Settings': 'Configure Settings',
        'Configure Controls': 'Configure Controls',
        'Manage Modules': 'Manage Modules',
        'Edit World': 'Edit World',
        'User Management': 'User Management',
        'Tour Management': 'Tour Management',
        'Support & Issues': 'Support & Issues',
        'View Documentation': 'View Documentation',
        'Community Wiki Pages': 'Community Wiki Pages',
        'Invitation Links': 'Invitation Links',
        'Log Out': 'Log Out',
        'Return to Setup': 'Return to Setup'
      };

      // Estrai il testo dopo fa-solid
      const cleanText = text.replace(/.*fa-solid.*?([A-Z][a-zA-Z\s&]+)/, '$1').trim();

      if (fixes[cleanText]) {
        btn.text(fixes[cleanText]);
      } else {
        // Pulisci il testo base
        const cleaned = text
          .replace(/fa-solid\s+fa-[\w-]+\s*/g, '')
          .trim();
        if (cleaned) {
          btn.text(cleaned);
        }
      }
    }
  });
});

console.log("✅ Brancalonia Targeted Fix loaded");