/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3f51b5',
        'primary-light': '#7986cb',
        'primary-dark': '#303f9f',
        'accent': '#ff4081',
        'text-dark': '#333',
        'text-light': '#fff',
        'shell1': '#ff5252',
        'shell2': '#4caf50',
        'shell3': '#2196f3',
        'shell4': '#9c27b0',
        'shell5': '#ffeb3b',
        'gray-light': '#f5f5f5',
        'gray-lighter': '#fafafa',
        'gray-medium': '#e0e0e0',
        'gray-dark': '#9e9e9e',
        'nucleus': '#808080',
        'electron1': '#ff7070',
        'electron2': '#70ff70',
        'electron3': '#7070ff',
        'electron4': '#ff70ff',
        'electron5': '#ffff70'
      },
      spacing: {
        'panel-width': '280px',
        'panel-padding': '15px',
      },
      fontFamily: {
        'comic': ['"Comic Sans MS"', '"Chalkboard SE"', '"Comic Neue"', 'sans-serif']
      },
      zIndex: {
        5: '5',
        10: '10'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    plugin(function({ addComponents }) {
      addComponents({
        '.temp-label': {
          position: 'absolute',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '15px',
          fontSize: '14px',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
          transition: 'opacity 0.5s',
          zIndex: '10'
        },
        '.animation-controls': {
          position: 'absolute',
          right: '10px',
          bottom: '10px',
          display: 'flex',
          gap: '8px',
          zIndex: '10',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '8px',
          borderRadius: '10px'
        }
      });
    })
  ],
}
