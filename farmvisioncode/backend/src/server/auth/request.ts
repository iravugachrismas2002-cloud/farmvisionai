import { isAllowedAppOrigin } from "./oauth-state";

export function isTrustedAuthRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  return origin !== null && isAllowedAppOrigin(origin);
}
