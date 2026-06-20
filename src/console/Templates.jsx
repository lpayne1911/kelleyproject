import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import AppHeader from '../components/AppHeader.jsx'
import { TEMPLATES } from './data.js'
import { BRAND } from '../theme.js'

const TABS = Object.keys(TEMPLATES)

export default function Templates() {
  const [tab, setTab] = useState('Reassurance')

  return (
    <>
      <AppHeader title="Advocate Console" brandColor={BRAND.navy} live />
      <div className="body">
        <div className="pad">
          <h2 className="section-h">
            <Icon name="book" size={20} style={{ color: BRAND.navy }} />
            Response templates
          </h2>
          <p className="section-sub">
            Pre-built for 30-min SLA. Load any template into a reply with one tap.
          </p>

          <div className="tabs">
            {TABS.map((t) => (
              <button key={t} className={`tab ${t === tab ? 'is-on' : ''}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>

          {TEMPLATES[tab].map((tpl) => (
            <div className="card tpl" key={tpl.title}>
              <div className="tpl__top">
                <b>{tpl.title}</b>
                <span className="tpl__target">
                  <Icon name="star" size={12} fill="currentColor" />
                  {tpl.target}
                </span>
              </div>
              <span className="tag">{tab}</span>
              <div className="tpl__ctx">{tpl.ctx}</div>
              <div className="tpl__body">
                {tpl.body.map((seg, i) =>
                  seg.startsWith('{{') ? <code key={i}>{seg}</code> : <span key={i}>{seg}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
