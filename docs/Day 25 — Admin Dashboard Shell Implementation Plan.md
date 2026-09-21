# Sainik Mart — Day 25 Implementation Plan

## Admin Dashboard Shell & Navigation

---

# 1. DAY 25 OVERVIEW

Day 25 begins the Admin Dashboard phase of the Sainik Mart MVP.

The purpose of Day 25 is to create the **Admin Dashboard UI foundation** that future admin features will plug into.

The dashboard should provide:

```text
Admin Login
     ↓
Admin Authentication
     ↓
Admin Authorization
     ↓
Admin Dashboard
     ↓
┌─────────────────────────────┐
│ Dashboard                   │
│                             │
│ Products                    │
│ Categories                  │
│ Orders                      │
│ Inventory                   │
│                             │
│ Logout                      │
└─────────────────────────────┘
```

Day 24 established the backend authorization foundation.

Day 25 builds the frontend/admin application shell on top of it.

---

# 2. PROJECT CONTEXT

Sainik Mart is a grocery delivery MVP.

Current architecture:

```text
Customer Mobile App
React Native + Expo + TypeScript
              │
              │ HTTPS
              ▼
Node.js + Express + TypeScript API
              │
              ▼
PostgreSQL + Prisma
```

Admin dashboard:

```text
Admin Dashboard
React / Next.js
      │
      │ HTTPS
      ▼
Existing Express API
      │
      ▼
PostgreSQL
```

The admin dashboard is a separate interface from the React Native customer application.

Use the existing admin frontend project if it already exists.

If an admin frontend project has already been created, inspect and extend it.

Do NOT create a second admin application.

---

# 3. DAY 25 GOAL

Build a clean, responsive **Admin Dashboard Shell**.

The shell should include:

* Admin layout
* Sidebar/navigation
* Dashboard home
* Products navigation placeholder
* Categories navigation placeholder
* Orders navigation placeholder
* Inventory navigation placeholder
* Admin profile/session area
* Logout
* Protected admin route handling
* Responsive desktop/tablet layout
* Loading/authentication states
* Unauthorized handling
* Consistent visual system

The actual CRUD functionality is NOT part of Day 25.

---

# 4. IMPORTANT — INSPECT FIRST

Before writing code, inspect the existing repository/project.

Do NOT blindly create files.

Inspect:

### Admin frontend

* project structure
* `package.json`
* framework
* React version
* Next.js version if applicable
* TypeScript configuration
* routing configuration
* existing layouts
* existing components
* existing API client
* authentication implementation
* environment configuration
* existing styling system
* existing design tokens
* existing reusable buttons/cards/forms
* existing error handling

### Backend

Inspect:

* existing authentication endpoint
* existing `/auth/me` endpoint
* JWT behavior
* admin authorization from Day 24
* admin route structure
* response format
* authentication error format
* authorization error format

### Important

Do not replace existing authentication architecture.

Do not create a second API client.

Do not create a second JWT implementation.

Do not create a second auth system.

Reuse existing project conventions.

---

# 5. VERIFY ADMIN AUTHENTICATION FLOW

Before building the dashboard, understand the existing authentication flow.

The intended flow is:

```text
Admin
 ↓
Login
 ↓
Existing authentication API
 ↓
JWT/session
 ↓
Authenticated admin
 ↓
Admin authorization
 ↓
Dashboard
```

The frontend must NOT determine that a user is an admin simply because the client says:

```text
role = ADMIN
```

The server remains the authority.

The frontend may use authenticated user information for UI purposes, but protected API access must still be enforced by the backend.

---

# 6. ADMIN LOGIN

Inspect whether an admin login screen already exists.

## If it exists

Reuse it.

Do not rebuild it unnecessarily.

## If it does not exist

Create a minimal admin login page.

Expected fields:

```text
Email
Password
Login
```

Behavior:

```text
Submit
 ↓
Existing login API
 ↓
Authentication succeeds
 ↓
Fetch/receive authenticated user
 ↓
Verify admin access
 ↓
Redirect to dashboard
```

