# Sainik Mart — Day 32 Implementation Plan

## Firebase Cloud Messaging (FCM) Notifications

**Day:** 32
**Week:** 5 — Payments, Notifications & Deployment
**Estimated effort:** 2.5–3 hours
**Primary goal:** Implement the Sainik Mart push-notification pipeline using Firebase Cloud Messaging so customers can receive important order-related notifications on their Android/iOS devices.

---

# 1. Day 32 Objective

By the end of Day 32, this flow should work:

```text
Customer Mobile App
        │
        │ Request notification permission
        ▼
Mobile Device
        │
        │ Generate native FCM device token
        ▼
Sainik Mart Backend
        │
        │ Store token against authenticated user
        ▼
Order / Order Status Event
        │
        ▼
Firebase Admin SDK
        │
        │ Send notification
        ▼
Firebase Cloud Messaging
        │
        ▼
Customer Mobile Device
```

The implementation should support the important MVP scenarios:

1. Customer grants notification permission.
2. Mobile app obtains the device's push/FCM token.
3. Mobile app registers the token with the backend.
4. Backend associates the token with the authenticated customer.
5. Backend can send an FCM notification to that customer.
6. Creating an order can trigger an order confirmation notification.
7. Admin changing an order status can trigger a status notification.
8. Tapping an order notification can navigate the customer toward the relevant order.
9. Invalid/expired FCM tokens are cleaned up.
10. Notification failures must not cause an otherwise successful order/status update to fail.

---

# 2. Important Expo Decision

The mobile application uses:

```text
React Native
Expo
TypeScript
```

Do NOT assume that Firebase native messaging works inside ordinary Expo Go.

Because the project is intended to use EAS production builds, configure the notification functionality for the actual Expo/EAS build environment.

For the MVP, prefer an Expo-compatible approach that can obtain the native device push token and allow the backend to send directly through Firebase Cloud Messaging.

If the existing project already uses `expo-notifications`, reuse it.

Do not introduce `@react-native-firebase/messaging` unless the existing project architecture already requires it.

The implementation must remain compatible with the project's existing Expo/EAS setup.

---

# 3. Scope of Day 32

## IN SCOPE

### Mobile

* Notification permission handling
* Native device/FCM token retrieval
* Token registration with backend
* Token refresh/re-registration handling where applicable
* Foreground notification handling
* Notification tap handling
* Android notification channel
* Basic notification configuration
* Order-related notification payload handling

### Backend

* Firebase Admin SDK
* Firebase initialization
* Device token storage
* Device-token registration API
* Device-token removal API
* Notification service
* Sending notifications to a user's registered devices
* Invalid token cleanup
* Order-created notification
* Order-status notification

### Testing

* Token registration
* Notification delivery
* Order notification
* Status notification
* Invalid token handling
* Authentication/ownership
* Notification failure isolation

---

# 4. OUT OF SCOPE

Do NOT implement:

* Notification center
* In-app notification history
* Read/unread notification database
* Notification analytics
* Marketing campaigns
* Scheduled notifications
* Promotional notification engine
* Segmentation
* Delivery-partner notifications
* Advanced notification preferences
* SMS
* Email notifications
* WhatsApp notifications
* Live delivery tracking
* Background location
* Complex deep-linking system
* Microservices/event bus
* Redis queues
* Kafka/RabbitMQ
* Advanced retry infrastructure

Day 32 should establish a reliable MVP notification foundation.

---

# 5. Firebase Project Setup

Create/configure a Firebase project for Sainik Mart.

The project should contain:

```text
Firebase Project
│
├── Android App
├── iOS App
└── Cloud Messaging
```

Use the actual package/bundle identifiers configured for the Sainik Mart Expo application.

Verify:

* Android application ID
* iOS bundle identifier
* Firebase Cloud Messaging enabled
* Android Firebase configuration
* iOS/APNs configuration when preparing iOS builds

Do not commit Firebase credentials or private service-account files into Git.

---

# 6. Backend Firebase Admin Setup

Install the Firebase Admin SDK in the backend.

Conceptually:

