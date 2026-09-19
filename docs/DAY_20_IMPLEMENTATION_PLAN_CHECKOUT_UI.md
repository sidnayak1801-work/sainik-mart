# Cursor Agent Task — Implement Day 20: Checkout UI

You are working on the **Sainik Mart** mobile application.

Your task is to implement **Day 20 — Checkout UI** completely and safely.

Before making any code changes, read and understand:

```text
DAY_20_IMPLEMENTATION_PLAN.md
```

Also inspect the existing implementation from Days 1–19.

---

# 1. PRIMARY OBJECTIVE

Build the customer-facing **Checkout Screen** in:

```text
React Native
Expo
TypeScript
```

The Checkout Screen must connect the already implemented:

```text
Day 16 → Cart Screen
Day 17 → Address API
Day 18 → Address UI
Day 19 → Order Creation API
```

The intended flow is:

```text
Cart Screen
    ↓
Proceed to Checkout
    ↓
Checkout Screen
    ↓
Review Address
    ↓
Select/Change Address
    ↓
Review Cart Items
    ↓
Review Total
    ↓
Place Order
    ↓
POST /api/orders
    ↓
Order Created
    ↓
Order Confirmation / Next Screen
```

---

# 2. CRITICAL SCOPE RULE

This is a **frontend/mobile checkout UI task**.

Do NOT implement payment functionality.

Do NOT implement Razorpay.

Do NOT implement payment verification.

Do NOT implement payment webhooks.

Payment integration comes later.

Day 20 ends after successfully creating an order through:

```http
POST /api/orders
```

---

# 3. BEFORE CODING — INSPECT THE PROJECT

Do NOT immediately create new files.

First inspect:

### Existing mobile architecture

Find:

* navigation structure
* screen structure
* reusable components
* theme/design tokens
* API client
* authentication/session handling
* error handling
* loading components
* button components
* card components
* typography
* existing spacing utilities
* existing hooks
* existing state management approach

### Day 16

Inspect the existing:

```text
Cart Screen
```

Understand:

* how cart data is fetched
* how cart items are represented
* how quantities are represented
* how totals are calculated/displayed
* how navigation to checkout currently works

### Day 18

Inspect:

```text
AddressListScreen
AddAddressScreen
EditAddressScreen
AddressCard
AddressForm
```

Reuse these where appropriate.

Do NOT create a second address-management implementation.

### Day 19

Inspect the actual Order API implementation.

Verify:

```text
POST /api/orders
```

and determine the actual request and response shape.

Expected request is conceptually:

```json
{
  "addressId": "address-id"
}
```

But **use the actual backend contract from the codebase**.

Do not assume field names if the implementation differs.

### Design

Read:

```text
design.md
```

Use the existing Sainik Mart design system.

Do not invent a new visual design.

---

# 4. EXISTING CODE IS THE SOURCE OF TRUTH

The existing codebase determines:

* file naming
* folder structure
* navigation conventions
* API client conventions
* auth conventions
* TypeScript types
* error handling
* loading components
* styling conventions
* reusable components

Do not introduce a new architecture just for Checkout.

---

# 5. DAY 20 SCOPE

Implement:

```text
CheckoutScreen
```

with:

* cart/order review
* delivery address
* address selection
* address change
* order total
* place-order action
* loading states
* error states
* empty states
* success handling
* navigation

---

# 6. API INTEGRATION

Use the existing central API client.

Do NOT create another:

```text
axios instance
fetch wrapper
API client
authentication mechanism
```

Use the project's existing system.

The screen may need:

```http
GET /api/cart
GET /api/addresses
POST /api/orders
```

Use the actual existing endpoints and response structures.

---

# 7. CART DATA

Checkout must display real cart data.

Do NOT hardcode:

```text
product names
prices
quantities
subtotals
totals
```

Example only:

```text
Rice
₹100 × 2
₹200
```

must come from the API.

---

# 8. CART SCREEN → CHECKOUT

Inspect the existing Day 16 Cart Screen.

The existing:

```text
Proceed to Checkout
```

action should navigate to the Checkout Screen.

If navigation already exists, reuse it.

If it does not exist, add the smallest required navigation change.

Do not redesign Cart Screen.

Do not modify unrelated navigation.

---

# 9. CHECKOUT SCREEN STRUCTURE

The screen should conceptually contain:

```text
Checkout

────────────────────

Delivery Address

[Selected Address]

Change

────────────────────

Order Summary

Product
Qty
Price

Product
Qty
Price

────────────────────

Total

₹XXX

────────────────────

[ PLACE ORDER ]
```

