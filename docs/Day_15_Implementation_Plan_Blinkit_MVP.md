# Day 15 — Cart & Cart-Item APIs

## Sprint Context

**Project:** Blinkit-like Grocery Delivery MVP
**Day:** 15 of 42
**Estimated Time:** 3 hours
**Priority:** P0
**Phase:** Cart & Checkout

---

# 1. Day 15 Objective

Implement the complete **backend Cart and Cart-Item APIs**.

At the end of Day 15, an authenticated customer should be able to:

```text
Product
   ↓
Add to Cart
   ↓
View Cart
   ↓
Update Quantity
   ↓
Remove Item
```

The backend should safely handle:

* Authentication
* User/cart ownership
* Product validation
* Quantity validation
* Stock validation
* Product availability
* Cart totals
* Database relationships
* Error handling

The mobile Cart UI will be implemented on **Day 16**.

---

# 2. Day 15 Scope

## In Scope

### Backend

* Cart retrieval
* Add item to cart
* Update cart-item quantity
* Remove cart item
* Cart totals
* Quantity validation
* Product validation
* Stock validation
* User/cart ownership validation
* Authentication protection
* Error handling
* Prisma/database integration
* Testing

## Out of Scope

Do NOT implement:

* Cart UI
* Checkout UI
* Address selection
* Order creation
* Razorpay
* Payment processing
* Coupons
* Discounts/coupon engine
* Delivery fees
* Order tracking
* Notifications
* Admin cart management
* Product recommendations
* Inventory reservation
* Redis
* WebSockets

Those belong to later days.

---

# 3. Existing Architecture

The backend should continue using:

```text
Route
   ↓
Auth Middleware
   ↓
Controller
   ↓
Service
   ↓
Prisma
   ↓
PostgreSQL
```

Do not bypass the service layer by putting all business logic inside controllers.

---

# 4. Existing Database Models

Day 5 should already have the required models.

At minimum:

```text
User
Category
Product
Cart
CartItem
Address
Order
OrderItem
Payment
```

For Day 15, the important relationships are:

```text
User
 │
 └── Cart
      │
      └── CartItem
             │
             └── Product
```

Conceptually:

```text
User 1 ───── 1 Cart
Cart 1 ───── N CartItem
Product 1 ── N CartItem
```

Inspect the existing Prisma schema before making changes.

Do not recreate models that already exist.

---

# 5. Inspect Existing Code First

Before implementing anything, inspect:

```text
prisma/schema.prisma

src/routes/
src/controllers/
src/services/
src/middleware/
src/validators/
src/types/
src/config/
```

Specifically check:

* Existing Cart model
* Existing CartItem model
* Product model
* User model
* Prisma relationships
* Authentication middleware
* Request user typing
* Error handling
* Validation system
* Response format
* Existing route conventions
* Existing controller/service patterns

Preserve the existing project architecture.

Do not rewrite working authentication or catalog code.

---

# 6. Cart API Endpoints

Implement:

```http
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:id
DELETE /api/cart/items/:id
```

All endpoints must require authentication.

---

# 7. GET Cart

## Endpoint

```http
GET /api/cart
```

Authentication:

```text
Required
```

The backend should identify the user from the JWT.

Do NOT accept:

```text
userId
```

from the client as the source of ownership.

Use the authenticated user:

```text
req.user.id
```

---

# 8. GET Cart Flow

Expected:

```text
GET /api/cart
      ↓
JWT validation
      ↓
Get authenticated user ID
      ↓
Find user's cart
      ↓
Load cart items
      ↓
Load product information
      ↓
Calculate totals
      ↓
Return cart
```

Example response concept:

```json
{
  "cart": {
    "id": "cart-id",
    "items": [
      {
        "id": "item-id",
        "product": {
          "id": "product-id",
          "name": "Milk 1L",
          "price": 70,
          "discountPrice": 65
        },
        "quantity": 2,
        "lineTotal": 130
      }
    ],
    "subtotal": 130
  }
}
```

Adapt this to the project's existing response format.

Do not blindly introduce a new response structure if one already exists.

---

# 9. Empty Cart

If the user has no cart or the cart has no items:

Return a valid empty-cart response.

For example:

```json
{
  "cart": {
    "items": [],
    "subtotal": 0
  }
}
```

