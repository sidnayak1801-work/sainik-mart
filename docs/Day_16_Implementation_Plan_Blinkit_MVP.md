# Day 16 — Cart Screen Implementation Plan

## Blinkit-like Grocery Delivery MVP

---

## 1. Sprint Context

This document is the implementation specification for **Day 16** of the 6-week Blinkit-like Grocery Delivery MVP.

### Current Stack

* Customer mobile app: React Native + Expo + TypeScript
* Backend: Node.js + Express + TypeScript
* Database: PostgreSQL
* ORM: Prisma
* Authentication: JWT + bcrypt
* Admin dashboard: React / Next.js
* Payments: Razorpay
* Notifications: Firebase FCM
* Image storage: Cloudinary or AWS S3

### Day 16

**Task:** Build the customer Cart Screen and integrate it with the existing Day 15 Cart APIs.

**Timebox:** 3 hours

**Priority:** P0

### Previous Day

Day 15 implemented the backend Cart APIs:

```text
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:id
DELETE /api/cart/items/:id
```

Day 16 should consume these APIs from the React Native application.

---

# 2. Day 16 Objective

Build a real customer-facing Cart Screen.

The Cart Screen must:

1. Load the authenticated user's cart from the backend.
2. Display cart items.
3. Display product information.
4. Display quantity.
5. Allow quantity increase.
6. Allow quantity decrease.
7. Allow item removal.
8. Display server-provided subtotal/total information.
9. Handle loading state.
10. Handle empty-cart state.
11. Handle API/network errors.
12. Provide retry functionality.
13. Provide navigation back to shopping/catalog.
14. Show a Proceed to Checkout entry point without implementing checkout.

The cart must use **real backend data**.

Do not hardcode cart items.

---

# 3. Critical Working Rule

Before changing any code:

> Inspect the existing Day 1–15 implementation first.

Do not assume:

* file names
* API response shapes
* navigation structure
* authentication architecture
* component structure
* existing state management

The existing project is the source of truth.

Preserve working code.

Do not rewrite unrelated architecture.

Do not introduce a new state-management library simply for Day 16.

---

# 4. Day 16 Scope

## In Scope

### Mobile

* CartScreen
* Cart item list
* Product information
* Quantity controls
* Remove item
* Cart API integration
* Subtotal/total display
* Loading state
* Empty state
* Error state
* Retry
* Continue Shopping navigation
* Checkout entry point
* TypeScript types
* Basic responsive layout
* Android/iOS compatibility

### API Integration

Use:

```http
GET /api/cart
PATCH /api/cart/items/:id
DELETE /api/cart/items/:id
```

Use the existing authenticated API client.

The JWT should be attached automatically by the existing API/auth architecture.

---

# 5. Explicitly Out of Scope

Do NOT implement these on Day 16:

* Checkout logic
* Address CRUD
* Address selection
* Order creation
* Order service
* Razorpay
* Payment verification
* Payment webhook
* Firebase notifications
* Admin dashboard
* Product management
* Image upload
* Delivery tracking
* Driver application
* Live GPS
* Coupons
* Loyalty
* Recommendations
* Advanced state management
* New backend Cart APIs unless an existing Day 15 bug must be fixed
* Major navigation restructuring

These belong to later sprint days.

---

# 6. Expected User Experience

The basic screen should look conceptually like:

```text
┌──────────────────────────────────┐
│              My Cart             │
├──────────────────────────────────┤
│                                  │
│  [Image]  Milk                   │
│           ₹60                    │
│                                  │
│           [-]  2  [+]     ₹120  │
│           Remove                 │
│                                  │
├──────────────────────────────────┤
│                                  │
│  [Image]  Apples                 │
│           ₹100                   │
│                                  │
│           [-]  1  [+]     ₹100  │
│           Remove                 │
│                                  │
├──────────────────────────────────┤
│                                  │
│  Subtotal                  ₹220  │
│                                  │
│  ┌────────────────────────────┐  │
│  │    Proceed to Checkout     │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

Do not spend excessive time making it visually identical to Blinkit.

Focus on:

* usability
* correctness
* API integration
* clean code
* responsive layout

---

# 7. Inspect Existing Code First

Before implementing anything, inspect:

## Authentication

Find:

* API client
* JWT handling
* SecureStore
* AuthContext
* authenticated request logic

Verify that authenticated requests automatically send:

```http
Authorization: Bearer <JWT>
```

Do not duplicate authentication logic inside CartScreen.

---

## Navigation

Inspect:

* AppNavigator
* MainNavigator
* existing Cart route
* Home route
* Product Details route
* Categories route

Determine how the existing app navigates between screens.

Reuse the current navigation architecture.

Do not create a second navigation system.

---

## Existing Components

Look for:

```text
Button
Loading
EmptyState
ErrorMessage
Screen
ProductCard
```

Reuse existing components where appropriate.

Do not create duplicate versions of components that already exist.

---

## Existing API Client

Inspect:

```text
src/api/client.ts
```

or the equivalent existing API abstraction.

Use it.

Do not call `fetch()` directly from every screen if the project already has a centralized API client.

---

## Day 15 API Response

Inspect the actual Day 15 implementation and determine the real response structure of:

```http
GET /api/cart
```

Do not invent a response shape.

Use the backend's actual response contract.

---

# 8. CartScreen

Create or complete:

```text
src/screens/cart/CartScreen.tsx
```

Use the project's existing folder structure if it differs.

The screen should be responsible for:

* loading cart data
* displaying cart data
* invoking cart actions
* managing screen-level loading/error state
* refreshing data after mutations
* navigating to relevant screens

Keep business logic out of the JSX where practical.

If the project architecture already has a cart API/service module, use it.

---

# 9. Cart API Module

Prefer a dedicated API abstraction such as:

```text
src/api/cart.ts
```

or the project's existing equivalent.

Potential functions:

```ts
getCart()
updateCartItem(itemId, quantity)
deleteCartItem(itemId)
```

Use the existing API client.

Conceptually:

```ts
export async function getCart() {
  return apiClient.get('/api/cart');
}

export async function updateCartItem(
  itemId: string,
  quantity: number
) {
  return apiClient.patch(`/api/cart/items/${itemId}`, {
    quantity,
  });
}

export async function deleteCartItem(itemId: string) {
  return apiClient.delete(`/api/cart/items/${itemId}`);
}
```

Adapt this to the project's actual API client conventions.

Do not blindly copy this code if the project uses another pattern.

---

# 10. TypeScript Types

Create or reuse appropriate cart types.

For example, conceptually:

```ts
interface CartItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  imageUrl?: string | null;
}

interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
}
```

However:

> Use the actual Day 15 API response shape.

Do not invent properties that the backend does not return.

Avoid:

```ts
any
```

unless there is a genuinely unavoidable existing boundary.

---

# 11. Loading the Cart

When CartScreen mounts:

```text
CartScreen
    ↓
GET /api/cart
    ↓
Authenticated API Client
    ↓
Express
    ↓
JWT Middleware
    ↓
Cart Service
    ↓
Prisma
    ↓
PostgreSQL
    ↓
Cart Response
    ↓
CartScreen
```

Display a loading state while the initial request is pending.

Reuse the existing `Loading` component if available.

Do not show an empty-cart message before the API request has completed.

---

# 12. Empty Cart

If the API returns an empty cart:

```text
          🛒

      Your cart is empty

   Add some products to your cart

       [Continue Shopping]
```

Reuse the existing EmptyState component if available.

The Continue Shopping button should navigate to the appropriate existing shopping screen.

Prefer Home or Categories based on the existing navigation structure.

---

# 13. Error State

If loading the cart fails:

```text
Unable to load your cart.

[Retry]
```

Requirements:

* display a user-friendly message
* do not expose raw server errors
* provide Retry
* retry the cart API request
* do not crash the application

If the project already has an ErrorMessage component, reuse it.

---

# 14. Cart Item Rendering

Each cart item should display, where available from the API:

* product image
* product name
* current/effective price
* quantity
* item subtotal
* quantity controls
* remove action

Example:

```text
[Image]

Milk
₹60

[-] 2 [+]

Subtotal: ₹120

Remove
```

Do not display fake values.

Use backend-provided values.

---

# 15. Quantity Increase

When the customer presses `+`:

```text
Current quantity = 2

        ↓

New quantity = 3

        ↓

PATCH /api/cart/items/:id

