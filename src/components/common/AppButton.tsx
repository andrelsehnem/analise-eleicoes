import type { ButtonHTMLAttributes, ReactNode } from 'react'

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export function AppButton({ children, ...props }: AppButtonProps) {
  return <button {...props}>{children}</button>
}
