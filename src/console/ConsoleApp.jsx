import { useState } from 'react'
import Phone from '../components/Phone.jsx'
import TabBar from '../components/TabBar.jsx'
import Triage from './Triage.jsx'
import Detail from './Detail.jsx'
import Templates from './Templates.jsx'
import Metrics from './Metrics.jsx'

const NAVY = '#16263F'

const TABS = [
  { key: 'triage', label: 'Triage', icon: 'triangle', badge: '3' },
  { key: 'templates', label: 'Templates', icon: 'book' },
  { key: 'metrics', label: 'Metrics', icon: 'bars' },
]

export default function ConsoleApp() {
  // `view` may be a tab key or 'detail' (reached from a triage card).
  const [view, setView] = useState('triage')
  const activeTab = view === 'detail' ? 'triage' : view

  const screens = {
    triage: <Triage onOpen={() => setView('detail')} />,
    detail: <Detail onBack={() => setView('triage')} />,
    templates: <Templates />,
    metrics: <Metrics />,
  }

  return (
    <Phone label="Advocate Console" dotColor={NAVY}>
      {screens[view]}
      <TabBar items={TABS} active={activeTab} onChange={setView} variant="console" />
    </Phone>
  )
}
