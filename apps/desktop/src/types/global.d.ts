import type { HeraldOSApi, MaxxOSApi } from '../../preload/index.ts'

declare global {
  interface Window {
    heraldOS: HeraldOSApi
    maxxOS: MaxxOSApi
  }
}

export {}
