/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'story': ['Georgia', 'Charter', 'serif'],
        'ui': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        'story': {
          background: '#faf9f7',
          text: '#2d3748',
          muted: '#718096',
          accent: '#4a5568',
          choice: '#805ad5',
          'choice-hover': '#9f7aea',
        },
      },
      typography: {
        story: {
          css: {
            fontSize: '1.125rem',
            lineHeight: '1.8',
            color: '#2d3748',
            maxWidth: '65ch',
            'p': {
              marginTop: '1.5em',
              marginBottom: '1.5em',
            },
            'strong': {
              color: '#1a202c',
              fontWeight: '600',
            },
            'em': {
              color: '#4a5568',
              fontStyle: 'italic',
            },
          },
        },
      },
      animation: {
        'fadeIn': 'fadeIn 0.8s ease-in-out',
        'slideUp': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}