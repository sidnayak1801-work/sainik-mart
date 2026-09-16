Day 9 Implementation Plan — Login/Register Screens + Secure Token Storage

Sprint Context

This plan follows the revised 6-week Blinkit-like Grocery MVP sprint.

Customer mobile: React Native + Expo + TypeScript

Backend: Node.js + Express + TypeScript

Database: PostgreSQL + Prisma

Authentication: JWT + bcrypt

Development machine: macOS

Target platforms: Android + iOS

Day 9 allocation: 3 hours

Day 9 priority: P0

Revised Sprint Row

Week 2 — Auth + Catalog

Day 9: Authentication — Build login/register screens and secure token storage
Deliverable: Customer auth UI
Definition of Done: User can register/login

This matches the revised sprint plan. fileciteturn1file0L17-L24

1. Day 9 Objective

Implement the customer-side authentication flow in the React Native + Expo application.

By the end of Day 9, a customer should be able to:

Open the mobile app.

Navigate to Register.

Register using the real Day 8 backend API.

Receive/store the JWT securely.

Enter the authenticated/main application.

Log in with an existing account.

Store the JWT securely after login.

Restore authentication after restarting the app when the token is valid.

Log out and remove the stored token.

See useful, user-friendly errors for failed authentication.

Do not implement catalog, cart, checkout, payment, orders, notifications, or admin functionality on Day 9.

2. Day 8 → Day 9 Contract

Day 8 should provide the backend authentication APIs:

POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

Before implementing the mobile integration, inspect the actual Day 8 backend implementation.

Do not assume request or response field names.

For example, if the backend returns:

{
  "accessToken": "...",
  "user": {}
}

use that actual contract.

If it returns:

{
  "token": "...",
  "user": {}
}

use that instead.

Do not change the backend merely to match an assumed format.

3. Inspect Existing Work First

Before changing anything:

Inspect the repository.

Inspect the Day 7 React Native/Expo project.

Inspect src/api/client.ts.

Inspect existing navigation.

Inspect existing theme/components.

Inspect .env / .env.example.

Inspect Day 8 backend auth routes/controllers/services.

Inspect JWT response format.

Inspect backend error format.

Inspect TypeScript configuration.

Inspect package.json.

Preserve correct existing work.

Do not recreate the Expo project.

Do not create a second API client.

Do not create a second navigation system.

Do not overwrite Day 7 unnecessarily.

4. Recommended Architecture

Adapt this to the existing Day 7 structure:

mobile/
└── src/
    ├── api/
    │   ├── client.ts
    │   └── auth.ts
    │
    ├── components/
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   ├── Loading.tsx
    │   └── ErrorMessage.tsx
    │
    ├── context/
    │   └── AuthContext.tsx
    │
    ├── navigation/
    │   ├── AppNavigator.tsx
    │   ├── AuthNavigator.tsx
    │   └── MainNavigator.tsx
    │
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.tsx
    │   │   └── RegisterScreen.tsx
    │   └── profile/
    │       └── ProfileScreen.tsx
    │
    ├── storage/
    │   └── authStorage.ts
    │
    ├── types/
    │   └── auth.ts
    │
    └── theme/
        └── index.ts

Keep the architecture lightweight.

5. Secure Token Storage

Use Expo SecureStore for JWT storage.

If not already installed:

npx expo install expo-secure-store

Do not use AsyncStorage for the authentication token.

Create a small storage abstraction such as:

src/storage/authStorage.ts

Conceptually provide:

setToken(token)
getToken()
removeToken()

Screens should not directly call SecureStore.

Preferred flow:

LoginScreen
    ↓
AuthContext
    ↓
auth.ts
    ↓
API client
    ↓
JWT
    ↓
authStorage
    ↓
SecureStore

Never log or display the JWT.

6. Authentication Context

Create a lightweight React Context.

Do not add Redux, Zustand, MobX, or another state-management library.

Expose functionality conceptually similar to:

{
  user,
  token,
  isAuthenticated,
  isLoading,
  login(),
  register(),
  logout()
}

Responsibilities:

check stored token on startup

store token after successful authentication

maintain authenticated user state

clear state on logout

expose login/register/logout actions

Use strict TypeScript types.

Avoid any.

7. Startup Authentication Check

When the app starts:

App starts
   ↓
