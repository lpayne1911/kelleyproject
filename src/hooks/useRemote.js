import { useState, useEffect } from 'react'
import { hasSupabase } from '../lib/supabase.js'

// Generic read hook. With no Supabase env it returns `mock` immediately (the
// fully-tested prototype path). With env set it runs `fetcher()` and uses the
// result, falling back to `mock` on any error so the UI never breaks.
export function useRemote(mock, fetcher, deps = []) {
  const [data, setData] = useState(mock)
  const [loading, setLoading] = useState(hasSupabase)

  useEffect(() => {
    if (!hasSupabase) return
    let live = true
    setLoading(true)
    Promise.resolve()
      .then(fetcher)
      .then((rows) => {
        if (live && rows) setData(rows)
      })
      .catch(() => {})
      .finally(() => {
        if (live) setLoading(false)
      })
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading }
}
