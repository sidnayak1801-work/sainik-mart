# Day 17 — Address CRUD APIs Implementation Plan

## Sainik Mart — Blinkit-like Grocery Delivery MVP

---

# 1. Sprint Context

Today is:

**DAY 17 — Address CRUD APIs**

### Current roadmap

```text
Day 15 → Cart & Cart-Item APIs
Day 16 → Cart Screen UI
Day 17 → Address CRUD APIs ← TODAY
Day 18 → Address UI
Day 19 → Order Service
Day 20 → Checkout UI
Day 21 → End-to-End Checkout/Order Testing
```

### Day 17 details

* Timebox: **2.5 hours**
* Priority: **P0**
* Area: **Backend**
* Stack:

  * Node.js
  * Express
  * TypeScript
  * PostgreSQL
  * Prisma
  * JWT authentication

---

# 2. Day 17 Objective

Implement the backend Address APIs required by the Sainik Mart customer application.

The authenticated customer must be able to:

1. Create a delivery address
2. View their saved addresses
3. Update their own address
4. Delete their own address

The address APIs must enforce **user ownership**.

The mobile UI will be implemented on **Day 18**.

---

# 3. Final User Flow

The intended flow is:

```text
Customer logs in
       ↓
JWT stored on mobile
       ↓
Customer opens address section
       ↓
GET /api/addresses
       ↓
Customer sees their saved addresses
       ↓
Add Address
       ↓
POST /api/addresses
       ↓
Address saved
       ↓
Edit Address
       ↓
PATCH /api/addresses/:id
       ↓
Address updated
       ↓
Delete Address
       ↓
DELETE /api/addresses/:id
       ↓
Address removed
```

---

# 4. Day 17 Scope

## Implement

* Address Prisma model verification
* Address validation
* Address types
* Address service
* Address controller
* Address routes
* JWT authentication
* Address ownership checks
* Create address
* Get user's addresses
* Update address
* Delete address
* Error handling
* Consistent API responses
* TypeScript safety
* Testing
* Documentation if appropriate

---

# 5. Explicitly DO NOT Implement

Do not implement any of the following during Day 17:

* React Native Address UI
* Add Address screen
* Edit Address screen
* Address selection UI
* Checkout
* Order creation
* Order service
* Razorpay
* Payment verification
* Firebase notifications
* Google Maps integration
* Live GPS tracking
* Driver application
* Delivery partner functionality
* Delivery zones
* Distance calculation
* Coupons
* Loyalty
* Admin address management

These belong to later stages of the MVP.

---

# 6. IMPORTANT — Inspect Existing Code First

Before changing anything, inspect the existing Days 1–16 implementation.

Do not assume the project structure.

Inspect:

```text
backend/
├── src/
├── prisma/
├── middleware/
├── controllers/
├── services/
├── routes/
├── validators/
├── types/
├── config/
└── ...
```

Also inspect:

* Prisma schema
* Address model
* User model
* User → Address relationship
* JWT authentication middleware
* `req.user` typing
* role middleware
* existing validation approach
* existing error handling
* existing response format
* existing Cart service/controller/routes
* existing API route registration
* existing naming conventions

Reuse existing architecture instead of creating a second pattern.

---

# 7. Existing Address Model

The project roadmap expects an Address model containing approximately:

```text
Address
├── id
├── userId
├── addressLine
├── city
├── pincode
├── latitude
├── longitude
└── timestamps
```

However:

**Do not blindly modify the Prisma schema.**

First inspect the actual existing `schema.prisma`.

Use the existing model and field names if they are already correct.

If the Address model was already created during Day 5, do not recreate it.

---

# 8. Address Relationship

The intended relationship is:

```text
User
  │
  └── has many
        │
        ├── Address 1
        ├── Address 2
        └── Address 3
```

Each address belongs to exactly one user.

Conceptually:

```text
User.id
   ↓
Address.userId
```

The authenticated user's ID must be used when creating and querying addresses.

---

# 9. API Endpoints

Implement:

```text
POST   /api/addresses
GET    /api/addresses
PATCH  /api/addresses/:id
DELETE /api/addresses/:id
```

All four endpoints require authentication.

---

# 10. Authentication Requirement

Every Address endpoint must use the existing JWT authentication middleware.

Expected flow:

```text
Request
   ↓
Authorization: Bearer <JWT>
   ↓
JWT middleware
   ↓
Verify token
   ↓
Extract user ID
   ↓
req.user
   ↓
Address Controller
   ↓
Address Service
```

Do not create another authentication mechanism.

Reuse the authentication implementation from Days 8–10.

---

# 11. Critical Security Rule — Never Trust Client User ID

The client must NOT control the owner of an address.

Do not implement:

```json
{
  "userId": "some-user-id",
  "addressLine": "..."
}
```

as the source of ownership.

Instead:

```text
JWT
 ↓
req.user.id
 ↓
address.userId
```

The backend determines ownership.

Even if the client sends:

```json
{
  "userId": "another-user"
}
```

the backend must ignore/reject that field.

---

# 12. POST /api/addresses

## Purpose

Create a new address for the authenticated customer.

Example request:

```http
POST /api/addresses
Authorization: Bearer <JWT>
Content-Type: application/json
```

Example body:

```json
{
  "addressLine": "123 Main Street, Sector 10",
  "city": "Delhi",
  "pincode": "110001",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

Use the actual field names from the existing Prisma model.

---

# 13. Create Address Logic

The service should:

1. Get authenticated user ID
2. Validate request data
3. Create address
4. Associate address with authenticated user
5. Return the created address

Conceptually:

```text
req.user.id
      ↓
AddressService.createAddress()
      ↓
Prisma Address.create()
      ↓
userId = req.user.id
```

Never accept the user ID as authoritative request data.

---

# 14. Address Validation

Validate required fields according to the existing project conventions.

At minimum consider:

### addressLine

Required.

Should not accept an empty string.

Bad:

```json
{
  "addressLine": ""
}
```

### city

Required.

### pincode

For the current India-focused MVP, use a basic six-digit validation.

Examples:

```text
110001 → valid
560001 → valid
400001 → valid

11000  → invalid
ABC123 → invalid
1234567 → invalid
```

Do not build complex international postal-code validation at this stage.

---

# 15. Latitude and Longitude

Latitude and longitude should be optional if the current Prisma model allows them to be optional.

Example:

```json
{
  "addressLine": "123 Main Street",
  "city": "Delhi",
  "pincode": "110001"
}
```

should still be valid if coordinates are optional.

If coordinates are provided:

### Latitude

Should be between:

```text
-90 and 90
```

### Longitude

Should be between:

```text
-180 and 180
```

Do not integrate Google Maps on Day 17.

---

# 16. GET /api/addresses

## Purpose

Return the authenticated user's saved addresses.

Example:

```http
GET /api/addresses
Authorization: Bearer <JWT>
```

The service should use:

```text
req.user.id
```

to retrieve addresses.

Conceptually:

```text
User A requests GET /api/addresses

        ↓

userId = User A

        ↓

SELECT addresses
WHERE userId = User A

        ↓

Return only User A's addresses
```

---

# 17. User Isolation

This is a mandatory security requirement.

Suppose:

```text
User A
 ├── Address A1
 └── Address A2

User B
 ├── Address B1
 └── Address B2
```

User A must only receive:

```text
A1
A2
```

User A must never receive:

```text
B1
B2
```

Do not implement a global:

```text
GET /addresses
```

that returns every user's addresses.

---

# 18. PATCH /api/addresses/:id

## Purpose

Update an existing address owned by the authenticated user.

Example:

```http
PATCH /api/addresses/address-id
Authorization: Bearer <JWT>
Content-Type: application/json
```

Example body:

```json
{
  "addressLine": "Updated Main Street",
  "city": "Delhi",
  "pincode": "110002"
}
```

All fields can be optional for a partial update.

---

# 19. Update Ownership Check

Before updating:

```text
Address exists?
       ↓
Does address.userId === req.user.id?
       ↓
Yes → update
No  → reject
```

Never perform:

```text
UPDATE address WHERE id = addressId
```

without checking ownership.

Prefer a query that incorporates ownership where practical:

```text
WHERE
    id = addressId
AND
    userId = authenticatedUserId
```

This reduces the chance of an insecure direct-object-reference vulnerability.

---

# 20. DELETE /api/addresses/:id

## Purpose

Delete an address owned by the authenticated user.

Example:

```http
DELETE /api/addresses/address-id
Authorization: Bearer <JWT>
```

Ownership must be checked.

Conceptually:

```text
DELETE address
WHERE
    id = addressId
