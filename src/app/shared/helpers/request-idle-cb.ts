export function idleCallback(callback: () => void, timeout: number = 50) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: timeout });
  } else {
    setTimeout(callback, timeout);
  }
}