```text
Express Backend
      │
      ▼
Firebase Admin SDK
      │
      ▼
Firebase Cloud Messaging
```

Create a dedicated notification module/service.

Recommended structure:

```text
src/
├── modules/
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── orders/
│   ├── payments/
│   └── notifications/
│       ├── notification.routes.ts
│       ├── notification.controller.ts
│       ├── notification.service.ts
│       ├── notification.validation.ts
│       └── firebase.ts
```

Follow the existing backend architecture.

Do not create a second API architecture.

---

# 7. Firebase Credentials

Firebase Admin credentials must remain server-side.

Possible production configuration:

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

If the project already uses another secure Firebase credential configuration, reuse it.

Important:

```text
Mobile App
❌ Firebase Admin credentials

Backend
✅ Firebase Admin credentials
```

Never expose:

* private key
* service account credentials
* Firebase Admin credentials
* server credentials

to the React Native application.

Never commit them to Git.

---

# 8. Firebase Initialization

Create a single Firebase Admin initialization layer.

Conceptually:

```text
firebase.ts
      │
      ▼
Firebase Admin App
      │
      ▼
Messaging
```

Requirements:

* Initialize Firebase once.
* Reuse the Firebase Admin instance.
* Avoid initializing Firebase on every request.
* Fail clearly if required production configuration is missing.
* Do not expose credentials through API responses.

The notification service should use this initialized Firebase messaging instance.

---

# 9. Database Design

A customer may have multiple devices.

Therefore, do NOT simply add:

```text
users.fcmToken
```

unless the existing architecture explicitly requires a single-device model.

For the MVP, a separate table is preferable:

```text
DeviceToken
```

Recommended structure:

```text
DeviceToken
--------------------------------
id
userId
token
platform
createdAt
updatedAt
```

Relationship:

```text
User
 │
 └── DeviceToken[]
```

Platform can represent:

```text
ANDROID
IOS
```

Use the project's existing enum conventions.

---

# 10. Device Token Constraints

A token should not be duplicated unnecessarily.

Recommended:

```text
unique(token)
```

or an equivalent uniqueness strategy.

The same user may have:

```text
Android phone
iPhone
tablet
```

Therefore:

```text
One User
   │
   ├── Device Token 1
   ├── Device Token 2
   └── Device Token 3
```

Do not assume one token per customer.

---

# 11. Prisma Migration

If `DeviceToken` does not already exist:

1. Add Prisma model.
2. Add User → DeviceToken relation.
3. Add appropriate indexes/unique constraint.
4. Create migration.
5. Run migration.
6. Generate Prisma client.
7. Verify existing users remain intact.

Do NOT:

* delete existing users
* reset the database
* drop tables
* modify historical orders

---

# 12. Device Token API

Create authenticated endpoints.

Recommended:

```http
POST /api/notifications/device-token
```

Request:

```json
{
  "token": "FCM_DEVICE_TOKEN",
  "platform": "ANDROID"
}
```

The authenticated user must come from JWT:

```text
req.user.id
```

Never accept:

```json
{
  "userId": "..."
}
```

as the source of ownership.

---

# 13. Token Registration Logic

When the mobile app registers a token:

```text
JWT
 ↓
Authenticated User
 ↓
Receive token
 ↓
Validate token/platform
 ↓
Check existing token
 ↓
Create or update DeviceToken
```

If the token already exists:

* update its association/timestamps if appropriate
* do not create duplicates

If it does not exist:

* create a new DeviceToken record.

---

# 14. Token Removal API

Create:

```http
DELETE /api/notifications/device-token
```

Request conceptually:

```json
{
  "token": "FCM_DEVICE_TOKEN"
}
```

Only the authenticated user's token should be removable.

This is especially useful during logout:

```text
Logout
 ↓
Remove device token
 ↓
Clear local auth
```

This prevents notifications from being sent to the wrong account if multiple customers use the same device.

---

# 15. Notification Service

Create a reusable:

```text
NotificationService
```

Responsibilities:

```text
sendToUser()
sendToTokens()
sendOrderCreatedNotification()
sendOrderStatusNotification()
```

Conceptually:

```text
NotificationService
       │
       ├── Find user's DeviceTokens
       │
       ├── Build FCM payload
       │
       ├── Send through Firebase
       │
       └── Remove invalid tokens
```

Keep Firebase-specific implementation inside this service.

Controllers should not contain Firebase logic.

---

# 16. Generic Notification Payload

Use a predictable payload structure.

Example:

```json
{
  "notification": {
    "title": "Order Placed",
    "body": "Your Sainik Mart order has been placed successfully."
  },
  "data": {
    "type": "ORDER_CREATED",
    "orderId": "12345"
  }
}
```

For status changes:

```json
{
  "notification": {
    "title": "Order Update",
    "body": "Your order is now out for delivery."
  },
  "data": {
    "type": "ORDER_STATUS_UPDATED",
    "orderId": "12345",
    "status": "OUT_FOR_DELIVERY"
  }
}
```

Keep `data` values compatible with FCM's expected string-based data payload.

---

# 17. Order Created Notification

Integrate notification sending into the existing Day 19 order creation flow.

Current flow:

```text
POST /api/orders
      ↓
Validate address
      ↓
Validate cart
      ↓
Validate products/stock
      ↓
Calculate prices
      ↓
Create Order
      ↓
Create OrderItems
      ↓
Reduce stock
      ↓
Clear cart
      ↓
Return order
```

Add notification AFTER successful order creation:

```text
Successful transaction
        ↓
Order created
        ↓
Send notification
```

Example:

```text
Title:
Order Placed

Body:
Your Sainik Mart order has been placed successfully.
```

Include:

```text
type = ORDER_CREATED
orderId = created order ID
```

---

# 18. Critical Notification Rule

Notification failure must NOT roll back a successful order.

Bad:

```text
Create Order
   ↓
Send FCM
   ↓
FCM fails
   ↓
Order fails
```

Correct:

```text
Create Order
   ↓
Transaction succeeds
   ↓
Return successful order
   ↓
Attempt notification
   ↓
Notification succeeds/fails independently
```

For the MVP, catch and log notification errors after the successful database transaction.

Do not put an external FCM network call inside the Prisma transaction.

---

# 19. Admin Order Status Notification

Integrate notification sending into the Day 27 admin order status update flow.

Current:

```text
Admin
 ↓
PATCH /api/admin/orders/:id/status
 ↓
Validate admin
 ↓
Validate order
 ↓
Validate status
 ↓
Update order
```

Add:

```text
Order status updated successfully
        ↓
Send FCM notification
```

Example mappings:

```text
CONFIRMED
→ "Your order has been confirmed."

PACKING
→ "Your order is being packed."

OUT_FOR_DELIVERY
→ "Your order is out for delivery."

DELIVERED
→ "Your order has been delivered."

CANCELLED
→ "Your order has been cancelled."
```

Do not create notifications for invalid/failed status changes.

---

# 20. Notification Failure Handling

Firebase may report invalid/unregistered tokens.

If a token is no longer valid:

```text
FCM response
    ↓
Invalid/unregistered token
    ↓
Delete DeviceToken
```

This prevents the database from accumulating dead tokens.

Do not allow one invalid token to prevent delivery to other valid devices.

Example:

```text
User
 ├── Token A ❌ invalid
 ├── Token B ✅
 └── Token C ✅

Result:

Delete Token A
Send to B
Send to C
```

---

# 21. Mobile Notification Permission

On the mobile application:

1. Ask the user for notification permission.
2. Check current permission status.
3. Request permission only when appropriate.
4. Do not repeatedly show permission prompts unnecessarily.
5. Continue allowing the application to function if permission is denied.

Do not make notifications a requirement for:

* login
* browsing
* cart
* checkout
* ordering

---

# 22. Mobile Token Registration

After permission is granted:

```text
Request permission
       ↓
Get native device token
       ↓
POST /api/notifications/device-token
       ↓
Backend stores token
```

Registration should occur only for an authenticated customer.

Do not attempt to register a token using an unauthenticated API.

Use the existing:

* API client
* auth token
* environment configuration
* error handling

Do not create a second HTTP client.

