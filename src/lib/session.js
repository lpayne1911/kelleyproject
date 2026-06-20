// Demo-mode identity. For the prototype both phones operate on the same seeded
// client so a buyer message shows up in the console and vice-versa.
// This is the single swap point for real Supabase Auth later (Phase 4).
export const DEMO_BUYER_CLIENT_ID = 'demo-client-marcus'
export const DEMO_ADVOCATE_ID = 'demo-advocate'

// Resolve the active client id for whichever app is mounted. Real auth will
// replace this with the logged-in user's assigned client.
export function getClientId() {
  return DEMO_BUYER_CLIENT_ID
}

export function getAdvocateId() {
  return DEMO_ADVOCATE_ID
}
