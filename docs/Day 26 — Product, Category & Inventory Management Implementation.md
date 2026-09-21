# Sainik Mart — Day 26 Implementation Plan

## Admin Product + Category CRUD & Inventory Management

---

# 1. DAY 26 OVERVIEW

Day 26 converts the Admin Dashboard shell from Day 25 into a functional product/catalog management area.

The main objective is:

```text
Admin Dashboard
      │
      ├── Categories
      │      ├── View categories
      │      ├── Create category
      │      ├── Edit category
      │      └── Deactivate category
      │
      ├── Products
      │      ├── View products
      │      ├── Search/filter
      │      ├── Create product
      │      ├── Edit product
      │      └── Deactivate product
      │
      └── Inventory
             ├── View stock
             ├── Identify low stock
             └── Update stock
```

Day 25 created the Admin Dashboard shell.

Day 26 connects the shell to the existing catalog backend and introduces actual admin catalog management.

---

# 2. IMPORTANT SCOPE

Day 26 includes:

* Category management
* Product management
* Product search
* Product filtering
* Product pagination
* Product creation
* Product editing
* Product deactivation
* Category creation
* Category editing
* Category deactivation
* Basic inventory/stock management
* Admin-only access
* Form validation
* Loading states
* Empty states
* Error states
* Confirmation dialogs
* Responsive admin UI

Day 26 does NOT include:

* Order management
* Razorpay
* Payments
* FCM
* Delivery management
* Maps
* Customer management
* Analytics
* Coupons
* Loyalty
* Image upload infrastructure unless it already exists
* Advanced inventory/warehouse management
* Multi-warehouse support

---

# 3. EXISTING BACKEND CONTEXT

Day 11 already established catalog APIs.

Expected API structure includes:

```text
GET    /api/categories
POST   /api/categories
PATCH  /api/categories/:id
DELETE  /api/categories/:id

GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
DELETE  /api/products/:id
```

IMPORTANT:

Do NOT assume the exact paths or request/response structures.

Inspect the actual backend implementation first.

The backend implementation is the source of truth.

If Day 11 already implemented:

* pagination
* search
* category filtering
* active/inactive status
* validation
* ownership/role protection

reuse those APIs.

Do not create duplicate endpoints.

---

# 4. PRIMARY GOAL

At the end of Day 26:

An admin should be able to:

```text
Login
  ↓
Dashboard
  ↓
Categories
  ↓
Create/Edit/Deactivate category
  ↓
Products
  ↓
Search/filter products
  ↓
Create product
  ↓
Edit product
  ↓
Deactivate product
  ↓
Inventory
  ↓
View and update stock
```

All management operations must go through the existing backend API.

The frontend must never directly access PostgreSQL.

---

# 5. INSPECT FIRST

Before changing anything, inspect the existing project.

Do not immediately create components or APIs.

Inspect:

## Admin frontend

* Day 25 AdminLayout
* AdminSidebar
* AdminHeader
* existing route structure
* existing API client
* auth state
* protected admin routes
* reusable buttons
* reusable inputs
* reusable cards
* modal/dialog components
* table components
* pagination components
* toast/notification system
* form validation
* styling system
* design tokens
* TypeScript types

## Backend

Inspect:

* category routes
* category controller
* category service
* product routes
* product controller
* product service
* Prisma schema
* Product model
* Category model
* existing enums
* validation
* pagination
* search
* active/inactive logic
* stock field
* authentication middleware
* Day 24 admin authorization

## IMPORTANT

Do not create frontend assumptions about backend response shapes.

Inspect the actual response.

---

# 6. REUSE EXISTING API CLIENT

If Day 25 already created or reused an API client, continue using it.

Do not create:

```text
adminApi.ts
productApi2.ts
categoryApi2.ts
```

if the existing API client can handle the requests.

Create a small domain-specific API service only if that matches the existing project architecture.

For example:

```text
productsApi
categoriesApi
```

is acceptable if the application already follows that pattern.

---

# 7. ADMIN SECURITY

Every mutation must require admin authorization on the backend.

