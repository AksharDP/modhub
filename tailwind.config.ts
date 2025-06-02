import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)', // Example primary color
        secondary: 'var(--color-secondary)', // Example secondary color
        accent: 'var(--color-accent)', // Example accent color
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        'nav-bg': 'var(--color-nav-bg)',
        'card-bg': 'var(--color-card-bg)',
        'button-bg': 'var(--color-button-bg)',
        'button-text': 'var(--color-button-text)',
      },
      borderRadius: {
        'custom': 'var(--border-radius-custom)', // For 5px roundness
        'card': 'var(--border-radius-card)',
        'button': 'var(--border-radius-button)',
        'input': 'var(--border-radius-input)',
        'avatar': 'var(--border-radius-avatar)',
      },
      spacing: {
        'nav-padding-x': 'var(--nav-padding-x)',
        'nav-padding-y': 'var(--nav-padding-y)',
      }
    },
  },
  plugins: [],
}
export default config
