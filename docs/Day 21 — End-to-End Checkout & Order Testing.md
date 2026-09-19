# DAY 21 — END-TO-END CHECKOUT & ORDER INTEGRATION TESTING

You are working on the Sainik Mart grocery delivery MVP.

Your task today is to perform a complete end-to-end integration test and stabilization pass for everything implemented during Days 15–20.

This is a TESTING + BUG-FIXING day.

Do NOT introduce major new features.

---

## PROJECT CONTEXT

Sainik Mart is a Blinkit-style grocery delivery MVP.

Current stack:

* React Native
* Expo
* TypeScript
* Node.js
* Express
* TypeScript
* PostgreSQL
* Prisma
* JWT authentication
* bcrypt

Current architecture:

Mobile:

React Native
→ API Client
→ Express REST API

Backend:

Route
→ Authentication Middleware
→ Validation
→ Controller
→ Service
→ Prisma
→ PostgreSQL

---

# DAYS ALREADY IMPLEMENTED

## Day 15 — Cart Backend

Expected APIs:

GET `/api/cart`

POST `/api/cart/items`

PATCH `/api/cart/items/:id`

DELETE `/api/cart/items/:id`

Cart must belong to authenticated user.

Backend is the source of truth for:

* product
* price
* quantity
* subtotal
* stock

---

## Day 16 — Cart Mobile UI

Expected functionality:

* Display cart
* Product image
* Product name
* Price
* Quantity
* Increase quantity
* Decrease quantity
* Remove item
* Subtotal
* Empty cart
* Continue Shopping
* Proceed to Checkout

---

## Day 17 — Address Backend

Expected APIs:

POST `/api/addresses`

GET `/api/addresses`

PATCH `/api/addresses/:id`

DELETE `/api/addresses/:id`

Authenticated users must only access their own addresses.

---

## Day 18 — Address Mobile UI

Expected screens/components:

* AddressListScreen
* AddAddressScreen
* EditAddressScreen
* AddressForm
* AddressCard

Expected functionality:

* View addresses
* Add address
* Edit address
* Delete address
* Select address
* Empty state
* Validation
* Loading/error states

---

## Day 19 — Order Creation Backend

Expected endpoint:

POST `/api/orders`

Expected request conceptually:

```json
{
  "addressId": "address-id"
}
```

The client must NOT be trusted for:

* userId
* totalAmount
* subtotal
* product price
* stock
* order status

Backend must:

1. Get authenticated user from JWT.
2. Validate address exists.
3. Validate address belongs to authenticated user.
4. Fetch user's cart.
5. Reject empty cart.
6. Validate products.
7. Check active/inactive status.
8. Check stock.
9. Calculate prices server-side.
10. Create Order.
11. Create OrderItems.
12. Snapshot product name/price.
13. Reduce stock safely.
14. Clear cart.
15. Perform the write operations inside a Prisma transaction.
16. Return the created order.

Initial order status should be:

`PENDING`

---

## Day 20 — Checkout Mobile UI

Expected flow:

Cart
→ Checkout
→ Address selection/review
→ Cart review
→ Total
→ Place Order
→ POST `/api/orders`
→ Confirmation

Day 20 does NOT include Razorpay.

---

# PRIMARY OBJECTIVE

Verify that the complete customer purchase flow actually works.

The expected flow is:

```text
Login
  ↓
Browse Products
  ↓
Add Product
  ↓
Cart
  ↓
Proceed to Checkout
  ↓
Select/Add Address
  ↓
Review Order
  ↓
Place Order
  ↓
POST /api/orders
  ↓
Backend validates everything
  ↓
Order created
  ↓
OrderItems created
  ↓
Stock reduced
  ↓
Cart cleared
  ↓
Order confirmation
```

---

# STEP 1 — INSPECT THE EXISTING CODEBASE FIRST

Before changing anything, inspect the existing implementation.

Do not assume file names.

Find:

* Prisma schema
* User model
* Product model
* Cart model
* CartItem model
* Address model
* Order model
* OrderItem model
* Auth middleware
* JWT implementation
* Cart routes
* Cart controller
* Cart service
* Address routes
* Address controller
* Address service
* Order routes
* Order controller
* Order service
* Mobile navigation
* Cart screen
* Address screens
* Checkout screen
* API client
* auth handling
* error handling
* validation utilities
* theme/design system

