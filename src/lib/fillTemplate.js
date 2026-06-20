// Fill a template body (array of plain + "{{token}}" segments) against a context map.
// Unknown tokens are left as-is so the advocate can spot what still needs filling.
export function fillTemplate(body, ctx = {}) {
  return body
    .map((seg) => {
      const m = /^\{\{(\w+)\}\}$/.exec(seg)
      if (m) return ctx[m[1]] != null ? ctx[m[1]] : seg
      return seg
    })
    .join('')
}

// Demo context derived from the active client / risk read. Real data fills this from Supabase.
export const DEMO_CONTEXT = {
  clientName: 'Marcus',
  vehicle: '2024 Honda Accord EX-L',
  feeName: 'documentation fee',
  lender: 'Honda Financial',
  buyRate: '6.8%',
  addonList: 'paint & warranty products',
  addonTotal: '$3,200',
  otdPrice: '$31,400',
  overpay: '$3,300',
}
