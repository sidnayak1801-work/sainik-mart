# Day 24 — Admin Authorization & Access Control

## Sainik Mart Mobile App — 6 Week MVP

**Day:** 24
**Week:** 4
**Phase:** Admin
**Focus:** Admin Authentication & Role-Based Authorization
**Estimated Time:** 2–3 hours
**Priority:** P0 / Security Foundation

---

# 1. Objective

Implement and verify the backend authorization layer required for the Sainik Mart admin system.

The goal is to ensure that:

* authenticated customers cannot access admin APIs
* authenticated admins can access admin APIs
* unauthenticated users cannot access protected admin APIs
* existing customer APIs continue working
* existing JWT authentication remains unchanged
* role information is securely obtained from the authenticated user
* admin authorization can be reused by Day 25 and later admin features

Target architecture:

```text
Request
   ↓
JWT Authentication
   ↓
Authenticated User
   ↓
Role Check
   ↓
ADMIN?
  /   \
YES    NO
 ↓      ↓
Allow   Reject
```

---

# 2. Day 24 Scope

## IN SCOPE

Implement/verify:

* existing user roles
* admin role handling
* reusable admin authorization middleware
* protected admin route pattern
* unauthorized customer access rejection
* unauthenticated access rejection
* admin access verification
* JWT/user role consistency
* admin authorization tests
* security review

---

# 3. OUT OF SCOPE

Do NOT implement:

* Admin Dashboard UI
* Product management UI
* Category management UI
* Inventory management UI
* Admin order management
* Analytics
* Razorpay
* FCM
* delivery management
* delivery partner
* coupons
* loyalty
* reviews
* ratings
* Redux
* Zustand
* major database redesign
* new authentication system

Those belong to later days.

---

# 4. Existing Architecture

The backend should continue using:

```text
Route
  ↓
JWT Authentication Middleware
  ↓
Admin Authorization Middleware
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

Do not create a different architecture for admin functionality.

---

# 5. FIRST STEP — INSPECT THE EXISTING PROJECT

Before changing anything, inspect:

```text
package.json
Prisma schema
authentication middleware
JWT implementation
User model
role enum
auth controller
auth service
auth routes
existing protected routes
existing middleware
error handling
response formatting
```

Also inspect all code created during:

* Day 8
* Day 10
* Day 19
* Day 22

The goal is to understand how authentication and roles already work.

Do not assume the role implementation.

---

# 6. CHECK THE USER MODEL

Inspect `prisma/schema.prisma`.

Determine whether the User model already has something like:

```prisma
role UserRole @default(CUSTOMER)
```

and an enum such as:

```prisma
enum UserRole {
  CUSTOMER
  ADMIN
}
```

The actual names may differ.

Use the existing schema.

Do NOT create duplicate role fields.

---

# 7. ROLE SOURCE OF TRUTH

Determine where the authenticated user's role currently comes from.

Possible implementations include:

### JWT contains role

```text
JWT
 ↓
userId + role
 ↓
req.user
```

or:

### JWT contains only user ID

```text
JWT
 ↓
userId
 ↓
Database
 ↓
User.role
```

Use the existing architecture.

Do not blindly add role information to the JWT if the current authentication design does not use it.

---

# 8. SECURITY PRINCIPLE

Admin authorization must NOT trust a role supplied by the client.

Never accept:

```json
{
  "role": "ADMIN"
}
```

from:

* request body
* query parameter
* request header
* route parameter

The customer must not be able to turn themselves into an admin by modifying a request.

The trusted role must come from the authenticated server-side user identity.

---

# 9. ADMIN AUTHORIZATION MIDDLEWARE

Implement or reuse a middleware that checks:

```text
authenticated user
       ↓
user.role
       ↓
ADMIN?
```

Conceptual implementation:

```text
requireAuth
    ↓
requireAdmin
    ↓
controller
```

The actual naming should follow the repository's conventions.

For example, if the project uses:

```text
authenticate
authorize
```

continue using that pattern.

Do not introduce inconsistent naming.

---

# 10. MIDDLEWARE RESPONSIBILITIES

Authentication middleware should be responsible for:

* verifying JWT
* identifying the user
* attaching authenticated user information to the request

Admin authorization middleware should be responsible for:

* checking authenticated user role
* allowing admins
* rejecting non-admin users

Do not duplicate JWT verification inside admin middleware.

---

# 11. CUSTOMER ACCESS

A normal customer:

```text
role = CUSTOMER
```

must NOT be able to access admin routes.

Example:

```text
CUSTOMER
   ↓
GET /api/admin/...
   ↓
403 Forbidden
```

or the project's equivalent authorization response.

---

# 12. UNAUTHENTICATED ACCESS

A user without valid authentication:

```text
No JWT
```

must not reach the admin controller.

Expected flow:

```text
No JWT
   ↓
