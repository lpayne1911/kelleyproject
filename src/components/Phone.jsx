import StatusBar from './StatusBar.jsx'

// Device frame. `label`/`dotColor` render the caption above the phone.
export default function Phone({ label, dotColor, children }) {
  return (
    <div className="phone-wrap">
      <div className="phone-label">
        <span className="dot" style={{ background: dotColor }} />
        {label}
      </div>
      <div className="phone">
        <div className="notch" />
        <div className="screen">
          <StatusBar />
          {children}
        </div>
      </div>
    </div>
  )
}