The exact visual structure should follow the existing Sainik Mart design system.

---

# 10. DESIGN SYSTEM

Use the existing `design.md`.

Important existing tokens include:

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

Text Primary:
#1A241C

Text Secondary:
#6B6560

Danger:
#B91C1C
```

Use:

```text
16px mobile margins
12px gutters
12px card radius
24px button radius
```

Buttons must respect:

```text
iOS minimum tap target: 44pt
Android minimum tap target: 48dp
```

---

# 11. IMPORTANT DESIGN PRINCIPLE

Do NOT turn Checkout into another Home Screen.

Do not use:

* large Home hero
* large search pill
* unnecessary promotional banner
* unnecessary grocery categories
* unrelated decorative elements

Checkout should feel:

```text
clean
focused
trustworthy
simple
transaction-oriented
```

while still matching Sainik Mart's visual language.

---

# 12. DELIVERY ADDRESS SECTION

Display the currently selected address.

Use the actual Address type from Day 18.

Conceptually:

```text
Delivery Address

123 Main Street
Delhi
110001

[Change]
```

If the existing Address model contains additional display fields, use them appropriately.

Do not invent address fields.

---

# 13. ADDRESS LOADING

When Checkout opens:

```text
Load addresses
```

Use the existing API client.

Display an appropriate loading state.

Do not block the entire app unnecessarily if existing skeleton/loading components are available.

Reuse existing loading components.

---

# 14. NO SAVED ADDRESS

If the user has no saved addresses:

Display a clean empty state.

Conceptually:

```text
No delivery address

Add an address to continue with your order.

[ ADD ADDRESS ]
```

The button should navigate to the existing:

```text
AddAddressScreen
```

Do not create a new address form.

---

# 15. ADDRESS SELECTION

The user must be able to select a saved address.

If multiple addresses exist:

```text
Address A
Address B
Address C
```

the user can choose one.

Only one address should be selected for the order.

The selected address ID is what must ultimately be sent to:

```http
POST /api/orders
```

---

# 16. CHANGE ADDRESS FLOW

Prefer reusing the existing Day 18 address list.

Conceptually:

```text
Checkout
   ↓
Change
   ↓
Address List
   ↓
Select Address
   ↓
Checkout
```

Use the existing navigation architecture.

Do not duplicate AddressListScreen.

---

# 17. ADDRESS SELECTION STATE

Keep the selected address state local to the checkout flow unless the existing application already has a different established pattern.

Do NOT introduce Redux/Zustand/global state just for this feature.

The selected address must be reset/updated correctly when the user changes it.

---

# 18. ADDRESS AFTER ADDING

Handle this flow:

```text
Checkout
   ↓
No address
   ↓
Add Address
   ↓
Address successfully created
   ↓
Return to Checkout
```

If the existing navigation architecture supports returning the newly created address, use it.

Otherwise reload addresses when Checkout becomes active/focused.

Do not create a new global state architecture.

---

# 19. ORDER SUMMARY

Display the current cart items.

Each item should show enough information for the customer to review the purchase.

Conceptually:

```text
Rice
₹100 × 2       ₹200

Milk
₹60 × 1        ₹60
```

Use:

* existing product name
* existing quantity
* existing effective price
* existing cart subtotal

Do not hardcode values.

---

# 20. PRODUCT IMAGE

If the existing Cart/Product implementation already has product images available:

reuse them.

If product images are not available in the current API response:

do NOT create a new image API or image architecture just for Day 20.

A text-based item row is acceptable.

---

# 21. TOTAL

Display the total according to the existing cart/API response.

However:

**Do not treat the client-side total as the final financial authority.**

Day 19 recalculates the actual order total on the backend.

The Checkout UI is only showing the customer the current cart information.

---

# 22. PRICE MISMATCH POSSIBILITY

Be aware that:

```text
Checkout displays cart price
        ↓
POST /api/orders
        ↓
