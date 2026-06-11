import React from 'react'
import 'katex/dist/katex.min.css'

import styles from './MathView.module.scss'

export interface MathViewProps {
  latex: string
  inline?: boolean
  textColor?: string
  fontSize?: number
}

// LaTeX command → Unicode mapping
const LATEX_SYMBOLS: Record<string, string> = {
  // Greek lowercase
  '\\pi': 'π', '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ',
  '\\delta': 'δ', '\\epsilon': 'ε', '\\theta': 'θ', '\\lambda': 'λ',
  '\\mu': 'μ', '\\nu': 'ν', '\\sigma': 'σ', '\\omega': 'ω',
  '\\phi': 'φ', '\\psi': 'ψ', '\\chi': 'χ', '\\eta': 'η',
  '\\rho': 'ρ', '\\tau': 'τ',
  // Greek uppercase
  '\\Delta': 'Δ', '\\Sigma': 'Σ', '\\Omega': 'Ω',
  '\\Chi': 'Χ', '\\Phi': 'Φ', '\\Psi': 'Ψ',
  // Operators
  '\\sum': 'Σ', '\\prod': 'Π', '\\int': '∫',
  '\\partial': '∂', '\\nabla': '∇',
  // Arrows
  '\\rightarrow': '→', '\\leftarrow': '←',
  // Relations
  '\\pm': '±', '\\infty': '∞', '\\approx': '≈', '\\angle': '∠',
  // Brackets
  '\\lfloor': '⌊', '\\rfloor': '⌋', '\\lceil': '⌈', '\\rceil': '⌉',
}

// Pattern-based replacements (order matters)
const LATEX_PATTERNS: [RegExp, string][] = [
  [/\\displaystyle\s*/g, ''],
  [/\\(?:text|mathrm|mathit|mathbf|operatorname)\{([^}]*)\}/g, '$1'],
  [/\\frac\s*\{([^}]*)\}\s*\{([^}]*)\}/g, '($1/$2)'],
  [/\\over\s*/g, '/'],
  [/\\sqrt\{([^}]*)\}/g, '√($1)'],
  [/\\(?:left|right|big|Big|bigg|Bigg)[()[\]{}|.]/g, ''],
  [/\\(?:cdot|times)/g, '×'],
  [/\\bmod/g, 'mod'], [/\\mod/g, 'mod'],
  [/\\leq?/g, '≤'], [/\\geq?/g, '≥'],
  [/\\neq?/g, '≠'],
  [/\\[,;!]/g, ''],
  [/\^{2}/g, '²'], [/\^2/g, '²'],
  [/\^{3}/g, '³'], [/\^3/g, '³'],
  [/\^{n}/g, 'ⁿ'], [/\^n/g, 'ⁿ'],
  [/\^{([^}]*)}/g, '^($1)'],
  [/_{([^}]*)}/g, '_$1'],
  [/[{}]/g, ''],
  [/\\\s/g, ' '],
  [/\\/g, ''],
  [/\s{2,}/g, ' '],
]

function latexToPlain(tex: string): string {
  let result = tex
  for (const [pattern, replacement] of LATEX_PATTERNS) {
    result = result.replace(pattern, replacement)
  }
  for (const [command, unicode] of Object.entries(LATEX_SYMBOLS)) {
    result = result.replaceAll(command, unicode)
  }
  return result.trim()
}

let katexRenderToString: ((tex: string, opts: Record<string, unknown>) => string) | null = null

if (typeof window !== 'undefined') {
  try {
    const katex = require('katex')
    katexRenderToString = katex.renderToString
  } catch {}
}

export function MathView({ latex, inline, textColor, fontSize }: MathViewProps) {
  const customStyle: React.CSSProperties = {
    ...(fontSize ? { fontSize } : undefined),
    ...(textColor ? { color: textColor } : undefined),
  }

  if (!katexRenderToString) {
    const fallbackClasses = [
      styles.fallback,
      inline ? styles.fallbackInline : styles.fallbackBlock,
    ].join(' ')

    return (
      <span className={fallbackClasses} style={customStyle}>
        {latexToPlain(latex)}
      </span>
    )
  }

  try {
    const html = katexRenderToString(latex, {
      displayMode: !inline,
      throwOnError: false,
    })

    if (inline) {
      return (
        <span
          className={styles.katexInline}
          style={customStyle}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    }

    return (
      <div
        data-component="MathView"
        className={styles.katexBlock}
        style={customStyle}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  } catch {
    return (
      <span className={styles.errorFallback} style={customStyle}>
        {latexToPlain(latex)}
      </span>
    )
  }
}

export { latexToPlain }
