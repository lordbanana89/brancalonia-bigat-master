# Brancalonia UI Assets

## Italian Renaissance Theme Assets for Foundry VTT

This directory contains all UI assets for the Brancalonia module's Italian Renaissance theme.

### Directory Structure

```
ui/
├── backgrounds/    # Texture backgrounds (parchment, wood, stone)
├── borders/        # Ornamental frames and borders
├── icons/          # UI icons for Brancalonia mechanics
├── cursors/        # Custom mouse cursors
├── fonts/          # Web fonts (if needed locally)
└── ornaments/      # Decorative elements (flourishes, symbols)
```

### Asset Specifications

#### Backgrounds
- **Format**: WebP with PNG fallback
- **Dimensions**: 1920x1080 (tiling textures: 512x512)
- **Files**:
  - `parchment.webp` - Aged parchment texture
  - `wood.webp` - Tavern wood texture
  - `stone.webp` - Renaissance stone texture
  - `leather.webp` - Worn leather texture

#### Borders & Frames
- **Format**: PNG with transparency
- **Dimensions**: Variable (typically 800x600 for full frames)
- **Files**:
  - `portrait-frame-gold.png` - Golden Renaissance portrait frame
  - `window-border-ornate.png` - Ornate window border
  - `section-divider.png` - Decorative section divider

#### Icons
- **Format**: SVG preferred, PNG fallback
- **Dimensions**: 32x32, 64x64, 128x128
- **Files**:
  - `infamia.svg` - Infamy icon
  - `baraonda.svg` - Tavern brawl icon
  - `rifugio.svg` - Haven icon
  - `compagnia.svg` - Company icon
  - `lavoro-sporco.svg` - Dirty job icon

#### Cursors
- **Format**: .cur (Windows), .png for CSS fallback
- **Dimensions**: 32x32
- **Files**:
  - `default.cur` - Default Renaissance-styled cursor
  - `pointer.cur` - Pointing hand cursor
  - `text.cur` - Text selection cursor

#### Ornaments
- **Format**: SVG or PNG with transparency
- **Dimensions**: Variable
- **Files**:
  - `fleur-de-lis.svg` - Fleur-de-lis symbol
  - `italian-crest.svg` - Italian heraldic crest
  - `vine-flourish.svg` - Decorative vine flourish
  - `corner-ornament.svg` - Corner decoration

### Color Palette

```css
/* Italian Renaissance Colors */
--ochre: #CC9966;
--sienna: #A0522D;
--umber: #8B4513;
--wine: #722F37;
--gold: #FFD700;
--bronze: #CD7F32;
--cream: #FFF8DC;
--parchment: #F4E4BC;
--terracotta: #CC5500;
--olive: #6B8E23;
--venetian-red: #C41E3A;
--florentine-gold: #D4AF37;
```

### Usage Guidelines

1. **Performance**: Always use WebP format with PNG fallback for better compression
2. **Accessibility**: Ensure sufficient contrast for UI elements
3. **Consistency**: Maintain the Italian Renaissance aesthetic across all assets
4. **Optimization**: Compress images without losing quality (use tools like TinyPNG)
5. **Naming**: Use descriptive, lowercase names with hyphens

### Creating New Assets

When adding new UI assets:

1. Follow the established naming convention
2. Provide multiple resolutions for different screen sizes
3. Include both light and dark theme variants where applicable
4. Document any special usage requirements
5. Test assets across different browsers

### License

All custom assets created for this module are subject to the module's license.
Original artwork should be properly attributed.