Do not create a new backend login endpoint.

Use the existing authentication API.

---

# 7. ADMIN ACCESS CHECK

After login, the frontend should establish whether the authenticated session is valid.

Preferred existing flow:

```text
GET /api/auth/me
```

or whatever equivalent endpoint already exists.

Inspect the actual project before assuming the endpoint name.

The frontend should not blindly trust:

```text
localStorage.role
```

as the only security mechanism.

The backend remains authoritative.

---

# 8. PROTECTED ADMIN ROUTES

Create a reusable admin route protection mechanism.

Conceptually:

```text
AdminRoute / ProtectedAdminRoute
        ↓
Check authentication
        ↓
Check authenticated user
        ↓
Check admin authorization state
        ↓
Allow dashboard
```

The exact implementation depends on whether the project uses:

* React Router
* Next.js App Router
* Next.js Pages Router
* another routing system

Use the existing routing architecture.

Do not introduce a second routing library.

---

# 9. UNAUTHENTICATED USER BEHAVIOR

If the user is not authenticated:

```text
Protected Admin Page
       ↓
No valid session
       ↓
Redirect to Admin Login
```

Do not render protected admin content while authentication is unresolved.

Use an appropriate loading state while checking the session.

---

# 10. NON-ADMIN USER BEHAVIOR

If a customer attempts to access the admin dashboard:

```text
Customer
   ↓
Authenticated
   ↓
Admin Dashboard
   ↓
Access denied
```

The UI should show an appropriate unauthorized state or redirect according to the project's existing conventions.

For example:

```text
403
Access Denied

You do not have permission to access the admin dashboard.

Back to Login
```

Do not expose admin content before this check.

Remember:

Frontend route protection is UX/security layering.

The backend remains the real authorization boundary.

---

# 11. ADMIN LAYOUT

Create the main admin layout.

Desktop concept:

```text
┌─────────────────────────────────────────────────────────┐
│ Sainik Mart Admin                       Admin / Logout  │
├───────────────┬─────────────────────────────────────────┤
│               │                                         │
│ Dashboard     │                                         │
│               │          Main Content                   │
│ Products      │                                         │
│ Categories    │                                         │
│ Orders        │                                         │
│ Inventory     │                                         │
│               │                                         │
│               │                                         │
│ Logout        │                                         │
│               │                                         │
└───────────────┴─────────────────────────────────────────┘
```

Use:

* persistent sidebar on desktop
* responsive navigation on smaller screens
* top header where appropriate
* main content area
* active navigation state

---

# 12. SIDEBAR NAVIGATION

Create reusable navigation items.

Required items:

```text
Dashboard
Products
Categories
Orders
Inventory
```

Optional:

```text
Settings
```

Only add Settings if there is an existing meaningful route.

Do not create unnecessary placeholder functionality.

---

# 13. ROUTES

Use the existing routing architecture.

Recommended route structure:

```text
/admin
/admin/products
/admin/categories
/admin/orders
/admin/inventory
```

The exact routing convention may differ depending on the current admin application.

Inspect first.

The following pages should exist as shell/placeholder pages:

### Dashboard

```text
/admin
```

### Products

```text
/admin/products
```

### Categories

```text
/admin/categories
```

### Orders

```text
/admin/orders
```

### Inventory

```text
/admin/inventory
```

---

# 14. IMPORTANT — PLACEHOLDER PAGES ONLY

Day 25 does NOT implement:

* product CRUD
* category CRUD
* order management
* inventory management

Instead, create clean placeholder pages.

Example:

```text
Products

Product management will be available here.
```

But keep placeholders professional.

Do not make them look like unfinished debug screens.

The shell should feel like a real admin application even though the feature pages are not implemented yet.

---

# 15. DASHBOARD HOME

Create the main admin dashboard page.

It should contain a clean overview.

For Day 25, use only information that is already safely available.

Do NOT build new analytics APIs.

Do NOT create fake business statistics.

Do NOT hardcode fake numbers such as:

```text
1250 Products
350 Orders
₹2,50,000 Revenue
```

unless those values already come from an existing API.

Instead, use simple dashboard navigation cards or neutral sections.

Example:

```text
Welcome to Sainik Mart Admin

Quick Access

Products
Manage grocery products

Categories
Manage product categories

Orders
View and manage customer orders

Inventory
Monitor product stock
```

These can navigate to the corresponding pages.

---

# 16. ADMIN HEADER

Create a reusable header.

It should show:

```text
Sainik Mart Admin
```

and the authenticated admin's display information where available.

For example:

```text
Admin
admin@example.com
```

Only display information already available from the authenticated user.

Do not expose:

* password
* password hash
* JWT
* access token
* sensitive database fields

---

# 17. LOGOUT

Implement logout using the existing authentication architecture.

Do not invent a second logout mechanism.

If the application stores authentication state in local storage:

* clear the appropriate authentication state
* clear user session state
* redirect to login

If the application uses cookies/session:

* follow the existing logout/session mechanism

After logout:

```text
Admin
 ↓
Logout
 ↓
Session removed
 ↓
Login page
```

Attempting to revisit:

```text
/admin
```

must require authentication again.

---

# 18. AUTH STATE

Use the project's existing auth state architecture.

If there is already:

```text
AuthContext
useAuth()
AuthProvider
```

reuse it.

If there is already a session/auth store, reuse it.

Do NOT introduce:

```text
Redux
Zustand
another AuthContext
```

just for Day 25.

Avoid unnecessary global state.

---

# 19. API CLIENT

Reuse the existing API client.

If the admin frontend already has:

```text
api.ts
apiClient.ts
axios instance
fetch wrapper
```

use it.

Do NOT create another API client.

Do NOT hardcode:

```text
http://localhost:3000
```

inside components.

Use the existing environment configuration.

---

# 20. ENVIRONMENT VARIABLES

Inspect the existing environment configuration.

If an API base URL already exists, reuse it.

For example, if the project uses:

```text
VITE_API_URL
```

or:

```text
NEXT_PUBLIC_API_URL
```

follow that convention.

Do not rename existing environment variables unnecessarily.

Do not commit secrets.

Do not put:

```text
JWT_SECRET
DATABASE_URL
```

in the frontend.

Frontend must never contain backend secrets.

---

# 21. DESIGN DIRECTION

The Admin Dashboard is separate from the customer mobile app.

Do not blindly copy the Blinkit-style mobile UI.

However, it should still feel like the same Sainik Mart brand.

Use the existing Sainik Mart visual language where appropriate.

Brand colors:

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
danger: "#B91C1C"
```

Recommended admin usage:

```text
Primary green
→ sidebar/header/primary actions

Primary dark
→ strong branding

Cream
→ page background

White
→ cards/surfaces

Orange
→ selected important actions/status accents

Gold
→ subtle brand accents

Dark text
→ headings

