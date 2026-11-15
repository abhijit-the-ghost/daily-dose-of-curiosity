import { useQuery } from '@tanstack/react-query'
import type { AdminManifest } from '../admin/types'

const FETCH = async (): Promise<AdminManifest> => {
  const res = await fetch('/admin-manifest.json')
  if (!res.ok) throw new Error(`admin-manifest.json HTTP ${res.status}`)
  return res.json()
}

export const useAdminManifest = () =>
  useQuery({ queryKey: ['admin-manifest'], queryFn: FETCH, staleTime: 30_000 })
