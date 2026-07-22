import type { ReactNode } from 'react'
import styles from './LinkButton.module.css'

type LinkButtonProps = {
  href: string
  children: ReactNode
  variant?: 'solid' | 'ghost'
}

/** ボタン状のアンカー(角丸なし=図面の様式) */
export function LinkButton({ href, children, variant = 'solid' }: LinkButtonProps) {
  return (
    <a
      href={href}
      className={variant === 'solid' ? styles.solid : styles.ghost}
    >
      {children}
    </a>
  )
}
