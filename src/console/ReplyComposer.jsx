import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { BRAND } from '../theme.js'
import { useMessages } from '../hooks/useMessages.js'
import { fillTemplate, DEMO_CONTEXT } from '../lib/fillTemplate.js'

// Compose an advocate reply from a template. Tokens like {{clientName}} are pre-filled;
// "Send" appends to the shared thread so it appears in the buyer's Messages instantly.
export default function ReplyComposer({ template, onBack, onSent }) {
  const { send } = useMessages()
  const [text, setText] = useState(() =>
    template ? fillTemplate(template.body, DEMO_CONTEXT) : ''
  )

  function handleSend() {
    send('advocate', text)
    onSent()
  }

  return (
    <>
      <div className="detail-head">
        <button className="back-btn" onClick={onBack}>
          <Icon name="chevronLeft" size={22} />
        </button>
        <div className="detail-head__t">Reply to {DEMO_CONTEXT.clientName}</div>
      </div>

      <div className="body">
        <div className="pad">
          <div className="composer-meta">
            <span className="tag">{template ? template.category || 'Reply' : 'Reply'}</span>
            <span className="composer-meta__title">{template ? template.title : 'New message'}</span>
          </div>

          <textarea
            className="composer-field"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder="Write your reply…"
          />

          <div className="composer-hint">
            <Icon name="zap" size={13} style={{ color: BRAND.navy }} />
            Tokens auto-filled from the client's deal. Edit anything before sending.
          </div>

          <div className="composer-actions">
            <button className="btn-outline" onClick={onBack}>
              Cancel
            </button>
            <button className="btn-primary composer-send" onClick={handleSend}>
              <Icon name="send" size={16} />
              Send to client
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
