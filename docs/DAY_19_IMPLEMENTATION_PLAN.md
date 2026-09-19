# Sainik Mart — Day 19 Implementation Plan

## Order Creation API / Order Service

**Project:** Sainik Mart
**Day:** 19 / 42
**Phase:** Week 3 — Cart + Checkout
**Estimated Time:** 2–2.5 hours
**Priority:** P0
**Platform:** Backend
**Stack:** Node.js + Express + TypeScript + Prisma + PostgreSQL

---

# 1. Day 19 Objective

Implement the backend **Order Creation API**.

The purpose of Day 19 is to convert:

```text
Customer Cart
     +
Customer Address
     ↓
New Order
     +
Order Items
```

The main API is:

```text
POST /api/orders
```

The backend must:

1. Authenticate the customer.
2. Validate the selected address.
3. Fetch the customer's cart.
4. Verify every cart product.
5. Verify product availability.
6. Verify stock.
7. Calculate prices server-side.
8. Create the order.
9. Create order-item snapshots.
10. Safely update inventory.
11. Clear the cart only after successful order creation.
12. Perform related database changes atomically using a Prisma transaction.
13. Return the created order.

---

# 2. Current Project Architecture

The existing backend architecture should remain:

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

Do not introduce a different architecture for Day 19.

The controller should remain thin.

The order service should contain the business logic.

Prisma should handle database access.

---

# 3. Important Existing Dependencies

Day 19 depends on previous work:

```text
Day 8  → Authentication
Day 10 → Authorization
Day 11 → Products / Categories
Day 15 → Cart APIs
Day 17 → Address APIs
Day 18 → Address UI
```

The backend must use the actual existing implementations.

Before making changes, inspect:

```text
src/
prisma/
```

and the existing implementations from Days 8–17.

---

# 4. First Step — Inspect Existing Codebase

Before writing code, inspect the existing project.

Do NOT immediately create an Order module from scratch.

First identify:

### Authentication

Find:

* JWT middleware
* authenticated request/user type
* how `req.user.id` is exposed
* authorization handling
* existing 401/403 behavior

### Cart

Inspect the Day 15 implementation:

* Cart model
* CartItem model
* cart service
* cart controller
* cart routes
* product relationship
* quantity handling
* price handling
* stock handling

### Address

Inspect Day 17:

* Address model
* Address service
* Address controller
* Address routes
* ownership checks
* validation
* response format

### Product

Inspect:

* Product model
* price fields
* discount fields
* stock field
* active/inactive field
* product relationships

### Database

Inspect:

```text
prisma/schema.prisma
```

Understand the actual relations before modifying anything.

### Existing conventions

Follow existing conventions for:

* naming
* controllers
* services
* DTOs/types
* validation
* errors
* response wrappers
* Prisma access
* module organization
* route registration

---

# 5. Day 19 Scope

## IN SCOPE

Implement:

* Order model changes if actually required
* OrderItem model changes if actually required
* Order creation route
* Order controller
* Order service
* Request validation
* Cart validation
* Address ownership validation
* Product validation
* Stock validation
* Server-side price calculation
* Order creation
* Order-item snapshot creation
* Stock decrement
* Cart clearing
* Prisma transaction
* Error handling
* Basic backend tests

---

# 6. OUT OF SCOPE

Do NOT implement:

* Razorpay
* Payment gateway
* Payment verification
* Webhooks
* Checkout mobile UI
* Order history UI
* Admin order dashboard
* FCM notifications
* Delivery tracking
* Delivery partner
* GPS
* Maps
* Coupons
* Loyalty
* Advanced discounts
* Inventory management dashboard
* Order cancellation workflow beyond existing schema requirements
* Order status management UI
* Redux/Zustand
* Microservices
* RabbitMQ/Kafka
* New authentication architecture

Day 19 is specifically about **creating an order safely from the customer's cart and address**.

---

# 7. Main API

Implement:

```http
POST /api/orders
```

The endpoint must require authentication.

---

# 8. Request Body

The customer should provide the selected address.

Conceptually:

```json
{
  "addressId": "address-id"
}
```

Use the actual ID type already used by the project.

Do NOT accept:

