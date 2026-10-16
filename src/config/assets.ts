/**
 * Illustrations exported from Figma into public/ (WebP at 2x, sizes are the
 * 1x display size). Themed assets have a dark and a light variant; pick with
 * the resolved theme, or render both and hide one with CSS.
 */
export interface ThemedImage {
  dark: string;
  light: string;
  width: number;
  height: number;
  /** Set when the light variant has different proportions. */
  lightWidth?: number;
  lightHeight?: number;
}

export interface StaticImage {
  src: string;
  width: number;
  height: number;
}

export const brand = {
  /** Multicolor mark; identical in both themes. */
  mark: { src: "/brand/sambanova-mark.svg", width: 32, height: 29 },
  /** Wordmark drawn with currentColor; inline it to inherit text color. */
  wordmark: { src: "/brand/sambanova-wordmark.svg", width: 109, height: 17 },
} satisfies Record<string, StaticImage>;

export const illustrations = {
  heroWave: {
    dark: "/illustrations/hero-wave-dark.webp",
    light: "/illustrations/hero-wave-light.webp",
    width: 819,
    height: 154,
    lightWidth: 704,
    lightHeight: 174,
  },
  onboardingPlayground: {
    dark: "/illustrations/onboarding-playground-dark.webp",
    light: "/illustrations/onboarding-playground-light.webp",
    width: 70,
    height: 60,
  },
  onboardingCredits: {
    dark: "/illustrations/onboarding-credits-dark.webp",
    light: "/illustrations/onboarding-credits-light.webp",
    width: 68,
    height: 60,
  },
  onboardingApiKey: {
    dark: "/illustrations/onboarding-api-key-dark.webp",
    light: "/illustrations/onboarding-api-key-light.webp",
    width: 73,
    height: 63,
  },
  onboardingBuildApp: {
    dark: "/illustrations/onboarding-build-app-dark.webp",
    light: "/illustrations/onboarding-build-app-light.webp",
    width: 72,
    height: 61,
  },
} satisfies Record<string, ThemedImage>;

export const emptyStates = {
  apiKeys: { src: "/illustrations/empty-api-keys.webp", width: 210, height: 132 },
  creditCard: { src: "/illustrations/credit-card.webp", width: 251, height: 138 },
} satisfies Record<string, StaticImage>;

/**
 * Playground hero backdrop and header art (Figma `1398:118805`, light `1520:47597`).
 * The blurred glows and vignettes are rasterised from the Figma SVG exports at
 * 1x (their soft edges gain nothing from 2x); the grid and badge glow ship as SVG.
 */
export const playgroundArt = {
  grid: {
    dark: "/playground/hero-grid-dark.svg",
    light: "/playground/hero-grid-light.svg",
    width: 1237,
    height: 1031,
  },
  /** Polygon 2; identical in both themes. */
  glowPurple: { src: "/playground/hero-glow-purple.webp", width: 1958, height: 1863 },
  /** Polygon 3; the light variant is larger and drawn at 50% opacity. */
  glowAmber: {
    dark: "/playground/hero-glow-amber-dark.webp",
    light: "/playground/hero-glow-amber-light.webp",
    width: 1958,
    height: 1863,
    lightWidth: 1992,
    lightHeight: 1892,
  },
  /** Ellipse 186: black in dark, white in light. */
  vignetteTopLeft: {
    dark: "/playground/hero-vignette-tl-dark.webp",
    light: "/playground/hero-vignette-tl-light.webp",
    width: 476,
    height: 453,
  },
  /** Ellipse 185: black in dark, white in light. */
  vignetteBottomRight: {
    dark: "/playground/hero-vignette-br-dark.webp",
    light: "/playground/hero-vignette-br-light.webp",
    width: 446,
    height: 427,
  },
  /** Ellipse 187 behind the "Blazing-fast Inference" badge bolt; both themes. */
  badgeGlow: { src: "/playground/badge-glow.svg", width: 35, height: 44 },
} satisfies Record<string, StaticImage | ThemedImage>;

/**
 * Project Settings › Billing art (Figma `1387:67354`). The card shape, wordmark and glows are the
 * Figma SVG exports; the chip, Mastercard mark and logos are WebP at 2x (sizes are 1x).
 */
export const billingArt = {
  /** Auto Recharge card icon ("image 38"). */
  autoRecharge: { src: "/billing/auto-recharge.svg", width: 46, height: 46 },
  /** Notched card body of the front card; the cards behind it are the same art scaled down. */
  card: { src: "/billing/card.svg", width: 265.776, height: 149.898 },
  /** White VISA wordmark on the card. */
  cardVisa: { src: "/billing/card-visa.svg", width: 49, height: 17 },
  /** Mastercard circles on the card. */
  cardMastercard: { src: "/billing/card-mastercard.webp", width: 27.5, height: 17 },
  cardChip: { src: "/billing/card-chip.webp", width: 45.334, height: 35.098 },
  /** Blurred purple streaks behind the cards, drawn unrotated with their blur margin. */
  glowRight: { src: "/billing/cards-glow-right.svg", width: 371.154, height: 461.264 },
  glowLeft: { src: "/billing/cards-glow-left.svg", width: 371.154, height: 461.264 },
  /** Visa, Mastercard, Amex and Discover in the empty card-number field. */
  acceptedCards: { src: "/billing/card-brands.webp", width: 112.5, height: 18.5 },
} satisfies Record<string, StaticImage>;

/** Card logos in the My Cards list (36px wide) and the card-number field. */
export const cardBrandLogos = {
  visa: { src: "/billing/brand-visa.webp", width: 36, height: 27 },
  mastercard: { src: "/billing/brand-mastercard.webp", width: 36, height: 27 },
  discover: { src: "/billing/brand-discover.webp", width: 36, height: 24 },
  amex: { src: "/billing/brand-amex.webp", width: 36, height: 23.5 },
} satisfies Record<string, StaticImage>;
