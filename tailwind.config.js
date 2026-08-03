/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eff6ff', 100: '#dbeafe', 500: '#2563eb', 700: '#1d4ed8', 800: '#1e3a8a', 900: '#172554' },
        teal: { 50: '#f0fdfa', 100: '#ccfbf1', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' },
        risk: { normal: '#16a34a', moderate: '#f59e0b', high: '#dc2626' },
        neutral: { 25: '#fcfcfd', 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 400: '#94a3b8', 500: '#64748b', 700: '#334155', 900: '#0f172a' }
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 4px 18px rgba(15, 23, 42, 0.08)', floating: '0 12px 32px rgba(30, 58, 138, 0.16)' },
      borderRadius: { card: '1.25rem' },
      backgroundImage: { 'health-gradient': 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)' }
    }
  },
  plugins: []
}
