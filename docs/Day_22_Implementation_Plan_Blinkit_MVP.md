# Day 22 — Customer Order APIs

## Sainik Mart Mobile App — 6 Week MVP

**Day:** 22
**Week:** 4
**Phase:** Customer Orders
**Focus:** Backend Customer Order APIs
**Estimated Time:** 2–3 hours
**Priority:** P0 / Core MVP

---

# 1. Objective

Implement the backend APIs required for an authenticated customer to view their own orders and retrieve the details of a specific order.

Day 19 already implemented order creation.

Day 21 verified the checkout → order creation flow.

Day 22 builds the read side of the customer order system so that Day 23 can implement the mobile **My Orders** and **Order Details** screens.

The target flow is:

```text
Customer
   ↓
GET /api/orders
   ↓
Customer's own orders
   ↓
Select an order
   ↓
GET /api/orders/:id
   ↓
Order details
```

---

# 2. Current Project Stack

## Mobile

* React Native
* Expo
* TypeScript

## Backend

* Node.js
* Express
* TypeScript

## Database

* PostgreSQL
* Prisma

## Authentication

* JWT
* bcrypt

---

# 3. Existing Backend Architecture

The backend should continue following:

```text
Route
  ↓
Authentication Middleware
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

Do not introduce a new architecture.

Reuse existing:

* authentication middleware
* JWT handling
* validation
* error handling
* response formatting
* Prisma client
* OrderService
* route conventions
* pagination conventions

---

# 4. Previous Day Dependencies

Day 22 depends on the work completed during Days 15–21.

## Day 15

Cart APIs.

```text
GET /api/cart
POST /api/cart/items
PATCH /api/cart/items/:id
DELETE /api/cart/items/:id
```

## Day 16

Cart mobile UI.

## Day 17

Address CRUD APIs.

```text
POST /api/addresses
GET /api/addresses
PATCH /api/addresses/:id
DELETE /api/addresses/:id
```

## Day 18

Address mobile UI.

## Day 19

Order creation:

```text
POST /api/orders
```

Conceptual request:

```json
{
  "addressId": "address-id"
}
```

The backend creates:

* Order
* OrderItems

and handles:

* server-side pricing
* stock validation
* stock reduction
* cart clearing
* Prisma transaction

## Day 20

Checkout mobile UI.

## Day 21

End-to-end checkout/order integration testing.

---

# 5. Day 22 Scope

## IN SCOPE

### Backend

Implement:

```text
GET /api/orders
GET /api/orders/:id
```

Also implement/verify:

* authentication
* user ownership
* order retrieval
* order item retrieval
* historical pricing
* order status
* address information
* sorting
* pagination where applicable
* validation
* error handling
* tests

---

# 6. OUT OF SCOPE

Do NOT implement:

* My Orders mobile UI
* Order Details mobile UI
* Razorpay
* payment verification
* Razorpay webhooks
* FCM
* push notifications
* order cancellation
* admin order management
* delivery tracking
* delivery partner application
* GPS
* maps
* coupons
* loyalty
* reviews
* ratings
* Redux
* Zustand
* microservices
* major architecture refactoring

These belong to later days.

---

# 7. Required APIs

## API 1 — Get Customer Orders

```http
GET /api/orders
```

Authentication required.

The endpoint must return orders belonging only to the authenticated user.

The user ID must come from the JWT/authentication middleware.

Conceptually:

```text
JWT
 ↓
req.user.id
 ↓
OrderService
 ↓
