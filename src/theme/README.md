# Theme – single source of truth

Import everything from `../theme` (or `@/theme` if you add a path alias):

```js
import { colors, spacing, typography, radii } from '../theme';
```

- **colors** – Primary, backgrounds, text, borders (`theme/colors.js`)
- **spacing** – `xxs` through `section`, `screen` for horizontal padding (`theme/spacing.js`)
- **typography** – Font sizes (`caption`…`display`) and weights (`theme/typography.js`)
- **radii** – Border radius for inputs, cards, pills (`theme/radii.js`)

Do not import from `theme/colors` directly; use `theme` so tokens stay in one place.
