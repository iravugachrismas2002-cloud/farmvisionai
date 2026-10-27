# Phase 9 — Veterinary Services Platform Preparation

Phase 9 is a preparation milestone only until the infrastructure verification sprint is complete. The sprint is the gate before any veterinary service is treated as operational.

## Intended scope to contract

The future veterinary module may connect farmers with qualified veterinary providers, service profiles, availability, consultation requests, and evidence-linked follow-up. Exact workflows, provider verification, jurisdictional compliance, payment, prescriptions, emergency handling, and medical-record retention require separate product and legal review before models or APIs are finalized.

## Non-negotiable boundaries

- Farm ownership remains unchanged.
- Veterinary users receive no automatic access to farm data; any farm access must use an explicit, farm-specific consent contract modeled separately from marketplace visibility.
- Marketplace profiles/products remain separate from veterinary provider identity and clinical authorization.
- Sensor observations and AI recommendations are supporting evidence only, not diagnoses, prescriptions, or emergency triage.
- No medication dosage, treatment decision, or actuator action is generated automatically.
- Hardware and calibration verification must precede claims based on real sensor observations.
- Multi-role users must satisfy the authorization contract for each operation.

## Gate before implementation

Before creating Phase 9 models, migrations, or services, complete the Verification Sprint in [`docs/verification-sprint.md`](verification-sprint.md), including ordered migration deployment to the existing `farmvision_dev`, persistence/isolation checks, build recovery, ESP32 verification, and sensor calibration. Track Code Complete, Database Verified, and Hardware Verified independently.
