import { useEffect, useState } from 'react'
import { SupportProjectButton } from '../common/SupportProjectButton'

const HIGHLIGHT_WORDS: string[] = [
  'cada político',
  'cada deputado',
  'cada senador',
  'cada presidente',
]

export function HeroSection() {
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0)
  const [isWordVisible, setIsWordVisible] = useState<boolean>(true)

  useEffect(() => {
    let timeoutId: number | null = null

    const intervalId: number = window.setInterval(() => {
      setIsWordVisible(false)

      timeoutId = window.setTimeout(() => {
        setActiveWordIndex((currentIndex) => (currentIndex + 1) % HIGHLIGHT_WORDS.length)
        setIsWordVisible(true)
      }, 220)
    }, 2000)

    return () => {
      window.clearInterval(intervalId)
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  return (
    <div className="hero">
      <div className="hero-label">🗳 Eleições 2026 · Políticos Brasileiros</div>
      <h1>
        Conheça o histórico
        <br />
        de{' '}
        <em
          className={`hero-animated-word ${isWordVisible ? 'is-visible' : 'is-hidden'}`}
          aria-live="polite"
        >
          {HIGHLIGHT_WORDS[activeWordIndex]}
        </em>
      </h1>
      <p className="hero-desc">
        Analise projetos de lei, votações e posicionamentos dos seus representantes. Dados
        oficiais dos orgãos públicos para uma escolha consciente.
      </p>

      <SupportProjectButton />
    </div>
  )
}
