import { useState, useRef, useEffect, useCallback } from 'react'
import './BadUxDobInput.css'

interface BadUxDobInputProps {
  value: string
  onChange: (dateStr: string) => void
}

// 4.6 Billion Years Ago to 2026 CE
const MIN_YEAR = -4600000000 // 4.6 Ga BCE
const MAX_YEAR = 2026 // Today

// Geological Eons / Eras for flavor
const getEraDescription = (year: number): { name: string; icon: string } => {
  if (year < -4000000000) return { name: 'Hadean Eon (Molten Earth)', icon: '🌋' }
  if (year < -2500000000) return { name: 'Archean Eon (Early Life)', icon: '🦠' }
  if (year < -541000000) return { name: 'Proterozoic Eon (Oxygen Crisis)', icon: '🪼' }
  if (year < -252000000) return { name: 'Paleozoic Era (Trilobites)', icon: '🦞' }
  if (year < -66000000) return { name: 'Mesozoic Era (Dinosaurs)', icon: '🦖' }
  if (year < -300000) return { name: 'Cenozoic Era (Mammoths)', icon: '🦣' }
  if (year < 1900) return { name: 'Ancient & Medieval History', icon: '🏛️' }
  if (year <= 2026) return { name: 'Modern Era (Humanity)', icon: '👶' }
  return { name: 'Unknown Era', icon: '⏳' }
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const BadUxDobInput = ({ value, onChange }: BadUxDobInputProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentYear, setCurrentYear] = useState<number>(-4600000000)
  const [month, setMonth] = useState<number>(1)
  const [day, setDay] = useState<number>(1)
  const [isLocked, setIsLocked] = useState(false)

  // Physics / Force state
  const [lastForce, setLastForce] = useState<number>(0)
  const [forceCategory, setForceCategory] = useState<string>('Static')
  const [feedbackMsg, setFeedbackMsg] = useState<string>('Scroll with your mouse wheel or trackpad to change year')

  const containerRef = useRef<HTMLDivElement | null>(null)
  const velocityRef = useRef<number>(0)
  const animRef = useRef<number | null>(null)

  // Format years nicely (e.g. 4,600,000,000 BCE or 1998 CE)
  const formatYear = (yr: number): string => {
    if (yr < 0) {
      return `${Math.abs(yr).toLocaleString()} BCE`
    }
    return `${yr} CE`
  }

  // Smooth physics deceleration
  useEffect(() => {
    if (!isOpen || isLocked) return

    const updatePhysics = () => {
      if (Math.abs(velocityRef.current) > 0.5) {
        setCurrentYear((prev) => {
          let next = Math.round(prev + velocityRef.current)
          if (next < MIN_YEAR) {
            next = MIN_YEAR
            velocityRef.current = 0
          }
          if (next > MAX_YEAR) {
            next = MAX_YEAR
            velocityRef.current = 0
          }
          return next
        })

        // Friction / Decay
        velocityRef.current *= 0.92
      }

      animRef.current = requestAnimationFrame(updatePhysics)
    }

    animRef.current = requestAnimationFrame(updatePhysics)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [isOpen, isLocked])

  // Wheel event listener detecting scroll force / impulse
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (isLocked) return
      e.preventDefault()

      // Calculate scroll force
      const delta = e.deltaY
      const absDelta = Math.abs(delta)

      // Extreme velocity scaling based on force
      let multiplier = 500
      let category = 'Gentle Breeze'
      let feedback = ''

      if (absDelta > 150) {
        // Massive flick!
        multiplier = 18000000
        category = '💥 SUPERNOVA FORCE'
        feedback = 'OOF! You scrolled with extreme force! Accelerated across epochs!'
      } else if (absDelta > 60) {
        multiplier = 3500000
        category = '🚀 High Kinetic Thrust'
        feedback = 'Heavy scroll force detected! Hurled through millions of years!'
      } else if (absDelta > 20) {
        multiplier = 250000
        category = '⚡ Moderate Scroll Impulse'
        feedback = 'Moderate scroll! Skipped over prehistoric eras!'
      } else {
        multiplier = 12500
        category = '🍃 Micro-Scroll'
        feedback = 'Subtle scroll force detected... still jumped 10,000+ years!'
      }

      setLastForce(Math.round(absDelta * 9.81))
      setForceCategory(category)
      setFeedbackMsg(feedback)

      // Impulse velocity
      const impulse = (delta > 0 ? 1 : -1) * absDelta * multiplier
      velocityRef.current += impulse

      // Also adjust months and days pseudo-randomly with force
      if (absDelta > 10) {
        setMonth((prev) => ((prev + Math.floor(absDelta)) % 12) + 1)
        setDay((prev) => ((prev + Math.floor(absDelta * 2)) % 28) + 1)
      }
    },
    [isLocked]
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el || !isOpen) return

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
    }
  }, [isOpen, handleWheel])

  const handleLockInDate = () => {
    const dateFormatted = `${MONTHS[month - 1]} ${day}, ${formatYear(currentYear)}`
    onChange(dateFormatted)
    setIsLocked(true)
    setIsOpen(false)
  }

  const currentEra = getEraDescription(currentYear)
  const isHumanEra = currentYear >= 1900 && currentYear <= 2026

  // Generate 5 surrounding dropdown sample options for visual illusion of dropdown
  const sampleSteps = [-2, -1, 0, 1, 2].map((offset) => {
    const yr = Math.min(Math.max(currentYear + offset * 150000000, MIN_YEAR), MAX_YEAR)
    return {
      year: yr,
      formatted: formatYear(yr),
      era: getEraDescription(yr),
    }
  })

  return (
    <div className="bad-dob-container">
      <label className="bad-dob-label" htmlFor="dobDropdownTrigger">
        Date of Birth (DOB) <span className="req">*</span>
      </label>
      <p className="bad-dob-subtext">
        ⏳ Dropdown covers Earth's formation (<strong>4.6 billion years ago</strong>) to present day.
        Scroll force sensor active.
      </p>

      {/* Main Dropdown Display Trigger */}
      <div
        id="dobDropdownTrigger"
        className={`dob-dropdown-trigger ${isOpen ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
        onClick={() => !isLocked && setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
      >
        <div className="trigger-content">
          <span className="era-icon">{currentEra.icon}</span>
          <span className="date-summary">
            {value
              ? value
              : `${MONTHS[month - 1]} ${day}, ${formatYear(currentYear)} (${currentEra.name})`}
          </span>
        </div>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>

      {/* The Force-Driven Dropdown Menu */}
      {isOpen && !isLocked && (
        <div className="dob-dropdown-menu" ref={containerRef}>
          <div className="force-meter-banner">
            <div className="force-meter-row">
              <span className="sensor-label">⚡ SCROLL FORCE SENSOR:</span>
              <span className="force-badge">{forceCategory}</span>
            </div>
            <div className="force-stats">
              <span>Force Detected: <strong>{lastForce} N</strong></span>
              <span>Speed: <strong>{Math.abs(Math.round(velocityRef.current)).toLocaleString()} yrs/sec</strong></span>
            </div>
            <p className="force-feedback-text">{feedbackMsg}</p>
          </div>

          <div className="era-status-card">
            <span className="big-era-icon">{currentEra.icon}</span>
            <div>
              <div className="era-name">{currentEra.name}</div>
              <div className="era-year-callout">{formatYear(currentYear)}</div>
            </div>
          </div>

          {/* Virtualized sample dropdown items that reflect current position */}
          <div className="dropdown-options-list">
            <div className="list-instructions">
              🖱️ Scroll with wheel/touchpad anywhere here to adjust date:
            </div>
            {sampleSteps.map((item, idx) => (
              <div
                key={idx}
                className={`dropdown-option-row ${item.year === currentYear ? 'selected' : ''}`}
                onClick={() => setCurrentYear(item.year)}
              >
                <span>{item.era.icon} {item.formatted}</span>
                <span className="option-era-tag">{item.era.name}</span>
              </div>
            ))}
          </div>

          {/* Precision Controls that also bounce uncontrollably */}
          <div className="month-day-row">
            <div>
              <label>Month:</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bad-select"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Day:</label>
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="bad-select"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isHumanEra && (
            <div className="miracle-banner">
              🎉 INCREDIBLE! You actually landed in the Modern Era! Quick, lock it in before you scroll!
            </div>
          )}

          <button
            type="button"
            className="lock-dob-btn"
            onClick={handleLockInDate}
          >
            🔒 Lock In This DOB Forever ({formatYear(currentYear)})
          </button>
        </div>
      )}

      {isLocked && (
        <div className="dob-locked-alert">
          🔒 DOB successfully locked to: <strong>{value}</strong>. No changes permitted by cosmological decree.
        </div>
      )}
    </div>
  )
}
