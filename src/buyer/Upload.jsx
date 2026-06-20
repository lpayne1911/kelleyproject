import { useRef } from 'react'
import Icon from '../components/Icon.jsx'
import { useDocuments } from '../hooks/useBuyer.js'

export default function Upload() {
  const { docs, addFiles } = useDocuments()
  const fileInput = useRef(null)

  const pick = () => fileInput.current && fileInput.current.click()

  function onFiles(e) {
    addFiles(e.target.files)
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