AuthContext initializes
   ↓
Read JWT from SecureStore
   ↓
No token ─────────────→ Logged out
   ↓
Token exists
   ↓
GET /api/auth/me
   ↓
Valid ────────────────→ Logged in
   ↓
Invalid
   ↓
Remove token
   ↓
Logged out

If /me is available, use it to validate the stored token.

Do not blindly trust the existence of a token.

During the startup check, display a simple loading state so the app does not flash the wrong navigator.

8. Login Screen

Replace the Day 7 placeholder.

Include:

App/product name

Email/phone identifier required by the backend

Password

Login button

Register navigation

Password must use secure text entry.

Do not log passwords.

Do not display JWTs.

Use the reusable Day 7 Input and Button components where appropriate.

9. Login Flow

Implement:

LoginScreen
     ↓
Client validation
     ↓
AuthContext.login()
     ↓
auth.login()
     ↓
POST /api/auth/login
     ↓
Express backend
     ↓
JWT response
     ↓
SecureStore
     ↓
AuthContext state update
     ↓
MainNavigator

Requirements:

disable submit while request is running

show loading state

prevent duplicate submissions

store JWT securely

update user state

enter MainNavigator after success

Prefer authentication-state-driven navigation rather than manually pushing Home.

10. Register Screen

Replace the Day 7 placeholder.

First inspect the Day 8 backend to determine the exact required fields.

Likely fields:

Name

Email/phone

Password

Confirm password

Do not invent unsupported backend fields.

Client-side validation should include:

required fields

email format if email is used

password rules if defined

password confirmation match

Backend validation remains authoritative.

11. Registration Flow

Expected:

RegisterScreen
     ↓
Validate form
     ↓
AuthContext.register()
     ↓
auth.register()
     ↓
POST /api/auth/register
     ↓
Express backend
     ↓
JWT/user response
     ↓
SecureStore
     ↓
Authenticated state
     ↓
MainNavigator

If the backend creates the user but does not return a JWT, follow the actual Day 8 contract and perform the required next step.

Do not invent API behavior.

12. Auth API Module

Create/use:

src/api/auth.ts

Keep authentication API calls here:

login(credentials)
register(data)
getCurrentUser()

Use the centralized Day 7 API client.

Do not put raw fetch calls in screens.

Avoid:

fetch("http://localhost:3000/api/auth/login")

inside LoginScreen.tsx.

Preferred:

LoginScreen
   ↓
AuthContext
   ↓
auth.ts
   ↓
client.ts
   ↓
Express

13. API Client Token Handling

Extend the existing Day 7 API client carefully.

Authenticated requests should eventually send:

Authorization: Bearer <JWT>

If implementing automatic token attachment now, avoid circular dependencies.

Do not:

duplicate token handling in every API module

put JWT in query parameters

log JWTs

Keep the implementation ready for Day 10 protected APIs.

14. Navigation

Use the Day 7 navigation structure:

AppNavigator
├── AuthNavigator
│   ├── Login
│   └── Register
│
└── MainNavigator
    ├── Home
    ├── Categories
    ├── ProductDetails
    ├── Cart
    ├── Orders
    ├── OrderDetails
    └── Profile

Drive navigation from authentication state:

isLoading
   ↓
Loading screen

isAuthenticated = false
   ↓
AuthNavigator

isAuthenticated = true
   ↓
MainNavigator

Do not implement admin role navigation on Day 9.

Day 10 is the authorization/protected-route day.

15. Logout

Implement a basic logout action.

Flow:

Profile
   ↓
Logout
   ↓
authStorage.removeToken()
   ↓
Clear AuthContext
   ↓
AuthNavigator
   ↓
Login

After logout:

token is removed

user state is cleared

authenticated navigation is no longer available

16. Error Handling

Handle:

Invalid credentials

Invalid email or password.

Duplicate account

Show an appropriate user-friendly backend-derived message.

Validation

Show relevant validation messages.

Network failure

Unable to connect to the server. Please try again.

Server error

Something went wrong. Please try again later.

Do not show raw stack traces or database errors.

17. Loading States

Implement loading for:

login

registration

initial auth check

Examples:

[ Logging in... ]

[ Creating account... ]

Disable buttons during requests.

Prevent duplicate submissions.

18. Form UX

Make forms usable on both Android and iOS.

