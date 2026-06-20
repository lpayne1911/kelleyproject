import { useState } from 'react'
import Icon from '../components/Icon.jsx'

const STEPS = ['goal', 'credit', 'vehicle', 'docs', 'review']

const GOALS = [
  { v: 'car', t: 'Buy a car soon', d: 'I have a vehicle in mind and want protection through signing.' },
  { v: 'credit', t: 'Fix my credit first', d: 'Improve my score before I finance anything.' },
  { v: 'both', t: 'Credit, then car', d: 'The full Credit-to-Keys journey.' },
]

const BANDS = [
  { v: 'unsure', t: 'Not sure' },
  { v: 'rough', t: 'Rough · under 580' },
  { v: 'fair', t: 'Fair · 580–669' },
  { v: 'good', t: 'Good · 670+' },
]

// Selectable option card.
function Option({ on, onClick, title, desc }) {
  return (
    <button className={`opt ${on ? 'is-on' : ''}`} onClick={onClick} type="button">
      <span className="opt__radio" />
      <span className="opt__txt">
        <span className="opt__t">{title}</span>
        {desc && <span className="opt__d">{desc}</span>}
      </span>
    </button>
  )
}

export default function Onboarding({ onClose, onComplete }) {
  const [i, setI] = useState(0)
  const [draft, setDraft] = useState({
    goal: '',
    band: '',
    vehicle: '',
    budget: '',
    docs: 0,
  })
  const [done, setDone] = useState(false)
  const step = STEPS[i]
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))

  const canContinue =
    (step === 'goal' && draft.goal) ||
    (step === 'credit' && draft.band) ||
    step === 'vehicle' ||
    step === 'docs' ||
    step === 'review'

  function next() {
    if (i < STEPS.length - 1) setI(i + 1)
    else setDone(true)
  }
  function back() {
    if (i > 0) setI(i - 1)
    else onClose()
  }

  if (done) {
    return (
      <div className="flow">
        <div className="flow-success">
          <span className="flow-success__icon">
            <Icon name="checkCircle" size={40} />
          </span>
          <h2>You're all set</h2>
          <p>Your advocate has your plan and documents. We'll review and message you shortly.</p>
          <button className="btn-primary" onClick={onComplete}>
            Back to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flow">
      <div className="flow__head">
        <button className="back-btn" onClick={back} aria-label="Back">
          <Icon name={i === 0 ? 'chevronLeft' : 'chevronLeft'} size={22} />
        </button>
        <div className="flow__title">Start your car plan</div>
        <button className="flow__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="stepper">
        {STEPS.map((s, idx) => (
          <span key={s} className={`stepper__seg ${idx <= i ? 'is-on' : ''}`} />
        ))}
      </div>

      <div className="flow__body">
        <div className="pad">
          {step === 'goal' && (
            <>
              <h2 className="screen-title">What's your goal?</h2>
              <p className="screen-sub">This sets which engine we start with.</p>
              {GOALS.map((g) => (
                <Option
                  key={g.v}
                  on={draft.goal === g.v}
                  onClick={() => set({ goal: g.v })}
                  title={g.t}
                  desc={g.d}
                />
              ))}
            </>
          )}

          {step === 'credit' && (
            <>
              <h2 className="screen-title">Your credit snapshot</h2>
              <p className="screen-sub">A rough idea is fine — we pull the real report later.</p>
              {BANDS.map((b) => (
                <Option key={b.v} on={draft.band === b.v} onClick={() => set({ band: b.v })} title={b.t} />
              ))}
            </>
          )}

          {step === 'vehicle' && (
            <>
              <h2 className="screen-title">What are you shopping for?</h2>
              <p className="screen-sub">Optional — helps us set a benchmark price.</p>
              <label className="ob-label">Vehicle</label>
              <input
                className="ob-input"
                placeholder="e.g. 2024 Honda Accord EX-L"
                value={draft.vehicle}
                onChange={(e) => set({ vehicle: e.target.value })}
              />
              <label className="ob-label">Target budget</label>
              <input
                className="ob-input"
                placeholder="e.g. $32,000 out the door"
                value={draft.budget}
                onChange={(e) => set({ budget: e.target.value })}
              />
            </>
          )}

          {step === 'docs' && (
            <>
              <h2 className="screen-title">Add your documents</h2>
              <p className="screen-sub">Credit report or a dealer quote — you can add more later.</p>
              <button className="dropzone" type="button" onClick={() => set({ docs: draft.docs + 1 })}>
                <span className="dropzone__icon">
                  <Icon name="upload" size={26} />
                </span>
                <div className="dropzone__t">Add a document</div>
                <div className="dropzone__d">Tap to attach a PDF or photo</div>
              </button>
              {draft.docs > 0 && (
                <div className="ob-note">
                  <Icon name="checkCircle" size={16} />
                  {draft.docs} document{draft.docs > 1 ? 's' : ''} attached
                </div>
              )}
            </>
          )}

          {step === 'review' && (
            <>
              <h2 className="screen-title">Review &amp; submit</h2>
              <p className="screen-sub">Here's what we'll send to your advocate.</p>
              <div className="card review-card">
                <Row k="Goal" v={GOALS.find((g) => g.v === draft.goal)?.t || '—'} />
                <Row k="Credit" v={BANDS.find((b) => b.v === draft.band)?.t || '—'} />
                <Row k="Vehicle" v={draft.vehicle || '—'} />
                <Row k="Budget" v={draft.budget || '—'} />
                <Row k="Documents" v={`${draft.docs} attached`} />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flow__foot">
        {i > 0 && (
          <button className="btn-outline flow__back" onClick={back}>
            Back
          </button>
        )}
        <button className="btn-primary" onClick={next} disabled={!canContinue}>
          {step === 'review' ? 'Submit to advocate' : 'Continue'}
          {step !== 'review' && <Icon name="arrowRight" size={17} />}
        </button>
      </div>
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="review-row">
      <span className="review-row__k">{k}</span>
      <span className="review-row__v">{v}</span>
    </div>
  )
}