Secondary text
→ descriptions
```

Do not overuse orange or gold.

---

# 22. ADMIN DASHBOARD VISUAL STYLE

Target:

```text
Clean
Professional
Minimal
Responsive
Modern
Easy to scan
```

Use:

* clear spacing
* cards
* subtle borders
* restrained shadows
* readable typography
* consistent button styles
* clear active navigation
* accessible contrast

Avoid:

* excessive gradients
* excessive animations
* unnecessary illustrations
* huge hero sections
* excessive rounded cards
* decorative elements that reduce usability

---

# 23. RESPONSIVE DESIGN

The dashboard must work on:

* desktop
* laptop
* tablet
* smaller browser widths

Desktop:

```text
Sidebar + Main Content
```

Smaller screens:

```text
Top navigation / collapsible sidebar
```

If the project already has a responsive layout component, reuse it.

Do not add a complicated UI framework solely for this task.

---

# 24. LOADING STATES

Authentication checks need a loading state.

Example:

```text
Checking admin session...
```

Use the project's existing loading/spinner component if available.

Do not render:

```text
Dashboard
```

until authentication state has been resolved.

---

# 25. ERROR STATES

Implement sensible states for:

### Authentication failure

```text
Unable to verify your session.
Please log in again.
```

### Unauthorized

```text
You do not have permission to access this dashboard.
```

### API/network failure

Use the existing error handling pattern.

Do not expose raw:

```text
AxiosError
PrismaError
stack traces
```

to the user.

---

# 26. NAVIGATION BEHAVIOR

Clicking:

```text
Dashboard
```

→ `/admin`

Clicking:

```text
Products
```

→ `/admin/products`

Clicking:

```text
Categories
```

→ `/admin/categories`

Clicking:

```text
Orders
```

→ `/admin/orders`

Clicking:

```text
Inventory
```

→ `/admin/inventory`

Each route must remain behind admin protection.

Do not only protect `/admin` while leaving:

```text
/admin/products
/admin/orders
```

publicly accessible.

---

# 27. ACTIVE NAVIGATION

The current route should visibly indicate the active navigation item.

For example:

```text
Dashboard     ← active
Products
Categories
Orders
Inventory
```

Use the Sainik Mart primary color for active navigation.

Keep inactive items visually quieter.

---

# 28. ACCESSIBILITY

Use semantic HTML where applicable.

Ensure:

* buttons are keyboard accessible
* navigation links are keyboard accessible
* visible focus states exist
* sufficient color contrast
* meaningful labels
* no navigation item is only represented by an icon without accessible text
* logout is a real button/action

Do not sacrifice accessibility for visual styling.

---

# 29. ICONS

Inspect whether an icon library already exists.

If the project already uses:

```text
Lucide
React Icons
Material Icons
etc.
```

reuse it.

Do not add multiple icon libraries.

Use simple icons for:

```text
Dashboard
Products
Categories
Orders
Inventory
Logout
Menu
```

Icons should support the text, not replace it unnecessarily.

---

# 30. COMPONENT STRUCTURE

Follow the project's existing structure.

Conceptually, reusable components could include:

```text
AdminLayout
AdminSidebar
AdminHeader
AdminNavItem
ProtectedAdminRoute
AdminPageHeader
DashboardCard
```

Only create components that provide meaningful reuse.

Do not create dozens of tiny components unnecessarily.

---

# 31. RECOMMENDED STRUCTURE

Adapt this to the actual project structure.

Example:

```text
src/
├── components/
│   └── admin/
│       ├── AdminLayout
│       ├── AdminSidebar
│       ├── AdminHeader
│       └── AdminNavItem
│
├── pages/
│   └── admin/
│       ├── Dashboard
│       ├── Products
│       ├── Categories
│       ├── Orders
│       └── Inventory
│
├── auth/
│   └── ...
│
├── api/
│   └── ...
│
└── ...
```

This is only a conceptual structure.

Use the project's actual conventions.

If using Next.js App Router, follow the existing `app/` architecture instead.

---

# 32. SECURITY PRINCIPLE

Remember:

```text
Frontend protection
≠
Backend authorization
```

The frontend should protect the user experience.

The backend protects the actual data.

Every future admin API must remain protected by the backend's:

```text
authenticate
+
requireAdmin
```

pattern established on Day 24.

Do not remove backend authorization because the frontend has route protection.

---

# 33. DO NOT BUILD ADMIN CRUD TODAY

Do not implement:

```text
Create Product
Edit Product
Delete Product
Create Category
Edit Category
Delete Category
Update Order
Update Stock
```

Those belong to later days.

Day 25 only establishes:

```text
Admin UI
+
Navigation
+
Protected Routes
+
Dashboard Shell
```

---

# 34. DO NOT CREATE FAKE DATA

Do not create fake:

```text
orders
products
categories
revenue
customers
inventory
```

just to populate the dashboard.

If the dashboard needs content, use navigation cards or real data from an existing API.

No fake business metrics.

---

# 35. TESTING REQUIREMENTS

Test the following.

## Test 1 — Admin login

```text
Admin
 ↓
