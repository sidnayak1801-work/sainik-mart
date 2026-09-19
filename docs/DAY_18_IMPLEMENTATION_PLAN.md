# Sainik Mart — Day 18 Implementation Plan

## Address UI — React Native + Expo

**Project:** Sainik Mart
**Day:** 18 / 42
**Phase:** Week 3 — Cart + Checkout
**Estimated Time:** 2–2.5 hours
**Priority:** P0
**Platform:** React Native + Expo + TypeScript
**Backend dependency:** Day 17 Address CRUD APIs
**Design reference:** `design.md`

---

# 1. Day 18 Objective

Build the complete **customer address management UI** for the Sainik Mart mobile application.

The customer should be able to:

1. View saved delivery addresses
2. See an empty state when no addresses exist
3. Add a new address
4. Edit an existing address
5. Delete an existing address
6. Select an address
7. Handle loading, errors, retries, and API mutation states
8. Navigate cleanly between address screens

Day 18 is a **mobile UI + API integration task**.

The backend Address APIs should already exist from Day 17.

---

# 2. Important Scope Boundary

## Day 18 IN SCOPE

### Mobile

* Address list screen
* Address card
* Add address screen
* Edit address screen
* Shared address form
* Address selection UI
* Delete confirmation
* Loading states
* Empty state
* Error state
* Retry
* API integration
* Navigation
* Form validation
* Android/iOS usability
* Design-system compliance

### API integration

Use the existing Day 17 endpoints:

```text
GET    /api/addresses
POST   /api/addresses
PATCH  /api/addresses/:id
DELETE /api/addresses/:id
```

---

# 3. Day 18 OUT OF SCOPE

Do NOT implement:

* Checkout
* Order creation
* Order APIs
* Razorpay
* Payment UI
* Maps
* Google Maps integration
* Geocoding
* GPS/location permissions
* Live location
* Delivery zones
* Delivery partner functionality
* FCM notifications
* Redux
* Zustand
* Global state architecture
* Address default/primary logic unless it already exists
* Address labels such as Home/Work unless already supported
* Backend changes unless required to fix an actual Day 17 integration mismatch
* New design system
* New authentication system

The address flow should be ready to be consumed by Day 19, but Day 18 must not implement Day 19 functionality.

---

# 4. First Step — Inspect Existing Project

Before writing code, inspect the existing project.

Do NOT immediately create new files.

First inspect:

```text
design.md

src/
```

Also inspect the implementation from Days 1–17.

Specifically identify:

* React Native structure
* Expo setup
* TypeScript configuration
* Navigation architecture
* Existing screens
* Existing API client
* Authentication/token handling
* Existing reusable components
* Theme/design tokens
* Button component
* Input component
* Loading component
* Empty state component
* Error state component
* Modal/dialog pattern
* Existing screen layout pattern
* Existing form validation approach
* Existing API response/error handling
* Existing TypeScript conventions
* Existing folder naming conventions

Also inspect the Day 17 backend API contract.

Do not assume the API response shape.

Use the actual project implementation as the source of truth.

---

# 5. Design System — MUST FOLLOW

The Sainik Mart mobile app already has a design system in:

```text
design.md
```

Do NOT invent a separate visual style.

Use the existing design system.

## Brand colors

```yaml
primary: "#145C38"
primary_dark: "#0C3F24"
primary_light: "#1F6B45"
gold: "#C6A34E"
accent: "#E85A20"
background: "#F6F4EF"
surface: "#FFFFFF"
text_primary: "#1A241C"
text_secondary: "#6B6560"
primary_text: "#FFFFFF"
danger: "#B91C1C"
```

## Typography

```yaml
display: 32
heading: 24
subheading: 18
body: 14
caption: 12
```

Use:

```text
iOS: System
Android: sans-serif / Roboto
```

## Layout

```yaml
mobile_margin: 16
mobile_gutter: 12
card_radius: 12
button_radius: 24
iOS_min_tap_target: 44
Android_min_tap_target: 48
```

---

# 6. Important Design Principle

Do NOT force the Home Screen visual language onto the Address screens.

The Home screen uses:

* dark green hero
* logo
* search pill
* orange CTA

The Address screens should be:

* clean
* simple
* functional
* spacious
* easy to scan

Use the Sainik Mart colors without unnecessarily adding hero sections.

