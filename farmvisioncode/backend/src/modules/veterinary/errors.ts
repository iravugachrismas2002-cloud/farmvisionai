export type VeterinaryErrorCode =
  | "ROLE_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "EVIDENCE_INVALID";

export class VeterinaryServiceError extends Error {
  constructor(
    public readonly code: VeterinaryErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "VeterinaryServiceError";
  }
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}