Login
 ↓
Dashboard
```

Expected:

```text
Dashboard loads successfully.
```

---

## Test 2 — Customer login

```text
Customer
 ↓
Login
 ↓
Attempt /admin
```

Expected:

```text
Access denied / redirect
```

---

## Test 3 — No authentication

Open:

```text
/admin
```

without a valid session.

Expected:

```text
Redirect to login
```

---

## Test 4 — Direct URL access

After logging in as admin:

```text
/admin/products
```

should load the protected Products shell.

---

## Test 5 — Direct customer access

A customer must not be able to access:

```text
/admin/products
/admin/categories
/admin/orders
/admin/inventory
```

---

## Test 6 — Logout

```text
Admin
 ↓
Logout
 ↓
Login
```

Then attempt:

```text
/admin
```

Expected:

```text
Redirect to login
```

---

## Test 7 — Refresh

While logged in:

```text
/admin
```

Refresh browser.

Expected:

```text
Session remains valid
```

if the existing authentication mechanism supports persistent sessions.

---

## Test 8 — Navigation

Verify:

```text
Dashboard → Dashboard
Products → Products
Categories → Categories
Orders → Orders
Inventory → Inventory
```

---

# 36. BACKEND VERIFICATION

Do not modify backend functionality unless required to integrate with the existing admin UI.

Verify that Day 24's backend authorization still works.

For example:

```text
Admin JWT
 ↓
GET protected admin endpoint
 ↓
Allowed
```

and:

```text
Customer JWT
 ↓
GET protected admin endpoint
 ↓
403
```

Do not weaken backend authorization just because frontend routing is now implemented.

---

# 37. BUILD AND LINT

Run the project's existing commands.

Inspect `package.json` first.

Likely commands may include:

```bash
npm run dev
npm run build
npm run lint
npm test
```

Do not assume all commands exist.

Run only the commands supported by the project.

Fix relevant errors caused by Day 25.

Do not start unrelated refactoring.

---

# 38. TYPESCRIPT

All new code must be properly typed.

Avoid:

```typescript
any
```

unless absolutely necessary.

Do not suppress TypeScript errors using:

```typescript
// @ts-ignore
```

without a strong reason.

Do not weaken the TypeScript configuration.

---

# 39. NO UNRELATED CHANGES

Do not modify:

* customer mobile application
* cart functionality
* address functionality
* order creation
* Razorpay
* FCM
* product backend APIs
* category backend APIs
* database schema

unless a genuine Day 25 integration issue requires it.

If something outside Day 25 appears broken, report it instead of silently refactoring it.

---

# 40. FINAL FILE REVIEW

Before completion:

Run:

```bash
git status
```

and:

```bash
git diff
```

Review all changed files.

Check for:

* accidental secrets
* `.env` changes
* debug statements
* console logs that should not remain
* temporary authentication bypasses
* fake credentials
* fake business data
* unused imports
* unused components
* dead code
* unrelated modifications

---

# 41. DAY 25 DEFINITION OF DONE

Day 25 is complete only when:

### Admin application

* [ ] Admin frontend project identified and reused.
* [ ] Admin login exists or existing login is reused.
* [ ] Admin authentication flow works.
* [ ] Admin dashboard shell exists.
* [ ] Sidebar/navigation exists.
* [ ] Dashboard page exists.
* [ ] Products page shell exists.
* [ ] Categories page shell exists.
* [ ] Orders page shell exists.
* [ ] Inventory page shell exists.

### Authorization

* [ ] Protected admin routes exist.
* [ ] Unauthenticated users cannot access admin pages.
* [ ] Customers cannot access admin pages.
* [ ] Admin users can access admin pages.
* [ ] Backend authorization from Day 24 remains active.
* [ ] No frontend-only security assumption.

### Navigation

* [ ] Dashboard navigation works.
* [ ] Products navigation works.
* [ ] Categories navigation works.
* [ ] Orders navigation works.
* [ ] Inventory navigation works.
* [ ] Active route is visually indicated.
* [ ] Logout works.

### UI

* [ ] Responsive desktop layout.
* [ ] Tablet/smaller viewport behavior works.
* [ ] Sainik Mart branding is used.
* [ ] Navigation is clean and readable.
* [ ] Loading state exists.
* [ ] Unauthorized state exists.
* [ ] Error handling exists.
* [ ] Accessibility basics are respected.

### Architecture

* [ ] Existing API client reused.
* [ ] Existing auth system reused.
* [ ] Existing routing system reused.
* [ ] Existing styling system reused where possible.
* [ ] No duplicate auth implementation.
* [ ] No unnecessary global state.
* [ ] No Redux/Zustand introduced unnecessarily.

### Scope

* [ ] No product CRUD implemented.
* [ ] No category CRUD implemented.
* [ ] No order management implemented.
* [ ] No inventory management implemented.
* [ ] No fake business metrics.
* [ ] No Razorpay changes.
* [ ] No FCM changes.
* [ ] No unrelated refactor.

### Quality

* [ ] TypeScript/build passes.
* [ ] Lint passes if configured.
* [ ] Tests pass where configured.
* [ ] Git diff reviewed.
* [ ] No secrets committed.
* [ ] No destructive database changes.

---

# 42. EXPECTED ADMIN FLOW AFTER DAY 25

At the end of Day 25, the application should conceptually work like this:

```text
                    ┌─────────────────┐
                    │   Admin Login   │
                    └────────┬────────┘
                             │
                             ▼
                    Existing Auth API
                             │
                             ▼
                    Authentication OK
                             │
                    ┌────────┴────────┐
                    │                 │
                CUSTOMER           ADMIN
                    │                 │
                    ▼                 ▼
              Access Denied      Admin Layout
                                      │
                         ┌────────────┼────────────┐
                         │            │            │
                         ▼            ▼            ▼
                     Dashboard    Products    Categories
                                      │
                         ┌────────────┴────────────┐
                         │                         │
                         ▼                         ▼
                      Orders                   Inventory