---

# 23. Token Refresh

Device tokens can change.

The application should handle token changes where supported by the chosen Expo notification implementation.

When a new token is received:

```text
New token
   ↓
Register with backend
   ↓
Backend creates/updates token
```

Do not assume that a token remains permanent.

---

# 24. Android Notification Channel

Create an order notification channel.

Example:

```text
Channel ID:
orders
```

Purpose:

```text
Sainik Mart Orders
```

Configure sensible importance and behavior.

Do not create dozens of channels.

For the MVP:

```text
orders
```

is enough.

---

# 25. Foreground Notifications

When the app is open and a notification arrives:

```text
FCM
 ↓
Mobile app in foreground
 ↓
Notification handler
```

Configure the behavior so the user receives appropriate feedback.

Avoid creating duplicate notifications.

The exact implementation should follow the notification library already used by the Expo project.

---

# 26. Notification Tap Handling

When the user taps:

```text
Order Placed
```

or:

```text
Order Status Updated
```

the application should be able to identify:

```text
type
orderId
```

Example:

```text
Notification tap
      ↓
data.type = ORDER_STATUS_UPDATED
      ↓
data.orderId = abc123
      ↓
Navigate to Order Details
```

Reuse the existing navigation structure from Day 23.

Do not create a second navigation system.

---

# 27. Authentication Consideration

Notification registration should happen after authentication is available.

Recommended:

```text
Login
  ↓
JWT available
  ↓
Request notification permission
  ↓
Get device token
  ↓
Register token
```

For logout:

```text
DELETE device token
  ↓
Clear authentication
```

This is important because the same physical device could later be used by another customer.

---

# 28. Environment Separation

Do not mix development and production Firebase credentials.

Use environment-specific configuration.

Conceptually:

```text
Development
   ↓
Development Firebase configuration

Production
   ↓
Production Firebase configuration
```

The backend should use environment variables/secrets.

Never hardcode credentials.

---

# 29. Security Requirements

The following are mandatory:

### Authentication

Device-token registration requires JWT.

### Ownership

A customer can only manage their own tokens.

### Admin

Only existing admin authorization can update orders.

### Server authority

Never accept:

```text
userId
```

from the client as the ownership source.

Use:

```text
req.user.id
```

### Credentials

Firebase Admin credentials remain on the backend.

### Logging

Never log:

* Firebase private keys
* service-account credentials
* JWTs
* sensitive authentication data

Device tokens should also not be unnecessarily printed in production logs.

---

# 30. API Error Handling

Reuse existing error conventions.

Examples:

```text
401
Unauthenticated

400
Invalid device token/platform

404
Resource not found where applicable

500
Internal notification infrastructure error
```

However, a notification infrastructure failure should not turn a successful order creation into a failed order response.

---

# 31. Testing Plan

## Test 1 — Token Registration

```text
Login
 ↓
Allow notification permission
 ↓
Token generated
 ↓
POST device-token
```

Verify token exists in PostgreSQL.

---

## Test 2 — Duplicate Registration

Register the same token twice.

Expected:

```text
One token record
```

not:

```text
Two duplicate records
```

---

## Test 3 — Multiple Devices

Same user:

```text
Device A
Device B
```

Both tokens should be stored.

Send notification.

Both devices should receive it.

---

## Test 4 — Order Created

Create an order.

Expected:

```text
Order created successfully
+
Order notification received
```

---

## Test 5 — Notification Failure

Temporarily make FCM unavailable/invalid.

Expected:

```text
Order creation still succeeds.
```

Notification failure should be logged safely.

---

## Test 6 — Admin Status Update

Admin changes:

```text
PENDING → CONFIRMED
```

Expected:

```text
Customer receives notification.
```

Repeat for relevant statuses.

---

## Test 7 — Customer Isolation

Customer A must not be able to register/remove Customer B's token.

---

## Test 8 — Invalid Token

Use an invalid/expired token.

Expected:

```text
FCM rejects token
       ↓
Token removed from database
```

---

## Test 9 — Logout

```text
Login
 ↓
Token registered
 ↓
Logout
 ↓
Token removed
```