AND
    userId = req.user.id
```

If the address does not exist or does not belong to the user, return the project's appropriate error response.

Do not reveal unnecessary information about another user's address.

---

# 21. Error Handling

Follow the existing centralized error-handling architecture.

Potential responses:

```text
401 Unauthorized
→ Missing/invalid JWT

400 Bad Request
→ Invalid address data

404 Not Found
→ Address doesn't exist or isn't accessible

500 Internal Server Error
→ Unexpected server failure
```

Use the project's existing error classes/response format if already implemented.

Do not introduce a second error format.

---

# 22. Controller Responsibilities

The Address controller should remain thin.

It should handle:

* request
* params
* body
* authenticated user
* calling the service
* sending response

Avoid putting large Prisma queries directly inside controllers.

Prefer:

```text
AddressController
      ↓
AddressService
      ↓
Prisma
```

---

# 23. Service Responsibilities

The Address service should contain:

* address creation
* address retrieval
* ownership checks
* address update
* address deletion
* relevant business validation

Example conceptual methods:

```text
createAddress(userId, data)

getUserAddresses(userId)

updateAddress(userId, addressId, data)

deleteAddress(userId, addressId)
```

Use the project's existing naming conventions if different.

---

# 24. Routes

Register the routes according to the existing route architecture.

Expected:

```text
/api/addresses
```

Routes:

```text
GET    /
POST   /
PATCH  /:id
DELETE /:id
```

Apply the existing JWT middleware to all routes.

---

# 25. Validation Layer

Use the project's existing validation library/pattern.

If the project already uses Zod, Joi, express-validator, or another approach:

**Reuse it.**

Do not introduce another validation library just for Day 17.

Validate:

```text
Create:
- addressLine
- city
- pincode
- latitude
- longitude

Update:
- same fields, but optional
```

---

# 26. Response Format

Follow the existing API response convention from Days 8–16.

Do not invent a new response format.

For example, if the project already uses:

```json
{
  "success": true,
  "data": {}
}
```

continue using it.

If the project uses another format, preserve that format.

---

# 27. Empty Address List

A user with no saved addresses should receive a successful response containing an empty collection.

For example, depending on the existing API format:

```json
{
  "success": true,
  "data": []
}
```

Do not treat an empty address list as a server error.

This will be important for Day 18's empty-state UI.

---

# 28. Address Ordering

If the existing project has no ordering requirement, use a predictable order.

For example:

```text
createdAt DESC
```

or the project's existing convention.

Do not invent complicated "Home/Work/Other" address categorization yet.

---

# 29. Day 17 Does Not Need Default Address

Do not add complicated default-address functionality unless it already exists in the current schema/design.

Do not add:

```text
isDefault
```

just because it might be useful later.

Keep Day 17 aligned with the existing database design.

If a default address is already part of the existing schema, preserve it and follow the established behavior.

---

# 30. Day 17 Does Not Need Address Labels

Do not add:

```text
HOME
WORK
OTHER
```

unless these already exist in the current schema.

The MVP can simply store the address.

The Day 18 UI can present the address cleanly without requiring a label system.

---

# 31. Prisma Considerations

Before making database changes:

Inspect:

```text
prisma/schema.prisma
```

Confirm:

* Address model exists
* User relationship exists
* `userId` exists
* correct field types
* nullable coordinates if intended
* timestamps if already designed

If the schema is already correct:

**Do not create a new migration.**

If a genuine missing schema change is required:

* make the smallest necessary change
* create a normal Prisma migration
* never reset the database
* never delete existing migrations

---

# 32. Database Safety

Absolutely do NOT run:

```text
prisma migrate reset
```

Do not:

* drop tables
* delete user data
* delete addresses
* delete migrations
* recreate the database
* modify unrelated models

Day 17 should normally require no destructive database operation.

---

# 33. API Security Matrix

| Endpoint                    | Authentication | Ownership                        |
| --------------------------- | -------------- | -------------------------------- |
| POST `/api/addresses`       | Required       | Automatically authenticated user |
| GET `/api/addresses`        | Required       | Own addresses only               |
| PATCH `/api/addresses/:id`  | Required       | Own address only                 |
| DELETE `/api/addresses/:id` | Required       | Own address only                 |

---

# 34. Security Test Scenario

Create:

```text
User A
Address A1

