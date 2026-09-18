# Day 14 — Auth + Catalog Testing, Bug Fixing & Code Cleanup

## Sprint Context

Project: Blinkit-like Grocery Delivery MVP  
Day: 14 of 42  
Estimated Time: 2.5 hours  
Priority: P0

## Day 14 Objective

Day 14 is a stabilization day.

The goal is to verify that everything built during Days 8–13 works together correctly:

Day 8  → Backend Authentication
Day 9  → Mobile Authentication
Day 10 → Auth Protection & Authorization
Day 11 → Category & Product APIs
Day 12 → Home Screen
Day 13 → Category/Search/Product UI
Day 14 → Test + Fix + Clean

Target flow:

Register
   ↓
Login
   ↓
JWT
   ↓
Secure Token Storage
   ↓
Home
   ↓
Categories
   ↓
Products
   ↓
Search / Filter
   ↓
Product Details
   ↓
Logout

No major new feature should be implemented today.

---

# 1. Scope

## In Scope

- Backend authentication testing
- Mobile authentication testing
- JWT testing
- CUSTOMER/ADMIN authorization testing
- Category API testing
- Product API testing
- Search testing
- Category filtering
- Pagination testing
- Home screen testing
- Category screen testing
- Product details testing
- API integration testing
- Loading states
- Empty states
- Error handling
- TypeScript fixes
- Lint fixes
- Code cleanup
- Small bug fixes

## Out of Scope

Do NOT implement:

- Cart
- Add to cart
- Checkout
- Address management
- Orders
- Razorpay
- Firebase notifications
- Admin dashboard UI
- Product image upload
- Cloudinary/S3
- Delivery partner functionality
- Live GPS tracking
- Advanced analytics
- AI recommendations
- Coupons
- Loyalty system

These belong to later days.

---

# 2. Inspect Existing Work First

Before making changes, inspect:

Backend:
- Day 8 authentication
- Day 10 JWT middleware
- Role middleware
- Day 11 category APIs
- Day 11 product APIs
- Validation
- Error handling
- Prisma

Mobile:
- Day 9 authentication
- SecureStore
- AuthContext
- Day 10 session handling
- API client
- Navigation
- Day 12 Home screen
- Day 13 catalog/search/product UI
- Reusable components

First identify:

- What works?
- What is broken?
- What is incomplete?
- What is duplicated?
- What has TypeScript errors?
- What has runtime errors?
- What doesn't match the backend API contract?

Do not immediately rewrite working code.

---

# 3. Authentication Testing

## 3.1 Registration

Test:

POST /api/auth/register

Verify:

- Valid registration succeeds.
- User is created in PostgreSQL.
- Password is hashed.
- Password is never stored as plaintext.
- Duplicate users are rejected.
- Invalid input is rejected.
- Required fields are validated.
- passwordHash is never returned to the client.

---

# 4. Login Testing

Test:

POST /api/auth/login

Test:

| Scenario | Expected |
|---|---|
| Correct credentials | Success |
| Wrong password | 401 |
| Unknown user | 401 |
| Missing email | Validation error |
| Missing password | Validation error |
| Invalid request | Validation error |

Expected flow:

Login
 ↓
Validate credentials
 ↓
Generate JWT
 ↓
Return JWT
 ↓
Mobile stores JWT securely

---

# 5. JWT Testing

Test:

GET /api/auth/me

## No token

Expected:

401 Unauthorized

## Invalid token

Authorization: Bearer invalid-token

Expected:

401 Unauthorized

## Expired token

Expected:

401 Unauthorized

## Valid token

Expected:

200 OK

Verify the response never exposes:

passwordHash

---

# 6. Role Authorization Testing

Create/use:

CUSTOMER
ADMIN

## CUSTOMER

Customer should be able to access customer functionality.

Customer must NOT be able to access admin endpoints.

Example:

POST /api/products

with CUSTOMER JWT.

Expected:

403 Forbidden

## ADMIN

Admin should be able to perform catalog management.

Example:

POST /api/products

with ADMIN JWT.

Expected:

Allowed

Core test:

CUSTOMER → ADMIN endpoint → 403
ADMIN    → ADMIN endpoint → Allowed

---

# 7. Mobile Authentication Testing

Test:

Register
 ↓
Login
 ↓
JWT
 ↓
SecureStore
 ↓
Home

Then completely close and restart the app.

Expected:

App restart
   ↓
Read JWT from SecureStore
   ↓
GET /api/auth/me
   ↓
Valid?
 ┌─┴─┐
Yes  No
 ↓    ↓
Home Login

---

# 8. Logout Testing

Test:

Home
 ↓
Logout
 ↓
Remove JWT from SecureStore
 ↓
Login/Register

After logout:

