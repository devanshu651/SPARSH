/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5fa',
          100: '#e0ecf6',
          200: '#b9d5ec',
          300: '#82b3dc',
          400: '#468cc7',
          500: '#236fac',
          600: '#18568e',
          700: '#163e65',
          800: '#0f2942',
          900: '#0a1e34',
          950: '#071526'
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a'
        },
        risk: {
          normal: '#166534',
          'normal-bg': '#f0fdf4',
          'normal-border': '#bbf7d0',
          moderate: '#9a3412',
          'moderate-bg': '#fffbeb',
          'moderate-border': '#fed7aa',
          high: '#991b1b',
          'high-bg': '#fef2f2',
          'high-border': '#fecaca'
        },
        neutral: {
          25: '#fcfcfd',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Figtree', 'Noto Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Noto Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.05)',
        elevation: '0 4px 14px rgba(15, 23, 42, 0.07)',
        floating: '0 8px 24px rgba(15, 23, 42, 0.1)'
      },
      borderRadius: {
        card: '0.75rem'
      },
      backgroundImage: {
        'health-gradient': 'linear-gradient(135deg, #0f2942 0%, #0d9488 100%)',
        'health-subtle': 'linear-gradient(180deg, #f0f5fa 0%, #ffffff 100%)'
      }
    }
  },
  plugins: []
}