Follow the project's existing conventions.

Do NOT create duplicate architecture.

---

# STEP 2 — VERIFY CART → CHECKOUT

Test the mobile flow:

```text
Product
→ Add to Cart
→ Cart
→ Proceed to Checkout
```

Verify:

* Product appears in cart.
* Correct quantity appears.
* Correct price appears.
* Quantity changes work.
* Removing items works.
* Subtotal updates.
* Checkout receives the correct cart state.
* Empty cart is handled correctly.

If you find a bug, fix it using the existing architecture.

Do not rewrite working code unnecessarily.

---

# STEP 3 — VERIFY ADDRESS FLOW

Test:

```text
Checkout
→ Address
→ Select Address
→ Back to Checkout
```

Verify:

### No address

User should be able to:

```text
Checkout
→ Add Address
→ Save
→ Return to Checkout
```

### Multiple addresses

User should be able to select a different address.

The selected address must be the address sent to:

```text
POST /api/orders
```

### Address ownership

Verify that backend prevents:

```text
User A
   ↓
User B's address
   ↓
POST /api/orders
```

This must be rejected.

---

# STEP 4 — VERIFY CHECKOUT TOTAL

The checkout screen may display the cart total.

However:

IMPORTANT:

The frontend total is only for display.

The backend must calculate the actual order total.

Verify that the mobile app does NOT send trusted:

* subtotal
* totalAmount
* price
* stock

The intended request is approximately:

```json
{
  "addressId": "selected-address-id"
}
```

Follow the actual backend contract if field names differ.

---

# STEP 5 — VERIFY SUCCESSFUL ORDER CREATION

Create a test order with:

* valid authenticated user
* valid address
* one or more cart items
* sufficient stock

Verify:

### Database

Order exists.

Order has:

* correct userId
* correct addressId
* status `PENDING`
* correct total

OrderItems exist.

Each OrderItem contains the appropriate purchase-time snapshot:

* productId
* productName
* price
* quantity
* subtotal

### Inventory

Product stock decreases correctly.

### Cart

Cart becomes empty after successful order creation.

### Mobile

User sees an order confirmation/success state.

Do not implement order history today.

---

# STEP 6 — TEST MULTIPLE PRODUCTS

Create a cart containing at least:

```text
Product A
quantity: 2

Product B
quantity: 1

Product C
quantity: 3
```

Place the order.

Verify:

```text
Order
 ├── Item A
 ├── Item B
 └── Item C
```

Verify every quantity and subtotal.

Verify:

```text
Order total
=
sum of all order item subtotals
```

---

# STEP 7 — TEST EMPTY CART

Attempt:

```text
Cart empty
→ Checkout
→ Place Order
```

Expected:

Order must NOT be created.

The API should return an appropriate 4xx/business error according to the existing project convention.

The mobile app should show an appropriate message.

Do not create an empty order.

---

# STEP 8 — TEST INSUFFICIENT STOCK

Create a situation where:

```text
Database stock = 2

Cart quantity = 5
```

Attempt to place the order.

Expected:

Order is rejected.

Verify:

* no order created
* no OrderItems created
* stock unchanged
* cart remains intact

If Prisma transaction is being used correctly, there must be no partial state.

---

# STEP 9 — TEST INACTIVE PRODUCT

If the product is inactive:

```text
Product.active = false
```

and it remains in the user's cart, attempt checkout.

Expected:

Order is rejected.

Verify:

* no order created
* no stock change
* cart is not incorrectly cleared

Use the project's actual active/inactive field name.

---

# STEP 10 — TEST PRICE CHANGE

This is an important security test.

Scenario:

1. Add product to cart.
2. Product price is ₹100.
3. Change product price in database to ₹150.
4. Attempt to create order.

Verify the backend uses the current valid server-side pricing rules.

Do NOT trust an old client-side price.

Follow the existing project's price/discount implementation.

---

# STEP 11 — TEST CLIENT PRICE MANIPULATION

Attempt to send a malicious request such as:

```json
{
  "addressId": "valid-address",
  "totalAmount": 1,
  "subtotal": 1
}
```

or any equivalent fields supported by the API.

Expected:

The backend must ignore client-supplied financial values.

Order pricing must come from trusted database/product data.

Do not weaken the API contract to support client-controlled totals.

---

# STEP 12 — TEST DUPLICATE PLACE ORDER

Rapidly tap:

```text
Place Order
Place Order
Place Order
```

Verify the mobile UI prevents accidental duplicate submissions.

Expected behavior:

* first submission enters loading state
* Place Order becomes disabled
* additional taps do not create multiple orders

Also inspect the backend behavior.

Do not add a large idempotency system unless required by the existing architecture.

For today's MVP, prevent duplicate UI submissions and verify normal backend behavior.

---

# STEP 13 — TEST NETWORK FAILURE

Simulate:

```text
Mobile
 ↓
POST /api/orders
 ↓
Network failure
```

Verify:

* loading state ends
* user sees an understandable error
* Place Order can be retried
* app does not incorrectly show success
* cart is not incorrectly cleared by frontend
* no misleading order confirmation appears

Follow existing API error conventions.

---

# STEP 14 — TEST AUTHENTICATION FAILURE

Test:

* missing JWT
* invalid JWT
* expired JWT if supported by the implementation

Expected:

Request is rejected.

Mobile should handle the authentication error using the existing auth/navigation mechanism.

Do not create a second authentication system.

---

# STEP 15 — TEST TRANSACTION ROLLBACK

This is particularly important for Day 19.

Verify that order creation is atomic.

Conceptually:

```text
Create Order
Create OrderItems
Reduce Stock
Clear Cart
```

must behave as one transaction.

If any critical database operation fails:

```text
ROLLBACK
```

Expected:

* no partial order
* no partial OrderItems
* stock not incorrectly reduced
* cart not incorrectly cleared

Use Prisma's existing transaction mechanism.

Do not use destructive database commands.

---

# STEP 16 — TEST CONCURRENT STOCK BEHAVIOR

Review the stock update logic.

Make sure it cannot casually produce:

```text
stock = -1
```

For example:

```text
Stock = 1

Request A buys 1
Request B buys 1
```

The implementation should use appropriate transactional/conditional logic according to the existing schema and architecture.

Do not introduce a huge inventory system.

The goal is simply to prevent obvious overselling/negative stock behavior.

---

# STEP 17 — VERIFY DATABASE STATE AFTER SUCCESS

After a successful order, inspect the database.

Verify:

```text
users
products
carts
cart_items
addresses
orders
order_items
```

The expected relationship is:

```text
User
 │
 ├── Address
 │
 ├── Cart
 │
 └── Order
       │
       ├── OrderItem
       ├── OrderItem
       └── ...
```

After successful checkout:

```text
Cart Items = 0
```

and:

```text
Order Items > 0
```

---

# STEP 18 — VERIFY MOBILE NAVIGATION

Test:

```text
Cart
 ↓
Checkout
 ↓
Address
 ↓
Checkout
 ↓
Place Order
 ↓
Success
```

Verify:

* back navigation works
* Android back works
* iOS navigation works
* no duplicate screens
* no stale checkout data
* no broken navigation after saving address

Follow the existing navigation architecture.

---

# STEP 19 — VERIFY LOADING STATES

Check:

### Cart loading

Shows appropriate loading state.

### Address loading

Shows appropriate loading state.

### Checkout loading

Shows appropriate loading state.

### Place Order

Shows submission/loading state.

Prevent:

```text
multiple simultaneous requests
```

---

# STEP 20 — VERIFY EMPTY/ERROR STATES

Verify:

### Empty cart

Show:

```text
Your cart is empty
Continue Shopping
```

or follow the existing design.

### No address

Provide:

```text
Add Address
```

### API failure

Show retry/error state.

### Order failure

Do NOT show order success.

---

# STEP 21 — VERIFY DESIGN SYSTEM

Use the existing:

`design.md`

Do NOT invent a new design system.

Expected key tokens:

```text
Background:
#F6F4EF

Surface:
#FFFFFF

Primary:
#145C38

Primary Dark:
#0C3F24

Accent:
#E85A20

Text:
#1A241C

Secondary:
#6B6560

Danger:
#B91C1C
```

Checkout should be clean and focused.

Do NOT use the Home hero/search/category visual treatment throughout checkout.

