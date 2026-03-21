import * as React from "react"

const MOBILE_BREAKPOINT = 768

type DeviceOverride = 'auto' | 'mobile' | 'desktop'

interface MobileContextValue {
  isMobile: boolean
  override: DeviceOverride
  setOverride: (v: DeviceOverride) => void
}

const MobileContext = React.createContext<MobileContextValue | null>(null)

export function MobileProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverride] = React.useState<DeviceOverride>('auto')
  const [realIsMobile, setRealIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setRealIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    mql.addEventListener("change", onChange)
    setRealIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  const isMobile = override === 'auto' ? realIsMobile : override === 'mobile'

  const value = React.useMemo(
    () => ({ isMobile, override, setOverride }),
    [isMobile, override]
  )

  return React.createElement(MobileContext.Provider, { value }, children)
}

export function useIsMobile() {
  const ctx = React.useContext(MobileContext)
  if (ctx) return ctx.isMobile

  // Fallback when used outside provider
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])
  return isMobile
}

export function useDeviceOverride() {
  const ctx = React.useContext(MobileContext)
  if (!ctx) throw new Error('useDeviceOverride must be used within MobileProvider')
  return { override: ctx.override, setOverride: ctx.setOverride }
}
