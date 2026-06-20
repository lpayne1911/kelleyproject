// In-memory message thread shared across both apps (buyer ↔ advocate) for the
// mock-first prototype. Canonical row shape: { sender: 'buyer'|'advocate', text, time }.
// Phase 2 swaps this module for a Supabase-backed source behind the same useMessages hook.
import { nowTime } from './time.js'

let thread = [
  { sender: 'advocate', text: "Hi Marcus — got your documents. I'm reviewing everything right now. Don't sign anything yet.", time: '2:14 PM' },
  { sender: 'buyer', text: "They're pushing me to sign. Payment jumped from $420 to $495.", time: '2:16 PM' },
  { sender: 'advocate', text: 'That jump is the added products and a marked-up rate. None of it is required. Give me 4 minutes.', time: '2:17 PM' },
  { sender: 'advocate', text: "Here's your read: APR should be 6.8%, not 9.4%. Ask them to remove the $3,200 in add-ons.", time: '2:21 PM' },
]

const listeners = new Set()

export function getThread() {
  return thread
}

export function sendMessage(sender, text) {
  const body = (text || '').trim()
  if (!body) return
  thread = [...thread, { sender, text: body, time: nowTime() }]
  listeners.forEach((l) => l())
}

export function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
