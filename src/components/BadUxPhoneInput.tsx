import { useState, useMemo, type ChangeEvent } from 'react'
import './BadUxPhoneInput.css'

interface BadUxPhoneInputProps {
  value: string
  onChange: (fullPhone: string) => void
}

// Convert numbers to Roman Numerals
function toRoman(num: number): string {
  const lookup: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let roman = ''
  for (const [val, sym] of lookup) {
    while (num >= val) {
      roman += sym
      num -= val
    }
  }
  return roman
}

// Country flags with dialing codes (displayed only as flag emoji in dropdown)
const COUNTRY_FLAGS = [
  { flag: '🇺🇸', code: '+1', name: 'United States' },
  { flag: '🇨🇦', code: '+1', name: 'Canada' },
  { flag: '🇬🇧', code: '+44', name: 'United Kingdom' },
  { flag: '🇯🇵', code: '+81', name: 'Japan' },
  { flag: '🇩🇪', code: '+49', name: 'Germany' },
  { flag: '🇫🇷', code: '+33', name: 'France' },
  { flag: '🇦🇺', code: '+61', name: 'Australia' },
  { flag: '🇧🇷', code: '+55', name: 'Brazil' },
  { flag: '🇮🇳', code: '+91', name: 'India' },
  { flag: '🇲🇽', code: '+52', name: 'Mexico' },
  { flag: '🇮🇹', code: '+39', name: 'Italy' },
  { flag: '🇪🇸', code: '+34', name: 'Spain' },
  { flag: '🇰🇷', code: '+82', name: 'South Korea' },
  { flag: '🇳🇱', code: '+31', name: 'Netherlands' },
  { flag: '🇨🇭', code: '+41', name: 'Switzerland' },
  { flag: '🇸🇪', code: '+46', name: 'Sweden' },
  { flag: '🇸🇬', code: '+65', name: 'Singapore' },
  { flag: '🇳🇿', code: '+64', name: 'New Zealand' },
  { flag: '🇿🇦', code: '+27', name: 'South Africa' },
  { flag: '🇦🇷', code: '+54', name: 'Argentina' },
  { flag: '🇪🇬', code: '+20', name: 'Egypt' },
  { flag: '🇳🇴', code: '+47', name: 'Norway' },
  { flag: '🇩🇰', code: '+45', name: 'Denmark' },
  { flag: '🇮🇪', code: '+353', name: 'Ireland' },
]

// Base Area Codes
const RAW_AREA_CODES = [
  201, 212, 312, 415, 503, 650, 702, 808, 917, 305,
  404, 617, 718, 510, 818, 202, 602, 972, 858, 425,
  206, 303, 512, 214, 713, 832, 408, 310, 619, 704,
  504, 216, 412, 615, 901, 314, 816, 414, 608, 505
]

