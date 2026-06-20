import { useState, useRef, useEffect } from 'react'
import Icon from '../components/Icon.jsx'
import { useMessages } from '../hooks/useMessages.js'

export default function Messages() {
  const { thread, send } = useMessages()
  const [draft, setDraft] = useState('')
  const bodyRef = useRef(null)

  // Keep the latest message in view as the thread grows.
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [thread.length])

  function submit(e) {
    e.preventDefault()
    send('buyer', draft)
    setDraft('')
  }

  return (
    <div className="msg-screen">
      <div className="msg-head">
        <span className="msg-avatar">DA</span>
        <div>
          <div className="msg-head__t">Your Advocate</div>
          <div className="msg-head__s">
            <span className="live"><span className="dot" />Online · replies in minutes</span>
          </div>
        </div>
      </div>

      <div className="msg-body" ref={bodyRef}>
        <div className="msg-day">Today</div>
        {thread.map((m, i) => {
          const mine = m.sender === 'buyer'
          return (
            <div key={i} className={`bubble-row ${mine ? 'me' : 'them'}`}>
              <div className={`bubble ${mine ? 'me' : 'them'}`}>
                {m.text}
                <span className="bubble__t">{m.time}</span>
              </div>
            </div>
          )
        })}
      </div>

      <form className="msg-input" onSubmit={submit}>
        <input
          className="msg-input__field"
          placeholder="Message your advocate…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="msg-send" type="submit" aria-label="Send">
          <Icon name="send" size={18} />
        </button>
      </form>
    </div>
  )
}