Backend recalculates current price
```

The backend is authoritative.

Do not attempt to bypass the Day 19 server-side pricing logic.

If the Day 19 API response indicates a price/stock-related failure, display the appropriate error and allow the user to retry/review the cart.

---

# 23. PLACE ORDER BUTTON

Create a primary CTA:

```text
PLACE ORDER
```

Use the existing Sainik Mart primary button component if available.

Do not create a duplicate button component unless necessary.

---

# 24. PLACE ORDER VALIDATION

Before making the API call:

Verify:

```text
selected address exists
cart is not empty
```

If no address is selected:

do not call the API.

Show a user-friendly message such as:

```text
Please select a delivery address.
```

Use the project's existing toast/alert/error mechanism.

---

# 25. CREATE ORDER REQUEST

Call:

```http
POST /api/orders
```

with the selected address ID.

Conceptually:

```json
{
  "addressId": "selected-address-id"
}
```

Use the actual backend contract.

Do NOT send:

```text
userId
totalAmount
price
subtotal
stock
status
```

as trusted order values.

---

# 26. AUTHENTICATION

The existing API client/authentication mechanism should automatically provide authentication.

Do not manually implement another JWT mechanism.

Do not store tokens again.

Do not decode JWT unnecessarily.

---

# 27. ORDER SUBMISSION LOADING STATE

When the user taps:

```text
PLACE ORDER
```

the UI should immediately enter a submitting state.

For example:

```text
Creating order...
```

or use the existing button loading indicator.

During submission:

```text
Disable Place Order
Prevent duplicate taps
Prevent duplicate order requests
```

---

# 28. DUPLICATE ORDER PREVENTION

This is important.

The user must not be able to generate:

```text
Order A
Order B
Order C
```

from rapid repeated taps.

Use a local submission state such as the existing project convention.

Example concept:

```typescript
if (isSubmitting) return;
```

But follow existing coding conventions.

---

# 29. ORDER SUCCESS

When:

```http
POST /api/orders
```

returns success:

Do not immediately attempt Razorpay.

Day 20 has no payment integration.

Instead, handle successful order creation according to the existing navigation architecture.

If there is no Order Confirmation screen yet, create only the minimal success handling required by Day 20.

Prefer a simple confirmation screen/message if appropriate.

Conceptually:

```text
Order placed successfully!

Order ID:
XXXXXXXX

Status:
PENDING

Total:
₹XXX

[ CONTINUE SHOPPING ]
```

Do not implement full Order History.

---

# 30. ORDER CONFIRMATION SCOPE

If an existing order-success/confirmation screen exists:

reuse it.

If it does not exist:

create the smallest appropriate confirmation screen required for Day 20.

Do NOT build:

* order history
* tracking
* delivery timeline
* admin order management

Those are later tasks.

---

# 31. AFTER SUCCESS

The cart has already been cleared by the Day 19 backend.

Therefore:

Do not manually attempt to delete cart items after successful order creation unless the existing architecture specifically requires it.

The backend is responsible for the transactional cart clear.

---

# 32. EMPTY CART

If Checkout loads and the cart is empty:

Display:

```text
Your cart is empty.

[ Continue Shopping ]
```

Do not display a Place Order button.

Do not call:

```http
POST /api/orders
```

with an empty cart.

---

# 33. CART LOADING STATE

When retrieving cart data:

Display the existing loading UI.

Do not briefly display misleading:

```text
₹0
0 items
```

if the actual data has not loaded yet.

---

# 34. CART ERROR

If cart loading fails:

Display a useful error state.

Conceptually:

```text
Unable to load your cart.

[ Retry ]
```

Use the project's existing error component if available.

---

# 35. ADDRESS ERROR

If address loading fails:

Display an appropriate error.

Conceptually:

```text
Unable to load saved addresses.

[ Retry ]
```

Do not silently treat a network failure as "no addresses."

Differentiate:

```text
No addresses
```

from:

```text
Failed to load addresses
```

---

# 36. ORDER CREATION ERROR

Handle backend errors such as:

```text
Insufficient stock
Inactive product
Invalid address
Unauthorized
Network failure
Server failure
```

Use the existing API error parser.

Do not display raw server/Prisma errors to the customer.

---

# 37. STOCK ERROR

If Day 19 returns an insufficient-stock error:

show a customer-friendly message.

Example:

```text
One or more items are no longer available in the requested quantity. Please review your cart.
```

Use the actual error-handling conventions.

Do not invent a new global error system.

---

# 38. INVALID ADDRESS ERROR

If the backend rejects the address because it no longer exists or is invalid:

handle it gracefully.

For example:

```text
This delivery address is no longer available. Please select another address.
```

Then allow the user to choose another address.

---

# 39. AUTH ERROR

If the existing API client detects an expired/invalid session:

follow the existing authentication flow.

Do not create another login flow.

Do not duplicate token refresh logic.

---

# 40. NETWORK ERROR

If the device has no network:

show a user-friendly retryable error.

Do not crash the app.

---

# 41. NAVIGATION

Inspect the existing navigation structure first.

Add only the minimum routes required.

Expected conceptual routes:

```text
Cart
 ↓
