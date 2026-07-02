/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm White / Cream / Beige / Soft Brown / Charcoal / Gold
        cream: {
          DEFAULT: '#FBF7F0',
          50: '#FFFEFC',
          100: '#FBF7F0',
          200: '#F5EEE1',
        },
        beige: {
          DEFAULT: '#EDE3D3',
          100: '#F2E9DB',
          200: '#EDE3D3',
          300: '#E2D3BB',
        },
        brown: {
          DEFAULT: '#8A6F52',
          50: '#F1E9DD',
          100: '#E0CFB4',
          300: '#B8926A',
          500: '#8A6F52',
          700: '#5E4A38',
          900: '#3A2E26',
        },
        charcoal: {
          DEFAULT: '#2B2622',
          soft: '#3D3630',
        },
        gold: {
          DEFAULT: '#C9A24B',
          soft: '#E0C687',
          deep: '#A9832F',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -6px rgba(58, 46, 38, 0.12)',
        lift: '0 12px 32px -8px rgba(58, 46, 38, 0.18)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      backgroundImage: {
        'ink-radial': 'radial-gradient(circle at 20% 20%, rgba(201,162,75,0.10), transparent 45%)',
      },
    },
  },
  plugins: [],
};
