import BuyerApp from './buyer/BuyerApp.jsx'
import ConsoleApp from './console/ConsoleApp.jsx'

export default function App() {
  return (
    <>
      <div className="page-head">
        <div className="kicker">Driveway Advocate · Product Prototype</div>
        <h1>From credit score to driveway — both sides of the deal.</h1>
        <p>
          Two connected apps: the <strong>buyer app</strong> that walks a client from credit work to a
          protected purchase, and the <strong>Advocate Console</strong> where the team triages live
          deals against a 30-minute SLA. Tap the bottom nav on either phone to move between screens.
        </p>
      </div>

      <div className="gallery">
        <BuyerApp />
        <ConsoleApp />
      </div>

      <p className="hint">
        Interactive prototype · On the buyer app, tap “Start car plan” or the bottom nav. On the
        console, tap Marcus’s card to open the risk scorecard, and switch tabs for Templates and
        Metrics.
      </p>
    </>
  )
}
