/**
 * Gradient color arrays and config for LinearGradient.
 * Change here to affect all screens using these gradients.
 */
import { colors } from './colors';

/** Screen background gradient (Culture, etc.) */
export const screenGradientColors = [
  colors.screenGradientStart,
  colors.screenGradientMid,
  colors.screenGradientWarm,
  colors.screenGradientEnd,
];

/** Accent bar (vertical: orange → primary) */
export const accentBarGradientColors = [colors.orange, colors.primary];

/** Toggle / button active state */
export const toggleActiveGradientColors = [colors.orange, colors.primary];

/** Section underline – Explore (gold → orange) */
export const sectionLineExploreGradientColors = [colors.gold, colors.orange];

/** Section underline – Featured (orange → primary) */
export const sectionLineFeaturedGradientColors = [colors.orange, colors.primary];

/** Card overlay gradient (image cards) */
export const cardOverlayGradientColors = [
  'transparent',
  'rgba(0,0,0,0.75)',
  'rgba(0,0,0,0.9)',
];