---

## Test 10 — Notification Tap

Tap an order notification.

Expected:

```text
Order Details Screen
```

with the correct order ID.

---

# 32. Day 32 Regression Testing

Verify that existing functionality still works:

### Customer

* Register
* Login
* Home
* Categories
* Products
* Search
* Cart
* Address
* Checkout
* Create Order
* My Orders
* Order Details

### Admin

* Admin login
* Dashboard
* Category management
* Product management
* Inventory
* Order list
* Order details
* Status update

FCM must not break any of these flows.

---

# 33. Files/Areas Cursor Should Inspect First

Before implementation, inspect:

```text
backend/
├── src/
│   ├── auth/
│   ├── orders/
│   ├── users/
│   ├── middleware/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── prisma/
```

and:

```text
mobile/
├── app/
├── src/
├── navigation/
├── services/
├── api/
├── components/
├── screens/
└── config/
```

Also inspect:

```text
app.json
app.config.*
eas.json
package.json
schema.prisma
```

Do not blindly create duplicate folders or infrastructure.

---

# 34. Implementation Order

Follow this order:

### Step 1

Inspect existing architecture.

### Step 2

Configure Firebase project.

### Step 3

Configure Expo/EAS Firebase/notification requirements.

### Step 4

Add DeviceToken Prisma model if required.

### Step 5

Run migration.

### Step 6

Install/configure Firebase Admin SDK.

### Step 7

Create Firebase initialization.

### Step 8

Create NotificationService.

### Step 9

Create device-token registration/removal APIs.

### Step 10

Implement mobile permission/token retrieval.

### Step 11

Register token with backend.

### Step 12

Implement Android notification channel.

### Step 13

Implement foreground notification handling.

### Step 14

Implement notification tap handling.

### Step 15

Integrate order-created notification.

### Step 16

Integrate order-status notification.

### Step 17

Implement invalid-token cleanup.

### Step 18

Test complete flow.

### Step 19

Run lint/type-check/tests.

### Step 20

Review Git diff and environment/secrets.

---

# 35. Definition of Done

Day 32 is complete only when:

* [ ] Firebase project configured.
* [ ] Expo/EAS notification configuration is correct.
* [ ] Firebase Admin SDK works in backend.
* [ ] Firebase credentials are environment-based.
* [ ] DeviceToken database model exists if required.
* [ ] Prisma migration succeeds.
* [ ] Authenticated device-token registration works.
* [ ] Device-token removal works.
* [ ] Multiple devices per customer are supported.
* [ ] Mobile app can request notification permission.
* [ ] Mobile app obtains native push/FCM token.
* [ ] Token reaches backend.
* [ ] Backend stores token against authenticated customer.
* [ ] Notification service exists.
* [ ] Backend can send an FCM notification.
* [ ] Order creation triggers an order notification.
* [ ] Admin status update triggers a notification.
* [ ] Invalid tokens are cleaned up.
* [ ] Notification failure cannot roll back successful order creation.
* [ ] Notification tap contains order ID/type.
* [ ] Order notification can navigate to order details.
* [ ] Logout/token cleanup works.
* [ ] No Firebase secrets are committed.
* [ ] No P0 security/data-integrity issue exists.
* [ ] Existing customer/admin flows still work.
* [ ] TypeScript/lint/tests pass.

---

# 36. Day 32 Final Architecture

After completion:

```text
                    ┌─────────────────────┐
                    │   React Native App  │
                    │    Expo + TS        │
                    └──────────┬──────────┘
                               │
                     Device/FCM Token
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Express API      │
                    │     TypeScript      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   DeviceToken DB    │
                    │     PostgreSQL      │
                    └─────────────────────┘

Order Created / Status Changed
              │
              ▼
      NotificationService
              │
              ▼
       Firebase Admin SDK
              │
              ▼
    Firebase Cloud Messaging
              │
              ▼
       Customer Device
```

The important architectural principle is:

```text
Business Event
     ↓
Database operation succeeds
     ↓
Notification attempt
     ↓
Customer receives notification
```

rather than making Firebase part of the database transaction.