Do not treat an empty cart as a server error.

The mobile application on Day 16 will use this response to display an empty-cart state.

---

# 10. POST Add Item

## Endpoint

```http
POST /api/cart/items
```

Authentication:

```text
Required
```

Example request:

```json
{
  "productId": "product-id",
  "quantity": 2
}
```

---

# 11. Add Item Flow

```text
POST /api/cart/items
       ↓
JWT authentication
       ↓
Validate request
       ↓
Find product
       ↓
Check product availability
       ↓
Check stock
       ↓
Find user's cart
       ↓
Existing CartItem?
    ┌───────┴───────┐
   YES             NO
    ↓               ↓
Update quantity   Create item
    └───────┬───────┘
            ↓
       Return cart/item
```

---

# 12. Product Validation

Before adding a product:

Verify that:

* Product exists.
* Product is active.
* Product is available for customers.
* Product has sufficient stock.

If product does not exist:

```text
404 Not Found
```

If product is inactive/unavailable:

Return an appropriate client error.

Do not allow inactive products to be added to a customer's cart.

---

# 13. Quantity Validation

Quantity must be:

```text
integer
>
0
```

Valid:

```text
1
2
5
10
```

Invalid:

```text
0
-1
-5
1.5
"2"
null
undefined
```

Validation should happen before database modification.

---

# 14. Stock Validation

Suppose:

```text
Product stock = 5
```

The customer already has:

```text
Quantity in cart = 3
```

They attempt:

```text
Add quantity = 4
```

The resulting quantity would be:

```text
3 + 4 = 7
```

Since:

```text
7 > 5
```

the request must be rejected.

Do not allow the cart to exceed available stock.

---

# 15. Existing Cart Item

If the product already exists in the user's cart:

```text
Product A × 2
```

and the user sends:

```json
{
  "productId": "A",
  "quantity": 3
}
```

The intended behavior should be clearly defined.

For this MVP, use:

```text
Existing quantity + requested quantity
```

Therefore:

```text
2 + 3 = 5
```

Then validate the resulting quantity against stock.

Do not accidentally create duplicate CartItems for the same product.

---

# 16. Prevent Duplicate Cart Items

A user's cart should contain at most one CartItem for a particular product.

Conceptually:

```text
Cart
 ├── Milk × 2
 ├── Bread × 1
 └── Eggs × 6
```

Not:

```text
Cart
 ├── Milk × 2
 ├── Milk × 3
 └── Bread × 1
```

Use the existing Prisma schema constraints/logic where possible.

If the database schema already supports a unique cart/product combination, preserve it.

If it does not, assess whether adding the appropriate constraint is safe.

Do not perform destructive migrations.

---

# 17. PATCH Cart Item

## Endpoint

```http
PATCH /api/cart/items/:id
```

Example:

```json
{
  "quantity": 5
}
```

Authentication:

```text
Required
```

---

# 18. Update Quantity Flow

```text
PATCH /api/cart/items/:id
       ↓
JWT authentication
       ↓
Validate quantity
       ↓
Find CartItem
       ↓
Verify CartItem belongs to authenticated user
       ↓
Find product
       ↓
Verify product is available
       ↓
Check stock
       ↓
Update quantity
       ↓
Return updated cart/item
```

---

# 19. User Ownership Security

This is critical.

User A must never be able to modify User B's cart.

For:

```http
PATCH /api/cart/items/:id
```

do NOT simply search:

```text
CartItem where id = :id
```

and update it.

Verify the item belongs to the authenticated user's cart.

Conceptually:

```text
JWT User ID
     ↓
User's Cart
     ↓
CartItem
```

If the CartItem belongs to another user:

```text
403 Forbidden
```

or an appropriate not-found response according to the existing security convention.

Never expose another user's cart information.

---

# 20. DELETE Cart Item

## Endpoint

```http
DELETE /api/cart/items/:id
```

Authentication:

```text
Required
```

Flow:

```text
DELETE /api/cart/items/:id
       ↓
JWT authentication
       ↓
Find CartItem
       ↓
Verify ownership
       ↓
Delete item
       ↓
Return updated cart/result
```

---

# 21. Delete Non-Existing Item

If the item doesn't exist:

Return:

```text
404 Not Found
```

