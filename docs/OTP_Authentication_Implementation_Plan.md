Sainik Mart — OTP Primary Customer Authentication

Detailed Implementation Plan for Cursor

Project: Sainik Mart
Purpose: Implement passwordless OTP-based customer authentication
Platforms: iOS + Android
Frontend: React Native + Expo + TypeScript
Backend: Node.js + Express + TypeScript
ORM: Prisma
Database: PostgreSQL
OTP Provider: MSG91 initially, behind a provider abstraction
Authentication: OTP verification + JWT/session token
Passwords: NOT supported in this phase

1. Objective

Implement phone-number-based authentication as the primary and only customer authentication method for Sainik Mart.

Customers should be able to:

Enter their mobile number.

Request an OTP.

Receive the OTP through the configured SMS provider.

Enter and verify the OTP.

Automatically become authenticated.

If they are new, have their customer account created.

If they already exist, be logged in.

Receive an authentication token.

Access protected Sainik Mart APIs.

Logout and later authenticate again using another OTP.

There must be no password registration, password login, forgot-password flow, reset-password flow, or password database field added for this feature.

2. Target Authentication UX

Do not create separate customer "Register" and "Login" flows.

Use one primary action:

Continue with mobile number

New customer

Enter mobile number
        ↓
Send OTP
        ↓
Verify OTP
        ↓
No existing user
        ↓
Create customer
        ↓
Issue auth token
        ↓
Complete profile if required
        ↓
Sainik Mart home

Existing customer

Enter mobile number
        ↓
Send OTP
        ↓
Verify OTP
        ↓
Existing user found
        ↓
Issue auth token
        ↓
Sainik Mart home

The customer should not need to know whether the flow is registration or login.

3. High-Level Architecture

                    ┌─────────────────────────────┐
                    │     Sainik Mart App         │
                    │ React Native + Expo + TS    │
                    └──────────────┬──────────────┘
                                   │
                         HTTPS REST API
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │ Express + TypeScript API    │
                    │                             │
                    │ /auth/send-otp              │
                    │ /auth/verify-otp            │
                    │ /auth/resend-otp            │
                    │ /auth/me                    │
                    │ /auth/logout                │
                    └───────┬──────────┬──────────┘
                            │          │
                            │          │
                            ▼          ▼
                   ┌────────────┐  ┌──────────────┐
                   │ PostgreSQL │  │ OTP Provider │
                   │ + Prisma   │  │    MSG91     │
                   └────────────┘  └──────┬───────┘
                                           │
                                           ▼
                                    Customer SMS

The backend must remain the source of truth.

The mobile application must never independently decide whether an OTP is valid.

4. Core Design Principles

4.1 Backend owns authentication

The React Native application must not:

Generate production OTPs.

Validate OTPs locally.

Store plaintext OTPs.

Create users directly in PostgreSQL.

Generate authentication tokens itself.

Trust a client-provided isVerified value.

All security-sensitive operations happen on the backend.

4.2 OTP provider abstraction

Do not hard-code MSG91 logic throughout controllers.

Create an interface similar to:

interface OtpProvider {
  sendOtp(phoneNumber: string, otp: string): Promise<void>;
}

Implement:

OtpProvider
    │
    └── Msg91OtpProvider

This makes it possible to replace MSG91 later without rewriting authentication logic.

4.3 Never store plaintext OTPs

Generate a cryptographically secure OTP and store only a hash.

Example:

Generated OTP:
483921

Stored:
hash(483921)

When the user submits 483921, hash the submitted value and compare it with the stored hash.

4.4 OTP must expire

Recommended initial expiry:

5 minutes

After expiry, verification must fail.

4.5 OTP is single-use

After successful verification:

verifiedAt = current timestamp

The OTP must never be accepted again.

4.6 Rate-limit OTP operations

Protect:

send OTP

resend OTP

verify OTP

from abuse.

Recommended initial values:

OTP length: 6 digits
OTP expiry: 5 minutes
Resend cooldown: 30 seconds
Maximum verification attempts: 5
Maximum OTP requests per phone: 5/hour

Make these configurable through environment variables where practical.

5. Database Design

Inspect the existing Prisma schema before changing it.