```json
{
  "userId": "...",
  "totalAmount": 500,
  "subtotal": 500
}
```

The backend must determine these values.

---

# 9. User Identification

The authenticated user must come from the existing JWT.

Conceptually:

```typescript
const userId = req.user.id;
```

The client must NOT be trusted to provide:

```text
userId
```

This is important for security.

---

# 10. Address Validation

When the customer sends:

```json
{
  "addressId": "..."
}
```

the service must verify:

```text
Address exists
        ↓
Address belongs to authenticated user
```

Conceptually:

```text
WHERE
address.id = addressId
AND
address.userId = authenticatedUserId
```

Do not merely check that the address exists.

---

# 11. Cross-User Address Security

This scenario must be rejected:

```text
User A
  ↓
tries to use
  ↓
User B's address
```

The API must not allow this.

Expected result:

```text
4xx error
```

Use the project's established error convention.

---

# 12. Fetch Customer Cart

After validating the user/address, retrieve the authenticated user's cart.

The service should fetch the necessary relations.

Conceptually:

```text
Cart
 └── CartItems
       └── Product
```

Use the actual Prisma relationships in the existing schema.

Do not assume relation names.

---

# 13. Empty Cart

If the cart does not exist or contains no items:

```text
POST /api/orders
        ↓
empty cart
        ↓
reject
```

Return an appropriate `4xx` response.

Example user-facing message:

```text
Cart is empty
```

Do not create an empty order.

Do not clear anything unnecessarily.

---

# 14. Product Validation

Every cart item must be validated before creating the order.

For each product:

Check:

```text
Product exists
Product is active
Product has sufficient stock
Product has a valid current price
```

Do not assume that because the product was previously added to the cart it is still valid.

---

# 15. Product Active Check

A product may have been active when added to the cart but inactive when the customer checks out.

Example:

```text
Day 15:
Product A → active
Customer adds Product A

Later:
Product A → inactive

Day 19:
Customer creates order
```

The backend should reject the order or otherwise follow the project's established business rule.

For this MVP:

**Do not create an order containing an inactive product.**

---

# 16. Stock Validation

For every cart item:

```text
requested quantity <= current product stock
```

Example:

```text
Product stock = 5
Cart quantity = 3
```

Valid.

But:

```text
Product stock = 2
Cart quantity = 5
```

must fail.

Do not create a partially fulfilled order.

---

# 17. Stock Failure Behavior

If any product has insufficient stock:

```text
Order creation fails
Cart remains unchanged
Stock remains unchanged
No partial order is created
```

Example:

```text
Product A → enough stock
Product B → insufficient stock
```

The entire order should fail.

Do not create an order containing only Product A.

---

# 18. Server-Side Pricing

This is one of the most important Day 19 requirements.

The mobile application must NOT determine the final order price.

The backend should retrieve current pricing from PostgreSQL.

For each product:

```text
Current database price
        ×
Requested quantity
        =
Item subtotal
```

Then:

```text
Order total =
sum(all item subtotals)
```

---

# 19. Never Trust Client Price

The client must not be able to send:

```json
{
  "price": 1,
  "totalAmount": 1
}
```

to purchase an expensive product for ₹1.

The server must ignore any client-provided:

```text
price
subtotal
total
```

if they are sent.

The server/database is the source of truth.

---

# 20. Discount Pricing

Inspect the actual Product schema.

If the existing project already has:

```text
price
discountPrice
```

then use the existing project/business convention for determining the effective price.

Do NOT invent a new discount system.

The effective price must be calculated on the server.

Example concept:

```text
price = ₹100
discountPrice = ₹80

effective price = ₹80
```

Only do this if the existing product implementation defines `discountPrice` that way.

---

# 21. Price Change Scenario

The API must handle this correctly:

```text
Product price when added to cart:
₹100

Product price at checkout:
₹120
```

The order should use the current server-side price according to the existing business rules.

The client must not be able to force the old price.

---

# 22. Order Model

Inspect the existing Prisma schema first.

If the Order model already exists, extend/reuse it.

Do not create a duplicate model.

The order should conceptually contain:

```text
Order
├── id
├── userId
├── addressId
├── status
├── totalAmount
├── createdAt
└── updatedAt
```

Use the actual existing naming conventions.

---

# 23. Initial Order Status

A newly created order should start as:

```text
PENDING
```

if this status already exists in the project schema.

The broader lifecycle is:

```text
PENDING
   ↓
CONFIRMED
   ↓
PACKING
   ↓
OUT_FOR_DELIVERY
   ↓
DELIVERED
```

Alternative:

```text
CANCELLED
```

Do not implement the complete lifecycle on Day 19.

Only establish the initial status during order creation.

---

# 24. Order Items

Inspect whether `OrderItem` already exists.

If it exists:

* reuse it
* do not duplicate it

If it doesn't exist and the schema requires it, add it following existing conventions.

Order items should conceptually contain:

```text
OrderItem
├── id
├── orderId
├── productId
├── productName
├── price
├── quantity
└── subtotal
```

Use the actual schema conventions.

---

# 25. Order Item Snapshot

The order item should preserve information about what the customer purchased at that moment.

Example:

```text
Today

Rice
Price = ₹100
Quantity = 2

OrderItem:
productName = Rice
price = 100
quantity = 2
subtotal = 200
```

If the product later changes:

```text
Rice
Price = ₹120
```

the historical order should still retain:

```text
₹100
```

Do not rely only on the current Product table to reconstruct historical prices.

---

# 26. Why Snapshot Price Matters

Product data can change.

For example:

```text
Monday:
Rice = ₹100

Tuesday:
Rice = ₹120

Wednesday:
Rice = ₹110
```

An order created Monday must continue to show the Monday purchase price.

Therefore:

```text
OrderItem.price
```

should represent the purchase-time price.

---

# 27. Snapshot Product Name

If the existing data model supports it, store the product name in the OrderItem snapshot.

This protects historical order information if the product name changes later.

Use the actual project schema and conventions.

Do not introduce unnecessary snapshot fields beyond what the MVP needs.

---

# 28. Subtotal Calculation

For every order item:

```text
subtotal =
effectivePrice × quantity
```

Example:

```text
Price = ₹80
Quantity = 3

Subtotal = ₹240
```

The backend calculates this.

The mobile client does not control it.

---

# 29. Total Calculation

Calculate:

```text
totalAmount =
sum(all order item subtotals)
```

Example:

```text
Item A = ₹200
Item B = ₹150
Item C = ₹100

Total = ₹450
```

Do not accept a client-provided total.

---

# 30. Currency / Amount Representation

Follow the existing project's database representation.

If the project stores monetary values as numeric/decimal:

* preserve that convention
* do not arbitrarily convert everything to floating-point JavaScript numbers if it can introduce precision issues

If the project already has a standard money-handling convention, reuse it.

Do not redesign monetary storage on Day 19.

---

# 31. Database Transaction

Order creation must be atomic.

Multiple database operations are involved:

```text
Validate
   ↓
Create Order
   ↓
Create OrderItems
   ↓
Update Stock
   ↓
Clear Cart
```

These operations must be performed safely.

Use a Prisma transaction where appropriate.

Conceptually:

```text
BEGIN
   ↓
Create Order
   ↓
Create OrderItems
   ↓
Update inventory
   ↓
Clear cart
   ↓
COMMIT
```

If anything fails:

```text
ROLLBACK
```

---

# 32. Why Transaction Is Required

Avoid this broken state:

```text
Order created       ✅
OrderItems created  ✅
Stock updated       ❌
Cart cleared        ❌
```

Or:

```text
Order created       ✅
OrderItems created  ❌
Cart cleared        ❌
```

The customer should either receive a successfully created order or the entire operation should fail without partial database changes.

---

# 33. Inventory Update

If the existing Product model contains stock:

```text
stock
```

then decrement it after validating availability.

Example:

```text
Before:
stock = 10

Customer orders:
quantity = 3

After:
stock = 7
```

Do this inside the same transaction.

---

# 34. Avoid Negative Stock

Never allow:

```text
stock < 0
```

The service must validate stock before decrementing.

Where practical, make the inventory update itself conditional on sufficient stock so concurrent requests cannot easily oversell inventory.

