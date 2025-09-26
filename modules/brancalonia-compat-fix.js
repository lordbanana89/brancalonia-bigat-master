// Compatibility fix for D&D 5e system issues
Hooks.once("init", function() {
  console.log("Brancalonia | Applying compatibility fixes");

  // Fix for missing slugify function in D&D 5e v5.1.9
  if (typeof window.slugify === 'undefined') {
    window.slugify = function(str) {
      if (!str) return '';
      return str
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[àáäâ]/g, 'a')
        .replace(/[èéëê]/g, 'e')
        .replace(/[ìíïî]/g, 'i')
        .replace(/[òóöô]/g, 'o')
        .replace(/[ùúüû]/g, 'u')
        .replace(/[ñ]/g, 'n')
        .replace(/[ç]/g, 'c')
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')          // Replace multiple - with single -
        .replace(/^-+/, '')              // Trim - from start of text
        .replace(/-+$/, '');             // Trim - from end of text
    };
    console.log("Brancalonia | Added missing slugify function");
  }

  // Additional safety checks
  if (game.system?.id === "dnd5e") {
    // Ensure ItemRegistry has required methods
    Hooks.once("ready", function() {
      if (game.dnd5e?.registry?.item) {
        const registry = game.dnd5e.registry.item;

        // Ensure slugify is available for registry
        if (registry && !registry.slugify && window.slugify) {
          registry.slugify = window.slugify;
        }
      }
    });
  }
});

// Prevent errors from breaking module initialization
Hooks.once("setup", function() {
  const originalError = console.error;
  console.error = function(...args) {
    // Filter out registry-related errors that don't affect functionality
    const errorStr = args.join(' ');
    if (errorStr.includes('slugify is not defined') && errorStr.includes('registry')) {
      console.warn("Brancalonia | Suppressed D&D 5e registry error (non-critical)");
      return;
    }
    originalError.apply(console, args);
  };
});