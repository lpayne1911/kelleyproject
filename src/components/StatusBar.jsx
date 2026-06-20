export default function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="sb-right">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <rect x="0" y="6" width="3" height="5" rx="1" fill="#16263F" />
          <rect x="4.5" y="4" width="3" height="7" rx="1" fill="#16263F" />
          <rect x="9" y="2" width="3" height="9" rx="1" fill="#16263F" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" fill="#16263F" opacity=".3" />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
          <path d="M8 2.2c2 0 3.8.8 5.2 2L14.6 2.8C12.8 1 10.5 0 8 0S3.2 1 1.4 2.8L2.8 4.2C4.2 3 6 2.2 8 2.2z" fill="#16263F" />
          <path d="M8 5.4c1.1 0 2.1.4 2.9 1.2l1.4-1.4C11.1 4 9.6 3.4 8 3.4s-3.1.6-4.3 1.8l1.4 1.4C5.9 5.8 6.9 5.4 8 5.4z" fill="#16263F" />
          <circle cx="8" cy="9.2" r="1.6" fill="#16263F" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="#16263F" opacity=".4" />
          <rect x="2" y="2" width="18" height="8" rx="1.5" fill="#16263F" />
          <rect x="23" y="4" width="1.5" height="4" rx=".75" fill="#16263F" opacity=".5" />
        </svg>
      </span>
    </div>
  )
}