Frontend protection is not enough.

The request flow must remain:

```text
Frontend
   ↓
Authenticated session/JWT
   ↓
Backend authentication
   ↓
Admin authorization
   ↓
Controller
   ↓
Service
   ↓
Prisma
```

A customer must NOT be able to call:

```text
POST /api/products
PATCH /api/products/:id
DELETE /api/products/:id

POST /api/categories
PATCH /api/categories/:id
DELETE /api/categories/:id
```

even if they manually construct the HTTP request.

Do not weaken Day 24 authorization.

---

# 8. CATEGORY MANAGEMENT

Build the Categories page:

```text
/admin/categories
```

The page should contain:

```text
Categories
────────────────────────────────────────

[ + Add Category ]

Search if existing backend supports it

Category List/Table

Name
Status
Created
Actions

Edit
Deactivate
```

Use the project's existing table/list component if available.

---

# 9. CATEGORY LIST

Fetch real category data.

Do NOT hardcode categories.

Expected concept:

```text
GET /api/categories
```

Use the actual endpoint discovered during inspection.

Display useful fields available from the API.

Likely:

```text
Name
Status
Created At
Actions
```

Do not display fields that do not exist.

---

# 10. CATEGORY LOADING STATE

While loading:

```text
Loading categories...
```

Prefer an existing skeleton/spinner component.

Do not show a blank page.

---

# 11. CATEGORY EMPTY STATE

If there are no categories:

```text
No categories found.

Create your first category to organize products.

[ Add Category ]
```

Do not show fake category rows.

---

# 12. CREATE CATEGORY

Add:

```text
+ Add Category
```

Clicking it opens the existing modal/dialog/form pattern.

Form:

```text
Category Name
```

Only include fields actually supported by the backend.

If the backend supports:

```text
name
isActive
```

follow that structure.

Do not invent extra fields.

---

# 13. CATEGORY VALIDATION

At minimum:

* name required
* name must not be whitespace-only
* reasonable maximum length
* trim leading/trailing whitespace

Follow backend validation rules.

Frontend validation improves UX.

Backend validation remains authoritative.

---

# 14. CREATE CATEGORY FLOW

```text
Add Category
      ↓
Form
      ↓
Client Validation
      ↓
POST /api/categories
      ↓
Backend Auth
      ↓
Admin Authorization
      ↓
Validation
      ↓
Create Category
      ↓
Success
      ↓
Close Modal
      ↓
Refresh/List Update
```

Do not fake the new category in the UI without confirming the API succeeded.

---

# 15. EDIT CATEGORY

Each category should have:

```text
Edit
```

Clicking Edit opens a form populated with existing values.

Example:

```text
Edit Category

Name
[ Grocery ]

[ Cancel ] [ Save Changes ]
```

Use the actual category fields.

---

# 16. UPDATE CATEGORY

Use the existing backend endpoint.

Conceptually:

```text
PATCH /api/categories/:id
```

Do not use POST for updates unless that is the existing backend contract.

After success:

```text
Success
 ↓
Close modal
 ↓
Update/re-fetch category list
```

---

# 17. CATEGORY DEACTIVATION

Prefer deactivation over destructive deletion if the backend supports active/inactive categories.

For example:

```text
Active
Inactive
```

or equivalent.

If the backend's DELETE endpoint already performs safe deactivation, follow the backend behavior.

Do NOT blindly hard-delete categories.

---

# 18. CATEGORY DELETE CONFIRMATION

Before a destructive/deactivation action:

```text
Are you sure?

This category will be deactivated.

[ Cancel ] [ Deactivate ]
```

Do not immediately perform the action on one accidental click.

Use a confirmation dialog.

---

# 19. CATEGORY ERROR HANDLING

Handle:

* duplicate category
* validation error
* unauthorized
* forbidden
* network failure
* server error

Use the backend's actual error response.

Show human-readable messages.

Do not display raw:

```text
Prisma error
stack trace
Axios error object
```

---

# 20. PRODUCT MANAGEMENT

Build:

```text
/admin/products
```

