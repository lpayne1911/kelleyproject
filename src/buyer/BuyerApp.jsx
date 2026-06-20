import { useState } from 'react'
import Phone from '../components/Phone.jsx'
import AppHeader from '../components/AppHeader.jsx'
import TabBar from '../components/TabBar.jsx'
import Icon from '../components/Icon.jsx'
import { BRAND } from '../theme.js'
import Home from './Home.jsx'
import Plan from './Plan.jsx'
import CreditDashboard from './CreditDashboard.jsx'
import Upload from './Upload.jsx'
import Messages from './Messages.jsx'
import Account from './Account.jsx'
import Onboarding from './Onboarding.jsx'

const TABS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'plan', label: 'Plan', icon: 'book' },
  { key: 'credit', label: 'Credit', icon: 'trend' },
  { key: 'upload', label: 'Upload', icon: 'upload' },
  { key: 'messages', label: 'Messages', icon: 'message' },
  { key: 'account', label: 'Account', icon: 'user' },
]

export default function BuyerApp() {
  // `screen` is a tab key, or 'onboarding' (a full-screen overlay flow).
  const [screen, setScreen] = useState('home')

  if (screen === 'onboarding') {
    return (
      <Phone label="Buyer App" dotColor={BRAND.green}>
        <Onboarding onClose={() => setScreen('home')} onComplete={() => setScreen('home')} />
      </Phone>
    )
  }

  const screens = {
    home: <Home onStartPlan={() => setScreen('onboarding')} onReview={() => setScreen('plan')} />,
    plan: <Plan />,
    credit: <CreditDashboard />,
    upload: <Upload />,
    messages: <Messages />,
    account: <Account />,
  }

  return (
    <Phone label="Buyer App" dotColor={BRAND.green}>
      <AppHeader title="Driveway Advocate" brandColor={BRAND.green} />
      {/* Messages owns its own full-height flex layout (sticky input);
          every other screen scrolls inside the standard .body wrapper. */}
      {screen === 'messages' ? screens.messages : <div className="body">{screens[screen]}</div>}

      {screen !== 'messages' && (
        <button className="help-pill" onClick={() => setScreen('messages')}>
          <Icon name="message" size={14} />
          Need help now
        </button>
      )}

      <TabBar items={TABS} active={screen} onChange={setScreen} variant="dense" />
    </Phone>
  )
}
