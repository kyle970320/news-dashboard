module.exports = {
    content: [
      './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        fontFamily:{
          pretendard:['var(--font-pretendard)'],
          gmarket:['var(--font-gmarket)'],
        },
        keyframes: {
          drift: {
            '100%': { transform: 'rotate(-360deg)' },
          },
        },
        animation: {
          spineight: 'spin 8s linear infinite',
          spinfour: 'spin 4s linear infinite',
        },
      },
    },
    plugins: [],
  }