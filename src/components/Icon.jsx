// Single inline-SVG icon set. Stroke icons inherit `currentColor`.
const paths = {
  shield: (
    <>
      <path d="M12 2l7 3v6c0 4.5-3 8.2-7 9-4-.8-7-4.5-7-9V5l7-3z" fill="currentColor" />
      <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  home: <path d="M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  book: (
    <>
      <path d="M4 5l5-1.5L15 5l5-1.5v15L15 20l-6-1.5L4 20V5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 3.5v15M15 5v15" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4m0 0L7 9m5-5l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 20h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  message: <path d="M21 11.5a8.4 8.4 0 01-9 8.4L3 21l1.1-9A8.4 8.4 0 1121 11.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  user: (
    <>
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20c.7-3.6 3.6-5.5 7-5.5s6.3 1.9 7 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  star: <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.7L12 17.3 5.8 20.8l1.6-6.7L2.2 8.9l6.9-.6L12 2z" fill="currentColor" />,
  arrowRight: <path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />,
  chevronLeft: <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />,
  chevronRight: <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  triangle: (
    <>
      <path d="M12 3l9 16H3L12 3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 10v4M12 16.5v.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 12l2.3 2.3 4.7-4.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  doc: (
    <>
      <path d="M14 3H6v18h12V7l-4-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  bars: <path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  zap: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />,
  camera: (
    <>
      <path d="M3 8h3l1.5-2h9L18 8h3v12H3V8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.4" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  send: <path d="M4 11.5L20 4l-7.5 16-2.2-6.3L4 11.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
}

export default function Icon({ name, size = 20, fill = 'none', style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      className={className}
      style={style}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
