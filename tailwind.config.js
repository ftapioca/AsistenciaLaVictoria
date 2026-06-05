import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './adminPanel.html',
    './misTurnos.html',
    './programadorTurnos.html',
    './TurnosAbiertos.html',
    './ventasMensuales.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // DESIGN TOKENS: COLORES CORPORATIVOS
      colors: {
        // Brand Colors (La Victoria Burger Palette)
        brand: {
          bun: '#ff8a13',           // Color primario - Naranja del pan
          'bun-dark': '#d96700',    // Variante oscura del bun
          cheese: '#ffc928',        // Amarillo queso
          ketchup: '#ef3b2d',       // Rojo tomate
          lettuce: '#19a66a',       // Verde lechuga
        },
        // Neutral Colors
        neutral: {
          charcoal: '#14100d',      // Principal oscuro
          'charcoal-light': '#211813', // Variante clara del charcoal
          cream: '#fff5e4',         // Crema/beige claro
          paper: 'rgba(255, 250, 241, 0.94)',  // Papel semitransparente
          'paper-strong': 'rgba(255, 250, 241, 0.98)', // Papel más opaco
          muted: '#806957',         // Texto muted/deshabilitado
        },
        // Semantic Colors
        success: '#19a66a',         // Basado en lettuce
        warning: '#ffc928',         // Basado en cheese
        error: '#ef3b2d',           // Basado en ketchup
        info: '#ff8a13',            // Basado en bun
      },
      
      // DESIGN TOKENS: TIPOGRAFÍA
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px', letterSpacing: '0.5px' }],
        sm: ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        base: ['16px', { lineHeight: '24px', letterSpacing: '0px' }],
        lg: ['18px', { lineHeight: '28px', letterSpacing: '0px' }],
        xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.2px' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.3px' }],
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.4px' }],
        '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.5px' }],
        '5xl': ['48px', { lineHeight: '48px', letterSpacing: '-0.6px' }],
        '6xl': ['64px', { lineHeight: '64px', letterSpacing: '-0.6px' }],
        // Clamp sizes para responsive
        'clamp-lg': 'clamp(34px, 5vw, 64px)',
        'clamp-md': 'clamp(24px, 4vw, 48px)',
        'clamp-sm': 'clamp(18px, 3vw, 32px)',
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      
      // DESIGN TOKENS: ESPACIADO
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '32px',
        '5xl': '36px',
        '6xl': '40px',
      },
      gap: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '32px',
      },
      
      // DESIGN TOKENS: BORDES Y RADIOS
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '18px',
        xl: '24px',
        '2xl': '30px',
        '3xl': '32px',
        full: '999px',
      },
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '2': '2px',
        '4': '4px',
      },
      
      // DESIGN TOKENS: SOMBRAS
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
        brand: '0 30px 80px rgba(33, 24, 19, 0.28)',
        'brand-sm': '0 10px 26px rgba(0, 0, 0, 0.18)',
        inner: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
      },
      
      // DESIGN TOKENS: Z-INDEX
      zIndex: {
        base: '1',
        dropdown: '10',
        sticky: '20',
        fixed: '30',
        modal: '40',
        popover: '50',
        tooltip: '60',
        notification: '70',
      },
      
      // DESIGN TOKENS: TRANSICIONES
      animation: {
        'spin': 'spin 0.8s linear infinite',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        slower: '500ms',
      },
      transitionTimingFunction: {
        ease: 'ease',
        'ease-in': 'ease-in',
        'ease-out': 'ease-out',
        'ease-in-out': 'ease-in-out',
      },
      
      // DESIGN TOKENS: BREAKPOINTS
      screens: {
        sm: '640px',    // Mobile landscape / Tablet portrait
        md: '768px',    // Tablet
        lg: '1024px',   // Desktop
        xl: '1280px',   // Desktop Large
        '2xl': '1536px', // Desktop Extra Large
      },
      
      // DESIGN TOKENS: WIDTH
      width: {
        full: '100%',
        screen: '100vw',
        min: 'min(100%, 1100px)',
        container: 'min(100%, 1200px)',
      },
      maxWidth: {
        xs: '320px',
        sm: '384px',
        md: '448px',
        lg: '512px',
        xl: '576px',
        '2xl': '672px',
        '3xl': '768px',
        '4xl': '896px',
        '5xl': '1024px',
        container: '1200px',
        full: '100%',
      },
      
      // DESIGN TOKENS: OPACITY
      opacity: {
        0: '0',
        5: '0.05',
        10: '0.1',
        20: '0.2',
        30: '0.3',
        40: '0.4',
        50: '0.5',
        60: '0.6',
        70: '0.7',
        72: '0.72',
        80: '0.8',
        90: '0.9',
        94: '0.94',
        96: '0.96',
        98: '0.98',
        100: '1',
      },
    },
  },
  plugins: [
    forms,
    typography,
  ],
};
