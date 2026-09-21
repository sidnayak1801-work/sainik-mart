# Day 23 — Customer Order UI

## Sainik Mart Mobile App — 6 Week MVP

**Day:** 23
**Week:** 4
**Phase:** Customer Orders
**Focus:** React Native Customer Order UI
**Estimated Time:** 2–3 hours
**Priority:** P0 / Core MVP

---

# 1. Objective

Implement the customer-facing order screens in the React Native + Expo application.

Day 22 implemented and verified the backend APIs:

```text
GET /api/orders
GET /api/orders/:id
```

Day 23 consumes those APIs and creates the customer order experience.

The target flow is:

```text
Customer
   ↓
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

The mobile UI must use the existing project architecture, API client, authentication, navigation, reusable components, and Sainik Mart design system.

---

# 2. Current Stack

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

---

# 3. Previous Day Dependencies

Day 23 depends on:

### Day 19

Order creation API:

```text
POST /api/orders
```

### Day 20

Checkout UI.

### Day 21

Checkout/order E2E testing.

### Day 22

Customer order APIs:

```text
GET /api/orders
GET /api/orders/:id
```

Do not recreate any of these APIs.

---

# 4. Scope

## IN SCOPE

Implement:

* My Orders screen
* Order list
* Order card
* Order details screen
* Order item list
* order total
* order status
* order date
* order address
* loading states
* empty state
* error state
* retry
* navigation
* authenticated API integration
* Android/iOS compatibility
* Sainik Mart design system

---

# 5. OUT OF SCOPE

Do NOT implement:

* Razorpay
* payment UI
* payment verification
* payment webhooks
* order cancellation
* FCM
* push notifications
* delivery tracking
* GPS
* maps
* delivery partner
* live delivery status
* admin order management
* coupons
* loyalty
* reviews
* ratings
* Redux
* Zustand
* new authentication architecture
* new API client
* backend changes unless a genuine API bug blocks the UI

Do not turn Day 23 into a backend refactoring day.

---

# 6. First Step — Inspect Existing Code

Before writing code, inspect:

```text
src/
```

and identify:

* navigation structure
* existing screen naming conventions
* API client
* auth/token handling
* theme
* reusable Button
* reusable Card
* reusable Loading component
* reusable Error component
* reusable EmptyState component
* Cart screen
* Address screens
* Checkout screen
* existing TypeScript types/interfaces
* existing formatting/date utilities

Do NOT create duplicate versions if reusable components already exist.

---

# 7. Required Screens

Implement two screens.

## Screen 1

```text
MyOrdersScreen
```

Purpose:

Display the authenticated customer's order history.

---

## Screen 2

```text
OrderDetailsScreen
```

Purpose:

Display complete information about a selected order.

---

# 8. Navigation Flow

Expected navigation:

```text
Profile / Account
       ↓
My Orders
       ↓
Order Details
```

If the project already has another logical entry point for orders, reuse it.

Do not create a completely separate navigation architecture.

The order list item should navigate using the existing navigation system.

Conceptually:

```text
MyOrdersScreen
     ↓
navigation.navigate("OrderDetails", {
   orderId
})
```

Use the project's actual navigation typing and route conventions.

---

# 9. My Orders API

Use:

```http
GET /api/orders
```

Use the existing authenticated API client.

Do NOT:

* create another Axios instance
* create another fetch wrapper
* manually manage JWT
* hardcode tokens
* hardcode API URLs

The existing API client should automatically handle authentication according to the current architecture.

---

# 10. My Orders Response

Do NOT assume the response shape.

First inspect the actual Day 22 implementation.

For example, it may return:

```json
{
  "data": [
    {
      "id": "order-1",
      "status": "PENDING",
      "totalAmount": 350,
      "createdAt": "2026-09-21T10:30:00.000Z",
      "itemCount": 3
    }
  ]
}
```

Or the project may use another response wrapper.

Use the real API response.

Do not invent a frontend response shape that does not match the backend.

---

# 11. TypeScript Order Type

Create or reuse a proper TypeScript type.

Conceptually:

```ts
interface OrderSummary {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount?: number;
}
```

But adapt this to the actual backend response.

Do not use:

```ts
any
```

unless an existing project convention genuinely requires it.

---

# 12. My Orders Screen Layout

The screen should be clean and mobile-friendly.

Conceptual layout:

```text
--------------------------------
        My Orders
