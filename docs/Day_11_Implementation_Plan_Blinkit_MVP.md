Day 11 — Category & Product APIs

Sprint Context

Stack: React Native + Expo + TypeScript, Node.js + Express + TypeScript, PostgreSQL + Prisma, JWT + bcrypt.

Day 11 task: Build Category/Product APIs with pagination, filtering and search.

Time: 3 hours
Priority: P0

Day 11 starts the Catalog phase. Days 12–13 will consume these APIs from the React Native app.

Objective

By the end of Day 11:

Customers can view active categories/products.

Customers can search products.

Customers can filter products by category.

Customers can paginate product results.

Admins can create, update and deactivate categories/products.

Existing Day 10 JWT and role middleware is reused.

Controllers, services, routes and Prisma remain separated.

1. Inspect Existing Code First

Before editing:

Inspect prisma/schema.prisma.

Confirm Category/Product models and relations.

Inspect existing routes, controllers, services and validators.

Inspect Day 10 auth/role middleware.

Inspect the existing response and error format.

Inspect Prisma client setup.

Identify any existing category/product code.

Preserve working code and avoid duplicate implementations.

Do not assume filenames or architecture.

2. Category APIs

Implement:

GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id

Permissions

Customers:

GET /api/categories
GET /api/categories/:id

Admins:

POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id

A CUSTOMER attempting an admin operation must receive 403 Forbidden.

An unauthenticated protected request must receive 401 Unauthorized.

Category validation

Support the existing schema fields, typically:

name
imageUrl
isActive

Validate:

name is required and non-empty

trim whitespace

imageUrl is optional

handle duplicate names appropriately

use existing validation conventions

Prefer deactivation (isActive = false) over hard deletion if that protects existing relations.

3. Product APIs

Implement:

GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id

Permissions

Customers can read:

GET /api/products
GET /api/products/:id

Admins can additionally:

POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id

Customer-facing queries should normally return only isActive = true products.

4. Product Data

Use the fields already defined in the Prisma schema, such as:

name
description
price
discountPrice
imageUrl
stockQuantity
categoryId
isActive

Example:

{
  "name": "Fresh Bananas",
  "description": "Fresh ripe bananas",
  "price": 60,
  "discountPrice": 50,
  "stockQuantity": 25,
  "categoryId": "<category-id>"
}

Do not add unnecessary fields.

5. Product Validation

Validate:

name is required and non-empty

price is numeric and >= 0

discountPrice, when supplied, is >= 0 and <= price

stockQuantity >= 0

categoryId refers to an existing category

only expected fields are accepted

If a partial update changes discountPrice, validate it against the current/new price correctly.

6. Product Listing

Implement:

GET /api/products

Support at minimum:

page
limit
search
categoryId

Examples:

GET /api/products?page=1&limit=20
GET /api/products?search=milk
GET /api/products?categoryId=<id>
GET /api/products?search=milk&categoryId=<id>&page=1&limit=10

Use Prisma/database filtering. Do not fetch all products and filter them in JavaScript.

7. Pagination

Use:

skip = (page - 1) * limit

Examples:

page 1 → skip 0
page 2 → skip 20
page 3 → skip 40

Validate:

page >= 1

limit >= 1

enforce a reasonable maximum limit

Return pagination metadata.

Example:

{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "totalPages": 7
  }
}

Follow the existing project's response format if one already exists.

8. Search

Support:

GET /api/products?search=milk

Search product name and, where appropriate, description.

Search must work together with pagination and category filtering.

9. Category Filtering

Support:

GET /api/products?categoryId=<id>

Only products in that category should be returned.

Combined example:

GET /api/products?categoryId=<id>&search=apple&page=1&limit=10

Apply:

active filter
+
category filter
+
search filter
+
pagination

for normal customer catalog requests.

10. Product Details

Implement:

GET /api/products/:id

Return the fields required by the future Product Details screen.

Include category information if useful and consistent with the API design.

Inactive products should not be exposed through normal customer-facing access.

11. Product Update / Deactivation

Implement:

PATCH /api/products/:id
DELETE /api/products/:id

Admin should be able to change:

product information

price

discount price

stock

category

active status

Prefer deactivation where appropriate:

isActive = false

Do not break historical order relationships.

12. Architecture

Follow:

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

Routes

Define HTTP method, endpoint and middleware.

Controllers

Read params/body/query, call services and return responses.

Do not put large Prisma/business logic blocks in controllers.

Services

Contain catalog business logic and Prisma queries.

Validators

Reuse the existing project validation approach.

13. Authorization Matrix

Endpoint

CUSTOMER

ADMIN

GET /categories

Yes

Yes

GET /categories/

Yes

Yes

POST /categories

No

Yes

PATCH /categories/

No

Yes

DELETE /categories/

No

Yes

GET /products

Yes

Yes

GET /products/

Yes

Yes

POST /products

No

Yes

PATCH /products/

No

Yes

DELETE /products/

No

Yes

Reuse Day 10 JWT and role middleware.

14. Error Handling

Use the centralized error system.

Handle at least:

400 → invalid input
401 → missing/invalid authentication
403 → insufficient role
404 → resource not found
409 → duplicate/conflicting resource where appropriate
500 → unexpected server error

Do not expose raw Prisma errors, passwords, JWTs or production stack traces.

15. Database Safety

Before schema changes:

Inspect the current schema.