WHERE order.userId = req.user.id
```

Never trust a client-provided `userId`.

---

# 8. Order List Requirements

The order list should provide enough information for the Day 23 My Orders screen.

Conceptual response for one order:

```json
{
  "id": "order-id",
  "status": "PENDING",
  "totalAmount": 350,
  "createdAt": "2026-09-21T10:30:00.000Z",
  "itemCount": 3
}
```

This is conceptual only.

The actual response must follow the existing project's API response format.

For example, if the project already uses:

```json
{
  "success": true,
  "data": []
}
```

continue using it.

Do not introduce a new response wrapper.

---

# 9. Order Sorting

Orders should be returned newest first.

Expected conceptual ordering:

```text
createdAt DESC
```

Example:

```text
Order #3 — Today
Order #2 — Yesterday
Order #1 — 3 days ago
```

Use the existing Prisma/database conventions.

---

# 10. Pagination

Inspect the pagination implementation from earlier APIs, especially Day 11.

If the project already uses:

```text
?page=1&limit=10
```

reuse that convention.

If existing responses contain metadata such as:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

reuse the same structure.

Do not invent a second pagination system.

If pagination infrastructure does not exist, implement simple safe pagination only if appropriate for the existing architecture.

---

# 11. API 2 — Get Single Order

Implement:

```http
GET /api/orders/:id
```

Authentication required.

The order must belong to the authenticated user.

Conceptually:

```text
order.id = requestedOrderId
AND
order.userId = authenticatedUserId
```

Do not retrieve an order using only:

```text
order.id
```

and then return it without checking ownership.

---

# 12. Order Detail Requirements

The order details should contain enough information for the future Day 23 Order Details screen.

Conceptual response:

```json
{
  "id": "order-id",
  "status": "PENDING",
  "totalAmount": 350,
  "createdAt": "2026-09-21T10:30:00.000Z",
  "items": [
    {
      "productId": "product-id",
      "productName": "Rice",
      "price": 100,
      "quantity": 2,
      "subtotal": 200
    }
  ],
  "address": {
    "addressLine": "Example address",
    "city": "Delhi",
    "pincode": "110001"
  }
}
```

Again, this is conceptual.

Use the actual Prisma schema and project response conventions.

---

# 13. OrderItem Historical Data

This is important.

Day 19 created OrderItems as purchase-time snapshots.

For example:

At purchase:

```text
Rice
Price = ₹100
Quantity = 2
```

Later the product price changes:

```text
Rice
Price = ₹150
```

The historical order must still show:

```text
Rice
Price = ₹100
Quantity = 2
```

Therefore:

```text
OrderItem
```

should be treated as the historical source of truth for:

* product name
* price
* quantity
* subtotal

Do not calculate historical order prices from the current Product record.

---

# 14. Product Relation

Inspect the Prisma schema before deciding whether the order detail API needs the Product relation.

If OrderItem already contains:

* productName
* price
* quantity
* subtotal

use those values.

Do not unnecessarily depend on current Product data.

Only use the Product relation if the existing application genuinely requires fields such as:

* product image

and the relation already exists.

Do not modify the schema simply to make the API easier.

---

# 15. Address Information

Inspect the existing Order → Address relationship.

The order details should return the address associated with the order.

Do NOT simply retrieve the customer's current address and assume it is the order address.

The order's stored address relationship/reference should be used according to the actual schema.

If the existing schema does not preserve historical address information and address editing could alter the address shown for an old order, do not perform a large redesign today.

Report the limitation instead.

---

# 16. Order Status

Return the existing order status.

Expected MVP statuses may include:

```text
PENDING
CONFIRMED
PACKING
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

Use the actual Prisma enum/status implementation.

Do not introduce new statuses.

Do not change status from the GET endpoints.

These APIs are read-only.

---

# 17. Authentication

Both APIs require authentication:

```text
GET /api/orders
GET /api/orders/:id
```

Reuse the existing JWT middleware.

Do not create another authentication system.

The authenticated user ID should come from:

```text
req.user.id
```

or the equivalent already established by the project.

---

# 18. User Data Isolation

This is a critical security requirement.

Example:

```text
User A
 ├── Order A1
 └── Order A2

User B
 ├── Order B1
 └── Order B2
```

When User A calls:

```http
GET /api/orders
```

the response must contain only:

```text
A1
A2
```

It must NOT contain:

```text
B1
B2
```

If User A requests:

```http
GET /api/orders/B1
```

the API must not expose User B's order.

Use the existing project convention for whether this becomes:

* 404 Not Found
* 403 Forbidden

Avoid revealing unnecessary information about another user's resources.

---

# 19. Input Validation

Validate:

```text
/api/orders/:id
```

according to the actual ID format.

For example, if the application uses UUIDs, use UUID validation.

If it uses another format, follow the project's existing convention.

Malformed IDs must produce controlled errors.

Do not expose:

* Prisma errors
* SQL errors
* stack traces
* internal implementation details

---

# 20. Error Handling

Handle at minimum:

### Authentication failure

No JWT or invalid JWT.

Expected:

```text
401 Unauthorized
```

or the project's equivalent.

### Invalid order ID

Return a controlled validation error.

### Order not found

Return the existing not-found response.

### Order belongs to another user

Do not expose the order.

### Database failure

Use the existing centralized error handling.

Do not expose raw database errors.

---

# 21. Empty Order History

A customer who has never placed an order should receive a successful response.

Example:

```json
{
  "data": []
}
```

or the project's equivalent.

An empty order list is NOT a server error.

If pagination exists, return appropriate zero-value metadata.

---

# 22. Multiple Order Items

Test an order containing:

```text
Product A × 2
Product B × 1
Product C × 3
```

The detail endpoint must return all three items.

Verify:

* correct product IDs
* correct names
* correct prices
* correct quantities
* correct subtotals
* correct total

---

# 23. Historical Price Test

Test this scenario:

### At purchase

```text
Product price = ₹100
```

Create an order.

### After purchase

Change product price:

```text
Product price = ₹150
```

Retrieve the old order.

Expected:

```text
OrderItem price = ₹100
```

The old order must not change because the current product price changed.

---

# 24. Order Status Test

Create an order using Day 19.

Verify:

```text
status = PENDING
```

Retrieve it using:

```http
GET /api/orders/:id
```

Verify the status is returned correctly.

Do not change the status from this endpoint.

---

# 25. Security Test Matrix

## Test 1 — Own orders

```text
User A
GET /api/orders
```

Expected:

Only User A's orders.

---

## Test 2 — Other user's order

```text
User A
GET /api/orders/{User-B-order-id}
```

Expected:

Order is not exposed.

---

## Test 3 — No authentication

```text
GET /api/orders
```

Expected:

Authentication error.

---

## Test 4 — No authentication for detail

```text
GET /api/orders/{id}
```

Expected:

Authentication error.

---

## Test 5 — Invalid ID

```text
GET /api/orders/not-a-valid-id
```

Expected:

Controlled validation error.

---

# 26. Read-Only Requirement

These endpoints must NOT modify:

* orders
* order items
* products
* stock
* cart
* addresses

The following should never happen from GET:

```text
Stock reduction
Cart clearing
Order status update
```

GET APIs must remain read-only.

---

# 27. Performance Requirements

Avoid unnecessary queries.

For:

```text
GET /api/orders
```

fetch only the information needed for the order list.

Do not load:

* unrelated users
* unrelated products
* entire database tables

For:

```text
GET /api/orders/:id
```

load only the necessary order relations.

Avoid obvious N+1 queries.

Do not introduce premature optimization.

---

# 28. Controller Requirements

Keep controllers thin.

Controller responsibilities:

1. Read authenticated user ID.
2. Read route/query parameters.
3. Pass values to the service.
4. Return the service result.
5. Follow existing response formatting.

Do not put complex Prisma queries directly in controllers.

---

# 29. Service Requirements

Reuse the existing OrderService created for Day 19.

The service should contain the order retrieval logic.

Responsibilities may include:

* ownership filtering
* pagination
* sorting
* Prisma queries
* relation selection
* not-found handling
* response mapping if the project uses service-level mapping

Do not create a duplicate OrderService.

---

# 30. Route Requirements

The expected customer order routes are:

```text
POST /api/orders
GET /api/orders
GET /api/orders/:id
```

Day 22 adds the GET endpoints to the existing order route structure.

Do not create unnecessary alternatives such as:

```text
/api/customer/orders
/api/user/orders
/api/my-orders
```

unless that is already the project's established convention.

---

# 31. Route Ordering

Check whether the order router contains static routes.

For example:

```text
GET /api/orders/history
GET /api/orders/:id
```

Static routes must not accidentally be interpreted as IDs.

Preserve correct route ordering.

Do not break the existing:

```text
POST /api/orders
```

endpoint.

---

# 32. Database Changes

Day 22 should ideally require NO Prisma schema changes.

First verify whether the existing models already support:

```text
User
 ↓
Orders
 ↓
OrderItems
 ↓
Products

Order
 ↓
Address
```

If the relations already exist, do not modify the schema.

Never run:

```bash
npx prisma migrate reset
```

Never delete existing migrations.

Never delete development data.

Only create a migration if a genuinely required schema problem is discovered.

If a schema problem appears, document:

* what is missing
* why it is required
* which models are affected
* migration impact

Do not perform a broad database redesign as part of Day 22.

---

# 33. Testing Requirements

Inspect the project's existing testing setup first.

Use the existing framework and conventions.

## GET /api/orders

Test:

* authenticated user with orders
* authenticated user with no orders
* only own orders returned
* newest orders first
* pagination if supported
* unauthenticated request

## GET /api/orders/:id

Test:

* own order returned
* multiple order items
* historical prices
* correct status
* correct address
* another user's order rejected
* nonexistent order
* malformed order ID
* unauthenticated request

