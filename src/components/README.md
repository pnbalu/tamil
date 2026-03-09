# Common components

Reusable UI that uses the theme. Import from `../components`:

```js
import { Button, Input, Card, ScreenContainer, LogoHeader, Divider, ErrorText } from '../components';
```

- **Button** – `variant`: primary | secondary | outline | gold; supports `loading`
- **Input** – Label + TextInput with theme styles
- **Card** – White card with optional border
- **ScreenContainer** – Safe area, optional scroll, optional keyboard avoid
- **LogoHeader** – த logo + “தமிழ் கற்போம்” (optional subtitle, `size="small"`)
- **Divider** – “or continue with” line
- **ErrorText** – Red error message (renders nothing if no message)

All components use `../theme` for colors, spacing, typography, and radii.
