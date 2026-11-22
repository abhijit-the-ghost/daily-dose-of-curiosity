/* ==================================================================
   Earth Never Made Its Own Gold â€” facts
   Every on-screen number/text claim in the episode must trace here
   or to a [src:] marker in script.txt. Hedged claims are phrased as
   "likely"/"most" in script and visuals; no invented percentages.
   ================================================================== */

export const FACTS = {
  // S2 â€” GW170817 neutron-star merger / kilonova (NASA)
  gw170817Year: { value: 2017, display: '2017', src: 'S2' },
  // S3 â€” early Earth differentiation; core/mantle separation
  coreSink: { value: 1, display: 'MOST SANK TO CORE', src: 'S3' },
  // S4 â€” late veneer / late accretion after core formation
  lateDelivery: { value: 1, display: 'DELIVERED LATER', src: 'S4' },
} as const

export type FactKey = keyof typeof FACTS
