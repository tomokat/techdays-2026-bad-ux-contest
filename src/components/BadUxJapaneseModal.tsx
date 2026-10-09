import { useState } from 'react'
import './BadUxJapaneseModal.css'

interface FormData {
  name: string
  dob: string
  phone: string
  email: string
}

interface BadUxJapaneseModalProps {
  data: FormData
  onClose: () => void
  onReset: () => void
}

type Language = 'ja' | 'en'

const I18N = {
  ja: {
    stamp: '🎉 送信受理',
    title: '最悪のUXコンテスト 登録完了！',
    subtitle: 'おめでとうございます！すべての悪質なトラップを乗り越え、無事にデータが送信されました。',
    nameLabel: '🏷️ ご登録氏名（永久固定）:',
    dobLabel: '🌋 生年月日（地球46億年の軌跡）:',
    phoneLabel: '📱 お電話番号（国旗＋ローマ数字）:',
    emailLabel: '📧 メールアドレス（太古のWeb1.0遺産）:',
    battleLabel: '🏃‍♂️ 送信ボタンとの攻防:',
    battleValue: '10回の激闘の末、見事に捕獲成功！',
    warningTitle: '重要なお知らせ：',
    warningText:
      'ご入力いただいた誤字・脱字・時代錯誤なドメインはそのまま公式記録に刻まれました。コンテスト規約に基づき、修正や異議申し立ては一切受け付けておりません。',
    closeBtn: '閉じる（現実に戻る）',
    resetBtn: '🔄 もう一度この地獄を遊ぶ',
  },
  en: {
    stamp: '🎉 SUBMISSION ACCEPTED',
    title: 'Worst UX Contest — Registration Complete!',
    subtitle: 'Incredible! Against all human odds, you survived every sadistic trap and successfully submitted your data.',
    nameLabel: '🏷️ Registered Legal Name (Permanently Frozen):',
    dobLabel: '🌋 Date of Birth (Cosmic 4.6-Billion-Year Epoch):',
    phoneLabel: '📱 Phone Number (Flag Guessing + Roman Numerals + Offset):',
    emailLabel: '📧 Email Address (Ancient Web 1.0 Fossil Domain):',
    battleLabel: '🏃‍♂️ Mortal Combat with Submit Button:',
    battleValue: 'Successfully captured after an agonizing 10-round chase!',
    warningTitle: 'CRITICAL LEGAL NOTICE:',
    warningText:
      'Every typo, scrambled Roman numeral, and archaic dial-up domain has been permanently etched into the immutable stellar archives. Per contest bylaws, corrections and appeals are strictly forbidden.',
    closeBtn: 'Close (Return to Reality)',
    resetBtn: '🔄 Play This Hell Again',
  },
}

export const BadUxJapaneseModal = ({ data, onClose, onReset }: BadUxJapaneseModalProps) => {
  const [lang, setLang] = useState<Language>('ja')
  const t = I18N[lang]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Header with Title and Language Toggle */}
        <div className="modal-header">
          <div className="header-top-bar">
            <div className="modal-stamp">{t.stamp}</div>

            {/* Language Switcher Toggle */}
            <div className="lang-switcher">
              <button
                type="button"
                className={`lang-tab ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
              >
                🇺🇸 English
              </button>
              <button
                type="button"
                className={`lang-tab ${lang === 'ja' ? 'active' : ''}`}
                onClick={() => setLang('ja')}
              >
                🇯🇵 日本語
              </button>
            </div>
          </div>

          <h2 className="modal-title">{t.title}</h2>
          <p className="modal-subtitle">{t.subtitle}</p>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <div className="jp-data-table">
            <div className="jp-data-row">
              <span className="jp-label">{t.nameLabel}</span>
              <span className="jp-value name-val">{data.name}</span>
            </div>

            <div className="jp-data-row">
              <span className="jp-label">{t.dobLabel}</span>
              <span className="jp-value">{data.dob}</span>
            </div>

            <div className="jp-data-row">
              <span className="jp-label">{t.phoneLabel}</span>
              <span className="jp-value">{data.phone}</span>
            </div>

            <div className="jp-data-row">
              <span className="jp-label">{t.emailLabel}</span>
              <span className="jp-value">{data.email}</span>
            </div>

            <div className="jp-data-row highlight-row">
              <span className="jp-label">{t.battleLabel}</span>
              <span className="jp-value">{t.battleValue}</span>
            </div>
          </div>

          <div className="jp-warning-box">
            ⚠️ <strong>{t.warningTitle}</strong>
            <br />
            {t.warningText}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer">
          <button type="button" className="jp-btn jp-close-btn" onClick={onClose}>
            {t.closeBtn}
          </button>
          <button type="button" className="jp-btn jp-reset-btn" onClick={onReset}>
            {t.resetBtn}
          </button>
        </div>
      </div>
    </div>
  )
}
