import Icon from '../components/Icon.jsx'

const THREAD = [
  { from: 'them', text: "Hi Marcus — got your documents. I'm reviewing everything right now. Don't sign anything yet.", time: '2:14 PM' },
  { from: 'me', text: "They're pushing me to sign. Payment jumped from $420 to $495.", time: '2:16 PM' },
  { from: 'them', text: 'That jump is the added products and a marked-up rate. None of it is required. Give me 4 minutes.', time: '2:17 PM' },
  { from: 'them', text: "Here's your read: APR should be 6.8%, not 9.4%. Ask them to remove the $3,200 in add-ons.", time: '2:21 PM' },
]

export default function Messages() {
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

      <div className="msg-body">
        <div className="msg-day">Today</div>
        {THREAD.map((m, i) => (
          <div key={i} className={`bubble-row ${m.from}`}>
            <div className={`bubble ${m.from}`}>
              {m.text}
              <span className="bubble__t">{m.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="msg-input">
        <div className="msg-input__field">Message your advocate…</div>
        <button className="msg-send">
          <Icon name="send" size={18} />
        </button>
      </div>
    </div>
  )
}