Do not duplicate an existing User model.

5.1 User model

Adapt the existing User model to support phone authentication.

Recommended fields:

model User {
  id           String   @id @default(uuid())
  phoneNumber  String   @unique
  name         String?
  email        String?
  role         UserRole @default(CUSTOMER)
  isVerified   Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Existing relations must be preserved.
}

Do not add:

password
passwordHash
passwordSalt

unless the existing application already requires them for a separate non-customer authentication system.

If an existing password field exists only for customer authentication and is not used elsewhere, remove it only after checking all dependencies.

5.2 OTP verification model

Recommended:

model OtpVerification {
  id          String    @id @default(uuid())
  phoneNumber String
  otpHash     String
  expiresAt   DateTime
  attempts    Int       @default(0)
  verifiedAt  DateTime?
  createdAt   DateTime  @default(now())

  @@index([phoneNumber])
  @@index([expiresAt])
}

Do not store plaintext OTP.

If the current project already has a suitable OTP/token model, extend it rather than creating a duplicate model.

5.3 Role

If a role enum already exists, preserve it.

If a role enum does not exist, use the project's existing authorization approach. If introducing one is appropriate:

enum UserRole {
  CUSTOMER
  ADMIN
}

Do not accidentally give newly created OTP users an ADMIN role.

Every OTP-created customer must receive:

CUSTOMER

6. Phone Number Normalization

Phone numbers must be normalized before:

storing them,

creating OTP records,

querying users,

sending OTPs,

rate limiting.

For the initial India-focused Sainik Mart MVP, support Indian numbers.

Accept examples such as:

9876543210
+919876543210
919876543210

Normalize internally to:

+919876543210

Use a proper phone-number parsing/validation library where possible rather than manually relying only on string slicing.

The backend must reject invalid phone numbers before sending an OTP.

The mobile app should also perform basic validation for UX, but backend validation is mandatory.

7. OTP Generation

Use a cryptographically secure random generator.

Do not use:

Math.random()

Generate a 6-digit numeric OTP using a secure random mechanism.

The OTP must be exactly six digits, including leading zeroes when applicable.

Example:

004821

must remain a six-digit OTP.

8. OTP Hashing

Use a secure one-way hash.

Recommended options:

HMAC with a server-side secret for deterministic comparison, or

SHA-256 combined with a server-side secret/salt.

Do not store the raw OTP.

Example conceptual flow:

OTP = 483921

otpHash = HMAC_SERVER_SECRET(483921)

Database:
otpHash = <hashed value>

During verification:

submittedOtp = 483921

submittedHash =
HMAC_SERVER_SECRET(submittedOtp)

compare submittedHash with database otpHash

Use constant-time comparison where applicable.

9. OTP Lifecycle

Send OTP

Request
  ↓
Validate phone
  ↓
Normalize phone
  ↓
Check rate limits
  ↓
Invalidate previous active OTP
  ↓
Generate secure OTP
  ↓
Hash OTP
  ↓
Store OTP hash + expiry
  ↓
Call SMS provider
  ↓
Return success

Do not return the OTP in the API response.

Do not log the OTP in production.

Verify OTP

Request
  ↓
Validate phone + OTP
  ↓
Normalize phone
  ↓
Find active OTP
  ↓
Check expiry
  ↓
Check attempts
  ↓
Hash submitted OTP
  ↓
Compare
  ↓
If invalid → increment attempts
  ↓
If valid
  ↓
Mark OTP verified
  ↓
Find user
  ├── Existing → authenticate
  └── New → create CUSTOMER
  ↓
Issue authentication token
  ↓
Return authenticated user + token

10. API Contract

All endpoints should follow the project's existing API response/error conventions.

Base:

/api/auth

10.1 POST /auth/send-otp

Request:

{
  "phoneNumber": "9876543210"
}

Success:

{
  "success": true,
  "message": "OTP sent successfully"
}

Do not return:

{
  "otp": "483921"
}

Never do this in production.

Possible errors:

400 INVALID_PHONE_NUMBER
429 OTP_RATE_LIMITED
429 OTP_COOLDOWN
500 OTP_PROVIDER_ERROR

