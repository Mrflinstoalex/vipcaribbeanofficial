import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;
function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if ((window as any).turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Turnstile"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export interface TurnstileHandle {
  reset: () => void;
}

interface Props {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

export const Turnstile = forwardRef<TurnstileHandle, Props>(
  ({ siteKey, onVerify, onExpire, onError, theme = "auto", className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const cbsRef = useRef({ onVerify, onExpire, onError });
    cbsRef.current = { onVerify, onExpire, onError };

    useEffect(() => {
      let cancelled = false;
      loadTurnstileScript()
        .then(() => {
          if (cancelled || !containerRef.current) return;
          const ts = (window as any).turnstile;
          if (!ts) return;
          widgetIdRef.current = ts.render(containerRef.current, {
            sitekey: siteKey,
            theme,
            callback: (token: string) => cbsRef.current.onVerify(token),
            "expired-callback": () => cbsRef.current.onExpire?.(),
            "error-callback": () => cbsRef.current.onError?.(),
          });
        })
        .catch(() => {
          cbsRef.current.onError?.();
        });
      return () => {
        cancelled = true;
        const ts = (window as any).turnstile;
        if (widgetIdRef.current && ts) {
          try {
            ts.remove(widgetIdRef.current);
          } catch {}
          widgetIdRef.current = null;
        }
      };
    }, [siteKey, theme]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        const ts = (window as any).turnstile;
        if (widgetIdRef.current && ts) {
          try {
            ts.reset(widgetIdRef.current);
          } catch {}
        }
      },
    }));

    return <div ref={containerRef} className={className} />;
  }
);

Turnstile.displayName = "Turnstile";

export default Turnstile;
