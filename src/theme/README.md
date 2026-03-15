# Theme – global design tokens

Change values here to impact the app globally. Screens import from `../../theme` (or `@/theme`) and use these tokens instead of hardcoded colors, shadows, or gradients.

## Files

| File | Purpose |
|------|--------|
| **colors.js** | Primary, backgrounds, text, borders. Add semantic names (e.g. `screenGradientStart`) so screens never use raw hex. |
| **gradients.js** | Gradient color arrays for `LinearGradient` (screen bg, accent bar, toggle, section underlines, card overlay). |
| **shadows.js** | Shadow presets (card, chip, chipSelected, cardSmall, cardCarousel). Spread into styles: `...shadows.card`. |
| **spacing.js** | Padding/margin/gap scale (xxs, xs, sm, md, lg, xl, screen, etc.). |
| **typography.js** | Font sizes (caption, body, h2, display) and weights (regular, semibold, extrabold). |
| **radii.js** | Border radius (sm, md, lg, pill, accentBar, line, cardLarge). Import from `theme/radii`. |
| **index.js** | Re-exports colors, spacing, typography, shadows, gradient arrays. |

## Usage

```js
import { colors, spacing, typography, shadows, screenGradientColors } from '../theme';
import { radii } from '../theme/radii';

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.cardBg,
    padding: spacing.lg,
    ...shadows.card,
  },
  title: { fontSize: typography.h2, fontWeight: typography.bold, color: colors.textDark },
});
```

## Making global changes

- **Colors** (e.g. primary, screen gradient): edit `colors.js` and, if needed, `gradients.js`.
- **Shadows**: edit `shadows.js`; any screen using `...shadows.card` (or other presets) updates automatically.
- **Gradients**: edit `gradients.js` (or the color entries in `colors.js` that gradients use).
- **Spacing / typography / radii**: edit the corresponding theme file; use the token names in screens instead of magic numbers.