Confirm relations.

Avoid destructive migrations.

Do not reset the database.

Do not delete existing user/order data.

Do not change unrelated models.

Only create a migration if actually required.

The Day 5 schema should already contain Category/Product models.

Never run:

npx prisma migrate reset

16. Testing

Test with Postman/Insomnia/curl or the existing test setup.

Categories

GET categories

GET category by ID

Admin creates category

Customer cannot create category

Admin updates category

Admin deactivates category

Invalid ID

Duplicate handling

Products

GET products

GET product by ID

Admin creates product

Customer cannot create product

Admin updates product

Admin deactivates product

Invalid ID

Invalid category

Negative stock rejected

Invalid price rejected

Invalid discount price rejected

Queries

GET /api/products?search=milk
GET /api/products?categoryId=<id>
GET /api/products?page=1&limit=10
GET /api/products?page=2&limit=10
GET /api/products?search=milk&categoryId=<id>&page=1&limit=10

17. Security

Do not:

log JWTs

log passwords

return password hashes

trust an isAdmin field from the client

allow customers to modify catalog data

accept arbitrary database fields

hardcode secrets

create a second authentication system

Use the authenticated server-side role.

18. Do Not Build on Day 11

Do not implement:

Home screen

Product cards UI

Search UI

Category UI

Product details UI

Cart

Checkout

Orders

Razorpay

Firebase

Cloudinary/S3 upload

Admin dashboard UI

Those belong to later sprint days.

19. Recommended Implementation Order

1. Inspect existing code
2. Verify Prisma Category/Product models
3. Category service
4. Category controller
5. Category routes
6. Category validation
7. Test category APIs
8. Product service
9. Product controller
10. Product routes
11. Product validation
12. Search
13. Category filtering
14. Pagination
15. Combined-query testing
16. CUSTOMER/ADMIN authorization testing
17. TypeScript/lint/tests
18. Final audit

20. 3-Hour Timebox

0:00–0:20

Inspect existing implementation.

0:20–1:10

Implement and test categories.

1:10–2:20

Implement products, search, filtering and pagination.

2:20–2:45

Run authorization and API tests.

2:45–3:00

Run build/lint/tests, inspect git diff and finalize.

21. Validation Commands

Use existing project scripts first:

npm run build
npm run lint
npm test

Also:

npx prisma generate

Only if a migration is genuinely required:

npx prisma migrate dev

Never use destructive reset commands.

22. Documentation

Update README/API documentation with:

category endpoints

product endpoints

query parameters

authentication requirements

CUSTOMER vs ADMIN permissions

sample requests/responses

pagination

search/filter behavior

23. Suggested Commit

feat: add category and product catalog APIs

Do not commit .env, secrets, passwords or JWT secrets.

24. Definition of Done

Categories

Read APIs work

Admin can create

Admin can update

Admin can deactivate/delete safely

Customer cannot modify

Validation works

Products

Read APIs work

Admin can create

Admin can update

Admin can deactivate/delete safely

Customer cannot modify

Validation works

Category relation works

Catalog queries

Pagination works

Search works

Category filtering works

Search + filtering works

Pagination + filtering works

Active/inactive behavior is correct

Quality

Day 10 auth/role middleware reused

Consistent errors

Controllers/services separated

TypeScript passes

Lint passes

Tests/smoke tests pass

README updated

No secrets committed

No destructive database commands

No later-day features added

25. Cursor Working Rules

When implementing with Cursor:

Inspect before editing.

Preserve working code.

Reuse Day 10 authentication/authorization.

Reuse existing response/error patterns.

Keep Route → Controller → Service → Prisma separation.

Use strict TypeScript.

Do not add unnecessary dependencies.

Do not use destructive database commands.

Do not implement later-day features.

Test incrementally.

Inspect the final git diff.

List every changed file at the end.

26. Final Cursor Audit

Check:

Category APIs

Product APIs

Customer read access

Admin write access

JWT integration

Role integration

Category validation

Product validation

Category relation

Pagination

Search

Category filtering

Combined filters

Active/inactive behavior

Error handling

TypeScript

Lint

Tests

Documentation

Scope compliance

No secrets

No destructive DB commands

Mark each PASS or FAIL.

If important issues remain, fix them before completion.

27. Final Decision

Output exactly one:

DAY 11 COMPLETE — SAFE TO MOVE TO DAY 12

or:

DAY 11 NOT COMPLETE — FIX THE FOLLOWING FIRST

If incomplete, list the exact remaining issues.

28. Architecture Goal

By the end of Day 11:

Customer/Admin
      │
      ▼
Express REST API
      │
 ┌────┴─────┐
 │          │
Category  Product
Routes     Routes
 │          │
 ▼          ▼
Controllers
 │          │
 ▼          ▼
Services
 └────┬─────┘
      ▼
    Prisma
      ▼
 PostgreSQL

Product listing:

GET /api/products
       │
       ├── search
       ├── categoryId
       ├── page
       └── limit
       │
       ▼
 Product Service
       │
       ▼
 Prisma Query
       │
       ▼
 PostgreSQL
       │
       ▼
Products + Pagination

Final Principle

Day 11 makes the catalog available through a clean, secure, reusable API.

Products and categories should come from PostgreSQL through Express rather than being hardcoded into the React Native app. This will later allow the Admin Dashboard to manage the live catalog without requiring a new mobile-app release.