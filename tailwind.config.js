/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F2F7F4', 100: '#E8F0EC', 200: '#D2E3D8', 300: '#A9C7B5',
          400: '#6FA384', 500: '#3D7D5E', 600: '#2B6F5B', 700: '#235E4D',
          800: '#1B4D3E', 900: '#143D31', 950: '#0C2820'
        },
        sage: {
          50: '#F5F8F6', 100: '#EBF2EE', 200: '#D5E3DB', 300: '#B6CEC0',
          400: '#8FA89B', 500: '#729082', 600: '#52796F', 700: '#3D5E56',
          800: '#29433D', 900: '#1B2E2A'
        },
        terracotta: {
          50: '#FDF4F0', 100: '#FDF0EB', 200: '#F8D8CB', 300: '#F1B59F',
          400: '#E78E6E', 500: '#D96B43', 600: '#C85A32', 700: '#A64421',
          800: '#833418', 900: '#5F2410'
        },
        primary: {
          50: '#F2F7F4', 100: '#E8F0EC', 200: '#D2E3D8', 300: '#A9C7B5',
          400: '#6FA384', 500: '#3D7D5E', 600: '#2B6F5B', 700: '#235E4D',
          800: '#1B4D3E', 900: '#143D31', 950: '#0C2820'
        },
        teal: {
          50: '#F5F8F6', 100: '#EBF2EE', 200: '#D5E3DB', 500: '#729082',
          600: '#52796F', 700: '#3D5E56', 800: '#29433D', 900: '#1B2E2A'
        },
        risk: {
          normal: '#2D7A58',
          'normal-bg': '#E8F5EE',
          'normal-border': '#C6E7D5',
          moderate: '#C85A32',
          'moderate-bg': '#FDF0EB',
          'moderate-border': '#F7D4C8',
          high: '#D32F2F',
          'high-bg': '#FDE8E8',
          'high-border': '#F8C4C4'
        },
        neutral: {
          25: '#FFFFFF', 50: '#FAFCFA', 100: '#F3F6F4', 200: '#E5EBE7',
          300: '#D0D7D2', 400: '#9CA6A0', 500: '#6E7A74', 600: '#5A6660',
          700: '#3E4742', 800: '#28302C', 900: '#1A201E'
        }
      },
      fontFamily: {
        sans: ['Figtree', 'Noto Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Noto Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 3px rgba(26, 32, 30, 0.04)',
        elevation: '0 4px 14px rgba(26, 32, 30, 0.06)',
        floating: '0 8px 24px rgba(26, 32, 30, 0.09)'
      },
      borderRadius: {
        xl: '1rem',
        card: '1rem',
        pill: '9999px'
      },
      backgroundImage: {
        'health-gradient': 'linear-gradient(135deg, #1B4D3E 0%, #52796F 100%)',
        'health-subtle': 'linear-gradient(180deg, #F2F7F4 0%, #ffffff 100%)'
      }
    }
  },
  plugins: []
}
