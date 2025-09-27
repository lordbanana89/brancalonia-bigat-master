# Brancalonia UI Customization

Complete Italian Renaissance theme for the Brancalonia module in Foundry VTT.

## Overview

This UI enhancement transforms the standard D&D 5e interface into an authentic Italian Renaissance experience with tavern atmosphere, bringing the world of Brancalonia to life through visual design.

## Features

### 🏛️ Italian Renaissance Theme
- Warm color palette: tavern woods, renaissance golds, wine reds
- Authentic Italian fonts and typography
- Ornate decorative elements and borders
- Parchment textures and vintage backgrounds

### 🎭 Character Sheet Enhancements
- **Infamia Tracker**: Monitor character reputation in the criminal underworld
- **Baraonda Counter**: Track tavern brawl participation
- **Lavori Sporchi**: Record completed dirty jobs and criminal activities
- **Rifugio Manager**: Manage character havens and safe houses
- Custom Italian styling for all character elements

### 🖼️ Visual Enhancements
- Ornate borders and frames with Renaissance motifs
- Italian-themed icons for Brancalonia-specific mechanics
- Enhanced journal styling with parchment textures
- Custom banners and decorative elements

### 🎲 UI Interactions
- Italian button text and dialog translations
- Custom chat message styling for Brancalonia rolls
- Enhanced tooltips for Italian gaming terms
- Atmospheric visual feedback for critical rolls

## File Structure

```
styles/
├── brancalonia-enhanced.css          # Main enhanced CSS
├── brancalonia-character-sheets.css  # Character sheet styling
├── brancalonia-ui-elements.css       # UI components
├── brancalonia-systems.css           # Existing systems CSS
└── brancalonia-rules.css             # Existing rules CSS

modules/
├── brancalonia-ui-hooks.js           # UI enhancement hooks
└── [existing modules...]

ui/
├── banners/                          # Italian-themed banners
├── frames/                           # Renaissance frames
├── icons/                            # Brancalonia-specific icons
├── cursors/                          # Custom cursor files
├── backgrounds/                      # Texture backgrounds
└── ornaments/                        # Decorative elements
```

## Color Palette

The Brancalonia UI uses an authentic Italian Renaissance color scheme:

| Color | Hex Code | Usage |
|-------|----------|-------|
| Tavern Wood | `#8B4513` | Primary structural elements |
| Renaissance Gold | `#FFD700` | Accent colors, highlights |
| Tuscan Red | `#8B0000` | Headers, important text |
| Wine Red | `#722F37` | Secondary accents |
| Aged Parchment | `#F4E4BC` | Background textures |
| Antique Brass | `#CD7F32` | Borders, frames |
| Warm Ivory | `#FFF8DC` | Text backgrounds |
| Deep Burgundy | `#800020` | Dark accents |

## Typography

- **Titles**: EB Garamond Bold - Elegant Renaissance headers
- **Headings**: EB Garamond Bold - Section headers and labels
- **Body Text**: EB Garamond Regular - Main content text
- **Italics**: EB Garamond Italic - Emphasis and flavor text
- **UI Elements**: Benton - Modern readability for interface
- **Decorative**: IM Fell - Atmospheric medieval text

## Brancalonia-Specific Elements

### Infamia Tracker
Displays character's criminal reputation with Italian styling:
```css
.brancalonia-infamia {
  background: linear-gradient(90deg, #8B0000, #800020);
  border: 2px solid #FFD700;
  color: #FFF8DC;
}
```

### Rifugio Manager
Haven management interface with Renaissance styling:
- Haven name input with Italian placeholder text
- Comfort level selector (Modesto, Confortevole, Lussuoso)
- Description textarea for detailed haven information

### Character Sheet Ornaments
- Renaissance fleur-de-lis decorations
- Italian flag indicators for Brancalonia characters
- Ornate portrait frames with gold accents
- Decorative corner elements

## Technical Implementation

### CSS Architecture
- CSS custom properties for consistent theming
- Dark mode support with `prefers-color-scheme`
- Responsive design for various screen sizes
- Accessibility features (high contrast, reduced motion)

### JavaScript Hooks
- `renderActorSheet5eCharacter` - Character sheet enhancements
- `renderJournalPageSheet` - Journal styling
- `renderChatMessage` - Chat message improvements
- `renderApplication` - General UI enhancements

### Asset Management
- WebP format for optimal web performance
- Fallback PNG support for compatibility
- Seamless texture patterns for backgrounds
- Multiple icon sizes (16px, 24px, 32px, 48px)

## Customization

### Adding Custom Elements
To add new Brancalonia-specific UI elements:

1. Define CSS classes following the naming convention:
   ```css
   .brancalonia-[element-name] {
     /* Italian Renaissance styling */
   }
   ```

2. Add JavaScript hooks in `brancalonia-ui-hooks.js`:
   ```javascript
   static addCustomElement(html, data) {
     // Implementation
   }
   ```

3. Update color palette using CSS custom properties:
   ```css
   :root {
     --brancalonia-custom-color: #yourcolor;
   }
   ```

### Theming Guidelines
- Maintain warm, tavern-like atmosphere
- Use Italian Renaissance visual motifs
- Ensure accessibility and readability
- Support both light and dark modes
- Keep performance optimized

## Browser Compatibility

- **Chrome/Edge**: Full support with all features
- **Firefox**: Full support with all features
- **Safari**: Full support, some CSS optimizations
- **Mobile**: Responsive design with touch-friendly interfaces

## Performance Considerations

- CSS optimized for minimal reflow/repaint
- WebP images with PNG fallbacks
- Font loading optimization with `font-display: swap`
- Efficient CSS selectors and minimal JavaScript overhead

## Installation and Setup

1. The UI enhancements are automatically loaded with the Brancalonia module
2. CSS files are included in the module's `styles` array
3. JavaScript hooks initialize on Foundry's `ready` hook
4. No additional configuration required

## Troubleshooting

### Common Issues

**Fonts not loading**: Check font file paths in CSS
**Icons missing**: Verify UI asset directory structure
**Colors incorrect**: Ensure CSS custom properties are defined
**Layout broken**: Check for CSS conflicts with other modules

### Debug Information
- Check browser console for JavaScript errors
- Verify CSS files are loaded in Foundry's settings
- Confirm module dependencies are installed
- Test with minimal module setup for conflicts

## Future Enhancements

Planned improvements for future versions:
- Animated UI elements with Italian flair
- Sound effects for UI interactions
- Additional regional Italian themes (Venetian, Florentine)
- Enhanced mobile experience
- Accessibility improvements

## Credits

- **Theme Design**: Inspired by Italian Renaissance art and architecture
- **Color Palette**: Based on traditional Italian tavern and villa aesthetics
- **Typography**: Selected for historical accuracy and modern readability
- **Implementation**: Modern CSS and JavaScript techniques for Foundry VTT

---

*Per aspera ad astra - through hardships to the stars*
*Welcome to the Renaissance adventure of Brancalonia!*
