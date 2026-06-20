import { useState } from 'react'
import { supabase, hasSupabase } from '../lib/supabase.js'
import { useRemote } from './useRemote.js'
import { getClientId } from '../lib/session.js'

// ---- Documents ----
const SEED_DOCS = [
  { name: 'credit-report.pdf', meta: 'Reviewed · 3 items disputed', state: 'done' },
  { name: 'pre-approval-letter.pdf', meta: 'Verified · 6.8% benchmark', state: 'done' },
  { name: 'dealer-quote.pdf', meta: 'Waiting on your upload', state: 'todo' },
]

export function useDocuments() {
  const { data, loading } = useRemote(SEED_DOCS, async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('client_id', getClientId())
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map((d) => ({ name: d.file_name, meta: d.meta, state: d.state }))
  })
  const [extra, setExtra] = useState([])

  // Optimistic local add (Phase 3 also uploads to Supabase Storage + inserts a row).
  function addFiles(fileList) {
    const added = Array.from(fileList || []).map((f) => ({
      name: f.name,
      meta: `Uploaded just now · ${Math.max(1, Math.round(f.size / 1024))} KB`,
      state: 'uploaded',
    }))
    if (added.length) setExtra((p) => [...added, ...p])
  }

  const docs = [...extra, ...data.filter((d) => d.state !== 'todo' || extra.length === 0)]
  return { docs, addFiles, loading }
}

// ---- Credit ----
const CREDIT_MOCK = {
  goal: 720,
  history: [612, 624, 631, 650, 663, 688],
  factors: [
    { k: 'Payment history', v: 'On track', pct: 88, tone: 'var(--green)' },
    { k: 'Credit utilization', v: '28% — aim < 10%', pct: 52, tone: 'var(--orange)' },
    { k: 'Credit age', v: 'Improving', pct: 64, tone: 'var(--green)' },
  ],
  disputes: [
    { item: 'Collection · Midland Funding', bureau: 'All bureaus', status: 'resolved' },
    { item: 'Late payment · Capital One', bureau: 'Experian', status: 'responded' },
    { item: 'Hard inquiry · unverified', bureau: 'TransUnion', status: 'sent' },
    { item: 'Mixed-file address error', bureau: 'Equifax', status: 'open' },
  ],
}

export function useCredit() {
  const { data, loading } = useRemote(CREDIT_MOCK, async () => {
    const clientId = getClientId()
    const [progress, disputes] = await Promise.all([
      supabase.from('credit_progress').select('score').eq('client_id', clientId).order('recorded_on'),
      supabase.from('disputes').select('item, bureau, status').eq('client_id', clientId),
    ])
    if (progress.error) throw progress.error
    return {
      ...CREDIT_MOCK,
      history: progress.data.map((r) => r.score),
      disputes: disputes.error ? CREDIT_MOCK.disputes : disputes.data,
    }
  })
  return { credit: data, loading }
}

export { hasSupabase }
