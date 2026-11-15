/* generated admin-manifest.json shapes */

export interface ManifestVideo {
  slug: string
  title: string
  series: string | null
  hookStyle: string | null
  captionStyle: string | null
  endCard: boolean | null
  durationSec: number | null
  wordCount: number | null
  voice: string | null
  tags: string[]
  posted: { youtube: string | null; instagram: string | null; tiktok: string | null } | null
  latestModified: string
  sizes: { videoMb: number; totalMb: number }
  files: string[]
  thumbnails: { youtube: string | null; instagram: string | null }
  covers: { youtube: string | null; tiktok: string | null; instagram: string | null }
}

export interface ManifestAsset {
  path: string
  name: string
  ext: string
  sizeKb: number
  modified: string
  url: string
}

export interface AdminManifest {
  generatedAt: string
  totals: { videos: number; assets: number; totalResultMb: number }
  videos: ManifestVideo[]
  assets: ManifestAsset[]
}