The page should contain:

```text
Products
────────────────────────────────────────────

[ + Add Product ]

Search products

Category Filter

Status Filter

Product Table

Product
Category
Price
Stock
Status
Actions
```

Use existing UI/table components.

---

# 21. PRODUCT LIST

Use the existing product API.

Likely:

```text
GET /api/products
```

with supported query parameters such as:

```text
page
limit
search
categoryId
```

Only send parameters actually supported by the backend.

Do not invent query parameters.

---

# 22. PRODUCT SEARCH

If the backend already supports search from Day 11, connect the search input.

Example:

```text
Search products...
```

Search should be server-backed.

Do NOT fetch every product and perform the complete search only in the browser if the backend already supports search.

---

# 23. SEARCH DEBOUNCE

If appropriate for the existing project, debounce search requests.

For example:

```text
User types:
Milk

Instead of:
M
Mi
Mil
Milk

Make one request after a short pause.
```

Keep the implementation simple.

Do not introduce a heavy dependency just for debounce.

---

# 24. CATEGORY FILTER

Use the categories already retrieved from:

```text
GET /api/categories
```

Provide a category selector.

Example:

```text
All Categories
Groceries
Beverages
Snacks
...
```

Selecting a category should use the backend's supported:

```text
categoryId
```

filter if available.

---

# 25. STATUS FILTER

If the product API supports active/inactive filtering, provide it.

Example:

```text
All
Active
Inactive
```

If the backend does not currently support status filtering, do not invent a frontend-only implementation that creates inconsistent behavior.

---

# 26. PRODUCT PAGINATION

Reuse the pagination implementation from Day 11.

Expected conceptual response:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

The actual response may differ.

Inspect the backend.

Build the UI around the real response shape.

---

# 27. PRODUCT TABLE

Display useful information such as:

```text
Product
Category
Price
Discount Price if available
Stock
Status
Actions
```

Only display fields available in the backend response.

For product image:

If a real image URL already exists, show it.

If not, use a clean placeholder.

Do NOT implement image upload infrastructure today unless it already exists.

---

# 28. CREATE PRODUCT

Add:

```text
+ Add Product
```

Open a product form.

Likely fields:

```text
Name
Description
Price
Discount Price
Category
Stock
Active/Inactive
Image URL
```

BUT:

Only use fields that exist in the current Prisma model/API.

Do not invent database fields.

---

# 29. PRODUCT FORM VALIDATION

At minimum, where applicable:

### Name

Required.

Not whitespace-only.

### Price

Must be numeric.

Must be >= 0.

### Discount price

If supplied:

```text
discountPrice <= price
```

Must not be negative.

### Stock

Must be an integer.

Must be >= 0.

### Category

Must be selected if the backend requires a category.

### Description

Optional if backend supports it.

Follow actual backend validation.

---

# 30. SERVER-SIDE VALIDATION REMAINS AUTHORITATIVE

Do not assume frontend validation is enough.

The backend must still validate:

```text
price
discountPrice
stock
category
name
```

Do not bypass backend validation.

---

# 31. CREATE PRODUCT FLOW

```text
Add Product
      ↓
Product Form
      ↓
Client Validation
      ↓
POST /api/products
      ↓
Authentication
      ↓
Admin Authorization
      ↓
Backend Validation
      ↓
Create Product
      ↓
Success
      ↓
Refresh Product List
```

---

# 32. EDIT PRODUCT

Each product should have:

```text
Edit
```

Clicking Edit opens the existing product values.

Example:

```text
Edit Product

Name
Description
Price
Discount Price
Category
Stock
Status

[ Cancel ] [ Save Changes ]
```

Use the actual backend schema.

---

# 33. UPDATE PRODUCT

Use:

```text
PATCH /api/products/:id
```

or the actual backend endpoint.

Do not recreate the product.

Do not use POST unless that is the backend contract.

After successful update:

```text
Close
 ↓
Refresh/update product list
```

---

# 34. PRODUCT DEACTIVATION

Prefer safe deactivation instead of permanent deletion.

