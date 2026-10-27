# FarmVision AI - Authentication Migration Plan: Remove Manus Dependency

## Overview
This plan removes all Manus OAuth authentication dependencies and replaces them with FarmVision's native email/password authentication using PostgreSQL + Prisma.

## Current Architecture (Manus-based)
```
User --> Manus OAuth --> Manus Runtime --> External API
                                    ↓
                               Prisma/PostgreSQL (user openId)
                                    ↓
                               JWT Session (MANUS_PROJECT_ID, MANUS_JWT_SECRET)
```

## Target Architecture (FarmVision-native)
```
User --> FarmVision Login Form --> Prisma/PostgreSQL (user email/password)
                                    ↓
                               JWT Session (farmvision-jwt-secret)
                                    ↓
                               /dashboard redirect
```

## Files to Modify/Delete

### 1. Delete: `backend/src/server/auth/manus-oauth.ts`
- Complete removal of Manus OAuth token exchange
- Remove Manus identity fetching from external API

### 2. Modify: `backend/src/server/auth/config.ts`
- Remove `ManusOAuthConfig` interface
- Remove `ManusSessionConfig` interface  
- Replace with simple auth configuration
- Remove `MANUS_PROJECT_ID`, `MANUS_OAUTH_PORTAL_URL`, `MANUS_OAUTH_API_URL` env vars
- Add `FARMVISION_JWT_SECRET` env var

### 3. Modify: `backend/src/server/auth/session.ts`
- Remove dependency on `getManusSessionConfig()`
- Use environment variable for JWT secret directly
- Keep `createApplicationSession` and `verifyApplicationSession` functions

### 4. Modify: `frontend/src/app/api/auth/callback/route.ts`
- Replace `exchangeCodeForIdentity` import with password verification
- Change user lookup from `openId` to `email` + password hash comparison
- Update user creation/upsert logic for credential-based auth

### 5. Create: `frontend/src/app/api/auth/login/route.ts`
- New POST route for email/password login
- Validate credentials against PostgreSQL
- Create session token
- Redirect to `/dashboard`

### 6. Modify: `frontend/src/app/login/login-button.tsx`
- Replace `ManusLoginButton` with `FarmVisionLoginForm`
- Add email/password input fields
- Submit to `/api/auth/login`

### 7. Modify: `frontend/src/app/api/auth/register/route.ts` (if exists)
- Add user registration with email/password

### 8. Documentation Updates
- Remove all Manus references from: README.md, TODO.md, ARCHITECTURE.md
- Update authentication flow diagrams

## Verification Flow

```
Open App
    ↓
Login Page (email + password form)
    ↓
Enter Email + Password
    ↓
Prisma queries User by email
    ↓
Verify password hash against PostgreSQL
    ↓
Session Created (JWT with farmvision-jwt-secret)
    ↓
Redirect to /dashboard
```

## Database Changes
- User model already has `email` field - no schema migration needed
- May need to add `passwordHash` field if not already present
- Existing users with `openId` from Manus can be migrated or kept

## Rollback Plan
If authentication breaks, revert to previous Manus OAuth implementation using git history.