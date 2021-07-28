export const logEvent = (detail: string, type?: string) => {
    const tracker = (window as any)?.umami?.trackEvent;
    if (tracker) tracker(detail, type || "click")
}