Follow the capabilities and conventions of the existing Prisma/PostgreSQL implementation.

---

# 35. Concurrency Consideration

Two customers may try to purchase the last item simultaneously.

Example:

```text
Product stock = 1

Customer A → wants 1
Customer B → wants 1
```

The implementation should minimize the possibility of both orders successfully consuming the same stock.

Use a safe transactional/conditional update strategy appropriate for the current Prisma/PostgreSQL schema.

Do not build a complex inventory reservation system on Day 19.

---

# 36. Cart Clearing

Only clear the customer's cart after successful order creation.

Correct:

```text
Create order
Create order items
Update stock
Clear cart
COMMIT
```

Incorrect:

```text
Clear cart
Create order
Create order fails
```

If the transaction rolls back, the cart must remain available.

---

# 37. Cart Ownership

Only operate on the authenticated user's cart.

Never allow:

```text
User A
  ↓
create order from
  ↓
User B's cart
```

The cart query must be scoped by authenticated user.

---

# 38. Order Ownership

The created order must belong to the authenticated user.

Conceptually:

```text
order.userId = req.user.id
```

Never accept the user ID from the client.

---

# 39. Address Snapshot Consideration

Use the existing Address relationship/schema.

For Day 19, the order should at minimum retain a relationship/reference to the selected address if that is how the existing schema is designed.

Do not introduce a full address snapshot system unless the existing database design already requires it.

The important requirement is:

```text
selected address belongs to customer
```

and is associated correctly with the created order.

---

# 40. Controller

The Order controller should be thin.

Conceptually:

```typescript
@Post()
createOrder(req, res) {
  const userId = req.user.id;

  return orderService.createOrder(
    userId,
    req.body
  );
}
```

Do not put the entire order calculation inside the controller.

The business logic belongs in the service.

---

# 41. Order Service

The service should handle:

```text
Validate address
Fetch cart
Validate cart
Validate products
Validate stock
Calculate prices
Create order
Create order items
Update stock
Clear cart
Return order
```

Use the project's established service pattern.

---

# 42. Validation Layer

Use the existing validation system.

Validate at least:

```text
addressId required
addressId correct type
```

Do not allow an empty request body.

Example invalid:

```json
{}
```

---

# 43. Error Handling

Use the project's existing exception/error architecture.

Potential cases:

### Unauthorized

```text
401
```

No valid authentication.

### Invalid address

```text
400 / 404
```

depending on existing conventions.

### Address belongs to another user

```text
4xx
```

### Empty cart

```text
400
```

### Inactive product

```text
400 / 409
```

depending on project convention.

### Insufficient stock

Prefer an appropriate conflict/business-rule error if the project uses one.

### Database failure

Return the project's standard server error.

Never expose:

```text
Prisma stack trace
SQL query
database credentials
```

to the client.

---

# 44. Response Structure

Follow the existing API response convention.

A successful response should contain enough information for Day 20.

Conceptually:

```json
{
  "id": "order-id",
  "status": "PENDING",
  "totalAmount": 350,
  "addressId": "address-id",
  "items": [
    {
      "productId": "product-id",
      "productName": "Rice",
      "price": 100,
      "quantity": 2,
      "subtotal": 200
    }
  ]
}
```

This is an example only.

Use the actual project's response wrapper and field naming.

---

# 45. Do Not Return Sensitive Data

The order response should not expose unnecessary internal information.

Do not return:

* password
* JWT
* internal database credentials
* unrelated user fields
* unnecessary internal metadata

Return only what the mobile application needs.

---

# 46. Prisma Relations

Inspect the actual schema before writing Prisma queries.

Do not assume names such as:

```text
cartItems
orderItems
product
address
```

without checking.

Use the project's actual relation names.

---

# 47. Prisma Schema Changes

Only modify the Prisma schema if genuinely necessary.

Before changing:

```text
prisma/schema.prisma
```

confirm whether Order and OrderItem models already exist.

If changes are required:

1. Make the smallest necessary schema change.
2. Follow existing naming conventions.
3. Preserve existing relationships.
4. Create a proper migration.
5. Do not delete existing data.
6. Do not reset the database.