Avoid revealing whether a phone number belongs to an existing user.

11. POST /auth/verify-otp

Request:

{
  "phoneNumber": "9876543210",
  "otp": "483921"
}

Successful new user:

{
  "success": true,
  "isNewUser": true,
  "token": "<access-token>",
  "user": {
    "id": "...",
    "phoneNumber": "+919876543210",
    "name": null,
    "role": "CUSTOMER",
    "isVerified": true
  }
}

Successful existing user:

{
  "success": true,
  "isNewUser": false,
  "token": "<access-token>",
  "user": {
    "id": "...",
    "phoneNumber": "+919876543210",
    "name": "Customer",
    "role": "CUSTOMER",
    "isVerified": true
  }
}

Invalid OTP:

400 INVALID_OTP

Expired:

400 OTP_EXPIRED

Too many attempts:

429 OTP_ATTEMPTS_EXCEEDED

12. POST /auth/resend-otp

Request:

{
  "phoneNumber": "9876543210"
}

Rules:

Enforce cooldown.

Generate a new OTP.

Invalidate the previous OTP.

Store only the new OTP hash.

Send through provider.

Do not reveal the OTP.

Success:

{
  "success": true,
  "message": "OTP resent successfully"
}

13. GET /auth/me

Protected endpoint.

Header:

Authorization: Bearer <token>

Return the authenticated customer.

Use the existing authentication middleware if one exists.

Do not duplicate token validation logic across controllers.

14. POST /auth/logout

Protected endpoint.

For JWT-only stateless authentication, logout can remove the token from the mobile device.

If the existing backend has token revocation/session storage, integrate logout with that system.

Do not create an unnecessary database session system if the existing architecture already has a working JWT approach.

15. Authentication Token

Follow the project's existing authentication architecture if already implemented.

If JWT is not currently implemented, use:

Access token

Recommended claims:

{
  "sub": "user-id",
  "role": "CUSTOMER"
}

Do not put sensitive information into the JWT.

JWT secret must be stored in an environment variable.

Example:

JWT_SECRET=<strong-production-secret>
JWT_EXPIRES_IN=7d

Do not commit secrets.

If the project already uses refresh tokens, preserve that architecture instead of creating a second token system.

16. Backend Folder Structure

Adapt to the existing project structure rather than restructuring unrelated modules.

A clean structure could be:

src/
├── modules/
│   └── auth/
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       ├── auth.routes.ts
│       ├── auth.validation.ts
│       ├── auth.types.ts
│       ├── otp/
│       │   ├── otp.service.ts
│       │   ├── otp.provider.ts
│       │   └── msg91.provider.ts
│       └── index.ts
│
├── middleware/
│   ├── auth.middleware.ts
│   └── rate-limit.middleware.ts
│
├── utils/
│   ├── phone.ts
│   └── crypto.ts
│
├── config/
│   └── env.ts
│
└── prisma/

If the current codebase follows a different architecture, follow the existing conventions.

Do not force this structure onto an established project unnecessarily.

17. MSG91 Integration

Create a dedicated provider implementation.

Conceptually:

class Msg91OtpProvider implements OtpProvider {
  async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    // MSG91 API integration
  }
}

Credentials must come from environment variables.

Example:

OTP_PROVIDER=msg91

MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=
MSG91_SENDER_ID=

Use the exact credentials and API parameters required by the currently configured MSG91 account/template.

Do not hard-code:

API keys

authentication tokens

sender IDs

template IDs

production phone numbers

Keep provider-specific code isolated.

18. OTP Provider Interface

Create an abstraction such as:

export interface OtpProvider {
  sendOtp(params: {
    phoneNumber: string;
    otp: string;
  }): Promise<void>;
}

Then:

OtpProvider
     │
     └── Msg91OtpProvider

The authentication service should depend on OtpProvider, not directly on MSG91.

This allows:

MSG91
  ↓
Fast2SMS
  ↓
Twilio
  ↓
another provider

without changing the core authentication workflow.

19. Development Mode

Provide a safe development/test mechanism.

Do NOT weaken production security.

Possible approach:

OTP_MODE=provider

For local development:

OTP_MODE=development
DEV_OTP=123456

However:

Development OTP must only work when explicitly enabled.

Production must reject OTP_MODE=development.

Never expose the development OTP to production clients.

Never commit production .env files.

Prefer provider test credentials/mock provider where available.

A mock provider can implement:

class MockOtpProvider implements OtpProvider {
  async sendOtp() {
    // no real SMS
  }
}

Automated tests should use the mock provider.

20. React Native Screens

Implement or adapt the following screens.

Screen 1 — Phone Number

Purpose:

Welcome to Sainik Mart
Enter your mobile number
[ +91 | __________ ]
[ Continue ]

Requirements:

Numeric keyboard.

Basic phone validation.

Disable button while request is running.

Show loading state.

Show friendly error.

Do not expose backend internals.

Screen 2 — OTP Verification

Example:

Verify your mobile number

OTP sent to
+91 XXXXXXX210

[ _ ][ _ ][ _ ][ _ ][ _ ][ _ ]

Didn't receive the OTP?

Resend OTP

[ Verify ]

Requirements:

Six OTP boxes or a single OTP input styled as six boxes.

Numeric keyboard.

Auto-focus.

Support OTP autofill where supported.

Countdown for resend.

Prevent repeated resend requests during cooldown.

Loading state during verification.

Clear error handling.

Do not automatically trust a client-side OTP.

21. OTP Autofill

Implement platform-friendly OTP autofill where supported by React Native/Expo.

The UI should still work manually if autofill is unavailable.

Do not make autofill a security requirement.

22. Auth State

After successful verification:

token
  ↓
secure device storage
  ↓
authenticated app state

Use secure storage appropriate for React Native/Expo.

Do not store authentication tokens in plain AsyncStorage if a secure-storage option is available for the project's architecture.

The exact storage implementation should follow the existing Sainik Mart auth/state architecture if already present.

23. API Client

Create a centralized API client.

It should:

attach authentication token automatically,

handle 401 responses,

clear invalid auth state,

support request loading/error states,

avoid duplicating fetch/axios logic across screens.

Example:

apiClient
   │
   ├── auth.sendOtp()
   ├── auth.verifyOtp()
   ├── auth.resendOtp()
   ├── auth.me()
   └── auth.logout()

Do not call backend URLs directly from every component.

24. Navigation

Expected flow:

App launch
   │
   ├── authenticated → Main App
   │
   └── unauthenticated → Auth Flow
                             │
                             ├── Phone
                             │
                             └── OTP

After successful verification:

OTP → Main App

Do not allow unauthenticated customers to access protected customer screens.

If a newly created customer must complete a profile:

OTP verification
      ↓
Profile completion
      ↓
Main App

If the current product requirements do not require mandatory profile completion, allow the customer to enter the app immediately.

25. Error Handling

Create user-friendly errors.

Backend:

INVALID_PHONE_NUMBER
OTP_SEND_FAILED
OTP_RATE_LIMITED
OTP_COOLDOWN
INVALID_OTP
OTP_EXPIRED
OTP_ATTEMPTS_EXCEEDED
AUTHENTICATION_FAILED
UNAUTHORIZED

Mobile UI examples:

"Please enter a valid mobile number."

"We couldn't send the OTP. Please try again."

"Too many attempts. Please request a new OTP."

"This OTP has expired. Please request a new one."

"Incorrect OTP. Please try again."

Never expose:

database errors
stack traces
provider API keys
provider internal errors
SQL errors

26. Rate Limiting

At minimum implement rate limits around:

Send OTP

Per phone number:

30-second resend cooldown

Additional hourly limit:

5 OTP requests/hour

Also consider IP-based limits.

Verify OTP

Example:

Maximum 5 attempts per OTP

Once exceeded:

OTP invalidated

The customer must request another OTP.

The limits should be configurable.

27. Brute-Force Protection

An attacker must not be able to repeatedly try six-digit OTPs.

Implement:

OTP
 ↓
5 attempts maximum
 ↓
invalidate

Also rate-limit verification requests by:

phone number

IP

optionally device identifier where appropriate

Avoid aggressive device fingerprinting unless actually required.

28. User Creation Transaction

