import { useState, type ChangeEvent } from 'react'
import './BadUxEmailInput.css'

interface BadUxEmailInputProps {
  value?: string
  onChange: (fullEmail: string) => void
}

// Nostalgic, obsolete, and forgotten domains
const VINTAGE_DOMAINS = [
  { domain: '@geocities.com', era: '1994 - 2009', desc: '🚧 Under Construction forever' },
  { domain: '@sympatico.com', era: '1995 Dial-up', desc: '🍁 Bell Canada dial-up classic' },
  { domain: '@angelfire.com', era: '1996 - Present', desc: '🔥 Glitter GIFs & MIDI background music' },
  { domain: '@altavista.com', era: '1995 - 2013', desc: '🔍 Web 1.0 search engine royalty' },
  { domain: '@lycos.com', era: '1994 - 2008', desc: '🐕 Go get it, Lycos!' },
  { domain: '@excite.com', era: '1995 - Present', desc: 'Portal of the dot-com bubble' },
  { domain: '@askjeeves.com', era: '1996 - 2006', desc: '🤵 The butler will read your emails' },
  { domain: '@compuserve.com', era: '1979 - 2009', desc: '💾 Hourly connect charges apply' },
  { domain: '@netscape.net', era: '1994 - 2008', desc: '🧭 Best viewed in Netscape Navigator 3.0' },
  { domain: '@prodigy.net', era: '1984 - 2001', desc: '📞 BBS era nostalgia' },
  { domain: '@earthlink.net', era: '1994 - Present', desc: '🔌 56k modem screech required' },
  { domain: '@myspace.com', era: '2003 - 2008', desc: '🎸 Tom is your only contact' },
  { domain: '@neopets.com', era: '1999 - Present', desc: '🐾 Feed your dying Neopets first' },
  { domain: '@napster.com', era: '1999 - 2001', desc: '🎧 Lars Ulrich is actively monitoring this inbox' },
  { domain: '@friendster.com', era: '2002 - 2015', desc: '👥 Top 8 friends only' },
  { domain: '@icqmail.com', era: '1996 - 2024', desc: '🌼 Uh-oh! 123456789' },
]

export const BadUxEmailInput = ({ onChange }: BadUxEmailInputProps) => {
  const [username, setUsername] = useState<string>('')
  const [domainIndex, setDomainIndex] = useState<number>(0)
  const [keystrokeCount, setKeystrokeCount] = useState<number>(0)

  const currentDomainObj = VINTAGE_DOMAINS[domainIndex]

  // Every time user types or backspaces in the email body, rotate to next vintage domain
  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value
    setUsername(newUsername)

    // Advance domain on every input change!
    const nextIdx = (domainIndex + 1) % VINTAGE_DOMAINS.length
    setDomainIndex(nextIdx)
    setKeystrokeCount((prev) => prev + 1)

    const nextDomain = VINTAGE_DOMAINS[nextIdx].domain
    if (newUsername.trim()) {
      onChange(`${newUsername.trim()}${nextDomain}`)
    } else {
      onChange('')
    }
  }

  // Attempting to manually change domain dropdown immediately shifts upon next type anyway
  const handleDomainSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10)
    setDomainIndex(idx)
    if (username.trim()) {
      onChange(`${username.trim()}${VINTAGE_DOMAINS[idx].domain}`)
    }
  }

  return (
    <div className="bad-email-container">
      <label className="bad-email-label" htmlFor="emailUsernameInput">
        Email Address <span className="req">*</span>
      </label>
      <p className="bad-email-desc">
        Separated for your convenience. Note: Domain automatically shifts to a deprecated Web 1.0
        provider on every keystroke.
      </p>

      <div className="email-parts-row">
        {/* Email Body / Username Input */}
        <div className="email-body-col">
          <label className="sub-label" htmlFor="emailUsernameInput">
            Email Body (Username)
          </label>
          <input
            id="emailUsernameInput"
            type="text"
            placeholder="e.g. coolguy2000"
            value={username}
            onChange={handleUsernameChange}
            className="email-username-input"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <span className="at-separator">@</span>

        {/* Shifting Vintage Domain Selector */}
        <div className="email-domain-col">
          <label className="sub-label" htmlFor="emailDomainSelect">
            Assigned Vintage Domain
          </label>
          <select
            id="emailDomainSelect"
            value={domainIndex}
            onChange={handleDomainSelect}
            className="email-domain-select"
          >
            {VINTAGE_DOMAINS.map((item, idx) => (
              <option key={idx} value={idx}>
                {item.domain}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Retro domain info card */}
      <div className="vintage-domain-card">
        <div className="vintage-top-row">
          <span className="retro-tag">📻 DEPRECATED DOMAIN</span>
          <span className="era-badge">{currentDomainObj.era}</span>
        </div>
        <div className="vintage-domain-name">{currentDomainObj.domain}</div>
        <div className="vintage-desc">{currentDomainObj.desc}</div>
        <div className="keystroke-ticker">
          Keystrokes detected: <strong>{keystrokeCount}</strong> (Domain shifted {keystrokeCount} times)
        </div>
      </div>

      {/* Assembled Email Preview */}
      {username && (
        <div className="assembled-email-bar">
          <span className="assembled-label">Destination Address:</span>
          <span className="assembled-email">{username}{currentDomainObj.domain}</span>
        </div>
      )}
    </div>
  )
}
