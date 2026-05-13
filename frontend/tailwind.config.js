module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      colors: {
        navy: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
      },
    },
  },
  plugins: [],
}
