module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          100: '#E6FFFA',
          500: '#38B2AC',
        },
        purple: {
          200: '#E9D8FD',
          500: '#9F7AEA',
          600: '#805AD5',
          800: '#553C9A',
        },
        pink: {
          300: '#FBB6CE',
        },
        blue: {
          300: '#90CDF4',
        },
        green: {
          300: '#9AE6B4',
        },
        indigo: {
          900: '#312e81',
        },
        blue: {
          900: '#1e3a8a',
          800: '#1e40af',
          400: '#60a5fa',
        },
        green: {
          700: '#15803d',
          400: '#4ade80',
        },
      },
    },
  },
  plugins: [],
}