- JWT is removed.
- Protected requests are no longer authenticated.
- Restarting the app does not restore the previous session.

---

# 9. Authentication Security Audit

Search the project for:

console.log

Look for:

console.log(token)
console.log(jwt)
console.log(password)
console.log(req.body)

Remove sensitive logs.

Never log:

- Passwords
- JWTs
- Authorization headers
- Database credentials
- Secrets

---

# 10. Category API Testing

Test:

GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id

Verify the actual Day 11 implementation and response format.

---

# 11. Category Read Testing

Test:

GET /api/categories

Verify:

- Categories are returned.
- Response format is consistent.
- Empty database is handled.
- Active/inactive behavior is correct.
- Unnecessary database fields aren't exposed.

Test:

GET /api/categories/:id

Then test a non-existing category.

Expected:

404 Not Found

---

# 12. Category Create Testing

Using ADMIN:

POST /api/categories

Valid:

{
  "name": "Fruits"
}

Test invalid cases:

{
  "name": ""
}

Also test:

- Missing name
- Duplicate category
- Very long name
- Wrong data type

---

# 13. Category Update Testing

Test:

PATCH /api/categories/:id

Verify:

- Existing category can be updated.
- Invalid category ID is handled.
- Invalid data is rejected.
- CUSTOMER cannot update.
- ADMIN can update.

---

# 14. Category Delete/Deactivate Testing

Test:

DELETE /api/categories/:id

Verify the actual Day 11 behavior.

Be careful with categories that already contain products.

Do not introduce destructive database changes just to make the test pass.

---

# 15. Product API Testing

Test:

GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id

---

# 16. Product Validation Testing

Valid example:

{
  "name": "Milk 1L",
  "description": "Fresh milk",
  "price": 70,
  "discountPrice": 65,
  "stockQuantity": 20,
  "categoryId": "..."
}

Test invalid cases:

## Negative price

price < 0

Expected: validation error.

## Invalid discount

discountPrice > price

Expected: validation error.

## Negative stock

stockQuantity < 0

Expected: validation error.

## Invalid category

Use a non-existent category ID.

Expected: appropriate validation/not-found error.

---

# 17. Product Search Testing

Test:

GET /api/products?search=milk

Verify:

- Matching products are returned.
- Search happens through the backend/database.
- The app isn't downloading the entire catalog and filtering everything locally.
- Empty search results are handled.

Also test:

GET /api/products?search=xyz-non-existing

Expected:

Empty result.

---

# 18. Category Filtering Testing

Test:

GET /api/products?categoryId=<categoryId>

Verify:

- Only products from that category are returned.
- Invalid category IDs are handled.
- Empty category results don't crash the app.

---

# 19. Pagination Testing

Test:

GET /api/products?page=1&limit=10

Then:

GET /api/products?page=2&limit=10

Verify:

- Correct page is returned.
- Limit is respected.
- Total count is correct.
- Total pages are correct.
- Unexpected duplicates don't occur.
- Invalid page/limit values are handled.

Example:

{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}

Use the actual Day 11 response structure.

---

# 20. Customer vs Admin Catalog Testing

## CUSTOMER

Should be able to:

GET categories
GET products
GET product

Should NOT be able to:

POST category
PATCH category
DELETE category

POST product
PATCH product
DELETE product

## ADMIN

Should be able to perform catalog management operations.

---

# 21. Active/Inactive Product Testing

Test:

isActive = true
isActive = false

Verify that customer-facing catalog behavior matches the Day 11 implementation.

Inactive products should not accidentally appear in customer results if the API is designed to hide them.

Admin should still be able to manage inactive products.

---

# 22. Home Screen Testing

Open the mobile app.

Verify:

Home
 ├── Categories
 ├── Banner
 ├── Products
 └── Navigation

Check:

- Categories come from API.
- Products come from API.
- No fake catalog data is being used.
- Product names are correct.
- Prices are correct.
- Discount prices display correctly.
- Images/fallbacks work.
- Horizontal scrolling works.
- Product cards render correctly.

---

# 23. Catalog/Search UI Testing

Test:

Home
 ↓
Category
 ↓
Product Listing
 ↓
Product Details

Then:

Search
 ↓
Search Results
 ↓
Product Details

Verify the UI uses the real Day 11 backend.

Do not accept a UI that only works with mock/hardcoded data.

---

# 24. Loading State Testing

Test under a slow network or delayed API.

Verify:

Loading
   ↓
Data

Check:

- Categories loading
- Products loading
- Search loading
- Product details loading

The UI should not appear frozen.

---

# 25. Empty State Testing

Test:

- No categories
- No products
- No search results
- No products in selected category

Example:

No products found.

Avoid blank screens.

---

# 26. Error State Testing

Temporarily make the API unavailable or use an invalid API URL.

