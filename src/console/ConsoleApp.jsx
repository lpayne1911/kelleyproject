import { useState } from 'react'
import Phone from '../components/Phone.jsx'
import TabBar from '../components/TabBar.jsx'
import Triage from './Triage.jsx'
import Detail from './Detail.jsx'
import Templates from './Templates.jsx'
import Metrics from './Metrics.jsx'
import ReplyComposer from './ReplyComposer.jsx'
import { TEMPLATES } from './data.js'
import { BRAND } from '../theme.js'

const TABS = [
  { key: 'triage', label: 'Triage', icon: 'triangle', badge: '3' },
  { key: 'templates', label: 'Templates', icon: 'book' },
  { key: 'metrics', label: 'Metrics', icon: 'bars' },
]

// Default template the "Reply" button on the detail view opens with.
const DEFAULT_REPLY = { ...TEMPLATES.Reassurance[0], category: 'Reassurance' }

export default function ConsoleApp() {
  // `view` may be a tab key, 'detail' (from a triage card), or 'compose' (reply composer).
  const [view, setView] = useState('triage')
  const [template, setTemplate] = useState(DEFAULT_REPLY)
  const [returnTo, setReturnTo] = useState('triage')
  const activeTab = ['detail', 'compose'].includes(view) ? 'triage' : view

  function openCompose(tpl, from) {
    setTemplate(tpl)
    setReturnTo(from)
    setView('compose')
  }

  const screens = {
    triage: <Triage onOpen={() => setView('detail')} />,
    detail: (
      <Detail onBack={() => setView('triage')} onReply={() => openCompose(DEFAULT_REPLY, 'detail')} />
    ),
    templates: <Templates onLoad={(tpl) => openCompose(tpl, 'templates')} />,
    metrics: <Metrics />,
    compose: (
      <ReplyComposer
        template={template}
        onBack={() => setView(returnTo)}
        onSent={() => setView(returnTo)}
      />
    ),
  }

  return (
    <Phone label="Advocate Console" dotColor={BRAND.navy}>
      {screens[view]}
      <TabBar items={TABS} active={activeTab} onChange={setView} variant="console" />
    </Phone>
  )
}