If the backend has:

```text
isActive
```

use it.

The product should remain available in the database but be excluded from customer-facing active product results according to the existing backend logic.

---

# 35. PRODUCT DELETE CONFIRMATION

Before deactivation:

```text
Deactivate Product?

This product will no longer be available to customers.

[ Cancel ] [ Deactivate ]
```

The exact wording should reflect the actual backend behavior.

Do not claim permanent deletion if the backend only deactivates.

---

# 36. INVENTORY MANAGEMENT

Day 26 includes basic inventory management.

Do not build a warehouse management system.

The goal is simply:

```text
View stock
+
Update stock
+
Identify low-stock products
```

---

# 37. INVENTORY PAGE

Build:

```text
/admin/inventory
```

Conceptual UI:

```text
Inventory
────────────────────────────────────────

Search products

Stock Status

All
In Stock
Low Stock
Out of Stock

Product
Current Stock
Status
Update Stock
```

---

# 38. INVENTORY DATA

Prefer using the existing product API if stock is already part of the Product model.

Do NOT create a separate Inventory table unless the existing architecture already has one and it is required.

The current MVP can treat:

```text
Product.stock
```

as inventory quantity.

---

# 39. LOW-STOCK THRESHOLD

Do not hardcode an arbitrary business rule without checking the existing project.

If the project already defines a low-stock threshold, reuse it.

If no threshold exists, keep the UI simple and configurable through a clearly defined constant only if appropriate.

For example:

```text
LOW_STOCK_THRESHOLD = 5
```

may be used only if the project has no existing business rule and the implementation clearly documents it.

Do not modify the database merely to add a low-stock threshold.

---

# 40. STOCK STATUS

Conceptually:

```text
Stock > threshold
→ In Stock

Stock > 0 and <= threshold
→ Low Stock

Stock = 0
→ Out of Stock
```

Use the project's existing terminology if one exists.

Do not change the product's actual status based solely on stock unless the backend already defines that behavior.

---

# 41. UPDATE STOCK

Allow admin to update stock.

Example:

```text
Current Stock: 12

New Stock
[ 20 ]

[ Cancel ] [ Update Stock ]
```

Use the existing product update API if stock is part of Product.

For example:

```text
PATCH /api/products/:id
```

with only the stock field if the backend supports partial updates.

Do not create a separate inventory API unless the existing architecture already requires it.

---

# 42. STOCK VALIDATION

Stock must be:

```text
integer
>= 0
```

Reject:

```text
-1
1.5
abc
```

Use both frontend and backend validation.

---

# 43. IMPORTANT INVENTORY RULE

Never allow the frontend to send:

```text
stock = -10
```

or other invalid values.

The backend must still protect against it.

Do not bypass the backend validation.

---

# 44. CUSTOMER-SIDE EFFECTS

Remember that product stock is used by the customer cart/order system.

Day 19 order creation already validates stock.

Therefore, after an admin updates stock:

```text
Customer order creation
        ↓
Uses current server stock
```

Do not modify the customer order logic during Day 26 unless an actual integration issue is discovered.

---

# 45. PRODUCT PRICE SAFETY

Admin product editing can change product price.

Remember:

```text
Current Product Price
```

is different from:

```text
Historical OrderItem Price
```

Do not modify existing orders when a product price changes.

Existing OrderItems must continue to represent purchase-time snapshots.

---

# 46. IMAGE HANDLING

Inspect whether the backend/product model already supports:

```text
imageUrl
image
imageUrls
```

If an image URL already exists:

Allow the admin to enter/edit the URL if appropriate.

If the project does not yet have image upload infrastructure:

Do NOT implement Cloudinary/S3 upload today.

Use an optional image URL only if supported by the existing backend.

Image upload can be implemented as a separate feature later.

---

# 47. MODALS / DRAWERS

Use the project's existing modal/dialog/drawer component.

Do not install a new UI library unless the existing project has no suitable solution and the addition is genuinely necessary.

Recommended behavior:

```text
Create
 ↓
Modal
 ↓
Form

Edit
 ↓
Modal
 ↓
Form

Deactivate
 ↓
Confirmation Modal
```

---

# 48. FORM STATE

Reuse existing form patterns.

If the project already uses:

```text
React Hook Form
Formik
controlled inputs
```

follow the existing approach.

Do not introduce another form library.

---

# 49. SUCCESS FEEDBACK

After successful:

* create
* update
* deactivate
* stock update

show a clear success message.

For example:

```text
Product created successfully.
```

Use the project's existing toast/notification system.

Do not create a second notification mechanism.

---

# 50. MUTATION LOADING STATE

During mutations:

```text
Create
Update
Deactivate
Stock Update
```

disable the relevant submit/action button.

Example:

```text
Saving...
```

Prevent duplicate submissions.

Do not allow repeated clicks to create duplicate categories/products.

---

# 51. NETWORK FAILURE

If a mutation fails due to network issues:

```text
Unable to save changes.
Please try again.
```

Do not lose unsaved form data unnecessarily.

Do not silently fail.

---

# 52. UNAUTHORIZED / FORBIDDEN

If backend returns:

```text
401
```

handle it using the existing auth mechanism.

If backend returns:

```text
403
```

show appropriate authorization feedback.

Do not attempt to bypass it.

---

# 53. TABLE RESPONSIVENESS

Desktop tables can use:

```text
Product
Category
Price
Stock
Status
Actions
```

On smaller screens:

* allow horizontal scrolling
* or use responsive cards if the existing UI system supports it

Do not make table content unreadably compressed.

---

# 54. ACCESSIBILITY

Ensure:

* forms have labels
* inputs have meaningful names
* buttons have accessible text
* dialogs can be closed with keyboard where applicable
* focus handling is sensible
* confirmation dialogs are understandable
* status information is not communicated only by color
* tables have appropriate headers
* navigation remains keyboard accessible

---

# 55. DESIGN SYSTEM

Use the existing Sainik Mart branding:

```text
Primary:        #145C38
Primary Dark:   #0C3F24
Primary Light:  #1F6B45
Gold:           #C6A34E
Accent:         #E85A20
Background:     #F6F4EF
Surface:        #FFFFFF
Text Primary:   #1A241C
Text Secondary: #6B6560
Danger:         #B91C1C
```

Admin UI should remain:

```text
Clean
Professional
Minimal
Consistent
Responsive
```

Use orange primarily for important actions/status accents.

Use red for destructive/deactivation actions.

Do not turn every button orange.

---

# 56. PRODUCT STATUS

If products support:

```text
isActive
```

show:

```text
Active
Inactive
```

with accessible visual differences.

Do not rely only on color.

Example:

```text
● Active
○ Inactive
```

with appropriate text.

---

# 57. CATEGORY STATUS

Same principle for categories if the backend supports active/inactive.

Do not invent a status field if it does not exist.

---

# 58. FILTER STATE

When using:

```text
Search
Category
Status
Page
```

ensure state changes correctly update the displayed results.

When search/filter changes:

```text
Reset page to 1
```

if the backend pagination requires it.

Do not remain on page 5 after applying a filter that only has one page.

---

# 59. PAGINATION UX

Provide:

```text
Previous
1
2
3
Next
```

or the project's existing pagination component.

Disable:

```text
Previous
```

on the first page.

Disable:

```text
Next
```

on the final page.

Display useful information where appropriate:

```text
Showing 1–20 of 100
```

Use actual API metadata.

---

# 60. DATA REFRESH

After mutations:

Option A:

```text
Re-fetch current list
```

Option B:

```text
Update local list with confirmed server response
```

Prefer whichever pattern the project already uses.

Do not optimistically display changes that have not been confirmed by the server unless the existing architecture intentionally supports optimistic updates.

---

# 61. CUSTOMER CATALOG REGRESSION

After admin changes a product/category, verify that customer-facing APIs still behave correctly.

For example:

```text
Admin deactivates product
        ↓
Customer product listing
        ↓
Inactive product should not appear
```

assuming that is the existing Day 11 behavior.

