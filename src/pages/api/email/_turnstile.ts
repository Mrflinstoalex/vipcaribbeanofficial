// Helper compartido para verificar tokens de Cloudflare Turnstile.
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  token: string,
  remoteIp?: string
): Promise<boolean> {
  const secret = import.meta.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY no configurado — rechazando request por defecto.");
    return false;
  }
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.append("remoteip", remoteIp);

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    const data: { success?: boolean; "error-codes"?: string[] } = await res.json();
    if (!data.success) {
      console.warn("Turnstile rechazó el token:", data["error-codes"]);
    }
    return Boolean(data.success);
  } catch (err) {
    console.error("Error verificando Turnstile:", err);
    return false;
  }
}