export const BadUxPhoneInput = ({ value, onChange }: BadUxPhoneInputProps) => {
  const [selectedFlagIdx, setSelectedFlagIdx] = useState<number>(0)
  const [selectedAreaCodeRoman, setSelectedAreaCodeRoman] = useState<string>('')
  const [numberDigits, setNumberDigits] = useState<string>('')
  const [lastIncrementNotice, setLastIncrementNotice] = useState<string | null>(null)

  // Scramble area codes deterministically into chaotic order with Roman numerals
  const shuffledRomanAreaCodes = useMemo(() => {
    // Deterministic shuffle
    const list = [...RAW_AREA_CODES]
    for (let i = list.length - 1; i > 0; i--) {
      const j = (i * 37 + 13) % list.length
      const temp = list[i]
      list[i] = list[j]
      list[j] = temp
    }
    return list.map((code) => ({
      code,
      roman: toRoman(code),
    }))
  }, [])

  // Update parent form
  const notifyChange = (flagIdx: number, romanArea: string, digits: string) => {
    const flagObj = COUNTRY_FLAGS[flagIdx]
    if (!flagObj || !romanArea || !digits) {
      onChange('')
      return
    }
    const full = `${flagObj.flag} (${flagObj.code}) [${romanArea}] ${digits}`
    onChange(full)
  }

  // Handle Country flag select
  const handleFlagChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10)
    setSelectedFlagIdx(idx)
    notifyChange(idx, selectedAreaCodeRoman, numberDigits)
  }

  // Handle Roman Area code select
  const handleAreaCodeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const roman = e.target.value
    setSelectedAreaCodeRoman(roman)
    notifyChange(selectedFlagIdx, roman, numberDigits)
  }

  // Handle Phone Number Input: when user enters a single digit, automatically increment by 1!
  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    // If user is deleting/backspacing
    if (rawVal.length < numberDigits.length) {
      setNumberDigits(rawVal)
      notifyChange(selectedFlagIdx, selectedAreaCodeRoman, rawVal)
      return
    }

    // Inspect the newly typed character(s)
    let processed = ''
    let noticedInc: string | null = null

    for (let i = 0; i < rawVal.length; i++) {
      const char = rawVal[i]
      if (char >= '0' && char <= '9') {
        // If this character was newly added at the end or changed
        if (i >= numberDigits.length || char !== numberDigits[i]) {
          const originalDigit = parseInt(char, 10)
          const incremented = (originalDigit + 1) % 10
          processed += incremented.toString()
          noticedInc = `Typed '${originalDigit}' ➔ Automatically incremented to '${incremented}' (+1 security offset)`
        } else {
          processed += char
        }
      } else if (char === '-' || char === ' ') {
        processed += char
      }
    }

    setNumberDigits(processed)
    if (noticedInc) {
      setLastIncrementNotice(noticedInc)
    }
    notifyChange(selectedFlagIdx, selectedAreaCodeRoman, processed)
  }

  return (
    <div className="bad-phone-container">
      <label className="bad-phone-label">
        Phone Number <span className="req">*</span>
      </label>
      <p className="bad-phone-desc">
        Select country flag (no names/numbers provided) + Roman numeral area code (out of order).
      </p>

      <div className="phone-sections-grid">
        {/* Section 1: Country Code (Flags Only) */}
        <div className="phone-section">
          <label className="section-label">1. Flag Code</label>
          <div className="flag-select-wrapper">
            <select
              value={selectedFlagIdx}
              onChange={handleFlagChange}
              className="bad-flag-select"
              title="Guess your country's flag!"
            >
              {COUNTRY_FLAGS.map((c, idx) => (
                <option key={idx} value={idx} className="flag-option">
                  {c.flag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 2: Area Code (Roman Numerals Out of Order) */}
        <div className="phone-section">
          <label className="section-label">2. Area Code (Roman)</label>
          <select
            value={selectedAreaCodeRoman}
            onChange={handleAreaCodeChange}
            className="bad-area-select"
          >
            <option value="">Select Roman Numeral...</option>
            {shuffledRomanAreaCodes.map((item, idx) => (
              <option key={idx} value={item.roman}>
                {item.roman}
              </option>
            ))}
          </select>
        </div>

        {/* Section 3: Number (Auto-increments by 1) */}
        <div className="phone-section number-section">
          <label className="section-label">3. Local Number</label>
          <input
            type="text"
            placeholder="e.g. 555-0199"
            value={numberDigits}
            onChange={handleNumberChange}
            className="bad-number-input-field"
            maxLength={10}
          />
        </div>
      </div>

      {lastIncrementNotice && (
        <div className="auto-inc-banner">
          🔢 <strong>Digit Mutated:</strong> {lastIncrementNotice}
        </div>
      )}

      {value && (
        <div className="phone-preview-card">
          <span className="preview-label">Assembled Phone:</span>
          <span className="preview-value">{value}</span>
        </div>
      )}
    </div>
  )
}
