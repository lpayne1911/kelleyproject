import { useSyncExternalStore } from 'react'
import { subscribe, getThread, sendMessage } from '../lib/messageStore.js'

// Subscribes to the shared message thread. `send(sender, text)` appends a message
// that is instantly visible to both the buyer app and the advocate console.
export function useMessages() {
  const thread = useSyncExternalStore(subscribe, getThread, getThread)
  return { thread, send: sendMessage }
}