or use the project's established error convention.

Do not return a successful deletion if the item never existed unless that behavior is intentionally part of the API design.

---

# 22. Cart Totals

The backend should calculate the cart subtotal.

For each item:

```text
lineTotal = effectivePrice × quantity
```

Then:

```text
subtotal = sum(all lineTotals)
```

For example:

```text
Milk
₹65 × 2 = ₹130

Bread
₹40 × 1 = ₹40

Eggs
₹60 × 2 = ₹120

Subtotal = ₹290
```

---

# 23. Effective Product Price

If the product has a valid discount price:

```text
discountPrice
```

use the appropriate effective price.

Otherwise use:

```text
price
```

The exact rule should follow the existing Product model/business logic.

Do not accept a price from the mobile application.

For example, never trust:

```json
{
  "productId": "...",
  "quantity": 2,
  "price": 1
}
```

The client must NOT determine the cart price.

The backend must fetch the product price from PostgreSQL.

---

# 24. Price Security

Never trust:

```text
client price
client subtotal
client total
```

The server should calculate:

```text
Product DB price
      ↓
Effective price
      ↓
Quantity
      ↓
Line total
      ↓
Subtotal
```

This is especially important because checkout/payment will be implemented later.

---

# 25. Cart Ownership

Every cart operation must use:

```text
Authenticated User ID
```

not:

```text
Request body userId
```

or:

```text
Query parameter userId
```

Avoid APIs such as:

```http
GET /api/cart?userId=123
```

for ownership.

The JWT determines the current customer.

---

# 26. Authentication Matrix

| Endpoint                   |             CUSTOMER |                    ADMIN |
| -------------------------- | -------------------: | -----------------------: |
| GET /api/cart              |              Allowed | Allowed if authenticated |
| POST /api/cart/items       |              Allowed | Allowed if authenticated |
| PATCH /api/cart/items/:id  | Allowed for own cart |     Allowed for own cart |
| DELETE /api/cart/items/:id | Allowed for own cart |     Allowed for own cart |

The important security rule is:

```text
Authenticated user → own cart only
```

Do not create special admin access to other customers' carts as part of Day 15.

---

# 27. Validation Layer

Use the project's existing validation architecture.

If Zod or another validation library already exists, reuse it.

Potential DTO/request validation:

```text
AddCartItem:
- productId required
- quantity required
- quantity integer
- quantity > 0

UpdateCartItem:
- quantity required
- quantity integer
- quantity > 0
```

Do not duplicate validation logic unnecessarily across controllers and services.

Business rules such as stock availability should remain in the service layer.

---

# 28. Controller Responsibilities

Controllers should primarily:

1. Read request.
2. Get authenticated user.
3. Validate/receive validated input.
4. Call service.
5. Return response.

Avoid putting large business logic in controllers.

Bad:

```text
Controller
 ├── Find product
 ├── Check stock
 ├── Calculate price
 ├── Find cart
 ├── Update cart
 ├── Calculate subtotal
 └── Handle all errors
```

Prefer:

```text
Controller
     ↓
CartService
     ↓
Prisma
```

---

# 29. Cart Service Responsibilities

The Cart Service should handle:

* Find/create user cart
* Find product
* Check active status
* Check stock
* Find cart item
* Verify ownership
* Add quantity
* Update quantity
* Remove item
* Calculate totals
* Return appropriate domain errors

Keep business rules centralized.

---

# 30. Prisma Queries

Use Prisma efficiently.

Avoid unnecessary queries.

For GET cart, retrieve the necessary relations in a sensible query rather than repeatedly querying every product individually.

Avoid an N+1 query pattern such as:

```text
Get cart
 ↓
For each item:
  query product
```

Prefer appropriate Prisma relation loading.

---

# 31. Concurrency Consideration

For Day 15 MVP, implement straightforward stock validation.

However, recognize that:

```text
Check stock
   ↓
Update cart
```

is not an inventory reservation.

The cart does NOT reserve inventory.

Two customers may temporarily have the same product in their carts.

Final stock validation must also happen during order/checkout creation later.

Do not implement inventory reservation today.

---

# 32. Error Handling

Use the existing centralized error handling.

Expected cases:

```text
401 Unauthorized
403 Forbidden
404 Not Found
400 Bad Request
422 Validation Error
500 Internal Server Error
```

