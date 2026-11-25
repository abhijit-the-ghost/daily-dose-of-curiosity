/* ==================================================================
   Venus: the Sun rises in the west — facts
   Single source of truth for every NUMBER shown on screen.
   Scene code never contains a digit literal for a displayed number.

   Tilt convention: S1 says "only three degrees"; S3 publishes
   177.36° and S4 lists 177.3°. They describe the same geometry under
   different conventions. Narration says "177-degree tilt"; the on-screen
   chip uses S3's 177.36°. Do not relabel one source as the other.

   Solar day vs sidereal day: S3 gives -5832.6 h sidereal spin (243 d)
   and a 2802.0 h length of day = 116.75 Earth days. Half of that full
   solar day is ~58 days, which is the "nearly two months" in the closing
   line. S1's prose says "sunrise to sunset would take 117 Earth days";
   the airtight derivation uses S3's table value, not that shorthand.
   ================================================================== */

export const FACTS = {
  // S3 — NASA NSSDCA Venus Fact Sheet: "Obliquity to orbit (deg) 177.36"
  obliquityDeg: { value: 177.36, display: '177.36° TILT', src: 'S3' },
  // S1 — NASA Venus Facts: "your 'day' would be 243 Earth days long"
  spinDays: { value: 243, display: '243 EARTH DAYS / SPIN', src: 'S1' },
  // S1 — NASA Venus Facts: a Venus year "takes only 225 Earth days"
  orbitDays: { value: 225, display: '225 EARTH DAYS / YEAR', src: 'S1' },
  // S3 — NASA NSSDCA: "Length of day (hrs) 2802.0", Earth ratio 116.750
  solarDayDays: { value: 116.75, display: '116.75-DAY SOLAR DAY', src: 'S3' },
  // Derived from S3: full solar day / 2 = 58.375 Earth days
  sunsetApproxDays: { value: 58.4, display: '~58 DAYS / SUNSET', src: 'S3' },
} as const

export type FactKey = keyof typeof FACTS
