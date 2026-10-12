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