User B
Address B1
```

Authenticate as User A.

Try:

```text
GET /api/addresses
```

Expected:

```text
A1 only
```

Then try:

```text
PATCH /api/addresses/B1
```

Expected:

```text
Rejected
```

Then:

```text
DELETE /api/addresses/B1
```

Expected:

```text
Rejected
```

This is one of the most important Day 17 tests.

---

# 35. Testing Checklist

## Authentication

```text
[ ] GET without JWT → 401
[ ] POST without JWT → 401
[ ] PATCH without JWT → 401
[ ] DELETE without JWT → 401
[ ] Invalid JWT → 401
[ ] Valid JWT → allowed
```

## Create

```text
[ ] Valid address → created
[ ] Missing addressLine → rejected
[ ] Missing city → rejected
[ ] Invalid pincode → rejected
[ ] Invalid latitude → rejected
[ ] Invalid longitude → rejected
[ ] Address belongs to authenticated user
```

## Read

```text
[ ] User sees own addresses
[ ] User cannot see other users' addresses
[ ] Empty list works
```

## Update

```text
[ ] Own address can be updated
[ ] Partial update works
[ ] Invalid data rejected
[ ] Other user's address cannot be updated
[ ] Non-existent address handled correctly
```

## Delete

```text
[ ] Own address can be deleted
[ ] Other user's address cannot be deleted
[ ] Non-existent address handled correctly
```

---

# 36. Manual API Test Flow

Use Postman, Insomnia, REST Client, or the project's existing API testing method.

### Step 1 — Register/Login

Get a valid JWT.

### Step 2 — Create address

```text
POST /api/addresses
```

### Step 3 — Get addresses

```text
GET /api/addresses
```

Confirm the new address appears.

### Step 4 — Update

```text
PATCH /api/addresses/:id
```

Change the city/pincode/address.

### Step 5 — Get again

Confirm the updated address appears.

### Step 6 — Delete

```text
DELETE /api/addresses/:id
```

### Step 7 — Get again

Confirm it is gone.

### Step 8 — User isolation

Create a second user and confirm the first user's address cannot be accessed/modified/deleted.

---

# 37. TypeScript Requirements

Avoid:

```typescript
any
```

where a proper type can be used.

Define appropriate:

```text
CreateAddressInput
UpdateAddressInput
AddressResponse
```

or follow existing project naming conventions.

Use the existing `req.user` type from the authentication implementation.

Do not duplicate the JWT user type if one already exists.

---

# 38. Suggested Backend Structure

Only use this structure if it matches the existing project:

```text
src/
├── controllers/
│   └── address.controller.ts
│
├── services/
│   └── address.service.ts
│
├── routes/
│   └── address.routes.ts
│
├── validators/
│   └── address.validator.ts
│
├── types/
│   └── address.ts
│
├── middleware/
│   └── auth.middleware.ts
│
└── app.ts
```

Do not create duplicate files if equivalent files already exist.

---

# 39. Architecture

The final architecture should remain:

```text
React Native App
       │
       │ HTTPS
       ▼
Express Route
       │
       ▼
JWT Middleware
       │
       ▼
Validation
       │
       ▼
Address Controller
       │
       ▼
Address Service
       │
       ▼
Prisma
       │
       ▼
PostgreSQL
```

Day 18 will then consume these APIs:

```text
React Native Address Screens
          ↓
     API Client
          ↓
GET/POST/PATCH/DELETE
          ↓
    Address API
```

---

# 40. Design System Compatibility

The current Sainik Mart design system is primarily relevant to Day 18's React Native UI.

Day 17 should **not** contain UI styling.

However, the API should provide clean data for the following future UI:

```text
Sainik Mart
────────────────────────

Saved Addresses

┌───────────────────────────┐
│ Delivery Address          │
│ 123 Main Street           │
│ Delhi - 110001            │
│                           │
│ Edit        Delete        │
└───────────────────────────┘