Checkout
 ↓
Address List
 ↓
Checkout
```

and after success:

```text
Checkout
 ↓
Order Confirmation
```

Use the actual navigation library already installed.

Do not replace navigation.

---

# 42. BACK BUTTON

Android back behavior should be correct.

If the user is on Checkout:

```text
Back
 ↓
Cart
```

Use the existing navigation stack.

Do not manually override Android back behavior unless necessary.

---

# 43. SAFE AREA

Use the existing Safe Area handling.

The Checkout Screen must work correctly around:

* iOS notch
* status bar
* Android status bar
* bottom navigation/home indicator

Do not hardcode device-specific offsets.

---

# 44. KEYBOARD

Checkout itself should not require a keyboard.

If the user navigates to Add Address:

reuse the existing Day 18 keyboard handling.

Do not duplicate keyboard behavior in Checkout.

---

# 45. RESPONSIVE LAYOUT

The UI must work across:

* small Android phones
* large Android phones
* iPhones
* different screen heights

Do not use fixed screen dimensions.

Prefer:

```text
flex
padding
margin
ScrollView/FlatList
```

according to the existing project architecture.

---

# 46. LONG CHECKOUT CONTENT

Checkout may contain:

* multiple addresses
* multiple products
* long product names

Therefore make the screen scrollable.

Do not allow the Place Order button to become inaccessible.

Use the project's established ScrollView/FlatList patterns.

---

# 47. PERFORMANCE

Do not introduce unnecessary:

* global state
* API calls on every render
* repeated address requests
* repeated cart requests
* expensive derived calculations

Use existing hooks/patterns.

---

# 48. REFETCHING

When returning to Checkout from Address screens:

ensure the selected/available addresses are current.

Use the existing navigation focus pattern if the project already has one.

Do not create a custom event bus.

---

# 49. TYPESCRIPT

Use proper existing TypeScript types.

Do not introduce:

```typescript
any
```

just to bypass type errors.

Reuse existing:

```text
Cart
CartItem
Product
Address
Order
```

types/interfaces where available.

If an Order type does not yet exist on mobile, create the smallest appropriate type based on the actual Day 19 response.

---

# 50. COMPONENT REUSE

Before creating a new component, check whether the project already has:

```text
Button
Card
Loading
ErrorState
EmptyState
Text
ScreenContainer
ProductRow
AddressCard
```

or equivalents.

Reuse them.

Do not duplicate components unnecessarily.

---

# 51. ADDRESS CARD

If Day 18 already has:

```text
AddressCard
```

reuse it.

Do not build a second AddressCard just for Checkout.

If it needs a small non-breaking enhancement to support selection:

make the smallest safe change.

Do not rewrite the component.

---

# 52. DESIGN DETAILS

Checkout should visually use:

```text
Background:
#F6F4EF

Cards:
#FFFFFF

Primary:
#145C38

Accent:
#E85A20

Text:
#1A241C

Secondary:
#6B6560

Danger:
#B91C1C
```

Use orange sparingly.

Primary actions should generally use the forest green.

---

# 53. CARD STYLE

For sections such as:

```text
Delivery Address
Order Summary
```

use existing card components/styles where available.

Target design characteristics:

```text
white surface
12px radius
clean spacing
subtle existing shadow
```

Do not invent a different card system.

---

# 54. TYPOGRAPHY

Follow:

```text
Display: 32
Heading: 24
Subheading: 18
Body: 14
Caption: 12
```

Use existing typography components/styles if available.

Do not introduce another font.

---

# 55. BUTTON

The Place Order CTA should:

* use existing primary button
* green background
* white text
* 24px radius
* minimum 48dp/44pt tap target
* clear disabled/loading state

---

# 56. NO PAYMENT

Again:

**DO NOT IMPLEMENT RAZORPAY.**

The correct Day 20 endpoint is:

```text
POST /api/orders
```

not:

```text
POST /api/payments
```

and not:

```text
Razorpay Checkout
```

Payment comes later.

---

# 57. NO ORDER HISTORY

Do not implement:

```text
My Orders
Order History
Order Details
Track Order
```

unless a minimal existing screen is required for navigation and already exists.

Do not expand scope.

---

# 58. NO ADMIN

Do not modify the Admin Dashboard.

Day 20 is customer mobile only.

---

# 59. NO GLOBAL STATE LIBRARY

Do not install:

```text
Redux
Redux Toolkit
Zustand
MobX
Recoil
```

for this task.

Use existing local/component state and existing application architecture.

---

# 60. NO NEW API ARCHITECTURE

Do not create:

```text
checkoutApi.ts
new Axios instance
new fetch wrapper
new auth service
```

unless the existing architecture specifically requires a small module consistent with the project.

Reuse the central API client.

---

# 61. ERROR HANDLING

Inspect how Day 16 and Day 18 handle errors.

Follow that exact style.

Do not introduce a second:

```text
Alert
Toast
Modal
ErrorHandler
```

architecture.

---

# 62. ACCESSIBILITY

Where the existing project supports accessibility:

add appropriate:

```text
accessibilityLabel
accessibilityRole
```

for:

* Change Address
* Add Address
* Place Order
* Continue Shopping

Do not over-engineer accessibility beyond the existing project conventions.

---

# 63. TEST SCENARIOS

After implementation, manually test or add tests according to the existing project setup.

At minimum verify:

### Test 1 — Normal Checkout

```text
Login
 ↓