Never run:

```bash
npx prisma migrate reset
```

as part of Day 19.

---

# 48. Migration Safety

If a migration is required:

```bash
npx prisma migrate dev
```

or use the project's established migration workflow.

Do not manually edit an already-applied migration unless the project workflow explicitly requires it.

Do not delete migrations.

Do not reset the database.

---

# 49. Testing Strategy

Test the Order API independently before connecting it to the mobile UI.

Use the existing project testing approach.

Possible tools:

```text
Postman
Insomnia
REST Client
Jest
Supertest
```

Use whichever is already established in the project.

---

# 50. Test Case 1 — Successful Order

Setup:

```text
User logged in
Cart contains:
Product A × 2
Product B × 1

Valid address exists
Products active
Enough stock
```

Call:

```http
POST /api/orders
```

with:

```json
{
  "addressId": "valid-address-id"
}
```

Expected:

```text
Order created
Order status = PENDING
OrderItems created
Total calculated correctly
Stock reduced
Cart cleared
```

---

# 51. Test Case 2 — Empty Cart

Setup:

```text
Cart = empty
```

Call:

```http
POST /api/orders
```

Expected:

```text
4xx
Order NOT created
```

---

# 52. Test Case 3 — Invalid Address

Use:

```text
non-existing addressId
```

Expected:

```text
4xx
Order NOT created
```

---

# 53. Test Case 4 — Another User's Address

Setup:

```text
User A
User B

Address belongs to User B
```

Authenticate as User A.

Attempt:

```json
{
  "addressId": "user-b-address"
}
```

Expected:

```text
4xx
Order NOT created
```

This is a mandatory authorization test.

---

# 54. Test Case 5 — Insufficient Stock

Example:

```text
Database stock = 2
Cart quantity = 5
```

Expected:

```text
Order NOT created
Stock unchanged
Cart unchanged
```

---

# 55. Test Case 6 — Inactive Product

Setup:

```text
Product is in cart
Product.active = false
```

Expected:

```text
Order NOT created
Cart unchanged
```

---

# 56. Test Case 7 — Price Change

Setup:

```text
Cart was created when price = ₹100

Database current price = ₹120
```

Create order.

Expected:

```text
OrderItem price = ₹120
```

assuming the existing pricing rules use the current database price.

The client must not control the final price.

---

# 57. Test Case 8 — Transaction Rollback

Force an error during order creation after one or more operations have started.

Verify:

```text
No partial order
No partial order items
Stock not incorrectly reduced
Cart not incorrectly cleared
```

The transaction must roll back.

---

# 58. Test Case 9 — Multiple Products

Cart:

```text
Product A:
₹100 × 2 = ₹200

Product B:
₹50 × 3 = ₹150

Product C:
₹25 × 4 = ₹100
```

Expected:

```text
Total = ₹450
```

Verify:

```text
OrderItem A subtotal = ₹200
OrderItem B subtotal = ₹150
OrderItem C subtotal = ₹100
```

---

# 59. Test Case 10 — Unauthenticated Request

Call:

```http
POST /api/orders
```

without authentication.

Expected:

```text
401
```

Do not create an order.

---

# 60. Test Case 11 — Malformed Request

Examples:

```json
{}
```

or:

```json
{
  "addressId": ""
}
```

Expected:

```text
400
```

according to the project's validation conventions.

---

# 61. Test Case 12 — Client Attempts Price Manipulation

Send a malicious request such as:

```json
{
  "addressId": "valid-id",
  "totalAmount": 1
}
```

or any equivalent client-controlled price.

Expected:

```text
Server ignores client price.
```

The final order amount must come from server-side database values.

---

# 62. Important Security Rules

The following must NEVER come from the client:

```text
userId
final total
order status
stock
product price
subtotal
```

The backend controls these values.

Client supplies:

```text
addressId
```

and the server derives everything else.

---

# 63. Logging

Use the existing backend logging system.

Do not log:

* passwords
* JWT tokens
* sensitive user data
* unnecessary full request bodies

Useful logs, if the project convention supports them:

```text
Order creation failed
Insufficient stock
Invalid address
```