When verification succeeds:

BEGIN TRANSACTION

mark OTP verified

find user by normalized phone

if user doesn't exist:
    create User
    role = CUSTOMER
    isVerified = true

create/update required auth/session information

COMMIT

The exact transaction boundaries should match the existing Prisma architecture.

Avoid creating duplicate users if two verification requests arrive simultaneously.

The unique constraint on phoneNumber must remain.

29. Existing Users

Existing users must be identified by normalized phone number.

Example:

9876543210
+919876543210
919876543210

must resolve to the same canonical identity:

+919876543210

Do not create three users.

30. Admin Authentication

Do not automatically replace or break existing admin authentication.

Customer authentication:

Phone + OTP

Admin authentication can remain according to the existing admin architecture.

Do not allow:

customer → admin

through any OTP payload.

Never trust the role supplied by the mobile client.

Role must come from the database/backend.

31. Security Requirements

Mandatory:

HTTPS in production.

No OTP in production logs.

No OTP in API response.

No API keys in React Native code.

No provider credentials in mobile application.

OTP expiration.

OTP single-use.

Maximum OTP attempts.

Rate limiting.

Phone normalization.

Secure token storage.

JWT secret in environment variables.

Input validation.

Proper authorization middleware.

Database unique constraint on phone number.

Do not commit:

.env
production API keys
MSG91 credentials
JWT secrets
OTP secrets

32. Environment Variables

Example:

NODE_ENV=development

DATABASE_URL=

JWT_SECRET=
JWT_EXPIRES_IN=7d

OTP_PROVIDER=msg91
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=5
OTP_RESEND_COOLDOWN_SECONDS=30
OTP_MAX_ATTEMPTS=5
OTP_MAX_REQUESTS_PER_HOUR=5

MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=
MSG91_SENDER_ID=

Use the project's existing environment/configuration loader if one exists.

Validate required production environment variables during application startup.

33. Prisma Migration

After schema changes:

npx prisma migrate dev --name add_otp_authentication

Then:

npx prisma generate

For production deployment, use the project's existing migration process, typically:

npx prisma migrate deploy

Do not manually modify production tables if migrations are the established project standard.

Before migration:

inspect existing schema,

preserve existing relations,

confirm no destructive change is accidentally introduced,

verify migration locally.

34. Backend Unit Tests

Test at minimum:

Phone validation

valid Indian number

invalid number

empty number

malformed number

normalization

OTP generation

six digits

leading zero supported

secure generation mechanism

OTP verification

valid OTP

wrong OTP

expired OTP

already-used OTP

too many attempts

missing OTP

User behavior

new phone creates CUSTOMER

existing phone logs in

duplicate user cannot be created

admin role is never assigned automatically

Rate limiting

resend cooldown

hourly limit

verification attempt limit

Provider

successful provider response

provider failure

provider timeout/error

Use a mock OTP provider in unit tests.

Do not send real SMS during automated tests.

35. Backend Integration Tests

Test the complete API flow:

POST /auth/send-otp
       ↓
mock provider captures OTP
       ↓
POST /auth/verify-otp
       ↓
User created
       ↓
JWT returned
       ↓
GET /auth/me
       ↓
Authenticated user returned

Also test:

send OTP
→ verify wrong OTP
→ verify correct OTP

and:

send OTP
→ expire
→ verify
→ rejected

36. React Native Tests

Test:

phone screen rendering,

invalid phone validation,

send OTP request,

navigation to OTP screen,

OTP input,

verification request,

loading states,

resend countdown,

resend button,

invalid OTP error,

successful login,

token persistence,

logout,

authenticated navigation.

37. Manual QA Checklist

New customer

[ ] Enter valid phone
[ ] OTP received
[ ] Enter OTP
[ ] User created
[ ] CUSTOMER role assigned
[ ] User authenticated
[ ] Home screen displayed

Existing customer

[ ] Enter existing phone
[ ] OTP received
[ ] Verify
[ ] No duplicate user created
[ ] Existing account authenticated

Invalid OTP

[ ] Wrong OTP rejected
[ ] Attempts incremented
[ ] User sees friendly message

Expired OTP

