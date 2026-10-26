"use client";

import { LoaderCircle, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { api, errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { safeNext } from "@/lib/redirect";
import { isDarkTheme, subscribeResolvedTheme } from "@/lib/theme";

type CredentialResponse = { credential?: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: CredentialResponse) => void;
            ux_mode?: "popup" | "redirect";
            context?: "signin" | "signup" | "use";
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            itp_support?: boolean;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GIS_SCRIPT = "https://accounts.google.com/gsi/client";
const LOAD_TIMEOUT_MS = 15_000;

// Google Identity Services keeps one configuration per page. Initialise it once and hand each credential to the
// button that is mounted now: re-initialising on every visit to the page only makes GIS log warnings.
const gis: { clientId: string | null; onCredential: ((response: CredentialResponse) => void) | null } = {
  clientId: null,
  onCredential: null,
};

function initializeOnce(clientId: string) {
  if (!window.google || gis.clientId === clientId) return;
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => gis.onCredential?.(response),
    ux_mode: "popup",
    context: "signin",
    itp_support: true,
  });
  gis.clientId = clientId;
}

/**
 * Official "Sign in with Google" button: the only way learners register and sign in.
 * Google hands the page an ID token; POST /auth/google verifies it and opens (or creates) the account.
 */
export function GoogleSignIn({ clientId, next }: { clientId: string; next?: string }) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const dark = useSyncExternalStore(subscribeResolvedTheme, isDarkTheme, () => false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCredential = useCallback(
    async ({ credential }: CredentialResponse) => {
      if (!credential) {
        setError("Google ntiyohereje amakuru yo kukwinjiza. Ongera ugerageze.");
        return;
      }
      setBusy(true);
      setError(null);
      try {
        await api("/auth/google", { method: "POST", json: { credential } });
        router.replace(safeNext(next));
        router.refresh();
      } catch (e) {
        setError(errorMessage(e));
        setBusy(false);
      }
    },
    [next, router],
  );

  useEffect(() => {
    gis.onCredential = onCredential;
    return () => {
      if (gis.onCredential === onCredential) gis.onCredential = null;
    };
  }, [onCredential]);

  // Draw the button once the script is ready, and redraw it in Google's dark style when the site turns dark.
  useEffect(() => {
    const element = buttonRef.current;
    if (!loaded || !element || !window.google) return;
    initializeOnce(clientId);
    window.google.accounts.id.renderButton(element, {
      type: "standard",
      theme: dark ? "filled_black" : "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      logo_alignment: "left",
      locale: "rw",
      // GIS accepts 200–400 px.
      width: Math.round(Math.min(400, Math.max(200, element.parentElement?.clientWidth ?? 320))),
    });
  }, [loaded, clientId, dark]);

  // Ad blockers and flaky connections can stall the script without firing an error event.
  useEffect(() => {
    if (loaded || failed) return;
    const timer = window.setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [loaded, failed]);

  return (
    <div className="flex flex-col items-center gap-3">
      <Script src={GIS_SCRIPT} strategy="afterInteractive" onReady={() => setLoaded(true)} onError={() => setFailed(true)} />
      {failed && !loaded ? (
        <div role="alert" className="w-full rounded-2xl bg-surface-2 p-4 text-center text-sm leading-relaxed text-muted">
          <p>
            Buto ya Google ntiyabashije gufunguka. Reba ko ufite interineti, cyangwa uhagarike igikoresho kibuza
            amatangazo (ad blocker) kuri uru rubuga.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 font-semibold text-ink shadow-soft ring-1 ring-line transition hover:ring-brand-400"
          >
            <RotateCw className="size-4" aria-hidden /> Ongera ugerageze
          </button>
        </div>
      ) : (
        <div className="relative flex min-h-11 w-full justify-center">
          <div ref={buttonRef} className={cn("min-h-11", busy && "pointer-events-none opacity-40")} />
          {(!loaded || busy) && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-semibold text-muted">
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              {busy ? "Turimo kukwinjiza..." : "Turimo gutegura Google..."}
            </div>
          )}
        </div>
      )}
      {error && (
        <p
          role="alert"
          className="w-full rounded-xl bg-signal-50 px-4 py-3 text-center text-sm font-medium text-signal-700 dark:bg-signal-500/10 dark:text-signal-200"
        >
          {error}
        </p>
      )}
    </div>
  );
}