Do not add excessive debug logging to production code.

---

# 64. Code Quality

Follow existing project conventions.

Avoid:

```text
any
```

where a proper type is possible.

Avoid:

* duplicated queries
* duplicated validation
* giant controller methods
* giant service methods if they can be cleanly structured
* unnecessary helpers
* unnecessary dependencies
* unrelated refactors

---

# 65. No Mobile Changes Unless Required

Day 19 is primarily backend.

Do not implement the Day 20 Checkout UI.

Do not modify mobile screens unnecessarily.

The API should simply become ready for Day 20.

---

# 66. Recommended Implementation Order

Follow this sequence.

## Step 1 — Inspect

Inspect:

```text
Day 8 auth
Day 10 authorization
Day 11 product
Day 15 cart
Day 17 address
Prisma schema
existing controllers/services/routes
```

---

## Step 2 — Confirm Schema

Determine:

```text
Does Order exist?
Does OrderItem exist?
Does Product have stock?
Does Product have active status?
Does Product have discountPrice?
What are the actual relation names?
```

Do not guess.

---

## Step 3 — Design Order Creation Flow

Establish:

```text
Authenticated user
       ↓
Validate address ownership
       ↓
Fetch user's cart
       ↓
Validate cart
       ↓
Validate products
       ↓
Validate stock
       ↓
Calculate server-side prices
       ↓
Transaction
       ↓
Create order
       ↓
Create order items
       ↓
Update stock
       ↓
Clear cart
       ↓
Return order
```

---

## Step 4 — Schema Changes

Only if necessary.

Create migration if required.

---

## Step 5 — Validation

Implement request validation using the existing project validation approach.

---

## Step 6 — Order Service

Implement the business logic in the service.

---

## Step 7 — Controller

Implement a thin controller.

---

## Step 8 — Route

Register:

```text
POST /api/orders
```

using the existing route structure.

---

## Step 9 — Transaction

Ensure all related write operations are atomic.

---

## Step 10 — Testing

Test success and failure scenarios.

---

## Step 11 — TypeScript / Lint

Run project checks.

---

## Step 12 — Git Review

Run:

```bash
git status
git diff
```

Review every modified file.

---

# 67. Suggested Final Architecture

After Day 19, the backend should conceptually look like:

```text
src/
├── modules/
│   ├── auth/
│   ├── products/
│   ├── categories/
│   ├── cart/
│   ├── addresses/
│   └── orders/
│
├── middleware/
├── prisma/
├── routes/
├── controllers/
├── services/
└── ...
```

However:

**Do not force this folder structure if the existing project uses another structure.**

Follow the actual architecture already established.

---

# 68. Order Service Responsibilities

The order service should be responsible for:

```text
1. Identify customer
2. Validate address
3. Fetch cart
4. Ensure cart is not empty
5. Validate every cart item
6. Validate product active state
7. Validate stock
8. Determine effective price
9. Calculate item subtotal
10. Calculate order total
11. Start transaction
12. Create order
13. Create order items
14. Decrement stock
15. Clear cart
16. Commit transaction
17. Return order
```

---

# 69. Important Transaction Boundary

Prefer having the write operations inside the transaction.

Conceptually:

```text
Validation outside/inside as appropriate
        ↓
BEGIN TRANSACTION
        ↓
Create Order
        ↓
Create OrderItems
        ↓
Update Stock
        ↓
Clear Cart
        ↓
COMMIT
```

If any write fails:

```text
ROLLBACK
```

Do not leave partial state.

---

# 70. Performance Considerations

For the MVP:

* avoid N+1 unnecessary queries
* fetch cart items with required product data
* use Prisma relations appropriately
* avoid repeatedly querying the same product
* keep the transaction focused

Do not prematurely optimize.

Do not introduce caching or Redis for Day 19.

---

# 71. Database Consistency

After successful order creation:

```text
Order exists
OrderItems exist
Product stock reduced
Cart empty
```

These states must be consistent.

After failed order creation:

```text
Order does not exist
OrderItems do not exist
Stock unchanged
Cart unchanged
```

where the failure occurs within the transactional portion.

---

# 72. Day 19 End-to-End Result