```

---

# 43. FUTURE DAY PREVIEW

Do NOT implement these today, but the shell should be ready for them.

Future admin functionality:

```text
Day 26
Product + Category CRUD + Inventory

Day 27
Admin Order Management

Day 28
Admin End-to-End Testing
```

Therefore, Day 25 should create a clean foundation that future pages can plug into without restructuring the entire admin application.

---

# 44. CURSOR EXECUTION INSTRUCTIONS

Implement Day 25 in the following order:

```text
1. Inspect repository
2. Identify admin frontend
3. Inspect authentication
4. Inspect routing
5. Inspect API client
6. Inspect Day 24 authorization
7. Build/reuse admin auth flow
8. Build protected admin layout
9. Build sidebar/navigation
10. Build dashboard page
11. Build Products shell
12. Build Categories shell
13. Build Orders shell
14. Build Inventory shell
15. Implement logout
16. Implement loading/error/unauthorized states
17. Make layout responsive
18. Test navigation
19. Test admin/customer access
20. Test logout
21. Run build/lint/tests
22. Review git diff
```

Do not skip the inspection phase.

Do not rewrite existing working infrastructure.

Prefer the smallest clean implementation consistent with the current codebase.

---

# 45. FINAL REPORT

At the end, provide a concise report with:

1. Admin frontend structure discovered
2. Authentication architecture reused
3. Protected route implementation
4. Admin layout implementation
5. Navigation routes created
6. Components created
7. Pages created
8. Logout implementation
9. Responsive behavior
10. Tests performed
11. Build/lint/test results
12. Files changed
13. Any remaining issues
14. Confirmation that no fake business data was introduced
15. Confirmation that no destructive DB changes were made

Finally, output exactly one of:

```text
DAY 25 COMPLETE — SAFE TO MOVE TO DAY 26
```

or:

```text
DAY 25 NOT COMPLETE — FIX THE FOLLOWING FIRST
```

If incomplete, list the exact blockers immediately below the status.
