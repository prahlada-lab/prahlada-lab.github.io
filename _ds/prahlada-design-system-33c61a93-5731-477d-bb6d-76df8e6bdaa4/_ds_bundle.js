/* @ds-bundle: {"format":4,"namespace":"PrahladaDesignSystem_33c61a","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Callout","sourcePath":"components/core/Callout.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"EyebrowLabel","sourcePath":"components/core/EyebrowLabel.jsx"},{"name":"Highlight","sourcePath":"components/core/Highlight.jsx"},{"name":"Ornament","sourcePath":"components/core/Ornament.jsx"},{"name":"Rule","sourcePath":"components/core/Rule.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"5511169be2d5","components/core/Button.jsx":"423c9a0d9012","components/core/Callout.jsx":"0150999b01f3","components/core/Card.jsx":"b293d15cd78d","components/core/EyebrowLabel.jsx":"ec314e1da723","components/core/Highlight.jsx":"060f9c4ca437","components/core/Ornament.jsx":"783229c36295","components/core/Rule.jsx":"7246b39be383"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.PrahladaDesignSystem_33c61a = window.PrahladaDesignSystem_33c61a || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
const TONES = {
  ongoing: {
    bg: 'var(--light-blue)',
    fg: 'var(--sky-blue)'
  },
  proposed: {
    bg: 'transparent',
    fg: 'var(--muted-text)',
    border: '1px solid var(--color-border)'
  },
  neutral: {
    bg: 'transparent',
    fg: 'var(--muted-text)',
    border: '1px solid var(--color-border)'
  }
};
function Badge({
  children,
  tone = 'neutral'
}) {
  const t = TONES[tone] || TONES.neutral;
  return React.createElement('span', {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      background: t.bg,
      color: t.fg,
      border: t.border || '1px solid transparent',
      padding: '6px 14px',
      borderRadius: 'var(--radius-pill)',
      display: 'inline-block',
      lineHeight: 1
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick
}) {
  const sizes = {
    sm: {
      padding: '8px 16px',
      fontSize: 13
    },
    md: {
      padding: '11px 22px',
      fontSize: 15
    },
    lg: {
      padding: '14px 28px',
      fontSize: 16
    }
  };
  const base = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'background .15s ease, color .15s ease, border-color .15s ease',
    ...sizes[size]
  };
  const variants = {
    primary: {
      background: 'var(--navy)',
      color: 'var(--ice-white)'
    },
    accent: {
      background: 'var(--sky-blue)',
      color: '#fff'
    },
    outline: {
      background: 'transparent',
      color: 'var(--navy)',
      borderColor: 'var(--navy)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--navy)'
    }
  };
  return React.createElement('button', {
    style: {
      ...base,
      ...variants[variant]
    },
    disabled,
    onClick
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Callout.jsx
try { (() => {
function Callout({
  label,
  children
}) {
  return React.createElement('div', {
    style: {
      fontFamily: 'var(--font-sans)',
      background: 'var(--light-blue)',
      borderLeft: '2px solid var(--sky-blue)',
      padding: '26px 30px'
    }
  }, label && React.createElement('div', {
    style: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: 'var(--sky-blue)',
      marginBottom: 10
    }
  }, label), React.createElement('div', {
    style: {
      fontSize: 22,
      fontWeight: 300,
      color: 'var(--navy)',
      lineHeight: 1.3,
      letterSpacing: '-0.01em'
    }
  }, children));
}
Object.assign(__ds_scope, { Callout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Callout.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  eyebrow,
  title,
  children,
  footer,
  tone = 'standard'
}) {
  const bg = tone === 'highlight' ? 'var(--light-blue)' : '#fff';
  return React.createElement('div', {
    style: {
      fontFamily: 'var(--font-sans)',
      background: bg,
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '32px 32px 28px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxSizing: 'border-box'
    }
  }, eyebrow && React.createElement('div', {
    style: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: 'var(--sky-blue)',
      marginBottom: 14
    }
  }, eyebrow), title && React.createElement('div', {
    style: {
      fontSize: 22,
      fontWeight: 400,
      color: 'var(--navy)',
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
      marginBottom: 12
    }
  }, title), React.createElement('div', {
    style: {
      fontSize: 15,
      color: 'var(--body-text)',
      lineHeight: 1.75,
      maxWidth: '46ch'
    }
  }, children), footer && React.createElement('div', {
    style: {
      marginTop: 'auto',
      paddingTop: 18,
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--muted-text)'
    }
  }, footer));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/EyebrowLabel.jsx
try { (() => {
function EyebrowLabel({
  children,
  color = 'sky'
}) {
  return React.createElement('div', {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.32em',
      textTransform: 'uppercase',
      color: color === 'sky' ? 'var(--sky-blue)' : color === 'muted' ? 'var(--muted-text)' : 'var(--navy)'
    }
  }, children);
}
Object.assign(__ds_scope, { EyebrowLabel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/EyebrowLabel.jsx", error: String((e && e.message) || e) }); }

// components/core/Highlight.jsx
try { (() => {
function Highlight({
  children,
  italic = false,
  variant = 'ring',
  onDark = false
}) {
  const block = variant === 'block';
  return React.createElement('span', {
    style: {
      background: onDark ? 'rgba(242,230,201,0.18)' : block ? 'var(--brass-soft)' : 'var(--highlight-bg)',
      boxShadow: onDark ? '0 0 0 1px var(--brass)' : block ? 'none' : '0 0 0 1px var(--highlight-ring)',
      borderRadius: 6,
      padding: block ? '0.08em 0.3em' : '0.02em 0.2em 0.02em 0.18em',
      whiteSpace: 'nowrap',
      color: onDark ? 'var(--ice-white)' : 'var(--highlight-fg)',
      fontWeight: block ? 400 : 500,
      fontStyle: italic ? 'italic' : 'normal'
    }
  }, children);
}
Object.assign(__ds_scope, { Highlight });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Highlight.jsx", error: String((e && e.message) || e) }); }

// components/core/Ornament.jsx
try { (() => {
function Ornament({
  size = 13
}) {
  return React.createElement('div', {
    style: {
      fontFamily: 'var(--font-sans)',
      color: 'var(--color-ornament)',
      letterSpacing: '0.7em',
      fontSize: size,
      lineHeight: 1,
      textIndent: '0.7em'
    }
  }, '\u25C6 \u25C6 \u25C6');
}
Object.assign(__ds_scope, { Ornament });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Ornament.jsx", error: String((e && e.message) || e) }); }

// components/core/Rule.jsx
try { (() => {
const COLORS = {
  brass: 'var(--brass)',
  sky: 'var(--sky-blue)',
  border: 'var(--color-border)'
};
function Rule({
  width = 56,
  color = 'brass',
  margin = 0
}) {
  return React.createElement('div', {
    style: {
      width,
      height: color === 'border' ? 1 : 2,
      margin,
      background: COLORS[color] || COLORS.brass
    }
  });
}
Object.assign(__ds_scope, { Rule });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Rule.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Callout = __ds_scope.Callout;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.EyebrowLabel = __ds_scope.EyebrowLabel;

__ds_ns.Highlight = __ds_scope.Highlight;

__ds_ns.Ornament = __ds_scope.Ornament;

__ds_ns.Rule = __ds_scope.Rule;

})();
