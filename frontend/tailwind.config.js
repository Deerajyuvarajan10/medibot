/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0A0F1E',
          secondary: '#111827',
          card: '#1A2235',
        },
        accent: {
          primary: '#00D4AA',
          secondary: '#3B82F6',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
        },
        warning: '#F59E0B',
        danger: '#EF4444',
        success: '#10B981',
      },
      fontFamily: {
        heading: ['DM Sans', 'Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'accent-glow': '0 4px 24px rgba(0, 212, 170, 0.08)',
      },
      borderRadius: {
        'small': '8px',
        'medium': '12px',
        'large': '16px',
        'pill': '24px',
      }
    },
  },
  plugins: [],
}