Use the project's existing conventions.

Do not expose:

* Stack traces
* Prisma internals
* Database credentials
* SQL details
* JWT secrets

in production responses.

---

# 33. API Response Consistency

Use the existing project's response format.

If the project already has:

```json
{
  "success": true,
  "data": {}
}
```

continue using it.

Do not introduce a second response convention.

---

# 34. Suggested File Structure

Follow the existing structure.

If the project uses this architecture:

```text
src/
├── controllers/
│   └── cart.controller.ts
│
├── services/
│   └── cart.service.ts
│
├── routes/
│   └── cart.routes.ts
│
├── validators/
│   └── cart.validator.ts
│
├── types/
│   └── ...
│
└── middleware/
    └── ...
```

Use it.

Do not create a completely different architecture for Cart.

---

# 35. Route Registration

Ensure:

```http
/api/cart
```

is registered in the main Express application.

Expected:

```text
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:id
DELETE /api/cart/items/:id
```

All should use authentication middleware.

---

# 36. Testing — Authentication

Test:

```text
No JWT → 401
Invalid JWT → 401
Valid JWT → allowed
```

---

# 37. Testing — GET Cart

Test:

```text
New user → empty cart
Existing user → existing cart
User with items → correct items
Correct subtotal → correct
```

---

# 38. Testing — Add Item

Test:

```text
Valid product + quantity → success
Non-existent product → error
Inactive product → error
Quantity = 0 → error
Negative quantity → error
Decimal quantity → error
Quantity greater than stock → error
Existing product → quantity increases
```

---

# 39. Testing — Update Quantity

Test:

```text
Valid quantity → success
Quantity = 0 → validation error
Negative quantity → validation error
Decimal quantity → validation error
Quantity > stock → error
Non-existent item → 404
Another user's item → rejected
```

---

# 40. Testing — Delete Item

Test:

```text
Own cart item → deleted
Non-existent item → 404
Another user's cart item → rejected
```

---

# 41. Testing — Price Calculation

Create products such as:

```text
Product A
price = 100
discountPrice = 80

Product B
price = 50
discountPrice = null
```

Add:

```text
A × 2
B × 3
```

Expected:

```text
A = 80 × 2 = 160
B = 50 × 3 = 150

Subtotal = 310
```

Verify the backend calculates this.

Do not send the expected total from the client.

---

# 42. Testing — User Isolation

Create:

```text
Customer A
Customer B
```

Customer A:

```text
Add Product A
```

Get Customer A cart.

Verify Product A appears.

Then authenticate as Customer B.

Verify:

```text
Customer B → GET /api/cart
```

does NOT return Customer A's items.

Then attempt:

```text
Customer B → PATCH Customer A's cart item
```

Expected:

```text
Rejected
```

Then:

```text
Customer B → DELETE Customer A's cart item
```

Expected:

```text
Rejected
```

This is one of the most important Day 15 security tests.

---

# 43. Testing — Database

Verify after operations:

```text
User
 ↓
Cart
 ↓
CartItem
 ↓
Product
```

Database records should remain consistent.

Check that:

* Cart belongs to correct user.
* CartItem belongs to correct cart.
* CartItem references correct product.
* Quantity is correct.
* No duplicate product entries are created in the same cart.

---

# 44. Testing — API Contract

Verify all four endpoints:

```text
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:id
DELETE /api/cart/items/:id
```

Use the same response/error conventions used by Days 8–14.

The API should be ready for Day 16 mobile integration.

---

# 45. TypeScript Validation

Run:

```bash
npx tsc --noEmit
```

Fix all genuine errors.

Do not use:

```ts
any
```

as a shortcut.

Pay special attention to:

* `req.user`
* Prisma relations
* nullable product fields
* discountPrice
* cart item IDs
* authenticated user ID
* API response types

---

# 46. Lint

If configured:

```bash
npm run lint
```

Fix relevant issues.

Do not perform unrelated application-wide refactoring.

---

# 47. Prisma Validation

Run:

```bash
npx prisma generate
```

If there is a legitimate schema/migration change:

* inspect the existing migration history first
* create a normal migration
* never reset the database

Do not run:

```bash
npx prisma migrate reset
```

---