--------------------------------

┌──────────────────────────────┐
│ Order #ABC123                │
│ 21 Sep 2026                  │
│                              │
│ 3 items                      │
│ ₹350                         │
│                              │
│ ● PENDING                    │
│                              │
│ View Details →               │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Order #XYZ789                │
│ 18 Sep 2026                  │
│                              │
│ 2 items                      │
│ ₹520                         │
│                              │
│ ● DELIVERED                  │
│                              │
│ View Details →               │
└──────────────────────────────┘
```

This is a conceptual structure.

Match the actual Sainik Mart design system.

---

# 13. Order Card

Create a reusable component if the project architecture supports it.

Suggested:

```text
OrderCard
```

It should display:

* order ID
* order date
* status
* total amount
* item count if available
* navigation affordance

Example:

```text
Order #12345
21 Sep 2026

3 items
₹350

PENDING                    →
```

Keep the card compact.

Do not show unnecessary information.

---

# 14. Order ID Display

The backend order ID may be a UUID or another long identifier.

Do not display an extremely long UUID in a visually awkward way.

For example:

```text
Order #8f4a2c...
```

or use an existing order-number/display convention if one already exists.

Important:

The actual complete ID must still be available internally for navigation.

Do not modify the backend ID.

---

# 15. Order Status UI

The API status should be displayed clearly.

Possible existing statuses:

```text
PENDING
CONFIRMED
PACKING
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

Do not introduce new backend statuses.

The UI may format them for readability.

For example:

```text
OUT_FOR_DELIVERY
```

can display as:

```text
Out for Delivery
```

while the underlying value remains:

```text
OUT_FOR_DELIVERY
```

---

# 16. Status Styling

Follow the existing Sainik Mart design system.

Use the established colors.

Important colors:

```text
Primary:
#145C38

Primary Dark:
#0C3F24

Primary Light:
#1F6B45

Gold:
#C6A34E

Accent:
#E85A20

Background:
#F6F4EF

Surface:
#FFFFFF

Primary Text:
#1A241C

Secondary Text:
#6B6560

Danger:
#B91C1C
```

Do not create a new color palette.

For status colors, reuse existing semantic colors if available.

If no status-specific colors exist, use subtle styling rather than inventing many new colors.

---

# 17. Loading State — My Orders

When the screen initially loads:

```text
GET /api/orders
```

show an appropriate loading state.

Prefer an existing reusable loading component.

Do not create a new global loading system.

The screen should not look broken while waiting for the API.

---

# 18. Empty State

If the API returns zero orders:

```text
[]
```

show a friendly empty state.

Conceptually:

```text
        No orders yet

Your orders will appear here
after you place your first order.

[ Continue Shopping ]
```

Use the existing EmptyState component if available.

The Continue Shopping button should navigate to the appropriate existing shopping/home screen.

Do not create a new shopping screen.

---

# 19. Error State

If:

```text
GET /api/orders
```

fails:

Show:

```text
Unable to load your orders.
Please try again.
```

with:

```text
[ Retry ]
```

Use the project's existing error handling and components.

Do not expose:

* raw API errors
* Axios errors
* stack traces
* backend implementation details

---

# 20. Retry

Retry should call:

```text
GET /api/orders
```

again.

Do not reload the entire application.

Do not recreate authentication.

---

# 21. Order List Rendering

Use:

```text
FlatList
```

or the project's existing list component.

Avoid rendering a large list using:

```text
ScrollView + map()
```

if the application expects multiple orders.

Use stable keys.

The order ID is the preferred key if unique.

---

# 22. Order Detail Navigation

When the customer taps an order:

```text
OrderCard
   ↓
OrderDetailsScreen
```

Pass only the order ID.

Conceptually:

```ts
{
  orderId: order.id
}
```

Do not pass the entire order object as the source of truth.

The details screen should fetch the latest order details from:

```text
GET /api/orders/:id
```

---

# 23. Order Details API