Similarly:

```text
Admin updates product price
        ↓
Customer catalog
        ↓
Current price reflected
```

while historical orders remain unchanged.

Do not rewrite customer catalog logic.

---

# 62. IMPORTANT DATABASE RULE

Do not make unnecessary Prisma schema changes.

Before changing the database:

1. Inspect existing schema.
2. Determine whether required fields already exist.
3. Reuse existing fields.

Never:

```text
prisma migrate reset
```

Never delete migrations.

Never drop existing data.

Never recreate the database.

If a schema change is genuinely required:

* create a proper migration
* preserve existing data
* explain the reason

---

# 63. BACKEND CHANGES

Day 26 is primarily an admin frontend implementation.

Only modify backend code if:

* an existing Day 11 endpoint has a real bug
* admin authorization is missing from a mutation
* a required field/response is genuinely missing
* stock update cannot be safely performed through the existing API

If backend changes are required:

* keep them minimal
* follow existing architecture
* reuse authentication
* reuse admin authorization
* add validation
* add tests
* do not refactor unrelated code

---

# 64. SECURITY CHECK

Verify that these endpoints cannot be used by customers:

```text
POST /categories
PATCH /categories/:id
DELETE /categories/:id

POST /products
PATCH /products/:id
DELETE /products/:id
```

The exact paths may differ.

Test directly against the API if possible.

Expected:

```text
Admin → allowed
Customer → 403
Unauthenticated → 401
```

---

# 65. PRODUCT PRICE SECURITY

When creating/updating products:

The backend must remain authoritative.

Do not allow:

```text
NaN
Infinity
negative price
invalid discount price
```

Do not allow malformed numeric values to reach Prisma.

Frontend validation is not sufficient.

---

# 66. INVENTORY SECURITY

Ensure stock updates:

```text
integer
>= 0
```

No negative inventory.

Do not expose database internals.

Do not allow customers to update stock.

---

# 67. TESTING — CATEGORY

Test:

### List

* category list loads
* empty state works
* loading works
* error works

### Create

* valid category
* empty name
* whitespace-only name
* duplicate name if backend rejects it
* network failure
* unauthorized request

### Edit

* existing values populate
* valid update
* invalid update
* save loading state

### Deactivate

* confirmation required
* cancel works
* successful deactivation
* error state

---

# 68. TESTING — PRODUCTS

Test:

### List

* products load
* pagination works
* search works
* category filter works
* status filter works if supported
* empty results
* loading
* network error

### Create

* valid product
* missing name
* invalid price
* negative price
* discount > price
* negative stock
* invalid category
* successful creation
* duplicate submit prevention

### Edit

* values populate
* price update
* category update
* stock update
* status update
* validation errors
* successful save

### Deactivate

* confirmation
* cancel
* successful deactivation
* customer catalog regression

---

# 69. TESTING — INVENTORY

Test:

```text
View stock
```

```text
Update stock from 10 → 20
```

```text
Update stock to 0
```

```text
Attempt -1
```

```text
Attempt 1.5
```

```text
Attempt invalid string
```

Expected invalid values are rejected.

Also verify:

```text
Customer order creation
```

still respects the updated stock.

---

# 70. SECURITY TEST MATRIX

Use this matrix:

| Action              |   Admin |          Customer |   Unauthenticated |
| ------------------- | ------: | ----------------: | ----------------: |
| View products       | Allowed | Existing behavior | Existing behavior |
| Create product      | Allowed |               403 |               401 |
| Edit product        | Allowed |               403 |               401 |
| Deactivate product  | Allowed |               403 |               401 |
| Create category     | Allowed |               403 |               401 |
| Edit category       | Allowed |               403 |               401 |
| Deactivate category | Allowed |               403 |               401 |
| Update stock        | Allowed |               403 |               401 |

Use the actual API routes discovered from the project.

---

# 71. IMPORTANT ORDER DATA SAFETY

When product data changes:

Do not modify existing order snapshots.

Example:

```text
Product price today = ₹100

Customer orders product = ₹100

Admin later changes product price = ₹120
```

