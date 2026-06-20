import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { supabase, hasSupabase } from '../lib/supabase.js'
import { getClientId } from '../lib/session.js'
import { fmtTime } from '../lib/time.js'
import { subscribe, getThread, sendMessage } from '../lib/messageStore.js'

const mapRow = (r) => ({ sender: r.sender_role, text: r.body, time: fmtTime(r.created_at) })

// Shared message thread for both apps. With Supabase configured it reads the
// `messages` table and subscribes to Realtime inserts; otherwise it uses the
// in-memory mock store. `send(sender, text)` works in both modes.
export function useMessages() {
  // Mock-store subscription is always wired (cheap, ignored when Supabase is on).
  const storeThread = useSyncExternalStore(subscribe, getThread, getThread)
  const [remoteThread, setRemoteThread] = useState([])

  useEffect(() => {
    if (!hasSupabase) return
    let live = true
    const clientId = getClientId()
    const load = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at')
      if (live && data) setRemoteThread(data.map(mapRow))
    }
    load()
    const channel = supabase
      .channel(`messages-${clientId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `client_id=eq.${clientId}` },
        () => load()
      )
      .subscribe()
    return () => {
      live = false
      supabase.removeChannel(channel)
    }
  }, [])

  const send = useCallback((sender, text) => {
    if (hasSupabase) {
      const body = (text || '').trim()
      if (!body) return
      supabase.from('messages').insert({ client_id: getClientId(), sender_role: sender, body })
    } else {
      sendMessage(sender, text)
    }
  }, [])

  return { thread: hasSupabase ? remoteThread : storeThread, send }
}