# 48. Database Safety

NEVER run:

```sql
DROP DATABASE
DROP TABLE
TRUNCATE
```

Do not delete existing data.

Do not reset the database to make tests pass.

Preserve all existing Day 8–14 work.

---

# 49. Security Audit

Search for:

```text
console.log
password
token
JWT
Authorization
userId
```

Ensure:

* Passwords aren't logged.
* JWTs aren't logged.
* Authorization headers aren't logged.
* Client-provided user IDs aren't trusted for cart ownership.
* Users cannot access other users' carts.
* Prices aren't trusted from the client.

---

# 50. No Client Price Trust

The mobile app should only send:

```json
{
  "productId": "...",
  "quantity": 2
}
```

It should NOT send:

```json
{
  "productId": "...",
  "quantity": 2,
  "price": 50,
  "subtotal": 100,
  "total": 100
}
```

The server calculates the price.

---

# 51. No Cart UI Today

Do not create or modify the React Native Cart screen as part of Day 15 unless a tiny existing integration change is absolutely necessary.

Day 16 will implement:

```text
GET /api/cart
      ↓
CartScreen
```

with:

* Product items
* Quantity controls
* Remove
* Subtotal
* Empty state
* Loading state
* Error state

---

# 52. No Checkout Today

Do not implement:

```text
Checkout
Address selection
Delivery fee
Order creation
Payment
Razorpay
```

These are later tasks.

---

# 53. 3-Hour Timebox

## 0:00–0:25 — Inspect

Review:

* Prisma schema
* Cart model
* CartItem model
* Product model
* Auth middleware
* Controllers
* Services
* Routes
* Validators
* Error handling

Understand the existing architecture.

---

## 0:25–1:20 — Implement Cart APIs

Implement:

```text
GET /api/cart
POST /api/cart/items
PATCH /api/cart/items/:id
DELETE /api/cart/items/:id
```

Add:

* Authentication
* Validation
* Ownership
* Product checks
* Stock checks
* Quantity logic
* Price calculation

---

## 1:20–2:15 — Testing

Test:

* Empty cart
* Add
* Add existing product
* Update
* Delete
* Invalid quantities
* Stock
* Inactive products
* Invalid product
* Unauthorized requests
* User isolation
* Totals

---

## 2:15–2:40 — Cleanup

Fix:

* TypeScript
* Lint
* Duplicate code
* Debug logs
* Error handling
* Response consistency

---

## 2:40–3:00 — Final Validation

Run:

```bash
npx prisma generate
npx tsc --noEmit
npm run build
npm run lint
```

Use the project's actual scripts if they differ.

Then:

```bash
git status
git diff
```

Review all changes.

---

# 54. Definition of Done

## Cart API

* [ ] GET cart works.
* [ ] Add item works.
* [ ] Update quantity works.
* [ ] Delete item works.
* [ ] Empty cart works.

## Validation

* [ ] Quantity must be integer.
* [ ] Quantity must be > 0.
* [ ] Product must exist.
* [ ] Product must be active.
* [ ] Stock is checked.
* [ ] Duplicate cart items are prevented.

## Security

* [ ] All endpoints require authentication.
* [ ] User ID comes from JWT.
* [ ] Users can access only their own cart.
* [ ] User A cannot modify User B's cart.
* [ ] Prices are never trusted from client.

## Calculation

* [ ] Line totals are calculated server-side.
* [ ] Subtotal is calculated server-side.
* [ ] Discount price is handled correctly.
* [ ] Database product price is authoritative.

## Code Quality

* [ ] Route/controller/service separation maintained.
* [ ] Validation maintained.
* [ ] Centralized error handling maintained.
* [ ] No unnecessary dependencies.
* [ ] No `any` shortcuts.
* [ ] No sensitive logs.
* [ ] TypeScript passes.
* [ ] Build passes.
* [ ] Lint passes if configured.

## Database

* [ ] Existing data preserved.
* [ ] No destructive commands.
* [ ] Prisma generation works.
* [ ] Relations remain correct.

## Scope

* [ ] No Cart UI.
* [ ] No Checkout.
* [ ] No Orders.
* [ ] No Razorpay.
* [ ] No Notifications.
* [ ] No Admin Dashboard.
* [ ] No later-day features.

---

