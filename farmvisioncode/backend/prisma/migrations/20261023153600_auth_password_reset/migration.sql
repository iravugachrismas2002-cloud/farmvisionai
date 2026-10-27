-- Add password-reset state to User.
-- This migration is intentionally unapplied until the target database is reviewed.
ALTER TABLE "User"
  ADD COLUMN "passwordResetToken" TEXT,
  ADD COLUMN "passwordResetExpiresAt" TIMESTAMPTZ(6);

CREATE UNIQUE INDEX "User_passwordResetToken_key"
  ON "User"("passwordResetToken");
