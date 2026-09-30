import type { Session } from "./types";

export const STORAGE_KEY = "synchronize.v1";

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (typeof parsed?.actorName !== "string" || !parsed.bornAt) return null;
    parsed.locks ??= [];
    parsed.pendingChildren ??= 0;
    parsed.userActions ??= 0;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null): void {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable: memory only */
  }
}