Authentication middleware
   ↓
401 Unauthorized
```

The admin middleware should not be responsible for authentication.

---

# 13. ADMIN ACCESS

An authenticated admin:

```text
role = ADMIN
```

should pass the authorization middleware.

Expected:

```text
ADMIN
  ↓
JWT valid
  ↓
Admin authorization passes
  ↓
Controller executes
```

---

# 14. ADMIN ROUTE STRUCTURE

Inspect existing route organization.

Admin routes should follow the project's existing convention.

A likely structure is:

```text
/api/admin/*
```

For example:

```text
GET /api/admin/...
```

Do not create actual product/order admin functionality today.

A minimal protected route may be used purely to verify authorization if the project does not yet have an admin endpoint.

Do not leave unnecessary production test routes behind.

---

# 15. PROTECTED ADMIN ROUTE TEST

If there is no existing admin endpoint, create the smallest appropriate protected endpoint according to the project's architecture for verification.

Conceptually:

```http
GET /api/admin/health
```

or another temporary/minimal protected route.

However:

* first inspect whether an appropriate existing route already exists
* do not create a route merely for testing if the project has another clean way to test middleware
* if a temporary test route is created, remove it before completion unless it has legitimate application value

Do not create a fake admin dashboard API.

---

# 16. ADMIN ROUTE MIDDLEWARE ORDER

The correct order should be:

```text
Request
  ↓
JWT Authentication
  ↓
Admin Authorization
  ↓
Controller
```

NOT:

```text
Request
  ↓
Admin Authorization
  ↓
JWT Authentication
```

The authorization middleware needs an authenticated user.

---

# 17. REQUEST USER TYPE

Inspect the existing Express request typing.

If the project already has:

```ts
req.user
```

reuse it.

Do not create duplicate request interfaces.

If TypeScript currently does not know about `req.user`, improve the existing typing cleanly according to the project's architecture.

Avoid:

```ts
(req as any).user
```

as a shortcut.

---

# 18. ERROR RESPONSE

Follow the project's existing error system.

For an authenticated customer attempting an admin endpoint:

```text
403 Forbidden
```

is generally appropriate.

For unauthenticated access:

```text
401 Unauthorized
```

is generally appropriate.

Use the project's existing error classes/status conventions.

Do not return raw:

```text
Error: ...
```

responses.

Do not expose stack traces.

---

# 19. INFORMATION DISCLOSURE

Do not reveal unnecessary information.

For example, a customer accessing an admin route should not receive:

```text
You are customer ID 123
Admin user ID is 456
```

Keep the authorization response minimal and consistent with the application's error conventions.

---

# 20. ROLE ENUM

If the project already has:

```text
CUSTOMER
ADMIN
```

reuse it.

Do not create:

```text
USER
CUSTOMER_USER
ADMIN_USER
SUPERADMIN
STAFF
MANAGER
```

unless these roles already exist and are required by the project.

Day 24 only needs the existing MVP admin/customer distinction.

---

# 21. ADMIN CREATION

Inspect how the project currently creates the admin account.

Possible existing approach:

```text
migration
seed
environment variable
manual DB creation
```

Do NOT create a second admin creation mechanism.

If Day 8 already created an admin during migration/seed, reuse it.

If there is already an environment-based super-admin setup, follow the existing project implementation.

---

# 22. IMPORTANT — DO NOT EXPOSE ADMIN CREDENTIALS

Do not:

* hardcode admin passwords
* add passwords to source code
* add credentials to logs
* commit `.env`
* print JWTs
* print authentication tokens

If admin credentials are configured through environment variables, leave that mechanism intact.

---

# 23. ADMIN LOGIN

Day 24 should NOT create a separate admin login system.

The existing login system should authenticate the admin account.

Conceptually:

```text
POST /api/auth/login
       ↓
email/password
       ↓
JWT
       ↓
role = ADMIN
       ↓
Admin routes allowed
```

If the existing login response already contains user role, reuse it.

If it does not, do not unnecessarily redesign the login API.

---

# 24. CUSTOMER LOGIN

Verify that existing customer login still works:

```text
CUSTOMER
   ↓
Login
   ↓
JWT
   ↓
Customer APIs
```

Do not break customer authentication while adding admin authorization.

---

# 25. ADMIN ROLE VERIFICATION

Test:

### Admin

```text
email/password
 ↓
login
 ↓
JWT
 ↓
ADMIN role
 ↓
admin endpoint
 ↓
200
```

### Customer

```text
email/password
 ↓
login
 ↓
JWT
 ↓
CUSTOMER role
 ↓
admin endpoint
 ↓
403
```

### No authentication

```text
no JWT
 ↓
admin endpoint
 ↓
401
```

---

# 26. SECURITY TEST — ROLE MANIPULATION

Attempt to modify the request.

Examples:

```json
{
  "role": "ADMIN"
}
```

or:

```text
?role=ADMIN
```

or:

```http
X-Role: ADMIN
```

The user must still be treated according to the server-trusted authenticated identity.

A customer must NOT become an admin.

---

# 27. SECURITY TEST — JWT TAMPERING

If practical, test that modifying the JWT payload without a valid signature does not grant admin access.

Expected:

```text
Tampered token
   ↓
Authentication failure
   ↓
401
```

Do not weaken JWT verification to make testing easier.

---

# 28. SECURITY TEST — CUSTOMER ADMIN ACCESS

Use a real customer account.

Try:

```text
GET /api/admin/...
```

Expected:

```text
403 Forbidden
```

The admin controller should not execute.

---

# 29. SECURITY TEST — ADMIN ACCESS

Use a legitimate admin account.

Try:

```text
GET /api/admin/...
```

Expected:

```text
200
```

or the appropriate successful response.

---

# 30. SECURITY TEST — NO TOKEN

Try the admin endpoint without:

```text
Authorization: Bearer ...
```

Expected:

```text
401 Unauthorized
```

---

# 31. SECURITY TEST — INVALID TOKEN

Try an invalid/expired JWT.

Expected:

```text
401 Unauthorized
```

Do not allow the request through to the admin controller.

---

# 32. EXISTING CUSTOMER API REGRESSION

After implementing admin authorization, verify existing customer APIs still work.

At minimum check:

```text
GET /api/products
GET /api/categories
GET /api/cart
GET /api/addresses
GET /api/orders
GET /api/orders/:id
```

Use the actual routes implemented in the project.

A customer should continue to access customer functionality normally.

---

# 33. EXISTING ADMIN DATA

If an admin account already exists:

Do NOT:

* delete it
* recreate it unnecessarily
* change its password
* change its email
* reset the database

Use the existing admin account.

---

# 34. DATABASE CHANGES

Avoid schema changes unless absolutely necessary.

Before changing Prisma:

```text
inspect prisma/schema.prisma
```

Determine whether role support already exists.

If it already exists:

```text
NO DATABASE CHANGE REQUIRED
```

Do not run:

```bash
npx prisma migrate reset
```

Do not delete migrations.

Do not recreate the database.

Do not destroy existing data.

---

# 35. IF ROLE SUPPORT DOES NOT EXIST

If the current application genuinely has no role field or role enum, then implement the smallest correct schema change required.

For example:

```text
User
 ↓
role
 ↓
CUSTOMER / ADMIN
```

Only do this if required.

If a migration is necessary:

1. Update Prisma schema.
2. Create a proper migration.
3. Do NOT reset the database.
4. Preserve existing users.
5. Ensure existing users receive the correct default role.
6. Verify the admin account is correctly assigned.

Before changing the schema, inspect the current database and migration history.

---

# 36. DEFAULT ROLE

If a role field needs to be introduced, existing/new customer users should default to:

```text
CUSTOMER
```

Do not default ordinary users to:

```text
ADMIN
```

Admin assignment must be explicit and controlled.

---

# 37. EXISTING ADMIN USER

If an existing admin account is already part of the project:

Verify:

```text
role = ADMIN
```

Do not expose admin credentials in logs or source code.

---

# 38. CONTROLLER PROTECTION

Every future admin route must be protected.

The reusable structure should make it difficult to accidentally create:

```text
/api/admin/products
```

without authorization.

The preferred pattern is:

```text
router
  ↓
authenticate
  ↓
requireAdmin
  ↓
controller
```

or the project's equivalent.

---

# 39. DO NOT PROTECT CUSTOMER ROUTES AS ADMIN

Be careful not to accidentally apply:

```text
requireAdmin
```

globally to:

```text
/api/*
```

Customer APIs must continue working.

Admin authorization should only apply to admin routes.

---

# 40. MIDDLEWARE REUSABILITY

The admin authorization mechanism should be reusable for future routes.

Day 25+ will eventually need routes such as:

```text
/api/admin/products
/api/admin/categories
/api/admin/orders
```

The middleware should allow:

```text
authenticate
+
requireAdmin
```

without duplicating role checks inside every controller.

---

# 41. NO ROLE CHECKS IN EVERY CONTROLLER

Avoid writing:

```ts
if (req.user.role !== "ADMIN") {
   ...
}
```

inside every admin controller.

Centralize authorization in middleware unless the existing architecture has another established pattern.

---

# 42. LOGGING

Do not log:

* passwords
* JWT tokens
* authorization headers
* sensitive credentials

Normal structured authorization logs are acceptable if the existing project already uses them.

Do not add noisy debug logs.

---

# 43. TESTING

Inspect the existing testing setup first.

Use the project's existing:

* Jest
* Supertest
* integration testing
* Postman
* REST Client
* curl

whatever is already established.

Do not introduce a new testing framework just for Day 24.

---

# 44. REQUIRED TEST MATRIX

Test at minimum:

| Scenario                       | Expected        |
| ------------------------------ | --------------- |
| Admin + valid JWT              | Allowed         |
| Customer + valid JWT           | Forbidden       |
| No JWT                         | Unauthorized    |
| Invalid JWT                    | Unauthorized    |
| Expired JWT                    | Unauthorized    |
| Tampered JWT                   | Unauthorized    |
| Customer sends `role=ADMIN`    | Still forbidden |
| Customer sends `X-Role: ADMIN` | Still forbidden |
| Existing customer API          | Still works     |
| Existing admin login           | Still works     |

---

# 45. TYPESCRIPT

Maintain strict TypeScript quality.

Avoid:

```ts
any
```

as a shortcut.

If request user typing needs improvement, fix it properly.

Do not duplicate types unnecessarily.

---

# 46. ERROR HANDLING

Use the existing centralized error handling.

Do not return:

```text
500
```

for a normal authorization failure.

Expected semantics:

```text
No/invalid authentication → 401
Authenticated but not admin → 403
```

Use the project's actual implementation conventions.

---

# 47. CODE QUALITY

Do not introduce unnecessary packages.

Do not refactor unrelated modules.

Do not rename large portions of the backend.

Do not rewrite authentication unless a genuine Day 24 blocker is found.

Keep the changes focused.

---

# 48. GIT REVIEW

Before finishing:

```bash
git status
git diff
```

Check:

* no `.env` changes
* no credentials
* no JWTs
* no passwords
* no debug code
* no unrelated files
* no destructive migrations
* no database reset
* no unrelated refactoring

---

# 49. VALIDATION COMMANDS

Inspect `package.json` first.

Run only commands that actually exist.

For example:

```bash
npm run typecheck
npm run lint
npm test
```

Do not assume these scripts exist.

Fix relevant errors introduced by Day 24.

---

# 50. DAY 24 DEFINITION OF DONE

Day 24 is complete when:

## Authentication

* [ ] Existing JWT authentication still works.
* [ ] Admin can log in through the existing authentication system.
* [ ] Customer can log in through the existing authentication system.
* [ ] Invalid JWT is rejected.
* [ ] Tampered JWT is rejected.

## Authorization

* [ ] Admin role is correctly identified.
* [ ] Admin authorization middleware exists/reuses existing mechanism.
* [ ] Admin routes require authentication.
* [ ] Admin routes require ADMIN role.
* [ ] Customer cannot access admin routes.
* [ ] Client-supplied role cannot override server role.

## Security

* [ ] No credentials are hardcoded.
* [ ] No JWTs are logged.
* [ ] No passwords are logged.
* [ ] Customer data remains protected.
* [ ] Customer APIs remain accessible to customers.

## Database

* [ ] Existing role schema reused if available.
* [ ] No unnecessary schema changes.
* [ ] No migration reset.
* [ ] No migrations deleted.
* [ ] Existing users preserved.

## Testing

* [ ] Admin access tested.
* [ ] Customer rejection tested.
* [ ] No-token rejection tested.
* [ ] Invalid-token rejection tested.
* [ ] Role manipulation tested.
* [ ] Existing customer APIs tested.
* [ ] TypeScript passes.
* [ ] Lint passes if configured.
* [ ] Tests pass if configured.

---

# 51. FINAL CHECKPOINT

If everything works:

```text
DAY 24 COMPLETE — SAFE TO MOVE TO DAY 25
```

If important problems remain:

```text
DAY 24 NOT COMPLETE — FIX THE FOLLOWING FIRST
```

For each remaining issue report:

```text
Issue:
File:
Why it matters:
Required fix:
Database impact:
Security impact:
```

Do not declare Day 24 complete if there is a P0 issue involving:

* authentication
* authorization
* customer/admin role isolation
* JWT validation
* credential exposure
* unauthorized admin access

---

# 52. DAY 25 PREVIEW

Day 25 will build the **Admin Dashboard Shell**.

Expected flow:

```text
Admin Login
     ↓
Admin Authorization
     ↓
Admin Dashboard
     ↓
Dashboard Navigation
     ├── Products
     ├── Categories
     ├── Orders
     └── Inventory
```

Day 25 should focus on the dashboard structure/UI.

Do NOT implement Day 25 functionality during Day 24.