{
  "quantity": 3
}

        ↓

Backend validates quantity and stock

        ↓

Success

        ↓

Update cart UI
```

The frontend should not assume that the requested quantity is valid.

The backend remains the source of truth for stock and quantity rules.

---

# 16. Quantity Decrease

When the customer presses `-`:

If:

```text
quantity > 1
```

decrease it by one.

Example:

```text
2 → 1
```

Then call:

```http
PATCH /api/cart/items/:id
```

with the new quantity.

Do NOT send:

```json
{
  "quantity": 0
}
```

when quantity is 1.

Recommended UX:

```text
quantity = 1
     ↓
user presses -
     ↓
remove item
```

If this behavior is implemented, use:

```http
DELETE /api/cart/items/:id
```

instead of trying to update quantity to zero.

---

# 17. Remove Cart Item

Provide a remove action.

Example:

```text
Remove
```

or an appropriate trash icon.

When pressed:

```http
DELETE /api/cart/items/:id
```

After successful deletion:

* remove the item from the UI
* update subtotal
* if the cart becomes empty, display EmptyState

Do not require the user to restart or manually refresh the screen.

---

# 18. Mutation Strategy

For Day 16, prefer correctness and simplicity.

A safe implementation is:

```text
User changes quantity
        ↓
API request
        ↓
Success
        ↓
Reload cart
        ↓
Display server state
```

This avoids client/backend state mismatch.

If the existing architecture already supports safe optimistic updates, they may be used.

Do not introduce complex optimistic state management solely for Day 16.

---

# 19. Prevent Duplicate Requests

Avoid accidentally sending multiple requests because of:

* double taps
* repeated effects
* unstable callbacks
* incorrect dependency arrays

During an update/remove operation:

* disable the affected control where practical
* show a small loading state if appropriate
* prevent duplicate mutation requests

Do not freeze the entire app unnecessarily.

---

# 20. Price and Total Rules

The mobile app must NOT be the authority for prices.

Never use a client-controlled product price as the authoritative order price.

The backend is the source of truth.

The mobile app should display values returned by the backend.

For example:

```text
Product price: ₹50
Quantity: 3
Server subtotal: ₹150
```

The frontend may perform temporary display calculations if required for UX, but the server-provided amount remains authoritative.

Do not implement:

* delivery fee
* taxes
* discounts
* coupons
* final checkout amount

unless those already exist in the Day 15 API response.

Those belong to checkout/order work later.

---

# 21. Proceed to Checkout

Display:

```text
[ Proceed to Checkout ]
```

However:

> Do not implement checkout on Day 16.

If no checkout screen exists yet, use one of the following approaches based on the existing navigation architecture:

1. Navigate to a clearly marked placeholder screen, or
2. Keep the button disabled until checkout is implemented.

Do not start implementing:

* address selection
* order creation
* Razorpay
* payment verification

Those are later sprint tasks.

---

# 22. Refresh Behavior

If the project supports pull-to-refresh, it may be added.

If not, do not spend significant time implementing a complex refresh system.

At minimum:

* load cart on screen entry
* refresh after quantity mutation
* refresh after deletion

Ensure the cart does not display stale data after successful mutations.

---

# 23. Navigation

CartScreen should integrate with the existing navigation.

Expected conceptual flow:

```text
Home
  ↓
Product
  ↓
Cart
```

and:

```text
Cart
  ↓
Continue Shopping
  ↓
Home / Categories
```

Also ensure the existing navigation can reach the Cart screen.

Do not redesign the entire app navigation.

---

# 24. UI Requirements

Use:

* SafeAreaView or existing Safe Area architecture
* FlatList for cart items
* reusable components
* existing theme
* existing spacing conventions
* responsive dimensions
* accessible touch targets

Avoid:

```text
ScrollView
  └── map(large list)
