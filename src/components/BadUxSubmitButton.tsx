import { useState, useRef, useEffect, useCallback } from 'react'
import './BadUxSubmitButton.css'

interface BadUxSubmitButtonProps {
  formId?: string
  giveUpAfter?: number // Infinity for now
}

const TAUNTS = [
  'Submit Form',
  'Too slow! 🏃‍♂️',
  'Nice try! 💨',
  'Almost had it! 😜',
  'Can’t touch this! ⚡',
  'Over here! 👀',
  'Whoops! 🚀',
  'Try harder! 🤡',
  'Missed me! 🏎️',
  'Not even close! 🎯',
]

export const BadUxSubmitButton = ({ giveUpAfter = Infinity }: BadUxSubmitButtonProps) => {
  const [escapeCount, setEscapeCount] = useState<number>(0)
  const [buttonText, setButtonText] = useState<string>('Submit Form')
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [isGivenUp, setIsGivenUp] = useState<boolean>(false)

  const buttonRef = useRef<HTMLButtonElement | null>(null)

  // Jump to a random position within viewport boundaries
  const dodge = useCallback(() => {
    if (isGivenUp) return

    const newCount = escapeCount + 1
    setEscapeCount(newCount)

    // Check if it should give up
    if (newCount >= giveUpAfter) {
      setIsGivenUp(true)
      setButtonText('Fine, you win... Click to Submit 🏳️')
      setPos(null)
      return
    }

    const nextTaunt = TAUNTS[newCount % TAUNTS.length]
    setButtonText(nextTaunt)

    // Calculate safe random coordinates within visible screen
    const btnWidth = buttonRef.current?.offsetWidth || 160
    const btnHeight = buttonRef.current?.offsetHeight || 48

    const padding = 30
    const maxX = Math.max(window.innerWidth - btnWidth - padding, 20)
    const maxY = Math.max(window.innerHeight - btnHeight - padding, 20)

    const randomX = Math.floor(Math.random() * (maxX - padding)) + padding
    const randomY = Math.floor(Math.random() * (maxY - padding)) + padding

    setPos({ x: randomX, y: randomY })
  }, [escapeCount, giveUpAfter, isGivenUp])

  // Mouse proximity sensor: if mouse gets within 75px, dodge before they even click!
  useEffect(() => {
    if (isGivenUp) return

    const handleMouseMove = (e: MouseEvent) => {
      const btn = buttonRef.current
      if (!btn) return

      const rect = btn.getBoundingClientRect()
      const btnCenterX = rect.left + rect.width / 2
      const btnCenterY = rect.top + rect.height / 2

      const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY)

      // Proximity threshold to trigger runaway
      if (dist < 65) {
        dodge()
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [dodge, isGivenUp])

  return (
    <div className="runaway-container">
      {escapeCount > 0 && (
        <div className="escape-counter-badge">
          🏃‍♂️ Submit Button Escapes: <strong>{escapeCount}</strong>
          {isGivenUp ? ' (Tired out!)' : ' (Running forever)'}
        </div>
      )}

      <button
        ref={buttonRef}
        type="submit"
        className={`runaway-btn ${pos ? 'teleported' : ''} ${isGivenUp ? 'given-up' : ''}`}
        style={
          pos
            ? {
                position: 'fixed',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                zIndex: 9999,
              }
            : {}
        }
        onMouseEnter={dodge}
        onTouchStart={dodge}
      >
        {buttonText}
      </button>
    </div>
  )
}