┌───────────────────────────┐
│ + Add New Address         │
└───────────────────────────┘
```

Day 18 will use the existing Sainik Mart design tokens:

```text
Primary:       #145C38
Primary Dark:  #0C3F24
Gold:          #C6A34E
Accent:        #E85A20
Background:    #F6F4EF
Surface:       #FFFFFF
Text Primary:  #1A241C
Text Secondary:#6B6560
Danger:        #B91C1C

Screen margin: 16
Card radius:   12
Button radius: 24
Button height: 48+
```

Do not add these design tokens to the backend.

---

# 41. Error Messages

Error messages should be useful but should not expose internal implementation details.

Good:

```text
Address not found
```

```text
You are not authorized to modify this address
```

```text
Invalid pincode
```

Bad:

```text
PrismaClientKnownRequestError: ...
```

or:

```text
SELECT * FROM addresses WHERE...
```

Never expose SQL/database details to the mobile client.

---

# 42. Logging

Do not log:

```text
JWT
Authorization header
password
SecureStore token
```

Normal development logging can include useful non-sensitive information if the project already uses logging.

Avoid excessive debug logs.

---

# 43. Performance

The address API is small.

Keep queries simple.

For:

```text
GET /api/addresses
```

retrieve only the authenticated user's addresses.

Avoid:

* unnecessary joins
* N+1 queries
* loading unrelated user data
* unnecessary database calls

---

# 44. Implementation Order

Follow this order:

```text
1. Inspect Days 1–16
        ↓
2. Inspect Prisma Address model
        ↓
3. Inspect existing auth middleware
        ↓
4. Inspect existing validation
        ↓
5. Inspect existing response/error format
        ↓
6. Create/reuse Address types
        ↓
7. Create/reuse Address validator
        ↓
8. Implement Address service
        ↓
9. Implement Address controller
        ↓
10. Implement Address routes
        ↓
11. Register routes in Express
        ↓
12. Test authentication
        ↓
13. Test CRUD
        ↓
14. Test user isolation
        ↓
15. Run TypeScript/build/lint
        ↓
16. Review git diff
```

---

# 45. 2.5-Hour Timebox

## 0:00–0:20 — Inspect

Inspect:

* Prisma schema
* Address model
* auth
* validation
* existing Cart implementation
* route conventions
* response conventions

---

## 0:20–0:45 — Validation & Types

Create/reuse:

* CreateAddressInput
* UpdateAddressInput
* Address response type
* validation schemas

---

## 0:45–1:30 — Backend Implementation

Implement:

* Address service
* Address controller
* Address routes

---

## 1:30–2:00 — Security & Errors

Verify:

* JWT
* user ownership
* validation
* error responses
* no client-controlled userId

---

## 2:00–2:20 — Testing

Test:

* create
* get
* update
* delete
* invalid input
* unauthorized requests
* cross-user access

---

## 2:20–2:30 — Final Validation

Run appropriate:

```bash
npx prisma generate
npx tsc --noEmit
npm run build
npm run lint
npm test
```

Only run commands that actually exist in the project.

Then:

```bash
git status
git diff
```

---

# 46. Do Not Overengineer

This is an MVP.

Do not introduce:

* repository pattern if the project doesn't already use it
* DTO frameworks
* event buses
* microservices
* Redis
* Kafka
* RabbitMQ
* Google Maps
* geocoding services
* address autocomplete
* delivery zone engines

The goal is:

```text
Simple
+
Secure
+
Tested
+
Maintainable
```

---

# 47. Definition of Done

Day 17 is complete when:

### API

* [ ] POST `/api/addresses` works
* [ ] GET `/api/addresses` works
* [ ] PATCH `/api/addresses/:id` works
* [ ] DELETE `/api/addresses/:id` works

### Authentication

* [ ] All endpoints require JWT
* [ ] Invalid/missing JWT rejected
* [ ] Authenticated user ID comes from JWT

### Ownership

* [ ] User sees only their addresses
* [ ] User cannot modify another user's address
* [ ] User cannot delete another user's address

### Validation

* [ ] Required fields validated
* [ ] Pincode validated
* [ ] Coordinates validated when provided
* [ ] Partial updates validated

### Database

* [ ] Prisma relationship works
* [ ] No destructive migration
* [ ] No data reset

### Code Quality

* [ ] Controller/service separation maintained
* [ ] Existing validation reused
* [ ] Existing error handling reused
* [ ] Existing response format preserved
* [ ] No unnecessary dependencies
* [ ] No `any` where avoidable
* [ ] No sensitive logs

### Verification

* [ ] TypeScript passes
* [ ] Build passes
* [ ] Lint passes if configured
* [ ] Manual CRUD test passes
* [ ] Cross-user security test passes

---

# 48. Day 17 Final API Contract

The final API surface should be:

```text
POST /api/addresses
```

Create authenticated user's address.

```text
GET /api/addresses
```

Return authenticated user's addresses.

```text
PATCH /api/addresses/:id
```

Update authenticated user's address.

```text
DELETE /api/addresses/:id
```

Delete authenticated user's address.

---

# 49. Day 17 Integration Check

The final backend flow should be:

```text
                 Customer
                    │
                    │ JWT
                    ▼
             Express Backend
                    │
             JWT Middleware
                    │
                    ▼
              req.user.id
                    │
                    ▼
             Address Service
                    │
              Ownership Check
                    │
                    ▼
                 Prisma
                    │
                    ▼
              PostgreSQL
