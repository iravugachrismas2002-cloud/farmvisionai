export type MarketplaceErrorCode = "ROLE_REQUIRED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INVALID";

export class MarketplaceServiceError extends Error {
  constructor(public readonly code: MarketplaceErrorCode, message: string) {
    super(message);
    this.name = "MarketplaceServiceError";
  }
}

export function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