Use where appropriate:

keyboard-aware scrolling

sensible keyboard type

secure password input

submit/return handling

keyboard dismissal

clear field errors

sensible spacing

Avoid platform-specific code unless genuinely required.

19. Cross-Platform Requirements

The developer is on macOS, but the app must target:

iOS

Android

Use one React Native + Expo codebase.

Avoid:

iOS-only libraries

Android-only libraries

Node.js APIs

browser-only APIs

hardcoded device paths

platform-specific assumptions

Use Expo-compatible APIs.

Validate on both platforms where available.

The revised sprint's broader Definition of Done requires the customer app to work on Android emulator and at least one physical Android device, so Android is a mandatory release-quality target even though development is happening on macOS. fileciteturn1file3L131-L139

20. Environment Configuration

Continue using:

EXPO_PUBLIC_API_URL=...

Do not hardcode the backend URL.

When testing on a physical phone, remember:

localhost

normally refers to the phone itself, not the Mac.

Use a reachable development-machine IP when required.

JWT secrets belong on the backend and must never be placed in the mobile app.

21. Security Requirements

Strictly follow:

Never log passwords.

Never log JWTs.

Never hardcode JWT secrets.

Never store JWT in source code.

Use Expo SecureStore.

Never put JWT in URLs.

Backend remains the authorization authority.

Do not expose stack traces to users.

Do not commit secrets.

22. Testing Scenarios

Registration success

Open app
→ Register
→ Valid data
→ Submit
→ User created
→ JWT stored
→ Main app

Registration validation

Register
→ Missing required field
→ Submit
→ Validation message

Password mismatch

Register
→ Different password/confirmation
→ Submit
→ Mismatch error

Existing account

Register
→ Existing identifier
→ Backend rejects
→ Friendly error

Login success

Login
→ Correct credentials
→ JWT returned
→ SecureStore
→ Main app

Login failure

Login
→ Wrong password
→ Backend rejects
→ Friendly error
→ Remain on Login

App restart

Login
→ Restart app
→ SecureStore token found
→ /me validates token
→ Main app

Invalid stored token

Invalid token
→ /me fails
→ Remove token
→ Login

Logout

Login
→ Profile
→ Logout
→ Token removed
→ Login

Network failure

Backend unavailable
→ Login/Register
→ Friendly error
→ App does not crash

23. Android + iOS Validation

Attempt:

npx expo start --ios

and:

npx expo start --android

Also test on a physical Android device when available.

Verify:

screen rendering

inputs

keyboard behavior

navigation

login

registration

loading

errors

logout

app restart

SecureStore behavior

If a platform cannot be tested because the local simulator/emulator is unavailable, report NOT TESTED. Never claim success without testing.

24. Commands

Use the existing package manager.

For npm:

npm install
npx expo install expo-secure-store
npx expo start
npx expo start --ios
npx expo start --android
npx tsc --noEmit
npx expo doctor

Do not reset the project.

Do not delete lockfiles or node_modules unless there is a justified dependency problem.

25. 3-Hour Timebox

0:00–0:20 — Understand

Inspect:

Day 7 mobile foundation

Day 8 auth backend

API contract

navigation

API client

environment configuration

0:20–1:15 — Implement

Build:

auth API module

SecureStore wrapper

AuthContext

Login UI

Register UI

auth state

1:15–1:50 — Connect

Connect:

React Native
→ API client
→ Day 8 backend
→ JWT
→ SecureStore
→ Auth state
→ MainNavigator

Implement logout and startup token validation.

1:50–2:30 — Test

Test:

registration

login

invalid login

logout

restart

network failure

Android/iOS behavior

2:30–3:00 — Fix + Git

Fix critical issues.

Run TypeScript validation.

Run Expo validation.

Review changed files.

Create a focused commit.

Suggested commit:

feat: implement mobile authentication

Do not mix catalog/cart work into this commit.

26. Definition of Done

Day 9 is complete only when:

Login screen is functional

Register screen is functional

Mobile calls the real Day 8 auth API

JWT is stored using Expo SecureStore

Auth state exists

Startup token check exists

/me validation is used where supported

Authenticated users enter MainNavigator

Unauthenticated users enter AuthNavigator

Logout removes stored authentication

Login loading state works

Registration loading state works