Add products
 ↓
Cart
 ↓
Checkout
 ↓
Select address
 ↓
Place order
```

Expected:

```text
Order successfully created
```

---

### Test 2 — Multiple Items

Cart:

```text
Rice × 2
Milk × 1
Bread × 3
```

Verify all items display correctly.

---

### Test 3 — Multiple Addresses

Create:

```text
Address A
Address B
```

Verify:

```text
Checkout
 ↓
Change
 ↓
Select B
 ↓
Checkout shows B
```

---

### Test 4 — No Address

Delete all addresses.

Expected:

```text
No address
 ↓
Add Address
```

Verify the user can navigate to Day 18 Add Address.

---

### Test 5 — Empty Cart

Remove all cart items.

Open Checkout.

Expected:

```text
Empty cart
Continue Shopping
```

No Place Order action.

---

### Test 6 — Insufficient Stock

Have Day 19 reject the order because stock changed.

Expected:

```text
Friendly error
No app crash
User can retry/review cart
```

---

### Test 7 — Network Failure

Disable network.

Expected:

```text
Error state
Retry available
```

No crash.

---

### Test 8 — Duplicate Tap

Rapidly tap:

```text
PLACE ORDER
```

Expected:

```text
Only one request
Only one order
```

---

### Test 9 — Invalid Session

Use an expired/invalid session.

Expected:

```text
Existing auth handling executes
```

No duplicate authentication logic.

---

# 64. IMPORTANT BACKEND CONTRACT CHECK

Before finishing, inspect Day 19 again.

Verify the mobile request matches the actual backend:

```text
POST /api/orders
```

and:

```text
addressId
```

matches the actual expected field/type.

Verify the response shape used by Checkout matches the actual backend response.

Do not assume the example JSON from this prompt is the exact API response.

---

# 65. RUN TYPESCRIPT CHECK

Run the project's appropriate TypeScript validation.

For example:

```bash
npx tsc --noEmit
```

If the mobile project has a specific command, use that instead.

Fix errors caused by your Day 20 implementation.

Do not suppress errors just to make the check pass.

---

# 66. RUN LINT

If the project has linting:

```bash
npm run lint
```

or its actual equivalent.

Fix relevant issues.

Do not modify lint configuration simply to hide problems.

---

# 67. RUN TESTS

If the project has tests:

```bash
npm test
```

or its actual equivalent.

Run relevant mobile tests.

Do not remove or weaken existing tests.

---

# 68. BUILD CHECK

If practical and supported by the existing project:

verify that the Expo/React Native project can still start/build.

Do not make unrelated native configuration changes.

---

# 69. GIT REVIEW

Before finishing:

```bash
git status
```

Then:

```bash
git diff
```

Review every changed file.

Confirm:

* no unrelated changes
* no debug logs
* no hardcoded product data
* no hardcoded addresses
* no fake order response
* no secrets
* no duplicate API client
* no duplicate auth
* no Razorpay code
* no unnecessary dependencies

---

# 70. FILE CHANGE DISCIPLINE

Only create/modify files required for Day 20.

Potential files may include:

```text
CheckoutScreen
navigation
types
components
API hooks/services
```

But determine the actual paths from the existing project.

Do not blindly create these exact filenames.

---

# 71. IMPORTANT — DO NOT REWRITE DAY 16 OR DAY 18

Cart and Address functionality already exists.

If integration requires a small fix:

make the smallest safe change.

Do not rewrite:

```text
Cart Screen
Address List
Address Form
API client
Authentication
Navigation
```

from scratch.

---

# 72. FINAL DAY 20 FLOW

The completed app should support:

```text
Customer
   ↓
