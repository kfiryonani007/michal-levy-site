/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Desert / warm-neutral palette — no bright or high-contrast colors.
        //
        // `wood` and `taupe` are two steps deeper than the reference palette
        // (#8B6B4A / #A89684). At the original values, taupe text on the shell
        // background measured 2.67:1 and on cream 2.39:1 — well under the 4.5:1
        // WCAG AA minimum, and taupe carries every small label and eyebrow on
        // the page. The values below read as the same warm earth tones but pass
        // AA everywhere they are used (5.7:1 and 5.1:1 respectively).
        shell: '#FAF7F2', // main page background (broken white)
        cream: '#F2EAE0', // light cream / beige sections
        sand: '#D9C7AE', // desert sand
        wood: '#7D5F41', // wood brown — links, icons, error text
        ink: '#2B2420', // very dark brown for text (never pure black)
        accent: '#C9B79C', // hairlines, borders, dividers, decorative numerals
        taupe: '#6F6050', // warm grey-brown for muted/secondary text

        // Two additions from a Pantone moodboard the client sent (Potter's
        // Clay 18-1340 and Warm Taupe 16-1318). Used as accents layered onto
        // the existing palette above, not as replacements for it — `wood` and
        // `taupe` already carry body text and are tuned for AA contrast; these
        // two are for backgrounds/active-states only, each checked for its
        // one intended use:
        //   clay        4.95:1 with white/shell text on top → safe as a
        //               button/active-state fill
        //   warmtaupe   2.6:1 with dark text as foreground (fails) but 5.0:1
        //               with dark ink text ON TOP of it → safe as a background
        //               wash only, never as a text colour
        clay: '#A65D35', // Pantone 18-1340 "Potter's Clay"
        warmtaupe: '#A6907E', // Pantone 16-1318 "Warm Taupe"
      },
      fontFamily: {
        // Elegant thin serif for headings; clean sans for body. Both support Hebrew.
        serif: ['"Frank Ruhl Libre"', '"David Libre"', 'Georgia', 'serif'],
        sans: ['Assistant', 'Heebo', '"Segoe UI"', 'system-ui', 'sans-serif'],
        script: ['"Great Vibes"', '"Frank Ruhl Libre"', 'cursive'],
      },
      letterSpacing: {
        eyebrow: '0.28em', // wide tracking for the small spaced-out kickers
      },
      maxWidth: {
        content: '1240px',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'ken-burns': {
          '0%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1.14)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scroll-hint': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.45' },
          '50%': { transform: 'translateY(7px)', opacity: '1' },
        },
      },
      animation: {
        'ken-burns': 'ken-burns 22s ease-out forwards',
        'fade-in': 'fade-in 1.2s ease-out forwards',
        'scroll-hint': 'scroll-hint 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