```

for the primary cart list if FlatList is appropriate.

Use stable keys.

Do not use array indexes as keys when a stable cart-item ID exists.

---

# 25. Performance

For the expected MVP cart size, keep the implementation simple.

Still ensure:

* no unnecessary API calls
* no infinite effects
* no repeated cart fetching caused by render loops
* no N+1 client requests
* no image loading that crashes the screen
* no unnecessary global state

Do not optimize prematurely.

---

# 26. Authentication

The Cart API requires authentication.

The mobile app must use the currently logged-in user's JWT.

Do NOT add:

```text
userId
```

to cart requests unless the existing API contract explicitly requires it.

The backend should identify the user from the JWT.

Do not store a second cart user ID in local storage.

---

# 27. 401 Handling

If the backend returns:

```http
401 Unauthorized
```

because the token is missing, invalid, or expired:

* use the existing authentication handling
* clear session/token if that is already the established behavior
* return the user to Login when appropriate

Do not implement a separate authentication mechanism inside CartScreen.

---

# 28. Backend Compatibility

Day 16 should primarily be a mobile implementation day.

If an existing Day 15 backend bug prevents the CartScreen from functioning:

1. Identify the exact bug.
2. Make the smallest safe backend fix.
3. Preserve the Day 15 architecture.
4. Do not expand into unrelated backend features.
5. Test the fix.

Do not redesign the Cart API unless absolutely necessary.

---

# 29. Error Handling

Handle common cases such as:

### Network unavailable

Display:

```text
Unable to connect. Please check your internet connection.
```

### Product out of stock

Display a useful message based on the backend response.

Example:

```text
This product is no longer available.
```

### Quantity exceeds stock

Display a useful message.

Example:

```text
Only 3 items are currently available.
```

### Unauthorized

Use the existing auth/session handling.

### Unexpected server error

Display a generic user-friendly error.

Do not expose:

* stack traces
* SQL errors
* JWT values
* internal server details

---

# 30. Security Rules

Never log:

```text
JWT
password
authorization header
SecureStore token
```

Do not send:

```text
password
JWT
user credentials
```

to the Cart API.

Do not trust client-side prices.

Do not trust client-side user identity.

The backend remains responsible for:

* user ownership
* product availability
* stock
* quantity validation
* price
* cart integrity

---

# 31. Testing Checklist

## Initial Loading

* [ ] Cart screen opens
* [ ] Loading state appears
* [ ] API request is sent once
* [ ] Cart renders after successful response

## Cart With Items

* [ ] Product image displays
* [ ] Product name displays
* [ ] Price displays
* [ ] Quantity displays
* [ ] Item subtotal displays
* [ ] Cart subtotal displays

## Quantity Increase

* [ ] Press + once
* [ ] Correct PATCH request sent
* [ ] Quantity updates
* [ ] Subtotal updates
* [ ] No duplicate requests

## Quantity Decrease

* [ ] Quantity decreases from 3 to 2
* [ ] Quantity decreases from 2 to 1
* [ ] Quantity does not become 0 through PATCH

## Remove

* [ ] Remove button works
* [ ] Correct DELETE request sent
* [ ] Item disappears
* [ ] Subtotal updates
* [ ] EmptyState appears if last item is removed

## Empty Cart

* [ ] Empty state appears
* [ ] No incorrect subtotal
* [ ] Continue Shopping works

## Error Handling

* [ ] Network failure handled
* [ ] Server error handled
* [ ] Retry works
* [ ] Stock error handled
* [ ] Unauthorized response handled

## Navigation

* [ ] Cart is reachable
* [ ] Continue Shopping works
* [ ] Checkout entry point behaves as expected

---

# 32. Android Testing

Since the MVP targets Google Play Store, test on a real Android device if available.

Verify:

* screen layout
* touch targets
* FlatList scrolling
* quantity controls
* API connectivity
* network error behavior
* image rendering
* navigation
* Android back button behavior

Important:

Do NOT use:

```text
http://localhost:3000
```

for a physical Android device unless the project is specifically configured for that environment.

Use the appropriate reachable development API URL.

---

# 33. iOS Compatibility

Keep the screen compatible with iOS.

Check:

* safe area
* navigation
* touch interactions
* image rendering
* list behavior
* loading/error states

Do not introduce Android-only APIs.

---

# 34. Code Quality

Before finishing Day 16, remove:

* unused imports
* dead code
* console logs containing sensitive information
* duplicate API functions
* duplicate components
* unnecessary `any`
* hardcoded product/cart data
* unnecessary state

Use clear names.

Prefer small reusable components where they improve readability.

Do not over-componentize a simple screen.

---

# 35. Suggested Component Structure

Depending on existing architecture, a reasonable structure is:

```text
src/
├── api/
│   ├── client.ts
│   └── cart.ts
│
├── components/
│   ├── Button.tsx
│   ├── Loading.tsx
│   ├── EmptyState.tsx
│   ├── ErrorMessage.tsx
│   └── CartItem.tsx
│
├── screens/
│   └── cart/
│       └── CartScreen.tsx
│
├── types/
│   └── cart.ts
│
└── navigation/
    └── ...