Verify:

API failure
   ↓
Friendly error message
   ↓
Retry

The app should not crash.

Do not show:

AxiosError
ECONNREFUSED
PrismaClient
stack traces

---

# 27. Network Testing

Test:

- Wi-Fi
- Mobile hotspot if available
- Backend running
- Backend stopped
- Slow network

For physical-device testing, make sure the app isn't accidentally using:

localhost

Remember:

Phone localhost ≠ Computer localhost

Use the configured machine/LAN API URL.

---

# 28. TypeScript Audit

Run:

npx tsc --noEmit

Fix:

- Type errors
- Navigation type errors
- Incorrect API response types
- Nullable data issues
- Missing route params
- Unsafe any

Do not solve everything by changing types to `any`.

---

# 29. Lint Audit

If configured:

npm run lint

Fix:

- Unused imports
- Unused variables
- Hook issues
- Formatting issues
- Unreachable code
- Obvious code smells

---

# 30. Expo Audit

Run:

npx expo doctor

Resolve important/blocking issues.

Then:

npx expo start

Verify the app launches correctly.

---

# 31. Backend Audit

Run the existing backend build command, for example:

npm run build

Verify:

- Server starts.
- Database connects.
- Health endpoint works.
- Auth works.
- Catalog works.

Do not modify the database schema unless a genuine Day 11 bug requires it.

---

# 32. Database Safety

Day 14 is a testing/cleanup day.

Do NOT run:

DROP DATABASE
DROP TABLE

Do not reset the database just to make testing easier.

If a migration problem is found:

1. Understand the problem.
2. Inspect the schema.
3. Make the smallest safe correction.
4. Preserve existing data where possible.

---

# 33. Code Cleanup

Look for:

- Unused imports
- Unused variables
- Duplicate functions
- Duplicate API calls
- Duplicate components
- Hardcoded URLs
- Hardcoded catalog data
- `any`
- Debug logs
- Dead code
- Commented-out code
- Inconsistent naming

Clean only code relevant to Days 8–13.

Do not perform a huge application-wide refactor.

---

# 34. Backend Architecture Audit

Backend should continue following:

Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL

Controllers should not contain large amounts of business logic.

---

# 35. Mobile Architecture Audit

Maintain:

Screen
  ↓
API module/service
  ↓
API client
  ↓
Express API

Avoid putting huge amounts of API/business logic directly inside UI components.

---

# 36. Environment Audit

Check:

.env
.env.example

Verify:

- API URL is configurable.
- Production secrets aren't committed.
- Database credentials aren't in mobile code.
- JWT secrets aren't in mobile code.
- `.env` is ignored where appropriate.
- `.env.example` contains placeholders.

Remember:

EXPO_PUBLIC_*

variables are public in the mobile bundle.

Never put secrets in them.

---

# 37. Security Checklist

## Backend

- [ ] Passwords hashed.
- [ ] JWT secret comes from environment variables.
- [ ] Protected routes require JWT.
- [ ] Admin routes require ADMIN role.
- [ ] Password hashes are not returned.
- [ ] Sensitive errors aren't exposed.
- [ ] Validation exists.
- [ ] CORS is configured.
- [ ] Helmet is configured.

## Mobile

- [ ] JWT stored using SecureStore.
- [ ] Passwords are not unnecessarily persisted.
- [ ] JWT is not logged.
- [ ] API secrets are not embedded.
- [ ] Database credentials do not exist in mobile code.

---

# 38. Regression Testing

## Flow 1 — New Customer

Register
 ↓
Login
 ↓
Home
 ↓
Categories
 ↓
Products
 ↓
Product Details
 ↓
Logout

## Flow 2 — Existing Customer

Login
 ↓
Home
 ↓
Search
 ↓
Product
 ↓
Logout

## Flow 3 — Admin

Admin Login
 ↓
Authenticated
 ↓
Admin Catalog API
 ↓
Create/Update Catalog

## Flow 4 — Unauthorized Customer

Customer Login
 ↓
Try Admin API
 ↓
403 Forbidden

---

# 39. Most Important Integration Test

Verify the complete chain:

React Native
     │
     ▼
Authentication
     │
     ▼
JWT
     │
     ▼
Express API
     │
     ▼
Auth Middleware
     │
     ▼
Catalog Service
     │
     ▼
Prisma
     │
     ▼
PostgreSQL
     │
     ▼
Products/Categories
     │
     ▼
React Native

If this complete chain works reliably, the foundation is ready for the Cart phase.

---

# 40. Bug Priority

## P0 — Must Fix

- App doesn't start.
- Backend doesn't start.
- Login doesn't work.
- JWT protection is broken.
- Customer can access admin APIs.
- Catalog APIs don't work.
- Home cannot load catalog.
- Product details don't work.
- TypeScript build fails.