```

No user ID should come from the mobile client as an authority.

---

# 50. Day 18 Preparation

After Day 17 is complete, Day 18 will implement:

```text
Address Screens
       │
       ├── Saved Addresses
       │
       ├── Add Address
       │
       ├── Edit Address
       │
       └── Select Address
```

Using the existing Sainik Mart design system.

The mobile UI should consume:

```text
GET    /api/addresses
POST   /api/addresses
PATCH  /api/addresses/:id
DELETE /api/addresses/:id
```

Day 18 should **not need to invent or modify the backend contract** if Day 17 is implemented correctly.

---

# 51. Final Cursor Self-Audit

Before declaring Day 17 complete, inspect:

```bash
git status
git diff
```

Then answer:

1. Did I inspect the existing Days 1–16 implementation?
2. Did I inspect the actual Prisma Address model?
3. Did I reuse the existing JWT middleware?
4. Did I reuse the existing validation system?
5. Did I reuse the existing response/error format?
6. Does POST `/api/addresses` work?
7. Does GET `/api/addresses` work?
8. Does PATCH `/api/addresses/:id` work?
9. Does DELETE `/api/addresses/:id` work?
10. Does every endpoint require authentication?
11. Does the address owner come from `req.user.id`?
12. Can a user see only their own addresses?
13. Can a user update only their own addresses?
14. Can a user delete only their own addresses?
15. Is pincode validation working?
16. Are latitude/longitude validated when supplied?
17. Are invalid requests rejected cleanly?
18. Are 401/404/400 errors handled consistently?
19. Are sensitive values absent from logs?
20. Did I avoid destructive database commands?
21. Did I avoid unrelated schema changes?
22. Did I avoid Day 18+ functionality?
23. Does TypeScript pass?
24. Does the backend build?
25. Does lint pass if configured?
26. Did I review the final git diff?

---

# 52. Final Checkpoint

The Day 17 checkpoint is:

```text
Authentication
      +
Address CRUD
      +
Ownership Security
      +
Validation
      +
Error Handling
      +
PostgreSQL/Prisma
      ↓
DAY 17 COMPLETE
      ↓
READY FOR DAY 18
```

---

# 53. Required Final Cursor Output

If everything is working:

```text
DAY 17 COMPLETE — SAFE TO MOVE TO DAY 18
```

Then provide:

* files created/modified
* APIs implemented
* validation implemented
* ownership/security tests
* TypeScript/build/lint results
* any migration performed
* any remaining minor issues

If anything is incomplete:

```text
DAY 17 NOT COMPLETE — FIX THE FOLLOWING FIRST
```

Then list the exact remaining issues.

Do not claim completion if the CRUD APIs have not been tested against the actual database.

---

# Core Principle

Day 17 is about giving Sainik Mart a **secure, authenticated address backend**.

Keep the responsibility clear:

```text
Mobile
  ↓
API request
  ↓
JWT authentication
  ↓
Authenticated user
  ↓
Address service
  ↓
Ownership validation
  ↓
Prisma
  ↓
PostgreSQL
```

**The client chooses the address data.
The server decides who owns it.**

Do not build the Address UI, checkout, maps, orders, or payments today.

**Day 17 = Address CRUD APIs only.**
