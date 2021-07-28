export const logEvent = (detail: string, type?: string) => {
    (window as any).umami.trackEvent(detail, type || "click")
}