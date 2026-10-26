// Installing Tsinda Neza as an app. Chrome/Android fire `beforeinstallprompt` (often before React hydrates), so an
// inline script keeps the event on window; iPhone/iPad have no prompt and need "Share → Add to Home Screen".

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

declare global {
  interface Window {
    __gpInstallPrompt?: InstallPromptEvent | null;
  }
}

const CHANGE_EVENT = "gp-installchange";

/** Runs in <head>: keeps the install prompt for our own button instead of the browser's mini-infobar. */
export const INSTALL_PROMPT_SCRIPT = `(function(){addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__gpInstallPrompt=e;dispatchEvent(new Event("${CHANGE_EVENT}"))});addEventListener("appinstalled",function(){window.__gpInstallPrompt=null;dispatchEvent(new Event("${CHANGE_EVENT}"))})})()`;

export type InstallState = "installed" | "prompt" | "ios" | "unavailable";

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function readInstallState(): InstallState {
  if (isStandalone()) return "installed";
  if (window.__gpInstallPrompt) return "prompt";
  if (isIos()) return "ios";
  return "unavailable";
}

export function subscribeInstall(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

/** Shows the browser's install dialog; true when the learner accepted. */
export async function promptInstall(): Promise<boolean> {
  const event = window.__gpInstallPrompt;
  if (!event) return false;
  await event.prompt();
  const { outcome } = await event.userChoice;
  window.__gpInstallPrompt = null;
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return outcome === "accepted";
}