---

# 7. Address Screen Architecture

Recommended screen structure:

```text
AddressListScreen
    │
    ├── AddressCard
    │
    ├── EmptyState
    │
    └── Add Address Button
          │
          ▼
    AddAddressScreen
          │
          ▼
      AddressForm


AddressListScreen
    │
    └── AddressCard → Edit
                         │
                         ▼
                  EditAddressScreen
                         │
                         ▼
                     AddressForm
```

Use **one shared `AddressForm` component** for both Add and Edit.

Do NOT duplicate the entire form.

---

# 8. Suggested File Structure

Follow the existing project structure.

Do not blindly create this structure if the project already has another established convention.

A possible structure is:

```text
src/
├── api/
│   └── addresses.ts
│
├── components/
│   ├── AddressCard.tsx
│   └── AddressForm.tsx
│
├── screens/
│   ├── AddressListScreen.tsx
│   ├── AddAddressScreen.tsx
│   └── EditAddressScreen.tsx
│
├── types/
│   └── address.ts
│
└── navigation/
    └── ...
```

If equivalent files/components already exist, extend them rather than creating duplicates.

---

# 9. Address Data Model

Use the actual Day 17 API/schema as the source of truth.

The expected address structure is approximately:

```typescript
type Address = {
  id: string;
  userId?: string;
  addressLine: string;
  city: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  updatedAt?: string;
};
```

Important:

Do not expose `userId` as a user-editable field.

The authenticated user is determined by the existing authentication system.

Coordinates should not be normal prominent form fields unless the existing backend/API specifically requires customers to provide them.

---

# 10. API Layer

Reuse the existing central API client.

Do NOT create another generic `fetch()` wrapper.

If the project does not already have an address API module, create:

```text
src/api/addresses.ts
```

Possible functions:

```typescript
getAddresses()

createAddress(data)

updateAddress(id, data)

deleteAddress(id)
```

The exact return types and implementation must follow the existing API architecture.

---

# 11. Authentication

The address API is authenticated.

Reuse the authentication/token mechanism already implemented.

Do NOT:

* manually read tokens in every screen
* duplicate JWT logic
* store another token
* create another auth context
* hardcode authorization headers inside Address screens

The central API client should handle authentication in the same way as the existing Cart/Product/Auth API calls.

---

# 12. Address List Screen

Create or implement:

```text
AddressListScreen
```

Suggested UI:

```text
┌─────────────────────────────────┐
│ ←    Delivery Address           │
│                                 │
│ Saved Addresses                 │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 123 Main Street             │ │
│ │ Sector 10                   │ │
│ │ Delhi - 110001              │ │
│ │                             │ │
│ │ Edit              Delete    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 45 Park Road                │ │
│ │ Noida                       │ │
│ │ Uttar Pradesh - 201301     │ │
│ │                             │ │
│ │ Edit              Delete    │ │
│ └─────────────────────────────┘ │
│                                 │
│       + Add New Address         │
└─────────────────────────────────┘
```

This is only an example.

Use actual data from the API.

---

# 13. Address Card

Create/reuse:

```text
AddressCard
```

Each card should display useful address information.

At minimum:

```text
addressLine
city
pincode
```

If the backend contains additional supported display fields, use them only when appropriate.

Actions:

```text
Edit
Delete
```

The card should also support selection.

---

# 14. Address Selection

Day 18 should implement visual address selection.

Example:

```text
● 123 Main Street
  Sector 10
  Delhi - 110001
```

Unselected:

```text
○ 45 Park Road
  Noida
  Uttar Pradesh - 201301
```

Selected indicator:

```text
#145C38
```

Unselected indicator:

```text
#6B6560
```

Selection should be local UI state for now unless the existing application architecture already has a checkout/address selection state.

Do NOT create order creation logic.

The purpose is to prepare the selected address for the upcoming checkout flow.

---

# 15. Selection Rules

Only one address should be selected at a time.

For example:

```text
Address A → selected
Address B → selected
```

should result in:

```text
Address A → unselected
Address B → selected
```

Do not allow multiple selected addresses.

---

# 16. Add Address Screen

Create:

```text
AddAddressScreen
```

Suggested UI:

```text
┌─────────────────────────────────┐
│ ←    Add Address                │
│                                 │
│ Address                         │
│ ┌─────────────────────────────┐ │
│ │ Enter address               │ │
│ └─────────────────────────────┘ │
│                                 │
│ City                            │
│ ┌─────────────────────────────┐ │
│ │ Enter city                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ Pincode                         │
│ ┌─────────────────────────────┐ │
│ │ 110001                      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │       Save Address          │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

Use the shared:

```text
AddressForm
```

component.

---

# 17. Edit Address Screen

Create:

```text
EditAddressScreen
```

It should:

1. Receive the address ID through navigation.
2. Load or use the existing address data.
3. Pre-populate the form.
4. Allow editing.
5. Submit a PATCH request.
6. Show mutation loading state.
7. Return to the address list.
8. Show the updated address.

Example:

```text
Address ID
    ↓
EditAddressScreen
    ↓
AddressForm
    ↓
PATCH /api/addresses/:id
    ↓
AddressListScreen
```

---

# 18. Shared AddressForm

Create one reusable form:

```text
AddressForm
```

It should support:

```text
mode="create"
```

and:

```text
mode="edit"
```

or an equivalent project-appropriate approach.

Fields:

```text
Address Line
City
Pincode
```

Coordinates should remain hidden/optional unless required by the existing API.

---

# 19. Form Validation

Validate before submitting.

### Address

Required.

Do not allow:

```text
empty string
```

or whitespace-only values.

### City

Required.

### Pincode

Must be an Indian 6-digit pincode.

Valid examples:

```text
110001
400001
560001
```

Invalid examples:

```text
123
1234567
abcdef
12ab56
```

Use the project's existing validation style if one already exists.

Do not create unnecessary complex validation.

---

# 20. Pincode Keyboard

On mobile, use an appropriate numeric keyboard for:

```text
Pincode
```

For React Native this may be:

```text
keyboardType="number-pad"
```

or the project's existing equivalent.

Do not use a normal full keyboard unnecessarily.

---

# 21. Keyboard Handling

The form must remain usable when the keyboard opens.

Ensure:

* fields remain visible
* save button is reachable
* content can scroll
* keyboard does not permanently cover the active input

Use the existing project keyboard handling pattern.

If none exists, use a simple reliable React Native approach.

Do not introduce a large new dependency only for this.

---

# 22. Loading State

The address list should show an appropriate loading state while:

```text
GET /api/addresses
```

is executing.

Follow the existing Sainik Mart loading pattern.

Preferred:

```text
Cream background
+
centered spinner/loading indicator
```

Do not create a new loading architecture.

---

# 23. Empty State

When the API returns:

```text
[]
```

show:

```text
No saved addresses

Add your delivery address
to continue with your order.

[ + Add Address ]
```

Use:

```text
background: #F6F4EF
text_secondary: #6B6560
primary button: #145C38
```

The empty state should feel intentional rather than like a broken screen.

---

# 24. Error State

If loading addresses fails:

```text
Unable to load addresses

Please try again.

[ Retry ]
```

The Retry button should call the same address-loading function again.

Do not silently fail.

Do not show raw backend stack traces to the customer.

---

# 25. Mutation Loading

When saving:

```text
Save Address
```

disable the submit action while the request is in progress.

Example:

```text
Saving...
```

or use the existing button loading pattern.

Prevent accidental duplicate submissions.

The same applies to:

* Edit
* Delete

---

# 26. Delete Address

Deleting an address is destructive.

Do NOT immediately delete after tapping Delete.

Show confirmation.

Example:

```text
Delete address?

Are you sure you want to remove this address?

Cancel       Delete
```

Use:

```text
danger: #B91C1C
```

for the destructive action.

Cancel should close the dialog.

Delete should call:

```text
DELETE /api/addresses/:id
```

---

# 27. Delete Success

After successful deletion:

* remove the address from the UI
* or reload the list
* show appropriate existing success feedback if the project already has one
* do not leave stale data visible

Follow the project's existing mutation/update pattern.

---

# 28. Create Success

After successful creation:

```text
POST /api/addresses
```

the app should:

1. complete the mutation
2. navigate back to AddressListScreen
3. refresh/update the list
4. show the newly created address

Do not leave the user on the Add Address form after successful creation.

---

# 29. Edit Success

After successful edit:

```text
PATCH /api/addresses/:id
```

the app should:

1. complete the mutation
2. navigate back
3. update/refresh the list
4. display the updated address

---

# 30. Navigation

Follow the existing navigation architecture.

Possible structure:

```text
MainNavigator
│
├── Home
├── Categories
├── ProductDetails
├── Cart
├── Addresses
│   ├── AddAddress
│   └── EditAddress
├── Orders
└── Profile
```

Do NOT replace the existing navigation system.

Add only the routes required for Day 18.

---

# 31. Navigation Flow

Expected:

```text
Cart
  ↓
