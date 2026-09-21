declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function installAnalytics() {
  if (typeof window === "undefined") return;
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
  const verification = import.meta.env.VITE_GSC_VERIFICATION as string | undefined;
  if (verification) {
    let meta = document.head.querySelector("meta[name='google-site-verification']") as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "google-site-verification"; document.head.appendChild(meta); }
    meta.content = verification;
  }
  if (!measurementId || document.querySelector(`script[data-ga-id='${measurementId}']`)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: true });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  script.dataset.gaId = measurementId;
  document.head.appendChild(script);
}

export function trackEvent(name: string, parameters: Record<string, string | number | boolean> = {}) {
  if (typeof window !== "undefined" && window.gtag) window.gtag("event", name, parameters);
}
