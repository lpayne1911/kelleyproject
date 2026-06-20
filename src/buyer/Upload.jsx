import { useState, useRef } from 'react'
import Icon from '../components/Icon.jsx'

const SEED_DOCS = [
  { name: 'credit-report.pdf', meta: 'Reviewed · 3 items disputed', state: 'done' },
  { name: 'pre-approval-letter.pdf', meta: 'Verified · 6.8% benchmark', state: 'done' },
  { name: 'dealer-quote.pdf', meta: 'Waiting on your upload', state: 'todo' },
]

export default function Upload() {
  const [docs, setDocs] = useState(SEED_DOCS)
  const fileInput = useRef(null)

  function pick() {
    fileInput.current && fileInput.current.click()
  }

  function onFiles(e) {
    const added = Array.from(e.target.files || []).map((f) => ({
      name: f.name,
      meta: `Uploaded just now · ${Math.max(1, Math.round(f.size / 1024))} KB`,
      state: 'uploaded',
    }))
    if (added.length) {
      // Replace the pending placeholder the first time a real file lands.
      setDocs((prev) => [...added, ...prev.filter((d) => d.state !== 'todo')])
    }
    e.target.value = ''
  }

  return (
    <div className="pad">
      <h2 className="screen-title">Upload documents</h2>
      <p className="screen-sub">
        Send us the paperwork and we'll flag anything that costs you money — before you sign.
      </p>

      <input
        ref={fileInput}
        type="file"
        accept="image/*,application/pdf"
        multiple
        hidden
        onChange={onFiles}
      />

      <div className="dropzone" onClick={pick} role="button">
        <span className="dropzone__icon">
          <Icon name="upload" size={26} />
        </span>
        <div className="dropzone__t">Add a document</div>
        <div className="dropzone__d">Quote, buyer's order, or credit report — PDF or photo</div>
        <div className="dropzone__btns">
          <button className="chip-btn" type="button" onClick={(e) => { e.stopPropagation(); pick() }}>
            <Icon name="upload" size={15} /> Choose file
          </button>
          <button className="chip-btn" type="button" onClick={(e) => { e.stopPropagation(); pick() }}>
            <Icon name="camera" size={15} /> Take photo
          </button>
        </div>
      </div>

      <div className="doc-list-h">Your documents</div>
      <div className="doc-list">
        {docs.map((d, i) => (
          <div key={`${d.name}-${i}`} className={`docrow ${d.state}`}>
            <span className="docrow__icon">
              <Icon name="doc" size={18} />
            </span>
            <div className="docrow__body">
              <div className="docrow__name">{d.name}</div>
              <div className="docrow__meta">{d.meta}</div>
            </div>
            <span className={`docrow__state ${d.state}`}>
              {d.state === 'todo' ? 'Pending' : <Icon name="checkCircle" size={18} />}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