AddressList
  ↓
AddAddress
  ↓
AddressList
```

Edit:

```text
AddressList
  ↓
EditAddress
  ↓
AddressList
```

Delete:

```text
AddressList
  ↓
Confirmation
  ↓
AddressList
```

Selection:

```text
AddressList
  ↓
Select Address
  ↓
Selected state visible
```

No order should be created.

---

# 32. Back Navigation

Ensure:

### Android

Physical/system back button behaves correctly.

### iOS

Navigation back button behaves correctly.

For example:

```text
AddAddress → Back → AddressList
```

and:

```text
EditAddress → Back → AddressList
```

Do not leave broken navigation stacks.

---

# 33. Safe Area

Use the existing safe-area implementation.

Address screens should work correctly with:

* iPhone notch
* iPhone Dynamic Island
* Android status bar
* Android navigation area

Do not hardcode screen heights.

---

# 34. Responsive Layout

Do not use fixed widths that only work on one phone.

Use:

```text
flex
width: "100%"
padding
margin
```

and the project's existing responsive utilities where available.

Test conceptually on:

* small Android
* large Android
* iPhone

---

# 35. Accessibility

Respect the existing design system.

Minimum tap targets:

```text
iOS: 44pt
Android: 48dp
```

Buttons such as:

```text
Edit
Delete
Add Address
Save Address
Retry
```

must be easy to tap.

Ensure text has sufficient contrast.

Avoid tiny interactive icons.

---

# 36. API Error Handling

Handle common situations:

### 401

Use the existing authentication/session handling.

Do not invent a new login redirect system.

### 400 / validation

Show a user-friendly message.

### 404

If an address no longer exists, handle gracefully.

### 500/network error

Show:

```text
Something went wrong.
Please try again.
```

or reuse the existing global error message pattern.

Do not expose:

```text
Prisma error
stack trace
SQL error
Axios internals
```

to customers.

---

# 37. State Management

Do NOT introduce:

```text
Redux
Zustand
MobX
Recoil
```

unless one is already part of the existing application architecture.

Day 18 can use local React state.

Example conceptual state:

```typescript
const [addresses, setAddresses] = useState<Address[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
```

Use the project's existing patterns if they differ.

---

# 38. Avoid Duplicate API Calls

Be careful with:

```text
useEffect
```

and navigation focus events.

Do not accidentally trigger:

```text
GET /api/addresses
GET /api/addresses
GET /api/addresses
```

on every render.

Use the existing navigation lifecycle pattern if one exists.

---

# 39. Address List Refresh

After:

```text
Create
Edit
Delete
```

the list must reflect the latest backend state.

Possible approaches:

### Option A

Refetch:

```text
GET /api/addresses
```

### Option B

Update local state using the mutation response.

Prefer whichever pattern is already used elsewhere in the project.

Do not introduce a new state management architecture just for addresses.

---

# 40. Source of Truth

The backend remains the source of truth.

Do not calculate or invent:

* address IDs
* user IDs
* address ownership
* database state

The mobile app displays the backend response.

---

# 41. Security Requirements

The mobile client must never send arbitrary:

```text
userId
```

to determine ownership.

The backend already derives ownership from the authenticated JWT.

The UI should simply call:

```text
GET /api/addresses
```

and:

```text
PATCH /api/addresses/:id
```

etc.

---

# 42. Physical Android Testing

If testing on a physical Android device:

Do NOT hardcode:

```text
localhost
```

for the API unless the project's existing networking setup explicitly supports it.

Use the existing environment/API configuration from Day 7 onward.

Do not modify environment architecture unnecessarily.

---

# 43. Reuse Existing Components

Before creating a new component, search the project.

Potential reusable components:

```text
Button
Input
TextInput
Screen
Header
Loading
EmptyState
ErrorState
Modal
Card
```

If an existing component provides the needed behavior, reuse it.

Do not create:

```text
Button2
CustomButtonNew
InputV2
LoadingNew
```

without a genuine need.

---

# 44. Styling Rules

Use the existing theme/design tokens.

Do not scatter arbitrary values such as:

```typescript
backgroundColor: "#123456"
```

when an existing theme token exists.

Prefer:

```text
primary
background
surface
textPrimary
textSecondary
danger
accent
```

through the existing project theme.

The final UI must visually match the rest of Sainik Mart.

---

# 45. Suggested Visual Hierarchy

Address List:

```text
Screen background
    ↓
Page header
    ↓
"Saved Addresses"
    ↓
Address cards
    ↓
Add Address CTA
```

Address Form:

```text
Header
    ↓
Form fields
    ↓
Validation messages
    ↓
Save button
```

Keep whitespace comfortable.

Do not overcrowd the screen.

---

# 46. Day 18 User Journey

The complete expected journey:

```text
Login
  ↓
Home
  ↓
Cart
  ↓
Proceed / Address
  ↓
Address List
  ↓
No addresses?
  ↓
Add Address
  ↓
Enter address
  ↓
Save
  ↓
Address List
  ↓
Address appears
  ↓
Select address
  ↓
Edit address
  ↓
Update
  ↓
Address List
  ↓
Delete
  ↓
Confirmation
  ↓
Delete
  ↓
Address disappears
```

The final step is only:

```text
Selected address is ready for the next checkout step.
```

Do NOT implement checkout.

---

# 47. Testing Checklist

## Address List

* [ ] Screen opens
* [ ] API request executes
* [ ] Loading state appears
* [ ] Addresses render
* [ ] Multiple addresses render
* [ ] Empty state works
* [ ] Error state works
* [ ] Retry works

## Add

* [ ] Add Address opens
* [ ] Address field works
* [ ] City field works
* [ ] Pincode field works
* [ ] Numeric keyboard appears for pincode
* [ ] Required validation works
* [ ] Pincode validation works
* [ ] Save works
* [ ] Save loading state works
* [ ] Duplicate submissions are prevented
* [ ] New address appears after creation

## Edit

* [ ] Edit opens
* [ ] Existing data is prefilled
* [ ] Fields can be changed
* [ ] Validation works
* [ ] Update works
* [ ] Loading state works
* [ ] Updated address appears in list

## Delete

* [ ] Delete button works
* [ ] Confirmation dialog appears
* [ ] Cancel does not delete
* [ ] Delete calls correct API
* [ ] Loading state works
* [ ] Address disappears after success

## Selection

* [ ] Address can be selected
* [ ] Selected state is visually obvious
* [ ] Only one address can be selected
* [ ] Selecting another address changes selection

## Navigation

* [ ] Back works
* [ ] Android back works
* [ ] Add → List works
* [ ] Edit → List works
* [ ] No broken navigation stack

## Authentication

* [ ] Authenticated user can access addresses
* [ ] Existing 401/session behavior works

## UI

* [ ] `design.md` tokens are followed
* [ ] Cream background used
* [ ] White address cards used
* [ ] Green primary actions used
* [ ] Orange accent used sparingly
* [ ] Danger actions use danger color
* [ ] Tap targets are large enough
* [ ] Keyboard does not hide fields
* [ ] Safe area works
* [ ] No fixed-width layout problems

---

# 48. API Integration Verification

Verify each API independently.

### GET

```text
GET /api/addresses
```

Expected:

```text
200
[
  ...
]
```

### POST

```text
POST /api/addresses
```

Expected:

```text
201
{
  ...
}
```

### PATCH

```text
PATCH /api/addresses/:id
```

Expected:

```text
200
{
  ...
}
```

### DELETE

```text
DELETE /api/addresses/:id
```

Expected:

```text
200/204
```

Use the actual backend response convention from Day 17.

Do not assume a response format if the project already defines one.

---

# 49. Do Not Modify Backend Unless Necessary

Day 17 is the backend implementation.

Day 18 is primarily mobile.

If API integration reveals a genuine mismatch:

1. Identify the mismatch.
2. Confirm it against the actual Day 17 implementation.
3. Make the smallest safe change.
4. Do not redesign the backend.
5. Do not introduce unrelated backend features.

Never perform destructive database changes as part of Day 18.

---

# 50. Code Quality Requirements

Follow existing project conventions for:

* TypeScript
* naming
* imports
* components
* hooks
* API calls
* navigation
* styling
* error handling

Avoid:

* `any`
* duplicated logic
* duplicated API clients
* duplicated forms
* giant screen components
* unnecessary dependencies
* dead code
* commented-out old implementations
* hardcoded API URLs
* hardcoded fake address data

---

# 51. Recommended Implementation Order

Implement in this order:

## Step 1

Inspect Days 1–17.

## Step 2

Confirm Day 17 API contract.

## Step 3

Inspect existing navigation.

## Step 4

Inspect reusable components and theme.

## Step 5

Create/extend address API module.

## Step 6

Create address types if required.

## Step 7

Create `AddressCard`.

## Step 8

Create `AddressListScreen`.

Implement:

```text
loading
success
empty
error
retry
```

## Step 9

Create shared `AddressForm`.

## Step 10

Create `AddAddressScreen`.

## Step 11

Create `EditAddressScreen`.

## Step 12

Implement delete confirmation.

## Step 13

Implement address selection.

## Step 14

Connect navigation.

## Step 15

Run TypeScript checks.

## Step 16

Run lint/tests/build checks available in the project.

## Step 17

Review the complete Day 18 flow manually.

## Step 18

Inspect:

```text
git status
git diff
```

and make sure no unrelated changes were introduced.

---

# 52. Verification Commands

Use the project's existing scripts first.

Possible checks:

```bash
npx tsc --noEmit
```

If configured:

```bash
npm run lint
```

If configured:

```bash
npm test
```

For Expo:

```bash
npx expo-doctor
```

Do not run commands that modify the database destructively.

Do not reset the database.

Do not delete migrations.

---

# 53. Final Audit

Before declaring Day 18 complete, verify:

### Architecture

```text
Screen
 ↓
API module
 ↓
Existing API client
 ↓
Backend
```

No duplicated networking architecture.

### Authentication

Uses existing auth.

### Design

Uses `design.md`.

### State

No unnecessary global state.

### Navigation

Works on iOS and Android.

### API

All four Address CRUD operations work.

### UX

Loading, empty, error, retry and mutation states are handled.

### Security

No client-controlled user ownership.

### Scope

No checkout/order/payment implementation.

---

# 54. Git Review

Before finishing:

```bash
git status
```

Then:

```bash
git diff
```

Review the changes.

Make sure the changes are limited to Day 18.

Do not modify unrelated files.

Do not commit automatically unless the project workflow explicitly requires Cursor to commit.

---

# 55. Day 18 Definition of Done

Day 18 is complete when the following flow works:

```text
Login
  ↓
Home
  ↓
Cart
  ↓
Address
  ↓
Address List
  ↓
Add Address
  ↓
Save
  ↓
Address appears
  ↓
Select
  ↓
Edit
  ↓
Update
  ↓
Delete
  ↓
Confirm
  ↓
Address disappears
```

And the UI follows:

```text
Sainik Mart Design System v1.2.0
```

with:

```text
Background: #F6F4EF
Surface: #FFFFFF
Primary: #145C38
Accent: #E85A20
Text: #1A241C
Secondary: #6B6560
Danger: #B91C1C
```

---

# 56. Final Cursor Checkpoint

After implementation and verification, Cursor must return exactly one of these:

If everything is working:

```text
DAY 18 COMPLETE — SAFE TO MOVE TO DAY 19
```

If something is incomplete:

```text
DAY 18 NOT COMPLETE — FIX THE FOLLOWING FIRST
```

If incomplete, list:

1. The exact issue
2. The affected file
3. Why it is incomplete
4. What remains to be fixed

Do not claim completion if the address flow has not been tested.

---

# 57. Important Cursor Instructions

When implementing Day 18:

> **Do not blindly follow this document if the existing codebase has a different established architecture.**

Instead:

1. Inspect the existing code.
2. Identify the project's actual conventions.
3. Reuse them.
4. Adapt this plan to the existing architecture.
5. Do not introduce unnecessary new patterns.

The existing codebase + `design.md` + Day 17 implementation are the primary sources of truth.

Day 18 should be implemented as a **clean extension of Days 1–17**, not as an isolated feature.

---

# END OF DAY 18 IMPLEMENTATION PLAN
