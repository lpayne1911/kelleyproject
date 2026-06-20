import { supabase } from '../lib/supabase.js'
import { useRemote } from './useRemote.js'
import { TONE } from '../theme.js'
import { ALERTS, SCORECARD, METRICS, TEMPLATES } from '../console/data.js'

// Console-side read hooks. Each returns the existing mock shape so screens are
// unchanged; the Supabase branch (used only when env is configured) maps the
// schema in supabase/schema.sql back to that same shape.

const SEV = { crit: { label: 'Critical', color: TONE.red }, high: { label: 'High', color: TONE.orange }, med: { label: 'Medium', color: TONE.yellow } }

function mapAlert(r) {
  return {
    id: r.id,
    initials: r.initials,
    name: r.client_name,
    sev: r.severity,
    sevLabel: SEV[r.severity]?.label,
    meta: r.meta,
    ring: r.ring,
    ringPct: r.ring_pct,
    quote: r.client_said || undefined,
    doc: r.has_doc ? 'Doc uploaded' : undefined,
    priors: r.priors || undefined,
    risk: r.total ?? undefined,
    color: SEV[r.severity]?.color,
  }
}

export function useAlerts() {
  const { data, loading } = useRemote(ALERTS, async () => {
    const { data, error } = await supabase
      .from('risk_scores')
      .select('*')
      .order('total', { ascending: false })
    if (error) throw error
    return data.map(mapAlert)
  })
  return { alerts: data, loading }
}

export function useScorecard() {
  const { data, loading } = useRemote(SCORECARD, async () => {
    const { data, error } = await supabase
      .from('risk_scores')
      .select('*, risk_metrics(*)')
      .eq('is_active', true)
      .single()
    if (error) throw error
    return {
      total: data.total,
      client: {
        initials: data.initials,
        name: data.client_name,
        vehicle: data.vehicle,
        said: data.client_said,
        read: data.advocate_read,
        file: data.file_name,
      },
      metrics: (data.risk_metrics || []).map((m) => ({
        name: m.name,
        score: m.score,
        tone: m.tone,
        note: m.note,
      })),
    }
  })
  return { scorecard: data, loading }
}

export function useMetrics() {
  // Today's performance is a derived/aggregate view; kept as mock for the demo.
  return { metrics: METRICS, loading: false }
}

export function useTemplates() {
  const { data, loading } = useRemote(TEMPLATES, async () => {
    const { data, error } = await supabase.from('templates').select('*')
    if (error) throw error
    // Group rows back into the { Category: [...] } shape the screen expects.
    return data.reduce((acc, t) => {
      ;(acc[t.category] ||= []).push({ title: t.title, target: t.target, ctx: t.ctx, body: t.body })
      return acc
    }, {})
  })
  return { templates: data, loading }
}