Use:

```http
GET /api/orders/:id
```

The ID must come from the navigation route.

Example:

```text
OrderDetailsScreen
        ↓
route.params.orderId
        ↓
GET /api/orders/{orderId}
```

Use the existing API client.

---

# 24. Order Details Screen

The screen should show:

```text
--------------------------------
        Order Details
--------------------------------

Order #ABC123

21 Sep 2026, 10:30 AM

Status
PENDING

Items
--------------------------------
Rice
₹100 × 2
₹200

Milk
₹50 × 1
₹50
--------------------------------

Total
₹250

Delivery Address
Example Address
Delhi
110001
```

The exact layout may differ.

The design must fit the Sainik Mart visual language.

---

# 25. Order Items

Display every OrderItem returned by the backend.

For each item show:

* product name
* quantity
* purchase-time price
* subtotal

Example:

```text
Rice
₹100 × 2                 ₹200
```

Do not fetch the current Product price.

The backend's OrderItem values are the historical source of truth.

---

# 26. Historical Price Display

If:

```text
OrderItem.price = ₹100
```

and the current product price is:

```text
₹150
```

the order details screen must show:

```text
₹100
```

because that was the purchase-time price.

Do not call:

```text
GET /api/products/:id
```

just to calculate the order amount.

The order API already contains the required historical information.

---

# 27. Total Amount

Display the server-returned order total.

Do not recalculate the trusted order total from current product data.

For example:

```text
Total
₹350
```

The backend remains the source of truth.

---

# 28. Address Display

Display the address associated with the order.

Example:

```text
Delivery Address

123 Example Street
Delhi
110001
```

Use the order response.

Do not fetch the customer's current address separately.

An old order should display the address associated with that order according to the backend's data model.

---

# 29. Date Formatting

The backend will likely return an ISO date:

```text
2026-09-21T10:30:00.000Z
```

Do not display the raw ISO string to the customer.

Format it using the project's existing date utility if one exists.

Example:

```text
21 Sep 2026, 10:30 AM
```

Be careful with timezone handling.

Do not hardcode a timezone conversion if the project already has a date/time utility.

If no utility exists, implement a small reusable formatter rather than duplicating formatting logic across components.

---

# 30. Loading State — Order Details

When opening Order Details:

```text
GET /api/orders/:id
```

show a loading state.

Do not briefly show fake/hardcoded order information.

---

# 31. Order Details Error

If the API fails:

Show a friendly error state.

Example:

```text
Unable to load order details.

[ Retry ]
```

If the order does not exist or is inaccessible:

Show the existing not-found/error UI convention.

Do not expose backend errors.

---

# 32. Back Navigation

Order Details should support:

```text
← Back
```

using the existing navigation system.

Android hardware back should also behave correctly.

Do not implement a custom global back-navigation system.

---

# 33. Design System Requirements

The mobile UI must follow:

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
```

Layout:

```text
Mobile margin:
16

Gutter:
12

Card radius:
12

Button radius:
24
```

Use:

* clean cards
* comfortable spacing
* clear typography
* accessible tap targets
* subtle shadows where existing components use them

---

# 34. Do NOT Use Home Hero Everywhere

The Home screen uses:

* dark forest hero
* logo
* search pill
* CTA

Do NOT copy that entire hero structure into My Orders or Order Details.

Orders should be:

```text
clean
simple
information-focused
```

Use the same design tokens, not necessarily the same layout.

---

# 35. Typography

Follow the design system:

```text
Display:
32

Heading:
24

Subheading:
18

Body:
14

