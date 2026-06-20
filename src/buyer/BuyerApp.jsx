import { useState } from 'react'
import Phone from '../components/Phone.jsx'
import AppHeader from '../components/AppHeader.jsx'
import TabBar from '../components/TabBar.jsx'
import Icon from '../components/Icon.jsx'
import Home from './Home.jsx'
import Plan from './Plan.jsx'
import Upload from './Upload.jsx'
import Messages from './Messages.jsx'
import Account from './Account.jsx'

const TABS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'plan', label: 'Plan', icon: 'book' },
  { key: 'upload', label: 'Upload', icon: 'upload' },
  { key: 'messages', label: 'Messages', icon: 'message' },
  { key: 'account', label: 'Account', icon: 'user' },
]

const GREEN = '#2F8C5A'

export default function BuyerApp() {
  const [tab, setTab] = useState('home')

  const screens = {
    home: <Home onStartPlan={() => setTab('plan')} />,
    plan: <Plan />,
    upload: <Upload />,
    messages: <Messages />,
    account: <Account />,
  }

  return (
    <Phone label="Buyer App" dotColor={GREEN}>
      <AppHeader title="Driveway Advocate" brandColor={GREEN} />
      <div className="body">{screens[tab]}</div>

      {tab !== 'messages' && (
        <button className="help-pill">
          <Icon name="message" size={14} />
          Need help now
        </button>
      )}

      <TabBar items={TABS} active={tab} onChange={setTab} />
    </Phone>
  )
}