## P1 — Fix Today If Possible

- Incorrect error messages.
- Broken loading states.
- Broken empty states.
- Navigation issues.
- Search/filter bugs.
- Incorrect price display.
- UI crashes.

## P2 — Can Defer

- Minor spacing issues.
- Small typography issues.
- Minor visual inconsistencies.
- Non-critical refactoring.

Do not let minor UI polish consume the entire Day 14 timebox.

---

# 41. 2.5-Hour Timebox

## 0:00–0:20 — Inspect

Review:

Day 8 Auth
Day 9 Mobile Auth
Day 10 Authorization
Day 11 Catalog
Day 12 Home
Day 13 Catalog UI

Create a short bug checklist.

## 0:20–1:00 — Authentication

Test:

Register
Login
JWT
/me
Logout
App restart
CUSTOMER
ADMIN
401
403

Fix critical issues.

## 1:00–1:40 — Catalog

Test:

Categories
Products
Search
Filter
Pagination
Validation
Active/inactive
CUSTOMER
ADMIN

Fix critical issues.

## 1:40–2:10 — Mobile Integration

Test:

Home
 ↓
Categories
 ↓
Products
 ↓
Search
 ↓
Product Details

Test loading/error/empty states.

## 2:10–2:30 — Cleanup

Run validation commands.

Then:

- Review git diff.
- Remove debug logs.
- Check environment files.
- Verify no secrets.
- Verify no Day 15+ features.

---

# 42. Cursor Working Rules

1. Inspect before editing.
2. Preserve correct existing code.
3. Do not rewrite authentication unnecessarily.
4. Do not unnecessarily rewrite Day 11 APIs.
5. Reuse existing components.
6. Reuse the existing API client.
7. Follow existing naming conventions.
8. Keep TypeScript strict.
9. Avoid `any`.
10. Do not install unnecessary dependencies.
11. Do not create duplicate API clients.
12. Do not use hardcoded catalog data when APIs are available.
13. Do not use fake API responses in the final implementation.
14. Do not implement Day 15+ features.
15. Do not run destructive database commands.
16. Do not change environment secrets.
17. Keep changes focused on stabilization.

---

# 43. Definition of Done

## Authentication

- [ ] Registration works.
- [ ] Login works.
- [ ] Passwords are hashed.
- [ ] JWT is generated correctly.
- [ ] JWT is stored securely.
- [ ] `/me` works.
- [ ] Invalid JWT returns 401.
- [ ] Missing JWT returns 401.
- [ ] Logout works.
- [ ] App restart restores valid session.
- [ ] CUSTOMER cannot access admin endpoints.
- [ ] ADMIN can access admin endpoints.

## Catalog

- [ ] Categories API works.
- [ ] Products API works.
- [ ] Category filtering works.
- [ ] Search works.
- [ ] Pagination works.
- [ ] Product validation works.
- [ ] Category validation works.
- [ ] Active/inactive behavior works.
- [ ] Customer catalog access works.
- [ ] Admin catalog management works.

## Mobile

- [ ] Home loads real API data.
- [ ] Categories display.
- [ ] Products display.
- [ ] Search/listing works.
- [ ] Product details works.
- [ ] Category navigation works.
- [ ] Loading states work.
- [ ] Empty states work.
- [ ] Error states work.
- [ ] App doesn't crash during normal flows.

## Code Quality

- [ ] TypeScript passes.
- [ ] Lint passes if configured.
- [ ] Expo doctor has no blocking issues.
- [ ] Backend builds successfully.
- [ ] No sensitive logs remain.
- [ ] No secrets are committed.
- [ ] No unnecessary dependencies were added.
- [ ] No destructive database operations were introduced.
- [ ] No Day 15+ features were implemented.

---

# 44. Final Day 14 Checkpoint

By the end of Day 14:

                BLINKIT MVP
                    │
          ┌─────────┴─────────┐
          │                   │
       Backend              Mobile
          │                   │
      Express             React Native
          │                   │
       Prisma              Expo
          │                   │
     PostgreSQL              │
          │                   │
          └─────────┬─────────┘
                    │
              Authentication
                    │
                    ▼
                 Catalog
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
      Categories           Products
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
                 Search             Details
                    │
                    ▼
                 HOME UI

Next major feature:

DAY 15
   ↓
🛒 Cart APIs

---

# 45. Final Principle

Day 14 is not about adding more features.

It is about making sure the features already built are reliable.

Target:

Auth works
   +
Catalog works
   +
Mobile UI works
   +
Backend ↔ Mobile integration works
   +
Authorization is secure
   +
No critical bugs
   ↓
READY FOR CART

Stabilize first. Build the Cart only after the authentication and catalog foundation is reliable.