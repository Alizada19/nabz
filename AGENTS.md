# Nabz AI Agent Instructions

## 1. Project Overview

Nabz is a **blood donation coordination and matching SaaS platform**.

Nabz is a **hub**, not a blood bank and not a centralized blood reserve.

The primary purpose of Nabz is to connect:

* Individuals who need blood
* Individual blood donors
* Hospitals
* Blood banks
* NGOs / blood donation organizations

Nabz facilitates:

* Blood requests
* Donor discovery
* Matching
* Communication
* Coordination
* Donor availability
* Request management
* Donation campaigns
* Notifications
* Verification
* Reporting and analytics

### Critical Product Principle

**Nabz does not own, store, control, or maintain a centralized reserve of blood.**

Do not introduce a centralized Nabz blood inventory unless explicitly requested by the project owner.

---

# 2. Core Architecture Principle

## Account Type ≠ Capability

A user's account type and the capabilities they have must remain separate concepts.

An Individual can simultaneously be:

* A blood donor
* A blood seeker/requester

These capabilities are NOT mutually exclusive.

### Correct model

```text
User
├── Individual account
├── optional DonorProfile
└── BloodRequests
```

### Incorrect model

```text
User
├── Donor
OR
└── Seeker
```

Never implement the second model.

---

# 3. Supported Account Types

Nabz currently supports these primary account types:

```text
individual
hospital
blood_bank
ngo
admin
```

These identify the account/entity.

They do NOT determine whether the account can request or donate blood.

---

# 4. Individual Users

An Individual account can have multiple capabilities.

An Individual may:

* Become a donor
* Stop being an active donor
* Update donor information
* View donor status
* Create blood requests
* Create requests for themselves
* Create requests for family members
* View their blood requests
* Track request status
* View donation history
* Receive donor/request notifications

### Critical Scenario

The following must always work:

```text
Individual registers
        ↓
Becomes donor
        ↓
DonorProfile created
        ↓
Later needs blood
        ↓
Creates BloodRequest
        ↓
Request succeeds
```

A DonorProfile must NEVER prevent the same Individual from creating a BloodRequest.

---

# 5. Donor Architecture

A donor is a **capability/profile**, not a separate user account type.

For an Individual:

```text
User
  │
  ├── role = individual
  │
  └── DonorProfile
        ├── bloodGroup
        ├── availability
        ├── isActive
        ├── eligibilityStatus
        └── lastDonationDate
```

The existence of `DonorProfile` must not change the user's fundamental account type.

Do not create separate accounts for donors and seekers.

---

# 6. Blood Requests

Blood requests can originate from:

* Individual
* Hospital
* Blood Bank
* NGO

The request should clearly identify its source.

Example:

```text
Request
├── requester
├── requestSource
├── bloodGroup
├── unitsRequired
├── urgency
├── destination
├── patient information
└── status
```

Possible request sources:

```text
individual
hospital
blood_bank
ngo
```

The request source must be available in the **Create Blood Request form**, not merely displayed on the request list.

---

# 7. Request Source vs User Role

Do not confuse:

```text
User role
```

with:

```text
Request source
```

Example:

An Individual:

```text
User role = individual
Request source = individual
```

A Hospital:

```text
User role = hospital
Request source = hospital
```

A Blood Bank:

```text
User role = blood_bank
Request source = blood_bank
```

An NGO:

```text
User role = ngo
Request source = ngo
```

The system should use explicit domain fields rather than inferring business meaning from unrelated fields.

---

# 8. Hospitals

Hospitals can:

* Register as organizations
* Manage hospital profiles
* Create blood requests
* Manage their requests
* Coordinate donors
* Receive donor responses
* Confirm donation/fulfillment events where applicable

Hospital functionality should focus on coordination.

Do not turn Nabz into a hospital inventory management system unless explicitly requested.

---

# 9. Blood Banks

Blood banks can:

* Register as organizations
* Manage their organization profile
* Coordinate donors
* Create blood-related requests
* Manage applicable inventory information
* Publish blood availability where appropriate
* Coordinate donations

### Important

Blood bank inventory belongs to the **Blood Bank**, not Nabz.

Nabz may facilitate or display information supplied by a blood bank.

Nabz must not become the owner of a centralized blood reserve.

---

# 10. NGOs / Blood Donation Organizations

NGOs can:

* Register as organizations
* Manage organization profiles
* Organize blood donation campaigns
* Recruit donors
* Coordinate volunteers
* Create campaign-related requests
* Communicate with participants

NGO functionality should remain focused on coordination and community engagement.

---

# 11. Administrator

Administrators can:

* Manage users
* Verify organizations
* Review requests
* Moderate inappropriate content
* Manage reports
* Manage platform configuration
* Monitor system activity

Administrative capabilities must not accidentally turn Nabz into a centralized blood authority.

---

# 12. Dashboard Principles

The dashboard should be capability-driven.

For an Individual who is also a donor, the dashboard should expose both sides.

Example:

```text
Dashboard

Donor
├── Donor Profile
├── Donation Availability
└── Donation History

Seeker
├── Request Blood
├── My Requests
└── Request History
```

Do NOT hide:

```text
Request Blood
```

because the user has a DonorProfile.

Likewise, do not remove donor functionality after the user creates a blood request.

---

# 13. Authorization Rules

Authorization must be based on actual permissions/capabilities.

Never write logic equivalent to:

```typescript
if (user.isDonor) {
  throw new ForbiddenException();
}
```

for blood requests.

Being a donor does not make a user ineligible to request blood.

Avoid mutually exclusive authorization assumptions such as:

```text
Donor OR Seeker
```

Use:

```text
Donor AND Seeker
```

where appropriate.

---

# 14. Database Rules

Use Prisma consistently with the existing project architecture.

Before modifying the schema:

1. Inspect existing models.
2. Understand relationships.
3. Check existing migrations.
4. Avoid destructive changes.
5. Preserve existing data whenever possible.

### Never use destructive database commands against production.

Commands such as:

```bash
npx prisma db push --force-reset
```

must only be used intentionally against disposable development/test databases.

For production schema changes, use proper Prisma migrations.

---

# 15. API Rules

Backend APIs must enforce the same business rules as the frontend.

Do not rely on frontend button visibility for security.

For every important capability verify:

```text
Frontend permission
+
Backend authorization
+
Service-level business validation
```

All three should agree.

---

# 16. Frontend Rules

The frontend must accurately represent the backend domain model.

Do not implement artificial restrictions such as:

```text
Donor → hide Request Blood
```

or:

```text
Requester → hide Become a Donor
```

The UI should support simultaneous capabilities.

Forms must expose all required domain fields.

For blood requests, verify that the request source is selectable on the actual creation form.

---

# 17. Matching System

The matching system should connect blood requests with suitable donors.

Matching may consider:

* Blood group
* Location
* Availability
* Eligibility
* Donor status
* Request urgency
* Other configured matching criteria

The matching system should **connect parties**.

It should not create or manage a centralized Nabz blood reserve.

---

# 18. Notifications

Notifications may be used for:

* New matching requests
* Blood requests
* Donor responses
* Request status changes
* Donation appointments
* Campaign announcements

Notifications should not expose unnecessary personal information.

---

# 19. Privacy and Data Minimization

Blood-related information can be sensitive.

Only collect information required for the platform's functionality.

Avoid exposing unnecessary:

* Personal information
* Contact information
* Patient information
* Medical information

Use appropriate authorization before exposing private information.

---

# 20. Business Flow: Individual

The canonical Individual flow is:

```text
Register
   ↓
Individual account
   ↓
Optional: Become a Donor
   ↓
DonorProfile
   ↓
Can donate
   ↓
Can still request blood
   ↓
Can view both donation and request history
```

This flow must never be broken.

---

# 21. Business Flow: Blood Request

General flow:

```text
Create Request
      ↓
Select Request Source
      ↓
Specify Blood Group
      ↓
Specify Units
      ↓
Specify Urgency
      ↓
Specify Destination
      ↓
Submit Request
      ↓
Matching / Coordination
      ↓
Notify Relevant Donors
      ↓
Donor Response
      ↓
Coordination
      ↓
Fulfillment / Completion
```

Nabz coordinates this process.

Nabz does not own the blood.

---

# 22. Product Scope

### In scope

* User accounts
* Individual donor profiles
* Blood requests
* Donor discovery
* Matching
* Hospital directory
* Blood bank directory
* NGO directory
* Donation campaigns
* Notifications
* Request tracking
* Donor availability
* Verification
* Analytics
* Administration

### Out of scope unless explicitly requested

