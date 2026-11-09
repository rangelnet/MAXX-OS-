// Imported (not a public URL) so Vite rewrites it relative to `base` for the packaged `file://` renderer.
import maxxMarkUrl from '../assets/brand/maxx-mark.svg'
import { cn } from '../lib/cn.ts'

/** MAXX OS mark on transparency; the export keeps the blue-to-cyan identity at every size. */
export function HeraldLogo({ height = 14, className }: { height?: number; className?: string }) {
  return <img src={maxxMarkUrl} alt="MAXX OS" height={height} style={{ height, width: 'auto' }} draggable={false} className={cn('shrink-0 select-none', className)} />
}