Invalid credentials show a friendly error

Network failure does not crash the app

No JWT/password logging

No hardcoded backend URL

TypeScript has no new errors

Expo configuration is valid

Android compatibility checked

iOS compatibility checked where available

No unnecessary Day 10 authorization work

No catalog/cart/checkout/payment/order work

Git working tree reviewed

Focused Day 9 commit created

Primary success condition:

A customer can register or log in from the React Native app, authenticate against the real backend, securely store the JWT, enter the authenticated application, and log out successfully.

27. Scope Boundary

IN SCOPE

Login screen

Register screen

Client-side form validation

Auth API integration

JWT handling

Secure token storage

AuthContext

Startup token check

/me validation where supported

Auth/Main navigation switching

Logout

Loading states

User-friendly auth errors

Android/iOS compatibility

OUT OF SCOPE

Product catalog

Category APIs/UI

Product search

Cart

Address

Checkout

Razorpay

Orders

Firebase notifications

Admin dashboard

Admin role management

Advanced authorization

Delivery tracking

Live location

Coupons

Redis

RabbitMQ

Microservices

These belong to later sprint days. The revised sprint places catalog APIs on Day 11 and catalog UI on Days 12–13. fileciteturn1file0L19-L24

28. Cursor Working Rules

When implementing:

Inspect existing code first.

Identify the actual Day 8 API contract.

Reuse the Day 7 API client.

Reuse Day 7 components/theme/navigation.

Add only missing authentication functionality.

Use TypeScript.

Avoid unnecessary any.

Avoid unnecessary dependencies.

Use Expo SecureStore for JWT.

Keep auth state in React Context.

Keep API calls in API modules.

Keep storage calls in the storage abstraction.

Drive navigation from auth state.

Do not unnecessarily modify the backend.

Do not implement future sprint features.

Do not fake tests.

Fix errors introduced by the implementation.

Preserve working code.

29. Final Cursor Audit

After implementation, produce exactly:

DAY 9 IMPLEMENTATION REPORT

1. Status:
   COMPLETE / NOT COMPLETE

2. Sprint task:
   Login/register screens + secure token storage

3. Backend API contract discovered:
   - Register endpoint:
   - Login endpoint:
   - Current-user endpoint:
   - Token field:
   - User response:

4. What was implemented:
   - ...

5. Files created:
   - ...

6. Files modified:
   - ...

7. Dependencies added:
   - ...

8. Authentication flow:
   Register: PASS/FAIL
   Login: PASS/FAIL
   JWT storage: PASS/FAIL
   Startup token check: PASS/FAIL
   /me validation: PASS/FAIL
   Auth navigation: PASS/FAIL
   Logout: PASS/FAIL

9. Error handling:
   Invalid credentials: PASS/FAIL
   Validation: PASS/FAIL
   Network failure: PASS/FAIL
   Server errors: PASS/FAIL

10. Platform validation:
   iOS: PASS/FAIL/NOT TESTED
   Android emulator: PASS/FAIL/NOT TESTED
   Physical Android: PASS/FAIL/NOT TESTED

11. Code quality:
   TypeScript: PASS/FAIL
   No unnecessary any: PASS/FAIL
   No hardcoded API URL: PASS/FAIL
   No secrets committed: PASS/FAIL
   No password/JWT logging: PASS/FAIL

12. Validation commands:
   TypeScript: PASS/FAIL
   Expo Doctor: PASS/FAIL
   Expo Start: PASS/FAIL

13. Known issues:
   - ...

14. Day 9 completion:
   XX%

15. Final decision:
   If all P0 requirements are complete:
   "DAY 9 COMPLETE — SAFE TO MOVE TO DAY 10"

   Otherwise:
   "DAY 9 NOT COMPLETE — FIX THE FOLLOWING FIRST"

Do not claim COMPLETE if the real register/login flow has not been connected and tested against the Day 8 backend.

30. Final Principle

Day 9 is not just about creating attractive login/register screens.

The actual target is:

             DAY 8
       Express Auth API
              |
              | JWT
              v
       React Native Day 9
              |
       ┌──────┴──────┐
       v             v
   SecureStore   AuthContext
       |             |
       └──────┬──────┘
              v
       Authenticated App

Keep the implementation small, secure, cross-platform, and within the revised 3-hour Day 9 scope.