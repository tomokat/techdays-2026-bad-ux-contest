import { useState, type FormEvent } from 'react'
import { BadUxNameInput } from './components/BadUxNameInput'
import { BadUxDobInput } from './components/BadUxDobInput'
import { BadUxPhoneInput } from './components/BadUxPhoneInput'
import { BadUxEmailInput } from './components/BadUxEmailInput'
import { BadUxSubmitButton } from './components/BadUxSubmitButton'
import { BadUxJapaneseModal } from './components/BadUxJapaneseModal'
import './App.css'

interface FormData {
  name: string
  dob: string
  phone: string
  email: string
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    dob: '',
    phone: '',
    email: '',
  })

  const [formError, setFormError] = useState<string | null>(null)
  const [submittedData, setSubmittedData] = useState<FormData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const handleNameChange = (newName: string) => {
    setFormData((prev) => ({
      ...prev,
      name: newName,
    }))
    setFormError(null)
  }

  const handleDobChange = (newDob: string) => {
    setFormData((prev) => ({
      ...prev,
      dob: newDob,
    }))
    setFormError(null)
  }

  const handlePhoneChange = (newPhone: string) => {
    setFormData((prev) => ({
      ...prev,
      phone: newPhone,
    }))
    setFormError(null)
  }

  const handleEmailChange = (newEmail: string) => {
    setFormData((prev) => ({
      ...prev,
      email: newEmail,
    }))
    setFormError(null)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.name) {
      setFormError('⚠️ You must complete spinning for all letters of your name first!')
      return
    }
    if (!formData.dob) {
      setFormError('⚠️ You must lock in your Date of Birth on the 4.6-billion-year timeline!')
      return
    }
    if (!formData.phone) {
      setFormError('⚠️ Please complete all sections of your phone number (flag, Roman area code, and local number)!')
      return
    }
    if (!formData.email) {
      setFormError('⚠️ Please enter your email body (username) to receive an obsolete 90s domain!')
      return
    }
    setFormError(null)
    setSubmittedData({ ...formData })
    setIsModalOpen(true)
  }

  const handleReset = () => {
    setSubmittedData(null)
    setIsModalOpen(false)
    setFormData({
      name: '',
      dob: '',
      phone: '',
      email: '',
    })
    setFormError(null)
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <span className="badge">Bad UX Contest 🏆</span>
          <h1>Contest Registration</h1>
          <p className="subtitle">Enjoy the world's most frustrating user experience!</p>
        </div>

        {submittedData ? (
          <div className="success-box">
            <h2>🎉 Form Submitted Successfully!</h2>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px' }}>
              HOW DID YOU DO IT?! You survived all forms of digital torture AND caught the runaway submit button!
            </p>
            <ul className="result-list">
              <li>
                <span>Official Name:</span> {submittedData.name}
              </li>
              <li>
                <span>DOB:</span> {submittedData.dob}
              </li>
              <li>
                <span>Phone:</span> {submittedData.phone}
              </li>
              <li>
                <span>Email:</span> {submittedData.email}
              </li>
            </ul>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                type="button"
                className="reset-btn"
                style={{ backgroundColor: '#e0e7ff', color: '#4338ca', borderColor: '#818cf8' }}
                onClick={() => setIsModalOpen(true)}
              >
                📋 結果ポップアップを表示 (EN / JA)
              </button>
              <button type="button" className="reset-btn" onClick={handleReset}>
                Reset All (もう一度遊ぶ)
              </button>
            </div>
          </div>
        ) : (
          <form id="badForm" onSubmit={handleSubmit} noValidate={false}>
            {/* The Bad UX Name Input with Letter Count + Spinning Wheel */}
            <BadUxNameInput value={formData.name} onChange={handleNameChange} />

            {/* The Bad UX DOB Input with 4.6 Billion Years Dropdown + Force Scroll Detection */}
            <BadUxDobInput value={formData.dob} onChange={handleDobChange} />

            {/* The Bad UX Phone Input: Flag-only country code, Roman area code out of order, +1 incrementing number */}
            <BadUxPhoneInput value={formData.phone} onChange={handlePhoneChange} />

            {/* The Bad UX Email Input: Broken into body & vintage domain that rotates on every keystroke */}
            <BadUxEmailInput value={formData.email} onChange={handleEmailChange} />

            {formError && <div className="error-banner">{formError}</div>}

            {/* The Runaway Submit Button: Gives up after exactly 10 attempts! */}
            <BadUxSubmitButton formId="badForm" giveUpAfter={10} />
          </form>
        )}

        <div className="footer-note">
          Bad UX active: A-z Name Wheel, 4.6B Year DOB Physics, Flag-only & Roman Phone, Rotating Web 1.0 Email, and 10-Dodge Runaway Submit Button.
        </div>
      </div>

      {/* Japanese Modal Popup on Submission */}
      {isModalOpen && submittedData && (
        <BadUxJapaneseModal
          data={submittedData}
          onClose={() => setIsModalOpen(false)}
          onReset={handleReset}
        />
      )}
    </div>
  )
}

export default App
