# Phase 8 — Entrepreneur Marketplace Foundation

## Purpose and boundaries

Phase 8 introduces the first marketplace foundation for suppliers and catalog products. It is a separate bounded module from farms, telemetry, alerts, recommendations, Digital Twin, and Agronomist advisory workflows.

This phase does not implement checkout, payments, orders, delivery, inventory synchronization, reviews, messaging, farm procurement, medical prescribing, agronomic claims, or actuator control. Product records are catalog data, not farm data.

PostgreSQL remains an integration dependency. The role/model changes and migration SQL are additive offline drafts only; no migration is applied and no database is recreated.

## Role activation

`UserRole` remains the multi-role assignment model. `ENTREPRENEUR` is a server-side/admin-assigned role and cannot be self-assigned through marketplace requests. A user may hold multiple roles, but each operation is authorized independently.

An Entrepreneur role does not grant access to any Farm, Device, SensorReading, Alert, Recommendation, AdvisoryNote, or RecommendationReview. Marketplace browsing and publishing are not consent, ownership, or advisory access.

## Supplier profile contract

A supplier profile is owned by one user through a unique `userId`. The owner must hold `ENTREPRENEUR` to create or update it. The profile stores business name, optional description, contact email, and lifecycle status. No farm identifiers or farm-derived metrics may be stored in this foundation.

The profile owner may manage only their own profile. Other users may receive a public catalog-safe profile projection when it is referenced by a published product; private account/session fields are not exposed.

## Product catalog contract

Products belong to exactly one supplier profile and are managed only by that supplier owner. Supported categories are:

- `FEED`
- `VETERINARY_MEDICINE`
- `SEEDS`
- `FERTILIZER`
- `EQUIPMENT`

The initial product fields are catalog-safe: name, category, description, unit label, price in minor currency units, ISO-like currency code, and status. Prices are informational catalog values only until a payment/order contract exists. Veterinary medicine listings are not prescriptions or treatment advice; the catalog stores no diagnosis, dosage decision, or farm observation.

Products transition through `DRAFT`, `PUBLISHED`, and `ARCHIVED`. New products start as `DRAFT`; only their supplier owner may publish, edit, archive, or restore them. Catalog readers see published products only. Draft and archived products are never public.

## API contracts

### `GET /api/marketplace/supplier-profile`

Returns the signed-in Entrepreneur's own profile, or `404` if none exists. It never returns farm data.

### `POST /api/marketplace/supplier-profile`

Accepts `{ businessName, description?, contactEmail? }`. Requires `ENTREPRENEUR`; creates one profile per user.

### `PATCH /api/marketplace/supplier-profile`

Accepts the same fields and updates only the authenticated user's profile. It never accepts `userId`.

### `GET /api/marketplace/products`

Returns published products only by default. Optional `category` and bounded `limit` filters are catalog filters, not farm filters. The response contains product and public supplier profile fields only.

### `POST /api/marketplace/products`

Accepts `{ name, category, description, unitLabel, priceMinor, currency }`. Requires `ENTREPRENEUR` and an existing supplier profile owned by the actor. The product is created as `DRAFT`; clients cannot choose another owner or supplier profile.

### `PATCH /api/marketplace/products/{productId}`

Accepts editable catalog fields and optional lifecycle `status`. Requires the product's supplier owner and Entrepreneur role. `PUBLISHED` is visible in catalog reads; `DRAFT` and `ARCHIVED` remain owner-scoped. No operation touches farms or advisory data.

## Authorization matrix

| Operation | Farmer | Entrepreneur/profile owner | Other role |
| --- | --- | --- | --- |
| Browse published catalog | Yes | Yes | Yes |
| Read own supplier profile | No unless also Entrepreneur | Yes | No |
| Create/update own supplier profile | No | Yes | No |
| Create product | No | Yes, with own profile | No |
| Edit/publish/archive product | No | Yes, own product only | No |
| Read another supplier's draft/archived product | No | No | No |
| Read any farm data through marketplace | Never automatic | Never automatic | Never automatic |

A multi-role user must satisfy the marketplace rule for marketplace operations and the existing owner/consent rule for farm operations. No marketplace query may join through a farm relationship to infer authorization.

## Verification boundary

Offline verification covers Zod input contracts, pure authorization/category rules, generated Prisma client, TypeScript, lint, and unit tests. It does not verify live PostgreSQL persistence, migration compatibility, payments, fulfillment, supplier verification, regulated veterinary compliance, or commercial accuracy. Those require later contracts and review.