The existing OrderItem should remain:

```text
₹100
```

Do not recalculate historical orders from current Product data.

---

# 72. NO CUSTOMER APP CHANGES

Do not redesign the React Native customer app during Day 26.

Only verify regressions where necessary.

Do not modify:

* Home
* Cart
* Checkout
* Address
* Orders UI
* navigation

unless a direct regression from admin catalog management is discovered.

---

# 73. TYPESCRIPT

All new code must be properly typed.

Avoid:

```typescript
any
```

Avoid:

```typescript
// @ts-ignore
```

Do not weaken TypeScript configuration.

Create proper types/interfaces for:

```text
Product
Category
ProductListResponse
CategoryListResponse
Pagination
ProductFormData
CategoryFormData
```

only where useful and consistent with the existing project.

---

# 74. API RESPONSE TYPES

Do not guess response shapes.

Inspect backend responses and existing frontend types.

For example, if backend returns:

```json
{
  "data": [],
  "meta": {}
}
```

do not assume:

```json
{
  "products": []
}
```

Build the frontend against the actual contract.

---

# 75. FORM DATA TYPES

Keep form types separate from API response types where appropriate.

For example:

```text
ProductFormData
```

does not necessarily need:

```text
id
createdAt
updatedAt
```

Do not send unnecessary server-controlled fields.

---

# 76. SERVER-CONTROLLED FIELDS

Do not allow frontend forms to control:

```text
id
createdAt
updatedAt
```

or other server-managed values.

Only send fields supported by the mutation API.

---

# 77. PERFORMANCE

Do not over-engineer.

For product lists:

* use pagination
* debounce search where appropriate
* avoid unnecessary duplicate requests
* do not fetch all products if backend pagination exists

For categories:

* categories are likely small enough for a simple list
* avoid unnecessary repeated category requests

Reuse cached/local data only if the existing architecture supports it cleanly.

---

# 78. NO NEW STATE MANAGEMENT LIBRARY

Do not add Redux/Zustand/etc. for Day 26.

Use:

* existing auth state
* local component state
* existing query/data layer if already present

Follow the project's existing architecture.

---

# 79. FINAL UI CHECK

Verify:

### Categories

```text
Categories

[ + Add Category ]

Name        Status       Actions
Groceries   Active       Edit | Deactivate
Beverages   Active       Edit | Deactivate
```

### Products

```text
Products

[ + Add Product ]

[ Search products... ]

[ Category ▼ ] [ Status ▼ ]

Product     Category     Price     Stock    Status    Actions
Milk        Dairy        ₹60       10       Active    Edit
Bread       Bakery       ₹40       3        Active    Edit
```

### Inventory

```text
Inventory

[ Search ]

Product     Stock     Status
Milk        10        In Stock
Bread       3         Low Stock
Rice        0         Out of Stock
```

These are visual examples only.

Use actual backend data.

---

# 80. FINAL GIT REVIEW

Before declaring completion:

Run:

```bash
git status
```

Then:

```bash
git diff
```

Review all changes.

Check:

* no secrets
* no `.env` committed
* no fake data
* no debug code
* no unnecessary dependencies
* no duplicate API client
* no duplicate auth system
* no unrelated refactoring
* no destructive migration
* no customer-app changes unless required
* no Day 27 features accidentally implemented

---

# 81. DEFINITION OF DONE

Day 26 is complete only when all relevant items below are satisfied.

## Categories

* [ ] Category list works.
* [ ] Category loading state works.
* [ ] Category empty state works.
* [ ] Create category works.
* [ ] Edit category works.
* [ ] Deactivate category works.
* [ ] Confirmation dialog works.
* [ ] Validation works.
* [ ] Error handling works.
* [ ] Admin authorization works.

## Products

* [ ] Product list works.
* [ ] Search works if supported.
* [ ] Category filtering works if supported.
* [ ] Status filtering works if supported.
* [ ] Pagination works if supported.
* [ ] Create product works.
* [ ] Edit product works.
* [ ] Deactivate product works.
* [ ] Product validation works.
* [ ] Error handling works.
* [ ] Duplicate submissions are prevented.
* [ ] Admin authorization works.