* Centralized Nabz blood reserve
* Nabz-owned blood inventory
* Physical blood storage
* Blood transportation operations
* Medical diagnosis
* Medical treatment decisions
* Replacing hospitals or blood banks

---

# 23. Coding Principles

When modifying the project:

1. Understand existing architecture first.
2. Make the smallest correct change.
3. Do not rewrite working modules unnecessarily.
4. Reuse existing services/components where appropriate.
5. Maintain existing API conventions.
6. Maintain TypeScript strictness.
7. Follow existing naming conventions.
8. Avoid duplicated business logic.
9. Keep frontend and backend models synchronized.
10. Add tests for new business rules.

---

# 24. Before Changing Anything

Always inspect:

```text
Project structure
↓
Database schema
↓
Existing services
↓
Controllers
↓
DTOs
↓
Authorization guards
↓
Frontend forms
↓
Frontend API clients
↓
Existing tests
```

Do not assume the current implementation works the way its filenames suggest.

---

# 25. Testing Requirements

Before declaring a feature complete, run appropriate tests.

At minimum for major backend changes (run from `api/`):

```bash
npx tsc --noEmit
pnpm test
```

For frontend changes (run from `frontend/`):

```bash
pnpm build
```

For user-facing flows:

```text
Playwright E2E
```

### Mandatory Multi-Role Test

Always test:

```text
Register Individual
        ↓
Enable Donor
        ↓
Create DonorProfile
        ↓
Create Blood Request
        ↓
Request succeeds
        ↓
DonorProfile remains active
```

This is a core Nabz acceptance test.

---

# 26. Regression Protection

Do not declare completion based only on:

```text
Compilation successful
```

A successful compilation does not prove that the business logic is correct.

Before completion verify:

* Database
* API
* Authorization
* Frontend
* User flow
* E2E
* Existing functionality

---

# 27. Git Rules

Before committing:

1. Review changed files.
2. Review the diff.
3. Check for accidental changes.
4. Ensure secrets are not committed.
5. Run relevant tests.
6. Use a clear commit message.

Do not overwrite unrelated user work.

Do not reset or delete branches without explicit instruction.

Do not force-push unless explicitly requested.

---

# 28. Agent Behavior

When working on Nabz:

* Do not invent requirements.
* Do not introduce centralized blood storage.
* Do not turn Donor into an exclusive account type.
* Do not make Donor and Seeker mutually exclusive.
* Do not create duplicate user accounts to solve role conflicts.
* Do not remove existing functionality without justification.
* Do not silently change product direction.
* Do not perform destructive database operations on production.
* Do not report success without actually testing the affected flow.

If requirements are ambiguous, inspect the existing architecture and project requirements before making assumptions.

---

# 29. Definition of Done

A feature is complete only when:

```text
Implementation
      ↓
Database correct
      ↓
Backend correct
      ↓
Authorization correct
      ↓
Frontend correct
      ↓
Tests passing
      ↓
E2E flow verified
      ↓
No regression
      ↓
Git diff reviewed
      ↓
Commit created
```

A message such as:

> "Implemented successfully"

is NOT sufficient evidence of completion.

Provide actual test results.

---

# 30. Core Nabz Principle

Always remember:

```text
                    NABZ
                     │
          ┌──────────┼──────────┐
          │          │          │
      Individuals  Hospitals  Organizations
          │          │          │
          │          │      ┌───┴────┐
          │          │      │        │
       Donors     Requests Blood     NGOs
          │          │      Banks
          └──────────┴──────────┘
                     │
              Matching & Coordination
                     │
                 Blood Requests
```

Nabz is the **bridge connecting the ecosystem**.

It is not the blood supply itself.

The platform should make it easier for the right people and organizations to find each other, coordinate, communicate, and complete the donation process.

## Dependency Management

Before installing dependencies:

1. Inspect the repository structure.
2. Check package.json and the existing lockfile.
3. Check whether dependencies are already installed.
4. Use the package manager and lockfile already used by the project.
5. Prefer `pnpm install --frozen-lockfile` when `pnpm-lock.yaml` exists and dependencies need to be installed (the repo is two independent pnpm projects: `api/` and `frontend/`; there is no pnpm workspace).
6. Do not upgrade dependencies unless explicitly required.
7. Do not replace package managers.
8. Do not modify lockfiles unnecessarily.
9. Do not install unrelated packages.
10. Never commit node_modules.

If dependencies are already installed and working, reuse them.