```

This is a recommendation, not a requirement.

If the existing project has a different clean structure, preserve it.

---

# 36. Suggested Implementation Order

Follow this order:

### Step 1

Inspect Days 1–15.

### Step 2

Inspect Day 15 API contract.

### Step 3

Inspect mobile API client/authentication.

### Step 4

Create/reuse cart types.

### Step 5

Create/reuse Cart API module.

### Step 6

Build CartScreen layout.

### Step 7

Connect GET `/api/cart`.

### Step 8

Render cart items.

### Step 9

Implement quantity update.

### Step 10

Implement remove.

### Step 11

Implement loading/empty/error states.

### Step 12

Implement Continue Shopping navigation.

### Step 13

Add checkout entry point only.

### Step 14

Test on Android.

### Step 15

Run TypeScript/lint/Expo checks.

### Step 16

Review git diff and remove unrelated changes.

---

# 37. 3-Hour Timebox

## 0:00–0:20 — Inspect

* Day 15 API
* API client
* auth
* navigation
* existing components
* existing types

## 0:20–1:10 — Cart UI

Build:

* header
* cart list
* CartItem
* price
* quantity controls
* remove
* subtotal
* checkout button

## 1:10–1:50 — API Integration

Implement:

* GET cart
* PATCH quantity
* DELETE item

## 1:50–2:20 — States

Implement:

* loading
* empty
* error
* retry
* mutation loading

## 2:20–2:45 — Navigation + UX

Test:

* Continue Shopping
* Cart navigation
* back button
* checkout placeholder/disabled behavior

## 2:45–3:00 — Validation

Run:

```bash
npx tsc --noEmit
```

If configured:

```bash
npm run lint
```

Run:

```bash
npx expo doctor
```

Start Expo:

```bash
npx expo start
```

Run the app on the target Android device.

---

# 38. Validation Commands

Use the project's actual package manager/scripts.

Typical checks:

```bash
npx tsc --noEmit
```

```bash
npm run lint
```

```bash
npx expo doctor
```

```bash
npx expo start
```

If backend changes were required, also run the backend's existing:

```bash
npm run build
```

and tests if available.

Do not run destructive database commands.

Do not reset the database.

Do not delete migrations.

---

# 39. Database Safety

Day 16 should not require database schema changes.

Therefore:

* Do not create a new migration unless a genuine existing defect requires it.
* Do not run `prisma migrate reset`.
* Do not drop tables.
* Do not delete production/dev data.
* Do not modify unrelated Prisma models.

Day 15 is responsible for the Cart database/API foundation.

---

# 40. Cursor Working Rules

While implementing:

1. Inspect before editing.
2. Preserve existing working code.
3. Follow the existing project architecture.
4. Reuse existing API client.
5. Reuse existing authentication.
6. Reuse existing UI components/theme.
7. Use TypeScript.
8. Avoid `any`.
9. Do not hardcode cart data.
10. Do not trust client-side prices.
11. Do not add userId manually to cart requests.
12. Do not introduce Redux/Zustand unnecessarily.
13. Do not implement later-day features.
14. Do not make destructive database changes.
15. Keep the git diff focused on Day 16.
16. Test after implementation.
17. Fix errors rather than hiding them.
18. Review the final diff before declaring completion.

---

# 41. Day 16 Definition of Done

Day 16 is complete only when all applicable items below are satisfied.

## Cart Screen

* [ ] CartScreen exists
* [ ] Cart is loaded from the backend
* [ ] Real cart data is displayed
* [ ] Product information is displayed
* [ ] Quantity is displayed
* [ ] Item subtotal is displayed
* [ ] Cart subtotal is displayed

## Quantity

* [ ] Increase works
* [ ] Decrease works
* [ ] Quantity cannot become zero through PATCH
* [ ] Backend validation errors are handled
* [ ] Duplicate mutation requests are prevented

## Remove

* [ ] Item can be removed
* [ ] UI updates after deletion
* [ ] Empty cart appears after removing final item

## States

* [ ] Loading state
* [ ] Empty state
* [ ] Error state
* [ ] Retry
* [ ] Mutation loading state where appropriate

## Navigation

* [ ] Cart navigation works
* [ ] Continue Shopping works
* [ ] Checkout entry point exists
* [ ] Checkout itself is NOT implemented

## Security

* [ ] JWT uses existing auth mechanism
* [ ] No JWT logging
* [ ] No password logging
* [ ] No client-controlled userId
* [ ] No client-controlled authoritative price

## Quality

* [ ] TypeScript passes
* [ ] Lint passes if configured
* [ ] Expo checks pass where applicable
* [ ] No obvious console/debug noise
* [ ] No unnecessary dependencies
* [ ] No unrelated files changed

## Device

* [ ] Android tested
* [ ] iOS-compatible implementation maintained

---

# 42. Final Architecture After Day 16

The application should now conceptually work like this:

```text
                    CUSTOMER MOBILE APP
                           │
                           ▼
                         Home
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
        Product List                Product Details
             │                           │
             └─────────────┬─────────────┘
                           ▼
                          Cart
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
            View        Update        Remove
              │            │            │
              ▼            ▼            ▼
           GET /cart    PATCH item    DELETE item
              │            │            │
              └────────────┼────────────┘
                           ▼
                    Express Backend
                           │
                       JWT Auth
                           │
                      Cart Service
                           │
                         Prisma
                           │
                       PostgreSQL
