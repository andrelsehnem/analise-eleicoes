//const AD_NETWORK_SCRIPT_ID = 'mt-ad-network-script'
//const AD_NETWORK_SCRIPT_SRC =
//  'https://pl29372614.profitablecpmratenetwork.com/f8/38/e0/f838e0f087e13e4db8d8c3c0e6488560.js'
//const NATIVE_BANNER_SCRIPT_ID = 'mt-native-banner-script'
//const NATIVE_BANNER_SCRIPT_SRC =
//  'https://pl29690551.effectivecpmnetwork.com/2a01a6f0f8175c1150b4d310483f83ff/invoke.js'
const GTAG_SCRIPT_ID = 'mt-ga-gtag-script'
const GTAG_CONFIG_SCRIPT_ID = 'mt-ga-config-script'
const GTM_SCRIPT_ID = 'mt-gtm-script'
const GTM_INIT_SCRIPT_ID = 'mt-gtm-init-script'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function hasDocument(): boolean {
  return typeof document !== 'undefined'
}

function injectExternalScript(id: string, src: string): void {
  if (!hasDocument() || document.getElementById(id)) {
    return
  }

  const script = document.createElement('script')
  script.id = id
  script.src = src
  script.async = true
  script.defer = true
  script.referrerPolicy = 'strict-origin-when-cross-origin'
  document.body.appendChild(script)
}

function injectInlineScript(id: string, scriptContent: string): void {
  if (!hasDocument() || document.getElementById(id)) {
    return
  }

  const script = document.createElement('script')
  script.id = id
  script.textContent = scriptContent
  document.body.appendChild(script)
}

function normalizeEnvVar(value: string | undefined): string {
  return value ? value.trim() : ''
}

/*function enableAdNetworkTracking(): void {
  injectExternalScript(AD_NETWORK_SCRIPT_ID, AD_NETWORK_SCRIPT_SRC)
}*/

/*function enableNativeBannerAd(): void {
  if (!hasDocument() || document.getElementById(NATIVE_BANNER_SCRIPT_ID)) {
    return
  }
  const script = document.createElement('script')
  script.id = NATIVE_BANNER_SCRIPT_ID
  script.src = NATIVE_BANNER_SCRIPT_SRC
  script.async = true
  script.setAttribute('data-cfasync', 'false')
  document.body.appendChild(script)
}*/

function enableGoogleAnalytics(measurementId: string): void {
  injectExternalScript(
    GTAG_SCRIPT_ID,
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
  )

  injectInlineScript(
    GTAG_CONFIG_SCRIPT_ID,
    [
      'window.dataLayer = window.dataLayer || [];',
      'function gtag(){dataLayer.push(arguments);}',
      'gtag("js", new Date());',
      `gtag("config", "${measurementId}", { anonymize_ip: true });`,
    ].join('\n'),
  )
}

function enableGoogleTagManager(containerId: string): void {
  injectInlineScript(
    GTM_INIT_SCRIPT_ID,
    [
      'window.dataLayer = window.dataLayer || [];',
      'window.dataLayer.push({"gtm.start": new Date().getTime(), event: "gtm.js"});',
    ].join('\n'),
  )

  injectExternalScript(
    GTM_SCRIPT_ID,
    `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`,
  )
}

export function enableAdsAlways(): void {
  //enableAdNetworkTracking()
 // enableNativeBannerAd()
}

export function enableTrackingByConsent(): void {
  const gaMeasurementId = normalizeEnvVar(import.meta.env.VITE_GA_MEASUREMENT_ID)
  const gtmContainerId = normalizeEnvVar(import.meta.env.VITE_GTM_CONTAINER_ID)

  if (gaMeasurementId) {
    enableGoogleAnalytics(gaMeasurementId)
  }

  if (gtmContainerId) {
    enableGoogleTagManager(gtmContainerId)
  }
}
