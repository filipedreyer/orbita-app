export const colorTokens = {
  bg: 'var(--bg)',
  // Provisional foundation aliases inferred from the current app visuals.
  bgElevated: 'var(--bg-elevated)',
  surface: 'var(--surface)',
  surfaceAlt: 'var(--surface-alt)',
  surfaceDisabled: 'var(--surface-disabled)',
  text: 'var(--text)',
  textSecondary: 'var(--text-secondary)',
  textTertiary: 'var(--text-tertiary)',
  border: 'var(--border)',
  borderStrong: 'var(--border-strong)',
  accent: 'var(--accent)',
  accentSoft: 'var(--accent-soft)',
  accentBorder: 'var(--accent-border)',
  overlay: 'var(--overlay)',
  focusRing: 'var(--focus-ring)',
  focusRingDanger: 'var(--focus-ring-danger)',
  danger: 'var(--danger)',
  warning: 'var(--warning)',
  success: 'var(--success)',
  healthy: 'var(--state-healthy)',
  attention: 'var(--state-attention)',
  risk: 'var(--state-risk)',
  critical: 'var(--state-critical)',
  healthySoft: 'var(--state-healthy-soft)',
  attentionSoft: 'var(--state-attention-soft)',
  riskSoft: 'var(--state-risk-soft)',
  criticalSoft: 'var(--state-critical-soft)',
  // Provisional semantic alias for task/purple.
  task: 'var(--task)',
  ink: 'var(--text-secondary)',
  // Legacy compatibility aliases. Keep only while the app still references the old names.
  teal: 'var(--teal)',
  tealLight: 'var(--teal-light)',
  tealMid: 'var(--teal-mid)',
  red: 'var(--red)',
  yellow: 'var(--yellow)',
  green: 'var(--green)',
} as const;

export const typographyTokens = {
  sans: 'var(--font-sans)',
  mono: 'var(--font-mono)',
} as const;

export const radiusTokens = {
  // Provisional: current radius scale inferred from existing component usage.
  md: 'var(--radius-md)',
  xl: 'var(--radius-xl)',
  xxl: 'var(--radius-2xl)',
  xxxl: 'var(--radius-3xl)',
  display: 'var(--radius-4xl)',
  pill: 'var(--radius-pill)',
} as const;

export const spacingTokens = {
  // Provisional: aliases TS for the spacing scale already dominant in the app.
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  xxl: '2rem',
} as const;

export const shadowTokens = {
  // Provisional: current elevation map inferred from the live surface.
  card: 'var(--shadow-card)',
  floating: 'var(--shadow-floating)',
  emphasis: 'var(--shadow-emphasis)',
  sheet: 'var(--shadow-sheet)',
} as const;

export const motionTokens = {
  fast: 0.18,
  normal: 0.22,
} as const;

export const themeTokens = {
  color: colorTokens,
  typography: typographyTokens,
  radius: radiusTokens,
  spacing: spacingTokens,
  shadow: shadowTokens,
  motion: motionTokens,
} as const;
