# Day 27 — Admin Order Management

## Objective

Implement the **Admin Order Management** functionality for the Sainik Mart admin dashboard.

After Day 27, an authenticated admin should be able to:

* view customer orders
* see order summary information
* search/filter orders using existing backend capabilities
* paginate orders
* open an order detail view
* see order items and purchase-time prices
* see delivery address associated with the order
* see current order status
* update order status
* handle loading, empty, error and mutation states

The existing customer order functionality from Days 22–23 must continue working.

---

# 1. IMPORTANT — INSPECT FIRST

Before changing anything, inspect the existing codebase.

## Backend

Inspect:

* Prisma schema
* User model
* Order model
* OrderItem model
* Address model
* OrderStatus enum
* existing customer order routes
* order controller
* order service
* authentication middleware
* admin authorization middleware from Day 24
* validation system
* error handling
* response format
* pagination implementation
* existing tests

Determine exactly how the current order system works.

Do NOT assume field names.

---

## Admin frontend

Inspect:

* AdminLayout
* AdminSidebar
* AdminHeader
* admin routing
* API client
* authentication
* admin authorization
* existing `/admin/orders` page
* reusable table components
* reusable modal/dialog components
* status badges
* forms
* pagination
* toast/notification system
* loading/error components

Reuse existing components wherever possible.

Do not create duplicate architecture.

---

# 2. DAY 27 TARGET

The final admin flow should look like:

```text
Admin Login
     ↓
Admin Authorization
     ↓
Admin Dashboard
     ↓
Orders
     ↓
Order List
     ↓
Select Order
     ↓
Order Details
     ↓
Update Status
```

---

# 3. ADMIN ORDER LIST

Expected route:

```text
/admin/orders
```

Display real orders from PostgreSQL.

Do NOT use mock/static orders.

At minimum show:

* Order ID
* customer information if available/appropriate
* order date
* total amount
* status
* item count if available
* action/view button

Use the actual API response shape.

Do not invent fields.

---

# 4. ADMIN ORDER API

First determine whether an admin order-list API already exists.

If it does:

* reuse it
* extend only if necessary

If it does not exist, implement an admin-protected endpoint following the existing backend architecture.

Preferred structure:

```text
Route
  ↓
authenticate
  ↓
requireAdmin
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

Do not put business logic directly in the route.

Do not duplicate authentication.

---

# 5. ORDER LIST ENDPOINT

If a new endpoint is required, use a clear admin-specific endpoint such as:

```text
GET /api/admin/orders
```

Use existing pagination conventions.

Example conceptually:

```text
GET /api/admin/orders?page=1&limit=10
```

Only use the actual parameter names already established in the project.

Response should provide enough information for the admin list.

Possible conceptual structure:

```json
{
  "orders": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

But use the project's existing response format if one already exists.

---

# 6. ORDER SORTING

Orders should normally appear newest first.

Prefer:

```text
createdAt DESC
```

unless the existing backend uses another established convention.

Do not introduce a completely new sorting system unless needed.

---

# 7. ORDER SEARCH

Inspect whether the existing order API already supports search.

If practical, support searching by relevant existing fields such as:

* order ID
* customer name
* customer email
* customer phone

Do not search fields that are not available.

Prefer server-side search when the backend already supports it.

Do not fetch the entire order database and perform all searching only in the frontend.

If search is not currently required by the backend architecture, keep it simple rather than introducing a large search abstraction.

---

# 8. STATUS FILTER

Allow admins to filter orders by status.

Use the existing `OrderStatus` enum.

Expected statuses:

```text
PENDING
CONFIRMED
PACKING
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

Do not create additional statuses unless the existing schema already contains them.

Example UI:

```text
Status:
[All ▼]
[PENDING]
[CONFIRMED]
[PACKING]
[OUT_FOR_DELIVERY]
[DELIVERED]
[CANCELLED]
```

Use the backend filter if available.

---

# 9. PAGINATION

Reuse the existing pagination implementation.

The admin should be able to navigate through large order lists.

Handle:

* page changes
* empty results
* search + pagination
* status filter + pagination

When filters/search change, reset to the appropriate page.

Do not create a second pagination component if one already exists.

---

# 10. ORDER DETAILS

Create or complete the admin order details view.

Possible route:

```text
/admin/orders/:id
```

or use the project's existing modal/detail pattern.

Display:

## Order information

* Order ID
* created date
* current status
* total amount

## Customer information

Only display fields actually returned by the backend and appropriate for admin use.

For example:

* name
* email
* phone

## Delivery address

Display the address associated with the order.

IMPORTANT:

The order's address should represent the address associated with the order at purchase time.

Do not automatically replace it with the customer's current saved address.

---

# 11. ORDER ITEMS

Display every item in the order.

For each item show, where available:

* product name snapshot
* quantity
* price at purchase
* subtotal

Example:

```text
Rice 5kg
₹450 × 2
₹900

Milk 1L
₹60 × 3
₹180
```

Use the `OrderItem` purchase-time values.

DO NOT fetch the current Product price and use that to display historical order pricing.

Historical order information must remain stable even if the product's current price changes.

---

# 12. TOTAL

Display the order total returned/calculated by the backend.

Do not recalculate the trusted order total from current product prices.

The historical order should remain consistent.

---

# 13. ORDER STATUS UPDATE

This is the primary mutation for Day 27.

Allow an admin to update order status.

If an endpoint already exists, reuse it.

If not, implement an admin-protected endpoint following existing conventions.

A likely endpoint is:

```text
PATCH /api/admin/orders/:id/status
```

Possible request:

```json
{
  "status": "CONFIRMED"
}
```

Use the actual project's conventions.

---

# 14. STATUS VALIDATION

The backend must validate status values.

Reject arbitrary values such as:

```text
HACKED
COMPLETED_RANDOM
ADMIN
123
```

Only valid `OrderStatus` values may be accepted.

Frontend validation is useful for UX, but backend validation is mandatory.

---

# 15. STATUS TRANSITION RULES

Inspect the current application architecture before enforcing transition rules.

The normal MVP flow is:

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

Cancellation may be:

```text
PENDING → CANCELLED
```

Potentially:

```text
CONFIRMED → CANCELLED
```

only if the existing business logic permits it.

Do NOT invent complicated workflow rules.

However, prevent obviously invalid transitions if the project already expects controlled status progression.

Examples to consider:

```text
DELIVERED → PENDING
DELIVERED → PACKING
CANCELLED → CONFIRMED
CANCELLED → PACKING
```

Do not silently allow nonsensical backward transitions.

If the current project does not have transition rules, implement the smallest reasonable validation required for the MVP.

Document the behavior.

---

# 16. STATUS UPDATE SECURITY

Only an authenticated admin may change order status.

Required behavior:

```text
No token
    ↓
401

Customer token
    ↓
403

Admin token
    ↓
Allowed
```

Do not rely on frontend route protection.

The backend must enforce:

```text
authenticate
    ↓
requireAdmin
    ↓
update order
```

Never trust a client-provided role.

---

# 17. ORDER OWNERSHIP / ADMIN ACCESS

Unlike customer order APIs, admin order APIs are intentionally allowed to access orders belonging to any customer.

Customer:

```text
GET /api/orders/:id
```

must remain restricted to that customer.

Admin:

```text
GET /api/admin/orders/:id
```

may access the order if the authenticated user is an admin.

Do not weaken the existing customer ownership checks.

---

# 18. ORDER NOT FOUND

If an admin requests a non-existent order:

return the project's standard not-found error.

Do not return:

```text
500 Internal Server Error
```

for a normal missing order.

Use the existing error handling convention.

---

# 19. INVALID ORDER ID

Handle malformed IDs using the existing validation/error system.

Do not allow malformed input to cause an unhandled Prisma/database exception.

Return the project's standard controlled client error.

---

# 20. CUSTOMER REGRESSION

After implementing admin order management, verify:

```text
Customer
   ↓
My Orders
   ↓
Order Details
```

still works.

Customer must still only see their own orders.

Test:

```text
Customer A → Order A
Customer A → cannot access Order B
Customer B → Order B
```

Admin must be able to access both.

---

# 21. ADMIN UI

Use the existing admin design system.

Do not copy the mobile Home hero.

The page should feel like a professional admin dashboard.

Recommended structure:

```text
------------------------------------------------
Admin Header
------------------------------------------------
Sidebar | Orders
        |
        | Search
        | Status Filter
        |
        | Order Table
        |
        | Pagination
------------------------------------------------
```

Order table:

```text
Order ID
Customer
Date
Items
Total
Status
Action
```

Use existing table/card components.

---

# 22. STATUS BADGES

Use the existing badge component if available.

If not, create a small reusable status badge component.

It should clearly distinguish statuses such as:

```text
PENDING
CONFIRMED
PACKING
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

Do not hardcode inconsistent styles throughout multiple components.

---

# 23. UPDATE STATUS UX

Do not allow accidental status changes.

Use an appropriate interaction such as:

```text
Status: PENDING ▼
```

or:

```text
[Update Status]
```

If changing status is destructive or consequential, provide a confirmation dialog.

Example:

```text
Change order status?

PENDING → CONFIRMED

[Cancel] [Confirm]
```

Prevent duplicate submissions.

Disable the control while the request is in progress.

---

# 24. LOADING STATES

Implement loading states for:

* order list
* order detail
* status update

Use the existing loading components.

Do not create unnecessary new loading architecture.

---

# 25. EMPTY STATES

If there are no orders:

```text
No orders found.
```

If filters produce no results:

```text
No orders match your filters.
```

Do not show fake orders.

---

# 26. ERROR STATES

If an API request fails:

* display a useful error
* preserve the existing UI where possible
* provide Retry when appropriate

Do not expose raw stack traces to the admin user.

Use the project's existing error handling.

---

# 27. RESPONSIVE UI

Admin order management should work on:

* desktop
* laptop
* tablet
* smaller screens

If the existing table becomes too wide on mobile/tablet, use the existing responsive card/list pattern.

Do not create a completely separate UI architecture.

---

# 28. API CLIENT

Reuse the existing API client.

Do NOT create another:

```text
api.ts
axios.ts
fetchClient.ts
```

if one already exists.

Reuse:

* base URL
* auth token
* interceptors
* error handling

---

# 29. AUTHENTICATION

Reuse Day 24/25 authentication and authorization.

Do not create:

* separate admin JWT
* separate login system
* duplicate token storage
* duplicate auth context

---

# 30. STATE MANAGEMENT

Do not introduce Redux/Zustand/etc. for this feature.

Use the existing architecture.

If the project already uses a state management solution, reuse it.

---

# 31. DATABASE SAFETY

Do NOT:

* reset database
* delete migrations
* drop tables
* recreate database
* delete existing orders
* modify historical OrderItems
* modify historical order totals
* modify historical purchase prices

Order history is critical.

An admin status update should only change the order's status and relevant status metadata if such fields already exist.

---

# 32. PAYMENT SCOPE

Do NOT implement Razorpay today.

Do not add:

* payment verification
* webhook handling
* refunds
* payment capture
* payment reconciliation

Those belong to the payment phase.

If the order contains existing payment information, display it only if already available and useful.

Do not redesign the payment architecture.

---

# 33. NOTIFICATIONS

Do NOT implement FCM notifications today.

Changing:

```text
PENDING → CONFIRMED
```

does NOT need to send a notification as part of Day 27.

FCM is handled later.

---

# 34. DELIVERY TRACKING

Do NOT implement:

* driver tracking
* GPS
* maps
* live location
* delivery partner application
* route optimization

Day 27 only manages the order status.

---

# 35. TESTING

Use the existing test framework.

Test backend:

### Admin authorization

```text
No token → 401
Customer → 403
Admin → allowed
```

### Order list

* admin can list orders
* pagination works
* newest orders first
* filters work if implemented
* empty results handled

### Order detail

* admin can view an order
* missing order returns 404
* malformed ID handled
* customer cannot use admin endpoint

### Status update

* admin can update status
* invalid status rejected
* customer cannot update status
* unauthenticated request rejected
* missing order handled
* duplicate requests handled safely
* invalid status transition rejected if transition validation is implemented

### Customer regression

* customer can list own orders
* customer can view own order
* customer cannot view another customer's order
* customer cannot update order status

---

# 36. IMPORTANT HISTORICAL DATA TEST

Verify this scenario:

```text
Product:
Rice
Current price = ₹120

Existing OrderItem:
Rice
Purchase price = ₹100
Quantity = 2
Subtotal = ₹200
```

Change current Product price:

```text
₹120 → ₹150
```

The existing order must still show:

```text
Purchase price = ₹100
Subtotal = ₹200
```

Admin order management must never replace historical order values with current catalog values.

---

# 37. FILES AND ARCHITECTURE

Before creating new files, determine whether equivalent files already exist.

Prefer something similar to:

```text
backend/
  routes/
  controllers/
  services/
  middleware/
  validators/

admin/
  pages/
  components/
  services/
  hooks/
```

But use the project's actual architecture.

Do not reorganize the entire project.

---

# 38. NO UNRELATED REFACTOR

Do not modify unrelated functionality.

Especially avoid changing:

* customer authentication
* cart
* checkout
* Razorpay
* FCM
* product catalog behavior
* address system
* mobile UI
* Prisma architecture

unless a direct Day 27 bug blocks implementation.

---

# 39. IMPLEMENTATION PROCESS

Follow this sequence.

## Step 1 — Audit

Inspect existing code.

Identify:

```text
Existing order functionality:
- ...

Existing admin functionality:
- ...

Existing OrderStatus:
- ...

Existing order APIs:
- ...

Missing admin functionality:
- ...

Files likely to change:
- ...
```

## Step 2 — Reuse

Reuse existing:

* authentication
* admin authorization
* order service
* Prisma models
* validation
* API client
* UI components
* pagination
* status enum

## Step 3 — Backend

Implement missing admin order APIs.

## Step 4 — Frontend

Implement:

```text
/admin/orders
/admin/orders/:id
```

or the project's existing equivalent routing pattern.

## Step 5 — Status update

Implement secure admin status mutation.

## Step 6 — Tests

Run backend and frontend tests.

## Step 7 — Regression

Verify customer order functionality.

---

# 40. VERIFY PROJECT COMMANDS

Inspect package.json first.

Then run the project's actual commands.

For example, if they exist:

```bash
npm run lint
npm run test
npm run build
```

Do not invent commands.

Check:

```bash
git status
git diff
```

Review all changes.

Remove:

* debug logs
* temporary code
* mock data
* unused imports
* dead code
* hardcoded credentials
* hardcoded production URLs

---

# 41. FINAL REPORT

At the end provide:

```text
DAY 27 IMPLEMENTATION REPORT

Implemented:
- Admin order list
- Admin order details
- Order search/filter if supported
- Pagination
- Order status updates
- Status validation
- Admin authorization
- Loading/error/empty states
- Tests

Backend files changed:
- ...

Frontend files changed:
- ...

Tests/checks:
- ...

Potential issues:
- ...

Out of scope:
- Razorpay
- FCM
- delivery tracking
- delivery partner
- refunds

Git diff reviewed:
YES/NO
```

---

# 42. FINAL CHECKPOINT

If all P0 functionality works:

```text
DAY 27 COMPLETE — SAFE TO MOVE TO DAY 28
```

If something important remains broken:

```text
DAY 27 NOT COMPLETE — FIX THE FOLLOWING FIRST

- ...
- ...
```

Do not claim completion if admin authorization, order visibility, status updates, or customer order isolation is broken.

---

# FINAL RULE

**Inspect first. Reuse existing architecture. Implement only Day 27.**

Do not rebuild the order system.

Do not create a second authentication system.

Do not create a second API client.

Do not create a second state-management system.

Do not modify historical order data.

Keep Day 27 focused on:

```text
ADMIN
  ↓
VIEW ORDERS
  ↓
VIEW ORDER DETAILS
  ↓
UPDATE ORDER STATUS
```
