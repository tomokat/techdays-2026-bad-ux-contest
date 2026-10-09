import { useState, useRef, useEffect, useCallback } from 'react'
import './BadUxNameInput.css'

interface BadUxNameInputProps {
  value: string
  onChange: (name: string) => void
}

// Letters A-Z, a-z, plus space
const CHARS = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  ...'abcdefghijklmnopqrstuvwxyz'.split(''),
  ' ',
]

export const BadUxNameInput = ({ value, onChange }: BadUxNameInputProps) => {
  const [phase, setPhase] = useState<'ask_length' | 'spinning' | 'locked'>('ask_length')
  const [totalLength, setTotalLength] = useState<number>(5)
  const [tempLengthInput, setTempLengthInput] = useState<string>('5')
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [isSpinning, setIsSpinning] = useState<boolean>(false)
  const [currentLetterUnderNeedle, setCurrentLetterUnderNeedle] = useState<string>('A')
  const [lastLockedLetter, setLastLockedLetter] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rotationRef = useRef<number>(0)
  const animFrameRef = useRef<number | null>(null)
  const speedRef = useRef<number>(0.12) // Rotation speed in radians per frame

  const totalChars = CHARS.length
  const sliceAngle = (2 * Math.PI) / totalChars

  // Calculate which character is currently at 12 o'clock (angle = 3*PI/2)
  const getCharUnderNeedle = useCallback(
    (rot: number) => {
      // Needle is at top: -PI/2 (or 1.5 * PI)
      // Segment i starts at rot + i * sliceAngle
      // We want needleAngle = -PI/2
      // Angle relative to wheel = (-PI / 2 - rot)
      const needleAngle = -Math.PI / 2
      let relAngle = (needleAngle - rot) % (2 * Math.PI)
      if (relAngle < 0) relAngle += 2 * Math.PI
      const index = Math.floor(relAngle / sliceAngle) % totalChars
      return CHARS[index]
    },
    [sliceAngle, totalChars]
  )

  // Render canvas wheel
  const drawWheel = useCallback(
    (rot: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(centerX, centerY) - 10

      ctx.clearRect(0, 0, width, height)

      // Draw slices
      for (let i = 0; i < totalChars; i++) {
        const start = rot + i * sliceAngle
        const end = start + sliceAngle

        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, start, end)
        ctx.closePath()

        // Alternating vibrant colors
        ctx.fillStyle = i % 2 === 0 ? '#3b82f6' : '#ec4899'
        if (CHARS[i] === ' ') {
          ctx.fillStyle = '#eab308'
        }
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw character
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(start + sliceAngle / 2)
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 12px monospace'
        const label = CHARS[i] === ' ' ? '␣' : CHARS[i]
        ctx.fillText(label, radius - 6, 0)
        ctx.restore()
      }

      // Draw Center Hub
      ctx.beginPath()
      ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI)
      ctx.fillStyle = '#1e1b4b'
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 3
      ctx.stroke()

      // Center Hub Text
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('A-z', centerX, centerY)
    },
    [sliceAngle, totalChars]
  )

  // Wheel animation loop
  useEffect(() => {
    if (phase !== 'spinning') return

    const loop = () => {
      if (isSpinning) {
        rotationRef.current = (rotationRef.current + speedRef.current) % (2 * Math.PI)
        const char = getCharUnderNeedle(rotationRef.current)
        setCurrentLetterUnderNeedle(char)
      }
      drawWheel(rotationRef.current)
      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [phase, isSpinning, drawWheel, getCharUnderNeedle])

  // Start spinning phase after length is submitted
  const handleConfirmLength = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseInt(tempLengthInput, 10)
    if (isNaN(parsed) || parsed < 1) {
      alert('You must have at least 1 letter in your name!')
      return
    }
    const len = Math.min(Math.max(parsed, 1), 30)
    setTotalLength(len)
    setSelectedLetters([])
    setPhase('spinning')
    setIsSpinning(true)
  }

  // Handle Stop Click (lock in current letter)
  const handleStopWheel = () => {
    if (!isSpinning) return

    setIsSpinning(false)
    const stoppedChar = getCharUnderNeedle(rotationRef.current)
    const updated = [...selectedLetters, stoppedChar]
    setSelectedLetters(updated)
    setLastLockedLetter(stoppedChar)

    // Check if finished
    if (updated.length >= totalLength) {
      const finalName = updated.join('')
      onChange(finalName)
      setTimeout(() => {
        setPhase('locked')
      }, 1200)
    } else {
      // Auto-start spinning for next letter after 1 second
      setTimeout(() => {
        setIsSpinning(true)
        setLastLockedLetter(null)
      }, 1000)
    }
  }

  const currentSlotIndex = selectedLetters.length

  return (
    <div className="bad-name-container">
      {phase === 'ask_length' && (
        <div className="length-step-card">
          <label className="bad-label" htmlFor="nameLengthInput">
            Step 1: How many letters in your name? <span className="req">*</span>
          </label>
          <p className="bad-hint">
            ⚠️ <strong>CRITICAL:</strong> Count carefully! Includes spaces. This CANNOT be changed
            once confirmed.
          </p>
          <div className="length-input-row">
            <input
              id="nameLengthInput"
              type="number"
              min={1}
              max={30}
              value={tempLengthInput}
              onChange={(e) => setTempLengthInput(e.target.value)}
              className="bad-number-input"
            />
            <button
              type="button"
              className="bad-confirm-btn"
              onClick={handleConfirmLength}
            >
              Lock Length & Spin! 🎡
            </button>
          </div>
        </div>
      )}

      {phase === 'spinning' && (
        <div className="wheel-step-card">
          <div className="wheel-status-bar">
            <span>
              Selecting Letter <strong>#{currentSlotIndex + 1}</strong> of{' '}
              <strong>{totalLength}</strong>
            </span>
            <span className="no-undo-pill">🚫 NO UNDO / NO BACKSPACE</span>
          </div>

          {/* Letter Slot tracker */}
          <div className="slots-row">
            {Array.from({ length: totalLength }).map((_, idx) => {
              const char = selectedLetters[idx]
              const isCurrent = idx === currentSlotIndex
              return (
                <div
                  key={idx}
                  className={`slot-box ${char !== undefined ? 'filled' : ''} ${
                    isCurrent ? 'active' : ''
                  }`}
                >
                  {char !== undefined ? (char === ' ' ? '␣' : char) : idx + 1}
                </div>
              )
            })}
          </div>

          {/* Wheel canvas & Pointer needle */}
          <div className="wheel-wrapper">
            <div className="wheel-pointer">▼</div>
            <canvas ref={canvasRef} width={280} height={280} className="wheel-canvas" />
          </div>

          <div className="needle-monitor">
            Targeting:{' '}
            <span className="monitor-char">
              {currentLetterUnderNeedle === ' ' ? '[SPACE]' : currentLetterUnderNeedle}
            </span>
          </div>

          {lastLockedLetter !== null ? (
            <div className="locked-letter-alert">
              🔒 Locked in: <strong>{lastLockedLetter === ' ' ? '[SPACE]' : lastLockedLetter}</strong>!
              {selectedLetters.length < totalLength
                ? ' Next letter starting in 1s...'
                : ' All letters locked!'}
            </div>
          ) : (
            <button
              type="button"
              className={`bad-stop-btn ${!isSpinning ? 'disabled' : ''}`}
              onClick={handleStopWheel}
              disabled={!isSpinning}
            >
              🛑 CLICK TO STOP WHEEL NOW!
            </button>
          )}

          <p className="wheel-warning">
            Good luck getting the right letter. Once stopped, it is permanently locked into your identity.
          </p>
        </div>
      )}

      {phase === 'locked' && (
        <div className="locked-step-card">
          <label className="bad-label">
            Your Official Legal Name (Locked Forever) <span className="req">*</span>
          </label>
          <div className="locked-name-display">
            <span className="lock-icon">🔒</span>
            <span className="locked-text">{value || selectedLetters.join('')}</span>
          </div>
          <p className="locked-subtext">
            ✍️ Registered with {totalLength} characters. Per Bad UX Contest Bylaws, this field is
            strictly non-editable.
          </p>
        </div>
      )}
    </div>
  )
}
