import Icon from './Icon.jsx'

// Brand header sitting just under the status bar.
// `brandColor` tints the shield; `live` shows the green Live pill (console).
export default function AppHeader({ title, brandColor, live = false }) {
  return (
    <div className="apphead">
      <div className="apphead__brand">
        <span style={{ color: brandColor, display: 'flex' }}>
          <Icon name="shield" size={title === 'Driveway Advocate' ? 22 : 20} />
        </span>
        {title}
      </div>
      <div className="apphead__right">
        {live && (
          <span className="live">
            <span className="dot" />
            Live
          </span>
        )}
        <span className="icon-btn">
          <Icon name="moon" size={live ? 17 : 18} />
        </span>
      </div>
    </div>
  )
}