The final backend flow should be:

```text
Customer
   │
   ▼
Cart
   │
   ├── Product A × 2
   ├── Product B × 1
   │
   ▼
Selected Address
   │
   ▼
POST /api/orders
   │
   ▼
Authentication
   │
   ▼
Address Ownership Check
   │
   ▼
Cart Validation
   │
   ▼
Product Validation
   │
   ▼
Stock Validation
   │
   ▼
Server-side Price Calculation
   │
   ▼
Prisma Transaction
   │
   ├── Create Order
   ├── Create OrderItems
   ├── Reduce Stock
   └── Clear Cart
   │
   ▼
Created Order
```

---

# 73. Day 19 Definition of Done

Day 19 is complete only when:

### API

* [ ] `POST /api/orders` exists
* [ ] Endpoint requires authentication
* [ ] Request validation works
* [ ] Address validation works
* [ ] Address ownership is enforced
* [ ] Cart is fetched for authenticated user
* [ ] Empty cart is rejected
* [ ] Products are validated
* [ ] Inactive products are rejected
* [ ] Stock is validated
* [ ] Prices are calculated server-side
* [ ] Client price manipulation is ignored
* [ ] Order is created
* [ ] Order starts with `PENDING`
* [ ] Order items are created
* [ ] Purchase-time price is stored
* [ ] Item subtotal is calculated server-side
* [ ] Order total is calculated server-side
* [ ] Stock is safely reduced
* [ ] Cart is cleared after success
* [ ] Database transaction protects the operation
* [ ] Errors are handled correctly

### Security

* [ ] User ID comes from JWT
* [ ] Client cannot choose another user's address
* [ ] Client cannot control final price
* [ ] Client cannot control order status
* [ ] Client cannot control stock

### Testing

* [ ] Successful order
* [ ] Empty cart
* [ ] Invalid address
* [ ] Another user's address
* [ ] Insufficient stock
* [ ] Inactive product
* [ ] Price change
* [ ] Client price manipulation
* [ ] Transaction rollback
* [ ] Multiple products
* [ ] Unauthenticated request
* [ ] Invalid request

### Quality

* [ ] TypeScript passes
* [ ] Lint passes if configured
* [ ] Tests pass if configured
* [ ] No destructive DB operations
* [ ] No unrelated refactoring
* [ ] Git diff reviewed

---

# 74. Final Verification

Before declaring Day 19 complete, verify this exact scenario:

```text
User logs in
     ↓
User has products in cart
     ↓
User has valid address
     ↓
POST /api/orders
     ↓
Backend validates address ownership
     ↓
Backend fetches cart
     ↓
Backend validates products
     ↓
Backend validates stock
     ↓
Backend calculates prices
     ↓
Transaction begins
     ↓
Order created
     ↓
OrderItems created
     ↓
Stock reduced
     ↓
Cart cleared
     ↓
Transaction commits
     ↓
Created order returned
```

Then verify the database state.

---

# 75. Final Cursor Checkpoint

After implementation and verification, Cursor must return exactly one of:

```text
DAY 19 COMPLETE — SAFE TO MOVE TO DAY 20
```

or:

```text
DAY 19 NOT COMPLETE — FIX THE FOLLOWING FIRST
```

If incomplete, provide:

```text
1. Exact issue
2. File
3. Why it is incomplete
4. Required fix
5. Whether the database/schema was affected
```

Do not claim completion if the Order API has not been tested.

---

# 76. Important Cursor Instructions

When implementing Day 19:

> **Inspect the existing codebase before making architectural decisions.**

The following are the primary sources of truth:

```text
1. Existing Days 1–18 implementation
2. prisma/schema.prisma
3. Existing authentication architecture
4. Existing Cart implementation
5. Existing Address implementation
6. Existing Product implementation
7. Existing API/error/validation conventions
8. This DAY_19_IMPLEMENTATION_PLAN.md
```

Do not invent schemas, relation names, response formats, or project patterns when they already exist.

Do not rewrite working Day 15 or Day 17 functionality unnecessarily.

Do not implement future-day functionality.

---

# END OF DAY 19 IMPLEMENTATION PLAN