# 55. Final API Contract

At the end of Day 15, the mobile application should be able to consume:

```text
GET /api/cart

POST /api/cart/items
{
  "productId": "...",
  "quantity": 2
}

PATCH /api/cart/items/:id
{
  "quantity": 5
}

DELETE /api/cart/items/:id
```

Authentication:

```http
Authorization: Bearer <JWT>
```

The server determines:

```text
Current User
     ↓
Current Cart
     ↓
Cart Items
     ↓
Products
     ↓
Prices
     ↓
Subtotal
```

---

# 56. Day 15 Final Architecture

```text
                 React Native
                 Day 16
                     │
                     │ HTTP
                     ▼
             ┌───────────────┐
             │ Express API   │
             └───────┬───────┘
                     │
               JWT Middleware
                     │
                     ▼
             Cart Controller
                     │
                     ▼
               Cart Service
                     │
                     ▼
                  Prisma
                     │
                     ▼
               PostgreSQL
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
       User         Cart       Product
                      │
                      ▼
                  CartItem
```

---

# 57. Day 15 → Day 16

Day 15:

```text
Backend
   ↓
Cart APIs
   ↓
Testing
   ↓
READY
```

Day 16:

```text
React Native
   ↓
Cart Screen
   ↓
GET /api/cart
   ↓
POST /api/cart/items
   ↓
PATCH /api/cart/items/:id
   ↓
DELETE /api/cart/items/:id
```

---

# 58. Final Checkpoint

Do not move to Day 16 until this works:

```text
Customer Login
      ↓
Browse Product
      ↓
POST /api/cart/items
      ↓
Product added
      ↓
GET /api/cart
      ↓
Correct item + quantity + subtotal
      ↓
PATCH quantity
      ↓
Correct updated subtotal
      ↓
DELETE item
      ↓
Cart becomes empty
```

And:

```text
Customer A
     ↓
Own Cart
     ↓
Allowed

Customer B
     ↓
Customer A's Cart Item
     ↓
REJECTED
```

The most important principle for Day 15 is:

> **The cart belongs to the authenticated user, and the server is the source of truth for product availability, price, quantity validation, and totals.**

---

# 59. Final Cursor Audit

At the end of implementation, perform a full self-audit.

Report:

```text
DAY 15 AUDIT

Cart GET:
PASS / FAIL

Add Cart Item:
PASS / FAIL

Update Cart Item:
PASS / FAIL

Delete Cart Item:
PASS / FAIL

Quantity Validation:
PASS / FAIL

Product Validation:
PASS / FAIL

Stock Validation:
PASS / FAIL

Product Availability:
PASS / FAIL

Cart Ownership:
PASS / FAIL

User Isolation:
PASS / FAIL

Duplicate Cart Items:
PASS / FAIL

Server-Side Price Calculation:
PASS / FAIL

Subtotal Calculation:
PASS / FAIL

Authentication:
PASS / FAIL

Authorization:
PASS / FAIL

Error Handling:
PASS / FAIL

TypeScript:
PASS / FAIL

Lint:
PASS / FAIL

Build:
PASS / FAIL

Database Safety:
PASS / FAIL

Scope Compliance:
PASS / FAIL
```

Then report:

```text
FILES CHANGED
- ...
- ...

TESTS PERFORMED
- ...
- ...

BUGS FIXED
- ...
- ...

REMAINING ISSUES
- ...
- ...
```

---

# 60. Final Decision

Only if all critical requirements pass:

```text
DAY 15 COMPLETE — SAFE TO MOVE TO DAY 16
```

If important problems remain:

```text
DAY 15 NOT COMPLETE — FIX THE FOLLOWING FIRST
```

List the exact blockers.

Do not claim completion merely because the code compiles.

The Cart APIs must actually work against PostgreSQL and enforce user ownership and stock/quantity rules.

---

# Final Principle

Day 15 establishes the backend foundation for the shopping cart.

Keep it simple:

```text
Product
   ↓
Add
   ↓
Cart
   ↓
Update
   ↓
Remove
```

with:

```text
Authentication
+
Ownership
+
Validation
+
Stock Check
+
Server-side Pricing
+
Correct Database Relations
```

Then Day 16 can safely build the customer-facing Cart UI on top of these APIs.
