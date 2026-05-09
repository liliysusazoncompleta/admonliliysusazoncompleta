/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Surface & Background ──────────────────────────────────────────
        'surface':                    '#fafaed',
        'surface-dim':                '#dadbce',
        'surface-bright':             '#fafaed',
        'surface-container-lowest':   '#ffffff',
        'surface-container-low':      '#f4f5e7',
        'surface-container':          '#eeefe2',
        'surface-container-high':     '#e8e9dc',
        'surface-container-highest':  '#e2e3d6',
        'surface-variant':            '#e2e3d6',
        'on-surface':                 '#1a1c15',
        'on-surface-variant':         '#444939',
        'inverse-surface':            '#2f3129',
        'inverse-on-surface':         '#f1f2e4',
        // ── Primary (Olive) ───────────────────────────────────────────────
        'primary':                    '#476500',
        'on-primary':                 '#ffffff',
        'primary-container':          '#5d7f13',
        'on-primary-container':       '#faffe7',
        'primary-fixed':              '#c8f17a',
        'primary-fixed-dim':          '#add461',
        'on-primary-fixed':           '#131f00',
        'on-primary-fixed-variant':   '#364e00',
        'inverse-primary':            '#add461',
        'surface-tint':               '#496800',
        // ── Secondary (Orange) ────────────────────────────────────────────
        'secondary':                  '#944a00',
        'on-secondary':               '#ffffff',
        'secondary-container':        '#fc8f34',
        'on-secondary-container':     '#663100',
        'secondary-fixed':            '#ffdcc5',
        'secondary-fixed-dim':        '#ffb783',
        'on-secondary-fixed':         '#301400',
        'on-secondary-fixed-variant': '#713700',
        // ── Tertiary ──────────────────────────────────────────────────────
        'tertiary':                   '#8c3d86',
        'on-tertiary':                '#ffffff',
        'tertiary-container':         '#a956a1',
        'on-tertiary-container':      '#fffbff',
        'tertiary-fixed':             '#ffd7f5',
        'tertiary-fixed-dim':         '#ffabf2',
        'on-tertiary-fixed':          '#380037',
        'on-tertiary-fixed-variant':  '#73266f',
        // ── Outline ───────────────────────────────────────────────────────
        'outline':                    '#747967',
        'outline-variant':            '#c4c9b4',
        // ── Error ─────────────────────────────────────────────────────────
        'error':                      '#ba1a1a',
        'on-error':                   '#ffffff',
        'error-container':            '#ffdad6',
        'on-error-container':         '#93000a',
        // ── Background ────────────────────────────────────────────────────
        'background':                 '#fafaed',
        'on-background':              '#1a1c15',
      },
      fontFamily: {
        sans:    ['Manrope', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '800' }],
        'h1':      ['32px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        'h2':      ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'h3':      ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        sm:      '0.25rem',
        DEFAULT: '0.5rem',
        md:      '0.75rem',
        lg:      '1rem',
        xl:      '1.5rem',
        full:    '9999px',
      },
      spacing: {
        'base': '4px',
        'xs':   '8px',
        'sm':   '16px',
        'md':   '24px',
        'lg':   '40px',
        'xl':   '64px',
        'gutter': '24px',
      },
      boxShadow: {
        'card':   '0px 4px 12px rgba(26, 28, 21, 0.05)',
        'modal':  '0px 12px 24px rgba(26, 28, 21, 0.10)',
        'lifted': '0px 8px 20px rgba(26, 28, 21, 0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-right': {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.6s ease-out forwards',
        'fade-in':    'fade-in 0.5s ease-out forwards',
        'slide-right':'slide-right 0.5s ease-out forwards',
        'scale-in':   'scale-in 0.4s ease-out forwards',
        'float':      'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