## Inventory

* [ ] Inventory page works.
* [ ] Current stock is displayed.
* [ ] Low-stock status works according to the defined project rule.
* [ ] Out-of-stock status works.
* [ ] Stock can be updated.
* [ ] Negative stock is rejected.
* [ ] Invalid stock is rejected.
* [ ] Admin authorization works.

## Security

* [ ] Customer cannot mutate products.
* [ ] Customer cannot mutate categories.
* [ ] Customer cannot update inventory.
* [ ] Unauthenticated mutation requests return 401.
* [ ] Customer mutation requests return 403.
* [ ] Backend authorization remains active.
* [ ] No client-side security bypass exists.

## Data Integrity

* [ ] Product price changes do not alter historical orders.
* [ ] Product deactivation does not delete historical order items.
* [ ] Category changes do not corrupt products.
* [ ] Stock cannot become negative.
* [ ] Server remains source of truth.

## Quality

* [ ] TypeScript passes.
* [ ] Lint passes if configured.
* [ ] Tests pass where configured.
* [ ] Git diff reviewed.
* [ ] No destructive DB operations.
* [ ] No unrelated refactor.
* [ ] No Day 27 functionality implemented.

---

# 82. FINAL EXPECTED FLOW

At the end of Day 26:

```text
Admin Login
    ↓
Admin Dashboard
    │
    ├── Dashboard
    │
    ├── Categories
    │      │
    │      ├── List
    │      ├── Create
    │      ├── Edit
    │      └── Deactivate
    │
    ├── Products
    │      │
    │      ├── List
    │      ├── Search
    │      ├── Filter
    │      ├── Create
    │      ├── Edit
    │      └── Deactivate
    │
    └── Inventory
           │
           ├── View Stock
           ├── Low Stock
           ├── Out of Stock
           └── Update Stock
```

The backend remains:

```text
Admin UI
   ↓
API Client
   ↓
JWT Authentication
   ↓
Admin Authorization
   ↓
Controller
   ↓
Service
   ↓
Prisma
   ↓
PostgreSQL
```

---

# 83. FUTURE DAYS

Do NOT implement these now.

### Day 27

Admin Order Management:

```text
Orders
 ↓
Order list
 ↓
Order details
 ↓
Status updates
 ↓
Customer/order information
```

### Day 28

Admin/customer end-to-end testing and stabilization.

### Later

* Razorpay/payment administration
* notifications
* image uploads
* advanced inventory
* analytics
* deployment hardening

---

# 84. FINAL CURSOR CHECKPOINT

At the end of implementation, provide a concise report containing:

1. Files inspected
2. Existing backend APIs discovered
3. Existing admin frontend architecture
4. Category implementation
5. Product implementation
6. Inventory implementation
7. API integrations
8. Components created
9. Routes created/modified
10. Validation implemented
11. Security/authorization checks
12. Tests performed
13. Build result
14. Lint result
15. Test result
16. Git diff summary
17. Any remaining issues
18. Confirmation that no destructive database operation was performed
19. Confirmation that no Day 27 functionality was implemented

Finally output exactly one of:

```text
DAY 26 COMPLETE — SAFE TO MOVE TO DAY 27
```

or:

```text
DAY 26 NOT COMPLETE — FIX THE FOLLOWING FIRST
```

If incomplete, list the exact blockers immediately below the status.

---

# 85. EXECUTION PRINCIPLE

The existing codebase is the source of truth.

Inspect first.

Reuse existing:

* authentication
* authorization
* API client
* backend APIs
* validation
* UI components
* styling
* routing
* error handling
* pagination
* TypeScript conventions

Implement only what is required for Day 26.

Do not rewrite working architecture.

Do not create duplicate systems.

Do not make assumptions about API responses.

Do not implement future-day functionality early.

Keep the implementation production-oriented, secure, maintainable, and consistent with the existing Sainik Mart application.
