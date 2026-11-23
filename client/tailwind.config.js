/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Stitch Surface Hierarchy
        "surface": "#0e131f",
        "surface-dim": "#0e131f",
        "surface-bright": "#343947",
        "surface-container-lowest": "#090e1a",
        "surface-container-low": "#161b28",
        "surface-container": "#1a1f2c",
        "surface-container-high": "#252a37",
        "surface-container-highest": "#303542",
        "surface-variant": "#303542",
        "on-surface": "#dee2f4",
        "on-surface-variant": "#c2c6d6",
        "inverse-surface": "#dee2f4",
        "inverse-on-surface": "#2b303e",
        "outline": "#8c909f",
        "outline-variant": "#424754",
        "surface-tint": "#adc6ff",

        // Stitch Signal & Accent Colors
        "primary": "#adc6ff",
        "on-primary": "#002e6a",
        "primary-container": "#4d8eff",
        "on-primary-container": "#00285d",
        "inverse-primary": "#005ac2",
        "primary-fixed": "#d8e2ff",
        "primary-fixed-dim": "#adc6ff",
        "on-primary-fixed": "#001a42",
        "on-primary-fixed-variant": "#004395",

        "secondary": "#4cd7f6",
        "on-secondary": "#003640",
        "secondary-container": "#03b5d3",
        "on-secondary-container": "#00424e",
        "secondary-fixed": "#acedff",
        "secondary-fixed-dim": "#4cd7f6",
        "on-secondary-fixed": "#001f26",
        "on-secondary-fixed-variant": "#004e5c",

        "tertiary": "#4edea3",
        "on-tertiary": "#003824",
        "tertiary-container": "#00a572",
        "on-tertiary-container": "#00311f",
        "tertiary-fixed": "#6ffbbe",
        "tertiary-fixed-dim": "#4edea3",
        "on-tertiary-fixed": "#002113",
        "on-tertiary-fixed-variant": "#005236",

        "error": "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",

        // Legacy / Brand Utility Fallbacks
        navy: {
          950: '#090e1a',
          900: '#0e131f',
          850: '#161b28',
          800: '#1a1f2c',
          750: '#252a37',
          700: '#303542',
          600: '#424754'
        },
        accent: {
          emerald: '#4edea3',
          amber: '#F59E0B',
          rose: '#EF4444',
          indigo: '#6366F1',
          cyan: '#4cd7f6'
        }
      },
      spacing: {
        "gutter": "1rem",
        "gutter-lg": "1.5rem",
        "margin": "1.5rem",
        "margin-lg": "2.5rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "0.75rem",
        "space-lg": "1.25rem",
        "space-xl": "2rem"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        "headline-xl": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "headline-sm": ["Inter", "sans-serif"],
        "score-display": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "stat-mono": ["Inter", "sans-serif"]
      },
      fontSize: {
        "headline-xl": ["3rem", { lineHeight: "3.5rem", letterSpacing: "-0.025em", fontWeight: "700" }],
        "headline-lg": ["2rem", { lineHeight: "2.5rem", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.015em", fontWeight: "600" }],
        "headline-sm": ["1.125rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        "score-display": ["1.75rem", { lineHeight: "2rem", letterSpacing: "-0.01em", fontWeight: "700" }],
        "body-lg": ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        "body-md": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        "body-sm": ["0.75rem", { lineHeight: "1rem", fontWeight: "400" }],
        "label-md": ["0.8125rem", { lineHeight: "1.125rem", letterSpacing: "0.01em", fontWeight: "500" }],
        "label-sm": ["0.6875rem", { lineHeight: "0.875rem", letterSpacing: "0.05em", fontWeight: "600" }],
        "stat-mono": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.02em", fontWeight: "600" }]
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.25s ease-out'
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