Cart
   ↓
Proceed to Checkout
   ↓
Checkout Screen
   ↓
Load Cart
   ↓
Load Addresses
   ↓
Select Address
   ↓
Review Products
   ↓
Review Total
   ↓
Place Order
   ↓
POST /api/orders
   ↓
Backend validates everything
   ↓
Order created
   ↓
Cart cleared by backend
   ↓
Mobile receives success
   ↓
Order Confirmation
```

No payment occurs yet.

---

# 73. DEFINITION OF DONE

Before declaring Day 20 complete, verify:

### Checkout

* [ ] Checkout screen exists
* [ ] Cart data loads from real API
* [ ] Address data loads from real API
* [ ] Saved addresses display
* [ ] Address selection works
* [ ] Change Address works
* [ ] Add Address flow works
* [ ] Order items display
* [ ] Quantities display
* [ ] Prices display
* [ ] Total displays
* [ ] Place Order button works

### Order Creation

* [ ] Correct `POST /api/orders` endpoint used
* [ ] Correct request body used
* [ ] Selected address ID sent
* [ ] Existing authentication reused
* [ ] No client-side userId sent
* [ ] No client-side trusted total sent
* [ ] Backend remains source of truth

### UX

* [ ] Loading state
* [ ] Empty cart state
* [ ] No address state
* [ ] Address loading error
* [ ] Cart loading error
* [ ] Order creation error
* [ ] Network error
* [ ] Duplicate submission prevention
* [ ] Success state
* [ ] Correct navigation
* [ ] Android back behavior
* [ ] Safe area support
* [ ] Responsive layout

### Design

* [ ] Uses `design.md`
* [ ] Uses Sainik Mart colors
* [ ] Uses existing components
* [ ] Uses existing typography
* [ ] Uses existing button style
* [ ] 44pt/48dp tap targets
* [ ] No Home-style hero unnecessarily
* [ ] Clean checkout-focused UI

### Engineering

* [ ] Existing API client reused
* [ ] Existing auth reused
* [ ] Existing navigation reused
* [ ] Existing Address components reused
* [ ] Existing Cart logic reused
* [ ] No Redux/Zustand added
* [ ] No duplicate API architecture
* [ ] No duplicate auth
* [ ] No mock data
* [ ] No hardcoded order data
* [ ] TypeScript passes
* [ ] Lint passes if available
* [ ] Tests pass if available
* [ ] No unrelated refactoring

### Scope

* [ ] No Razorpay
* [ ] No payment verification
* [ ] No webhook
* [ ] No FCM
* [ ] No order tracking
* [ ] No delivery partner
* [ ] No maps/GPS
* [ ] No admin changes
* [ ] No advanced coupons/discounts

---

# 74. FINAL CURSOR RESPONSE

If everything is implemented and verified, respond exactly:

```text
DAY 20 COMPLETE — SAFE TO MOVE TO DAY 21
```

Then provide a concise summary containing:

1. Files created/modified
2. Checkout flow implemented
3. APIs integrated
4. Navigation changes
5. Tests performed
6. Any important implementation decisions

If anything remains incomplete, respond exactly:

```text
DAY 20 NOT COMPLETE — FIX THE FOLLOWING FIRST
```

Then list:

1. Exact issue
2. File
3. Cause
4. Required fix
5. Whether it affects backend/API/navigation/design

Do NOT claim completion if the Checkout → Order API flow has not been verified.

---

# FINAL INSTRUCTION

Start now.

First read:

```text
DAY_20_IMPLEMENTATION_PLAN.md
```

Then inspect the actual Days 1–19 implementation.

Especially inspect:

```text
Day 16 Cart Screen
Day 17 Address API
Day 18 Address UI
Day 19 Order Creation API
Navigation
API client
Authentication
design.md
```

Only after understanding those implementations should you begin coding.

Implement **only Day 20 Checkout UI**.

Reuse the existing architecture.

Use real APIs.

Do not hardcode data.

Do not invent API contracts.

Do not implement Razorpay or any later-day functionality.

Keep the implementation production-quality, simple, and consistent with the existing Sainik Mart application.