Use:

* 16px mobile margins
* 12px gutters
* 12px card radius
* 24px button radius
* minimum 44pt iOS tap target
* minimum 48dp Android tap target

---

# STEP 22 — CHECK API CLIENT USAGE

Verify all mobile requests use the existing central API client.

Do NOT create:

```text
fetch()
```

or Axios instances scattered throughout screens if the project already has a central API client.

Do NOT hardcode:

```text
localhost
```

for physical Android testing.

Reuse the project's environment/API configuration.

---

# STEP 23 — RUN TESTS

Run the project's existing commands.

First inspect `package.json` files to determine the actual commands.

Run where applicable:

```text
npm test
npm run lint
npm run typecheck
```

or the project's equivalent commands.

Do not invent scripts that do not exist.

Fix legitimate issues introduced by Days 15–20.

---

# STEP 24 — REVIEW GIT DIFF

Before finishing:

Inspect:

```text
git status
git diff
```

Make sure:

* only relevant files changed
* no debug logs
* no temporary test code
* no secrets
* no `.env` committed
* no generated junk
* no unrelated refactoring
* no destructive migration
* no database reset commands
* no hardcoded credentials

---

# IMPORTANT SCOPE RULE

Do NOT implement:

* Razorpay
* payment verification
* Razorpay webhook
* FCM
* notifications
* order history
* admin orders
* delivery tracking
* GPS
* maps
* delivery partner
* coupons
* loyalty
* advanced inventory
* Redux
* Zustand
* microservices
* major architectural rewrite

If one of these appears to be missing, report it instead of implementing it.

---

# BUG PRIORITY

If bugs are discovered, classify them:

## P0 — BLOCKER

Examples:

* cannot place order
* wrong user can access another user's address
* client can manipulate order price
* stock becomes negative
* duplicate orders created easily
* transaction leaves partial database state
* cart cleared without successful order

Fix P0 issues.

## P1 — HIGH

Examples:

* checkout navigation broken
* address selection broken
* incorrect total displayed
* order confirmation broken
* important error state broken

Fix P1 issues if practical today.

## P2 — POLISH

Examples:

* spacing issue
* minor text issue
* minor visual inconsistency

Fix only if time remains and it does not risk the core flow.

---

# FINAL VALIDATION CHECKLIST

Before declaring Day 21 complete, verify:

[ ] User can login

[ ] User can browse products

[ ] User can add product to cart

[ ] Cart displays correctly

[ ] Quantity updates work

[ ] Remove item works

[ ] Checkout opens

[ ] Address list works

[ ] Address selection works

[ ] Add address works

[ ] Multiple addresses work

[ ] Selected address is used

[ ] Empty cart handled

[ ] Empty address state handled

[ ] POST `/api/orders` works

[ ] Address ownership enforced

[ ] Empty cart rejected

[ ] Inactive product rejected

[ ] Insufficient stock rejected

[ ] Server-side price calculation verified

[ ] Client price manipulation rejected/ignored

[ ] Order created correctly

[ ] OrderItems created correctly

[ ] Product stock decreases correctly

[ ] Cart clears only after successful order

[ ] Transaction rollback verified

[ ] Duplicate Place Order prevented

[ ] Network error handled

[ ] Authentication error handled

[ ] Mobile loading states work

[ ] Mobile error states work

[ ] Order success state works

[ ] Android back navigation works

[ ] iOS navigation works

[ ] TypeScript passes

[ ] Lint passes if configured

[ ] Existing tests pass if configured

[ ] No secrets committed

[ ] No destructive DB commands

[ ] No unrelated files modified

---

# IMPORTANT FINAL RESPONSE FORMAT

At the end, report the result using exactly one of these formats.

If everything is working:

DAY 21 COMPLETE — SAFE TO MOVE TO DAY 22

Then provide a short summary of:

* tests performed
* bugs fixed
* important integration findings
* test commands/results

If anything important remains:

DAY 21 NOT COMPLETE — FIX THE FOLLOWING FIRST

Then list each remaining issue with:

1. Issue
2. File/location
3. Why it matters
4. Required fix
5. Whether database/schema changes are required

Do NOT declare Day 21 complete if a P0 checkout/order/security/data-integrity issue remains.