---

# 34. Integration Testing

Verify that Day 19 order creation still works.

Complete flow:

```text
Cart
 ↓
Address
 ↓
POST /api/orders
 ↓
Order created
 ↓
GET /api/orders
 ↓
New order appears
 ↓
GET /api/orders/:id
 ↓
Order details returned
```

This integration is important because Day 23 will depend on these APIs.

---

# 35. API Contract Verification

After implementation, manually verify:

```http
GET /api/orders
```

and:

```http
GET /api/orders/:id
```

Use whichever tool the project already uses:

* Postman
* Insomnia
* REST Client
* curl
* automated tests

Verify the actual JSON response.

Do not assume TypeScript compilation means the API contract is correct.

---

# 36. Expected Customer Flow After Day 22

The backend should now support:

```text
Customer Login
      ↓
Browse Products
      ↓
Add to Cart
      ↓
Checkout
      ↓
Create Order
      ↓
Order stored in DB
      ↓
GET /api/orders
      ↓
Customer sees their orders
      ↓
GET /api/orders/:id
      ↓
Customer sees order details
```

---

# 37. Code Quality

Follow existing project conventions.

Use TypeScript.

Avoid unnecessary:

```text
any
```

Do not add unnecessary dependencies.

Do not duplicate:

* Prisma client
* authentication middleware
* validation
* API response wrappers
* error classes
* services

Keep changes focused on Day 22.

---

# 38. Validation Commands

Inspect `package.json` first.

Determine the actual commands available.

Run appropriate commands for:

* tests
* TypeScript
* lint
* formatting if configured

For example, only if they exist:

```bash
npm test
npm run lint
npm run typecheck
```

Do not invent commands.

Fix relevant errors.

---

# 39. Git Review

Before finishing Day 22:

```bash
git status
git diff
```

Check that:

* only Day 22 files changed
* no secrets are present
* no `.env` changes were accidentally committed
* no debug code remains
* no temporary files exist
* no unrelated refactoring was introduced
* no destructive migrations were created

---

# 40. Definition of Done

Day 22 is complete when:

### API

* [ ] `GET /api/orders` implemented
* [ ] `GET /api/orders/:id` implemented

### Authentication

* [ ] Both endpoints require authentication
* [ ] User ID comes from JWT
* [ ] Client cannot override user ownership

### Authorization

* [ ] User only sees own orders
* [ ] User cannot access another user's order

### Order List

* [ ] Orders returned correctly
* [ ] Newest orders appear first
* [ ] Empty order history works
* [ ] Pagination follows existing project convention where applicable

### Order Details

* [ ] Correct order returned
* [ ] OrderItems returned
* [ ] Historical price returned
* [ ] Quantity returned
* [ ] Subtotals returned
* [ ] Total returned
* [ ] Status returned
* [ ] Associated order address returned

### Error Handling

* [ ] Authentication errors handled
* [ ] Invalid ID handled
* [ ] Missing order handled
* [ ] Unauthorized order access handled
* [ ] Database errors handled safely
* [ ] No Prisma/SQL stack traces exposed

### Compatibility

* [ ] Day 19 POST `/api/orders` still works
* [ ] Existing authentication still works
* [ ] Existing cart functionality is not broken
* [ ] Existing address functionality is not broken

### Quality

* [ ] Tests pass
* [ ] TypeScript passes
* [ ] Lint passes if configured
* [ ] No unnecessary schema changes
* [ ] No destructive DB operations
* [ ] No unrelated refactoring
* [ ] Git diff reviewed

---

# 41. Day 22 Final Checkpoint

If everything works:

```text
DAY 22 COMPLETE — SAFE TO MOVE TO DAY 23
```

If important problems remain:

```text
DAY 22 NOT COMPLETE — FIX THE FOLLOWING FIRST
```

For each remaining issue, report:

1. Issue
2. File/location
3. Why it matters
4. Required fix
5. Database/schema impact

Do NOT declare Day 22 complete if a P0 authentication, authorization, data-isolation, order retrieval, or data-integrity issue remains.

---

# 42. Day 23 Preview

After Day 22 is complete, Day 23 will implement the React Native customer order UI:

```text
My Orders
   ↓
GET /api/orders
   ↓
Order List
   ↓
Tap Order
   ↓
GET /api/orders/:id
   ↓
Order Details
```

Day 23 should consume the APIs created and verified during Day 22.

Do not implement this mobile UI during Day 22.