Caption:
12
```

Use existing typography components/styles if available.

Do not introduce a second typography system.

---

# 36. Android/iOS Requirements

The screen must work on:

* Android
* iOS
* Expo

Check:

* SafeAreaView / Safe Area handling
* status bar
* navigation
* scrolling
* touch targets
* Android hardware back
* keyboard is not relevant to the main order screens
* different screen widths

Minimum tap target:

```text
iOS: 44pt
Android: 48dp
```

---

# 37. Authentication

Do not create any new authentication logic.

The existing API client/auth system must handle authenticated requests.

The user should not manually provide:

```text
userId
```

The backend determines the user from JWT.

---

# 38. No Global State

Do not introduce:

```text
Redux
Zustand
MobX
```

for this feature.

Use local screen state and existing project patterns.

Example conceptual state:

```ts
const [orders, setOrders] = useState<OrderSummary[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

Use the project's existing approach if it already has a suitable pattern.

---

# 39. API Client

Use the existing central API client.

Do NOT create:

```text
ordersApi.ts
```

if the project already has an established service/API organization that should be extended.

If a service layer exists, add order API methods there.

Conceptually:

```ts
getOrders()
getOrderById(orderId)
```

Follow the actual project's naming convention.

---

# 40. No Hardcoded Data

Do not use fake orders such as:

```ts
const orders = [
  {
    id: "123",
    totalAmount: 350
  }
];
```

The screen must use real API data.

No hardcoded:

* order IDs
* prices
* statuses
* dates
* addresses
* item names

---

# 41. Pull-to-Refresh

If consistent with the existing application, add pull-to-refresh to My Orders.

Conceptually:

```text
Pull down
   ↓
GET /api/orders
```

Use React Native's existing refresh behavior.

Do not build a custom refresh system.

This is optional if the existing app does not use pull-to-refresh elsewhere.

---

# 42. Order Details Refresh

Do not add unnecessary automatic polling.

Day 23 is not a live delivery tracking feature.

The screen can fetch the order when opened.

No:

```text
setInterval()
```

for order polling.

---

# 43. Status Progress

Do not build a complicated delivery tracking timeline yet.

A simple status display is sufficient:

```text
Status

PENDING
```

or:

```text
Status

Out for Delivery
```

The advanced order progress experience can be implemented later if required.

---

# 44. Component Structure

Follow the existing project structure.

A possible structure is:

```text
screens/
  MyOrdersScreen.tsx
  OrderDetailsScreen.tsx

components/
  OrderCard.tsx
  OrderItemRow.tsx
```

But do NOT blindly create this exact structure.

First inspect the repository and follow its existing conventions.

---

# 45. Suggested OrderCard Responsibilities

`OrderCard` should:

* display order summary
* format status
* display date
* display total
* display item count
* trigger `onPress`

It should NOT:

* make API requests
* manage authentication
* navigate using hardcoded route names if the architecture passes navigation handlers
* modify orders

Keep components presentational where practical.

---

# 46. Suggested OrderItemRow Responsibilities

`OrderItemRow` should display:

```text
Product name
Price
Quantity
Subtotal
```

It should not:

* fetch products
* fetch cart
* modify order
* call backend

---

# 47. API Failure Scenarios

Test:

### No internet

Expected:

```text
Friendly error
Retry
```

### Expired authentication

Use the existing auth interceptor/handling.

Do not manually implement a second token refresh system.

### Server error

Show friendly message.

### Empty orders

Show empty state.

### Order not found

Show appropriate error state.

---

# 48. Navigation Testing

Verify:

```text
Profile
 ↓
My Orders
 ↓
Order Details
 ↓
Back
 ↓
My Orders
```

Also test:

```text
Android hardware back
```

and:

```text
iOS navigation back
```

---

# 49. End-to-End Day 23 Test

Use a real test account.

### Step 1

Login.

### Step 2

Place an order if required.

### Step 3

Open My Orders.

### Step 4

Verify the new order appears.

### Step 5

Verify:

* order ID
* date
* status
* total

### Step 6

Tap the order.

### Step 7

Verify Order Details.

### Step 8

Verify:

* items
* quantities
* purchase-time prices
* subtotals
* total
* address
* status

### Step 9

Go back.

### Step 10

Verify My Orders remains functional.

---

# 50. Important Data Integrity Test

Create an order for:

```text
Product A
Price = ₹100
```

Then change the current product price to:

```text
₹150
```

Open the order.

Expected:

```text
Order price = ₹100
```

This confirms that the mobile app is correctly displaying backend historical data.

---

# 51. Multi-User Test

If practical:

```text
User A
  ↓
Order A

User B
  ↓
Order B
```

Login as User A.

My Orders must show:

```text
Order A
```

and not:

```text
Order B
```

This is primarily a backend security requirement, but the mobile integration should be verified.

---

# 52. Performance

Do not:

* fetch every order's details individually on the list screen
* call product APIs for each order item
* create N+1 API calls

The list should use:

```text
GET /api/orders
```

The detail screen should use:

```text
GET /api/orders/:id
```

Only.

---

# 53. Code Quality

Use:

* TypeScript
* reusable components
* existing API client
* existing navigation
* existing theme
* existing error handling
* existing authentication

Avoid:

```text
any
```

where possible.

Do not introduce unnecessary packages.

Do not perform unrelated refactoring.

---

# 54. Validation Commands

Inspect `package.json` first.

Run the existing commands for:

* TypeScript
* lint
* tests
* formatting if configured

For example, only if these scripts exist:

```bash
npm run typecheck
npm run lint
npm test
```

Do not invent commands.

---

# 55. Git Review

Before finishing:

```bash
git status
git diff
```

Confirm:

* only Day 23 files changed
* no `.env` changes
* no secrets
* no debug logs
* no fake data
* no unrelated refactor
* no backend modifications unless genuinely necessary

---

# 56. Definition of Done

Day 23 is complete when:

## My Orders

* [ ] My Orders screen exists
* [ ] `GET /api/orders` integrated
* [ ] real authenticated data displayed
* [ ] order cards implemented
* [ ] newest orders displayed correctly
* [ ] status displayed
* [ ] total displayed
* [ ] date displayed
* [ ] item count displayed when available
* [ ] loading state implemented
* [ ] empty state implemented
* [ ] error state implemented
* [ ] retry works

## Order Details

* [ ] Order Details screen exists
* [ ] receives order ID from navigation
* [ ] `GET /api/orders/:id` integrated
* [ ] order status displayed
* [ ] order date displayed
* [ ] order items displayed
* [ ] historical price displayed
* [ ] quantity displayed
* [ ] subtotal displayed
* [ ] total displayed
* [ ] order address displayed
* [ ] loading state implemented
* [ ] error state implemented
* [ ] retry works

## Navigation

* [ ] My Orders can be opened
* [ ] Order Details opens from an order
* [ ] Back navigation works
* [ ] Android hardware back works

## Design

* [ ] Sainik Mart design tokens followed
* [ ] cream background used appropriately
* [ ] green primary actions
* [ ] orange accent used sparingly
* [ ] card radius follows design system
* [ ] spacing follows design system
* [ ] tap targets are accessible
* [ ] no Home hero copied into order screens

## Architecture

* [ ] Existing API client reused
* [ ] Existing auth reused
* [ ] Existing navigation reused
* [ ] Existing components reused where appropriate
* [ ] No Redux/Zustand
* [ ] No duplicate API client
* [ ] No hardcoded data
* [ ] No hardcoded API URL

## Testing

* [ ] Real order appears in My Orders
* [ ] Order Details loads correctly
* [ ] Historical price displays correctly
* [ ] Empty state works
* [ ] API error works
* [ ] Retry works
* [ ] Navigation works
* [ ] Android tested
* [ ] iOS/Expo compatibility checked
* [ ] TypeScript passes
* [ ] Lint passes if configured
* [ ] Git diff reviewed

---

# 57. Final Day 23 Checkpoint

If everything is working:

```text
DAY 23 COMPLETE — SAFE TO MOVE TO DAY 24
```

If important problems remain:

```text
DAY 23 NOT COMPLETE — FIX THE FOLLOWING FIRST
```

If incomplete, report every issue using:

```text
Issue:
File:
Why it matters:
Required fix:
Backend impact:
```

Do not declare Day 23 complete if a P0 issue exists involving:

* authentication
* user isolation
* incorrect order data
* incorrect historical price
* incorrect total
* broken order navigation
* broken API integration

---

# 58. Day 24 Preview

Day 24 moves into the **Admin** side of the application.

The next major flow will be:

```text
Admin Login
    ↓
Admin Authorization
    ↓
Admin Dashboard
    ↓
Protected Admin APIs
```

Day 24 should focus on admin authorization and access control before building the full admin dashboard.

Do not implement Day 24 functionality during Day 23.
