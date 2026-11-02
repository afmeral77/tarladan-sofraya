export function safeInternalPath(
  candidate: string | null | undefined,
  fallback = "/hesabim",
): string {
  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return fallback;
  }

  return candidate;
}

export function authCallbackUrl(origin: string, next: string): string {
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", safeInternalPath(next, "/hesabim"));
  return callback.toString();
}