```

---

# 43. Day 16 → Day 17

After Day 16:

```text
Day 15
Cart APIs
   ↓
Day 16
Cart Screen
   ↓
Day 17
Address CRUD APIs
   ↓
Day 18
Address UI
   ↓
Day 19
Order Service
   ↓
Day 20
Checkout Screen
```

Do not pull Day 17–20 functionality into Day 16.

---

# 44. Final Integration Test

The minimum customer journey after Day 16 should be:

```text
Register
   ↓
Login
   ↓
Home
   ↓
Browse Products
   ↓
Product Details
   ↓
Add product to cart
   ↓
Open Cart
   ↓
View cart item
   ↓
Increase quantity
   ↓
Decrease quantity
   ↓
Remove item
   ↓
Cart updates correctly
```

The product-to-cart addition itself may already come from an earlier/later implementation.

If it is not yet available in the current codebase, do not implement a complete new Add-to-Cart feature unless required to test the existing Day 15 API.

---

# 45. Final Cursor Self-Audit

Before finishing, inspect:

```bash
git status
```

and:

```bash
git diff
```

Confirm:

* no unrelated files changed
* no secrets committed
* no hardcoded JWT
* no hardcoded cart data
* no hardcoded user ID
* no sensitive logs
* no unnecessary dependency
* no destructive DB command
* no later-day features

Then verify:

```text
Day 15 Cart API
       ↓
Day 16 Cart Screen
       ↓
Real authenticated API data
       ↓
Quantity update
       ↓
Item removal
       ↓
Correct server-backed totals
       ↓
Loading / Empty / Error states
       ↓
READY FOR DAY 17
```

---

# 46. Required Final Cursor Output

At the end of the implementation, Cursor must perform a final self-audit.

If everything is complete:

```text
DAY 16 COMPLETE — SAFE TO MOVE TO DAY 17
```

If anything important is incomplete:

```text
DAY 16 NOT COMPLETE — FIX THE FOLLOWING FIRST
```

Then list the exact remaining issues.

Do not claim completion if the Cart Screen does not work against the actual Day 15 backend.

---

# 47. Core Principle

The purpose of Day 16 is simple:

> **Turn the Day 15 Cart API into a working customer-facing Cart Screen without overengineering the application.**

The backend remains the source of truth for:

* user ownership
* product availability
* stock
* quantity validation
* prices
* cart totals

The mobile app is responsible for:

* displaying the cart
* collecting quantity/remove actions
* calling the backend
* displaying the server's resulting state
* providing a good customer experience.

**Day 16 should finish with a working Cart UI, not a partially implemented checkout system.**