[ ] Expired OTP rejected
[ ] User can request a new OTP

Resend

[ ] Resend disabled during cooldown
[ ] New OTP generated
[ ] Previous OTP invalidated
[ ] New OTP works

Security

[ ] OTP not returned by API
[ ] OTP not logged
[ ] Provider secret not exposed
[ ] JWT not exposed in logs
[ ] Rate limiting works

38. Production SMS/DLT Considerations

Because Sainik Mart targets Indian customers, production SMS delivery must use an SMS provider and configuration appropriate for Indian transactional messaging.

Before production launch:

Complete the provider account setup.

Complete required business/entity verification.

Configure sender information as required.

Configure the appropriate OTP message template.

Complete any required Indian DLT/template registration process.

Test delivery across multiple Indian mobile networks.

Do not assume that a local development SMS setup will automatically work for production Indian numbers.

39. Logging

Safe production logs:

OTP requested for phone ending ****3210
OTP verification succeeded
OTP verification failed
OTP provider request failed

Do NOT log:

483921
MSG91 auth key
JWT
full sensitive authentication payload

Mask phone numbers in production logs where practical.

40. Observability

Track metrics such as:

otp_requested
otp_sent
otp_send_failed
otp_verified
otp_verification_failed
otp_expired
otp_rate_limited
new_customer_created
existing_customer_login

This will help diagnose:

SMS provider failures,

OTP delivery problems,

suspicious activity,

conversion/drop-off.

Do not include plaintext OTP values in analytics.

41. Failure Scenarios

SMS provider unavailable

Expected behavior:

Backend calls provider
       ↓
Provider fails
       ↓
Do not tell user OTP was successfully sent
       ↓
Return retryable error

Do not create a user simply because an OTP was requested.

Database unavailable

Return a generic server error.

Do not expose database details.

OTP expired

Return:

OTP_EXPIRED

Customer can request a new OTP.

Too many attempts

Invalidate OTP and require a new OTP.

42. Avoid These Anti-Patterns

Do NOT:

❌ Store plaintext OTP
❌ Return OTP from production API
❌ Put MSG91 credentials in React Native
❌ Use Math.random() for security-sensitive OTP generation
❌ Store OTP in AsyncStorage
❌ Let frontend validate OTP as the authority
❌ Create a separate user every time OTP is verified
❌ Trust role from frontend
❌ Add passwords "just in case"
❌ Hard-code production secrets
❌ Log OTP values
❌ Allow unlimited OTP attempts
❌ Allow unlimited OTP resends

43. Implementation Order

Implement in this order.

Phase 1 — Audit existing authentication

Inspect current backend.

Inspect Prisma schema.

Inspect existing User model.

Inspect existing auth middleware.

Inspect JWT/session implementation.

Inspect existing React Native auth/navigation.

Identify existing login/register code.

Do not duplicate existing functionality.

Phase 2 — Database

Modify User model only if required.

Add OTP verification model.

Add indexes/unique constraints.

Create migration.

Run migration locally.

Generate Prisma client.

Verify relations.

Phase 3 — Backend OTP core

Phone normalization.

Phone validation.

Secure OTP generation.

OTP hashing.

OTP expiry.

OTP attempt tracking.

OTP invalidation.

Rate limiting.

Phase 4 — Provider

Define OtpProvider.

Implement Msg91OtpProvider.

Add environment configuration.

Add provider error handling.

Add mock provider for tests.

Phase 5 — Auth API

Implement:

POST /auth/send-otp
POST /auth/verify-otp
POST /auth/resend-otp
GET  /auth/me
POST /auth/logout

Phase 6 — Customer creation/login

On successful OTP:

find by phone
    ↓
existing → login
new → create CUSTOMER
    ↓
issue token

Phase 7 — Mobile UI

Implement:

PhoneScreen
OtpVerificationScreen

Integrate with navigation and auth state.

Phase 8 — Secure token storage

Store authentication credentials using the secure storage architecture appropriate to Expo/React Native.

Phase 9 — Testing

Run:

backend unit tests
backend integration tests
mobile tests
manual device testing

Phase 10 — Production configuration

Only after all functionality is working:

MSG91 production configuration
DLT/template setup
production secrets
HTTPS
rate limits
monitoring

44. Definition of Done

The feature is complete only when all of the following are true:

Customer authentication

Customer can enter phone number.

Backend validates phone.

OTP is generated securely.

OTP is hashed before storage.

OTP is sent through provider.

OTP expires.

OTP is single-use.

OTP attempts are limited.

OTP resend is rate-limited.

New customer is created automatically.

Existing customer can log in.

Duplicate customers cannot be created.

Customer receives authentication token.

Protected APIs accept authenticated customers.

Logout works.

No customer passwords exist.

Mobile

Phone screen implemented.

OTP screen implemented.

Loading states implemented.

Error states implemented.

OTP autofill supported where available.

Resend countdown implemented.

Auth state persisted securely.

Unauthenticated users cannot access protected customer screens.

Security

No plaintext OTP stored.

No plaintext OTP logged.

No provider secret in mobile app.

HTTPS required in production.

Rate limiting implemented.

Input validation implemented.

Role is server-controlled.

Production secrets use environment configuration.

Production

MSG91 account configured.

Indian SMS/DLT requirements completed.

OTP template approved/configured.

Production credentials configured securely.

Real-device OTP testing completed.

Monitoring/logging verified.

45. Cursor Implementation Instructions

When implementing this feature in the existing Sainik Mart repository:

First inspect the repository.

Identify the current frontend architecture.

Identify the current backend architecture.

Identify the existing Prisma schema.

Identify whether authentication already exists.

Reuse existing conventions.

Do not rewrite unrelated modules.

Do not replace working cart, product, order, payment, or admin functionality.

Preserve existing API response conventions.

Preserve existing error handling.

Preserve existing navigation patterns.

Implement the smallest clean change necessary.

Use TypeScript throughout the backend.

Do not introduce JavaScript backend files.

Do not add passwords.

Do not add Firebase unless explicitly requested.

Keep MSG91 behind an OTP provider interface.

Never expose OTP/provider secrets to React Native.

Write tests for the authentication flow.

Run type checking, linting, tests, Prisma validation, and the relevant build after implementation.

Report every changed file and migration.

Report any existing architecture issue that prevents safe implementation rather than silently rewriting it.

46. Expected Final Architecture

After implementation:

                         ┌───────────────────────┐
                         │   React Native Expo   │
                         │                       │
                         │ Phone Number Screen   │
                         │ OTP Screen            │
                         └───────────┬───────────┘
                                     │
                                  HTTPS
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │      Express + TypeScript      │
                    │                                │
                    │ /auth/send-otp                 │
                    │ /auth/verify-otp               │
                    │ /auth/resend-otp               │
                    │ /auth/me                       │
                    │ /auth/logout                   │
                    └───────────────┬────────────────┘
                                    │
                  ┌─────────────────┼──────────────────┐
                  │                 │                  │
                  ▼                 ▼                  ▼
          ┌──────────────┐  ┌──────────────┐  ┌───────────────┐
          │ PostgreSQL   │  │ OTP Service  │  │ JWT/Auth      │
          │              │  │              │  │ Middleware    │
          │ User         │  │ Provider     │  │               │
          │ OTP          │  │ Abstraction  │  │               │
          └──────────────┘  └──────┬───────┘  └───────────────┘
                                    │
                                    ▼
                              ┌────────────┐
                              │   MSG91    │
                              │ SMS / OTP  │
                              └─────┬──────┘
                                    │
                                    ▼
                              Customer Phone

This is the target architecture for the Sainik Mart passwordless customer authentication system.

47. Recommended Next Implementation Step

Do not immediately start coding if the current repository already contains authentication code.

First have Cursor perform a read-only authentication audit of the existing Sainik Mart codebase.

The audit should identify:

existing User model,

existing auth routes,

existing auth controllers/services,

existing JWT/session implementation,

existing middleware,

existing navigation/auth state,

existing API client,

existing secure storage,

existing environment configuration,

existing Prisma migrations,

existing tests.

Only after the audit should Cursor implement the OTP feature.

This minimizes the risk of creating duplicate authentication infrastructure or breaking existing Sainik Mart functionality.