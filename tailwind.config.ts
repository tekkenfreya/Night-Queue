const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: '#E50914',
          dark: '#141414',
          gray: '#333333',
        }
      },
      fontFamily: {
        'sans': ['Noto Sans', 'sans-serif'],
        'heading': ['Barlow', 'sans-serif'],
        'p5hatty': ['P5hatty', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config