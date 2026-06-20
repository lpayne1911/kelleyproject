import Icon from '../components/Icon.jsx'

const DOCS = [
  { name: 'credit-report.pdf', meta: 'Reviewed · 3 items disputed', state: 'done' },
  { name: 'pre-approval-letter.pdf', meta: 'Verified · 6.8% benchmark', state: 'done' },
  { name: 'dealer-quote.pdf', meta: 'Waiting on your upload', state: 'todo' },
]

export default function Upload() {
  return (
    <div className="pad">
      <h2 className="screen-title">Upload documents</h2>
      <p className="screen-sub">
        Send us the paperwork and we'll flag anything that costs you money — before you sign.
      </p>

      <div className="dropzone">
        <span className="dropzone__icon">
          <Icon name="upload" size={26} />
        </span>
        <div className="dropzone__t">Add a document</div>
        <div className="dropzone__d">Quote, buyer's order, or credit report — PDF or photo</div>
        <div className="dropzone__btns">
          <button className="chip-btn">
            <Icon name="upload" size={15} /> Choose file
          </button>
          <button className="chip-btn">
            <Icon name="camera" size={15} /> Take photo
          </button>
        </div>
      </div>

      <div className="doc-list-h">Your documents</div>
      <div className="doc-list">
        {DOCS.map((d) => (
          <div key={d.name} className={`docrow ${d.state}`}>
            <span className="docrow__icon">
              <Icon name="doc" size={18} />
            </span>
            <div className="docrow__body">
              <div className="docrow__name">{d.name}</div>
              <div className="docrow__meta">{d.meta}</div>
            </div>
            <span className={`docrow__state ${d.state}`}>
              {d.state === 'done' ? <Icon name="checkCircle" size={18} /> : 'Pending'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
