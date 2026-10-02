# DESIGN.md — Zalopay

> Extracted from [zalopay.vn](https://zalopay.vn/) (`Zalopay - Ứng dụng thanh toán tích thưởng`). Vietnam's flagship e-wallet from VNG Corp — a consumer fintech super-app design system built on top of Bootstrap with a custom token layer that extends every Bootstrap color into a full 9-step ramp (25→900). The visual identity centers on **ZaloPay Blue `#0068ff`** with a bright payment-confirm green (`#03ca77`) and accent red/orange for promotions.

---

## Design Tokens

### Color — Brand Primaries

| Token       | Hex       | Usage                                       |
| ----------- | --------- | ------------------------------------------- |
| `primary`   | `#007bff` | Bootstrap primary (action surfaces)         |
| `blue`      | `#0068ff` | **ZaloPay brand blue** — signature voltage  |
| `blue-alt`  | `#0768ff` | Variant brand blue                          |
| `green`     | `#03ca77` | **ZaloPay payment-confirm green**           |
| `green-alt` | `#00de6a` | Bright success green                        |
| `red`       | `#e31748` | **ZaloPay brand red** — promotions          |
| `orange`    | `#faa828` | **ZaloPay accent orange**                   |
| `indigo`    | `#6356e4` | ZaloPay indigo accent                       |
| `teal`      | `#55b3f3` | ZaloPay teal (sky blue)                     |
| `dark`      | `#001f3e` | **ZaloPay deep-navy text/anchor**           |

### Color — Blue (Signature Ramp)

| Token       | Hex       | Usage                                  |
| ----------- | --------- | -------------------------------------- |
| `blue-25`   | `#f2f7ff` | Faintest blue tint background          |
| `blue-50`   | `#e6f0ff` | Light blue surface                     |
| `blue-100`  | `#cce1ff` | Pale blue                              |
| `blue-200`  | `#99c3ff` | Soft blue                              |
| `blue-300`  | `#66a4ff` | Mid blue                               |
| `blue-400`  | `#3386ff` | Bright blue                            |
| `blue-500`  | `#0068ff` | **Brand blue (base)**                  |
| `blue-600`  | `#0053cc` | Hover blue                             |
| `blue-700`  | `#003e99` | Pressed blue                           |
| `blue-800`  | `#002a66` | Deep blue                              |
| `blue-900`  | `#001533` | Deepest blue                           |

### Color — Green (Success / Payment)

| Token       | Hex       | Usage                            |
| ----------- | --------- | -------------------------------- |
| `green-25`  | `#f2fcf8` | Faintest mint background         |
| `green-50`  | `#e6faf1` | Light mint                       |
| `green-100` | `#cdf4e4` | Pale mint                        |
| `green-200` | `#9aeac9` | Soft mint                        |
| `green-300` | `#68dfad` | Mid mint                         |
| `green-400` | `#35d592` | Bright mint                      |
| `green-500` | `#03ca77` | **Brand green** (payment OK)     |
| `green-600` | `#02a25f` | Hover green                      |
| `green-700` | `#027947` | Pressed                          |
| `green-800` | `#015130` | Deep green                       |
| `green-900` | `#012818` | Deepest green                    |

### Color — Red (Promotion / Alert)

| Token       | Hex       | Usage                            |
| ----------- | --------- | -------------------------------- |
| `red-25`    | `#fef3f5` | Faintest blush background        |
| `red-50`    | `#fce8ec` | Light blush                      |
| `red-100`   | `#f9d1d8` | Pale red                         |
| `red-200`   | `#f4a2b1` | Soft pink-red                    |
| `red-300`   | `#ee748a` | Mid coral                        |
| `red-400`   | `#e94563` | Bright coral-red                 |
| `red-500`   | `#e31748` | **Brand red**                    |
| `red-600`   | `#b61230` | Hover red                        |
| `red-700`   | `#880e24` | Pressed                          |
| `red-800`   | `#5b0918` | Deep                             |
| `red-900`   | `#2d050c` | Deepest                          |

### Color — Orange (Accent / Loyalty)

| Token        | Hex       | Usage                              |
| ------------ | --------- | ---------------------------------- |
| `orange-25`  | `#fffbf4` | Faintest peach                     |
| `orange-50`  | `#fff6ea` | Light peach                        |
| `orange-100` | `#feeed4` | Pale orange                        |
| `orange-200` | `#fddca9` | Soft orange                        |
| `orange-300` | `#fccb7e` | Mid amber                          |
| `orange-400` | `#fbb953` | Bright amber                       |
| `orange-500` | `#faa828` | **Brand orange (loyalty/points)**  |
| `orange-600` | `#c88620` | Hover                              |
| `orange-700` | `#966518` | Pressed                            |
| `orange-800` | `#644310` | Deep                               |
| `orange-900` | `#322208` | Deepest                            |

### Color — Teal (Secondary)

| Token       | Hex       |
| ----------- | --------- |
| `teal-25`   | `#f7fbfe` |
| `teal-50`   | `#eef7fe` |
| `teal-100`  | `#ddf0fd` |
| `teal-200`  | `#bbe1fa` |
| `teal-300`  | `#99d1f8` |
| `teal-400`  | `#77c2f5` |
| `teal-500`  | `#55b3f3` |
| `teal-600`  | `#448fc2` |
| `teal-700`  | `#336b92` |
| `teal-800`  | `#224861` |
| `teal-900`  | `#112431` |

### Color — Indigo (Tertiary Accent)

| Token         | Hex       |
| ------------- | --------- |
| `indigo-25`   | `#f7f7fe` |
| `indigo-50`   | `#efeefc` |
| `indigo-100`  | `#e0ddfa` |
| `indigo-200`  | `#c1bbf4` |
| `indigo-300`  | `#a19aef` |
| `indigo-400`  | `#8278e9` |
| `indigo-500`  | `#6356e4` |
| `indigo-600`  | `#4f45b6` |
| `indigo-700`  | `#3b3489` |
| `indigo-800`  | `#28225b` |
| `indigo-900`  | `#14112e` |

### Color — Neutrals (Cool Blue-Gray)

| Token       | Hex       | Usage                            |
| ----------- | --------- | -------------------------------- |
| `white`     | `#ffffff` | Canvas, cards                    |
| `gray-25`   | `#f2f4f5` | Subtle surface                   |
| `gray-50`   | `#e6e9ec` | Dividers, hairlines              |
| `gray-100`  | `#ccd2d8` | Borders                          |
| `gray-200`  | `#99a5b2` | Disabled text                    |
| `gray-300`  | `#66798b` | Secondary text                   |
| `gray-400`  | `#334c65` | Strong body text                 |
| `gray`      | `#6c757d` | Bootstrap secondary              |
| `gray-dark` | `#343a40` | Bootstrap dark                   |
| `dark`      | `#001f3e` | **ZaloPay deep-navy**            |
| `dark-600`  | `#001932` | Stronger navy                    |
| `dark-700`  | `#001325` | Premium navy                     |
| `dark-800`  | `#000c19` | Deepest navy                     |
| `dark-900`  | `#00060c` | Near-black                       |

The grayscale leans **cool/blue** rather than warm — `gray-400` is `#334c65`, a deep slate-blue. This subtle tint keeps everything visually anchored to the brand blue.

### Color — Semantic (Bootstrap-compatible)

```css
--primary:   #007bff;
--success:   #28a745;     /* Bootstrap green */
--danger:    #dc3545;     /* Bootstrap red */
--warning:   #ffc107;     /* Bootstrap yellow */
--info:      #17a2b8;     /* Bootstrap cyan */
--light:     #f8f9fa;
--secondary: #6c757d;
--cyan:      #17a2b8;
--pink:      #e83e8c;
--purple:    #6f42c1;
--yellow:    #ffc107;
```

The site keeps Bootstrap's default semantic colors alongside the brand palette — promotional surfaces use brand red/green/orange; system surfaces (alerts, validation) use Bootstrap defaults.

---

## Typography

### Font Families

```css
--font-family-sans-serif:
  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
  Arial, "Noto Sans", "Liberation Sans", sans-serif,
  "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

--font-family-monospace:
  SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
  "Courier New", monospace;

/* Brand display: */
font-family: "SF Pro", "Helvetica Neue", sans-serif;

/* Vietnamese-safe fallback (legacy areas): */
font-family: Helvetica, Arial, Tahoma, Verdana, sans-serif;
```

Zalopay uses a **system-font-first** stack for performance (the app is content-heavy and accessed often on mid-range Android in Vietnam), with `SF Pro` as the preferred display face on iOS and the system-UI fallback chain everywhere else.

### Type Scale (Bootstrap-aligned)

| Class / Level | Size (rem) | Px      | Weight | Usage                          |
| ------------- | ---------- | ------- | ------ | ------------------------------ |
| `h1` / `.h1`  | `2.5rem`   | 40px    | 500    | Hero / page title              |
| `h2` / `.h2`  | `2rem`     | 32px    | 500    | Section heading                |
| `h3` / `.h3`  | `1.75rem`  | 28px    | 500    | Sub-section                    |
| `h4` / `.h4`  | `1.5rem`   | 24px    | 500    | Card title                     |
| `h5` / `.h5`  | `1.25rem`  | 20px    | 500    | Smaller heading                |
| `h6` / `.h6`  | `1rem`     | 16px    | 500    | Eyebrow / micro heading        |
| `lead`        | `1.25rem`  | 20px    | 300    | Hero lead paragraph            |
| `body`        | `1rem`     | 16px    | 400    | Default body                   |
| `small`       | `0.875rem` | 14px    | 400    | Caption                        |
| `display-1`   | `6rem`     | 96px    | 300    | Huge marketing display         |
| `display-2`   | `5.5rem`   | 88px    | 300    | Large display                  |
| `display-3`   | `4.5rem`   | 72px    | 300    | Medium display                 |
| `display-4`   | `3.5rem`   | 56px    | 300    | Small display                  |

### Font Weights

| Value | Usage                      |
| ----- | -------------------------- |
| `300` | Light display copy         |
| `400` | Body, default              |
| `500` | Section headings           |
| `600` | Emphasis, button labels    |
| `700` | Bold display / hero        |

### Vietnamese Text Handling

Because Zalopay serves Vietnamese content extensively, the font stack includes `Noto Sans` and `Liberation Sans` for full Vietnamese-diacritic support, and the body line-height stays slightly looser than English-only sites to accommodate stacked diacritics.

---

## Layout

### Breakpoints (Bootstrap)

```css
--breakpoint-xs: 0;
--breakpoint-sm: 576px;
--breakpoint-md: 768px;
--breakpoint-lg: 992px;
--breakpoint-xl: 1200px;
```

| Breakpoint | Min width | Container max |
| ---------- | --------- | ------------- |
| `xs`       | 0         | 100%          |
| `sm`       | 576px     | 540px         |
| `md`       | 768px     | 720px         |
| `lg`       | 992px     | 960px         |
| `xl`       | 1200px    | 1140px        |

### Grid System

12-column Bootstrap flexbox grid:

```css
.container        { max-width: var(--container-max); margin: 0 auto; }
.row              { display: flex; flex-wrap: wrap; margin: 0 -15px; }
.col, .col-md-6   { padding: 0 15px; flex: 1 0 0%; }
```

### Body Defaults

```css
body {
  background-color: #ffffff;
  color:            #001f3e;        /* --dark — ZaloPay deep navy */
  font-family:      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...;
  font-size:        1rem;
  line-height:      1.5;
  text-align:       left;
}
```

---

## Components

### Navigation

```css
background-color: #ffffff;
color:            #001f3e;             /* --dark */
position:         sticky;
top:              0;
height:           ~64–72px;
border-bottom:    1px solid #e6e9ec;   /* --gray-50 */
```

- ZaloPay logo (blue glyph + dark wordmark) left-aligned
- Center nav links in dark navy, Bootstrap default sizing
- Right rail: language toggle (VI/EN) + "Tải ứng dụng" (Download app) blue CTA

### Buttons

#### Primary — ZaloPay Blue

```css
background-color: #0068ff;             /* --blue */
color:            #ffffff;
border:           1px solid #0068ff;
border-radius:    0.25rem;             /* 4px */
padding:          0.375rem 0.75rem;
font-family:      inherit;
font-weight:      400;
font-size:        1rem;
line-height:      1.5;
transition:       all 0.15s ease-in-out;

/* Hover */
background-color: #0053cc;             /* --blue-600 */
border-color:     #003e99;             /* --blue-700 */

/* Focus */
box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);
```

#### Pill CTA (Marketing)

```css
background-color: #0068ff;
color:            #ffffff;
border-radius:    100px;
padding:          12px 32px;
font-weight:      600;
font-size:        1rem;
```

#### Success — ZaloPay Green

```css
background-color: #03ca77;
color:            #ffffff;
border-radius:    0.25rem;
padding:          0.375rem 0.75rem;
```

#### Outlined / Ghost

```css
background-color: transparent;
color:            #0068ff;
border:           1px solid #0068ff;
border-radius:    0.25rem;
padding:          0.375rem 0.75rem;
```

#### Button States (Bootstrap-compatible focus ring)

```css
:focus { box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); }
:disabled { opacity: 0.65; }
```

### Cards

```css
background-color: #ffffff;
border:           1px solid #e6e9ec;       /* --gray-50 */
border-radius:    0.25rem;
padding:          1.25rem;
box-shadow:       0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);

/* Hover lift */
box-shadow:       0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
```

### Promotion Cards (Brand Red / Orange)

```css
background:    linear-gradient(135deg, #e31748 0%, #b61230 100%);
color:         #ffffff;
border-radius: 10px;
padding:       16px;
```

### Footer

```css
background-color: #001f3e;             /* --dark — deep navy */
color:            #ffffff;
padding:          48px 0 24px;
```

- Multi-column link groups (Products, Company, Support, Legal)
- Social icons + app store badges
- Vietnamese-language copyright notice with VNG Corp attribution

### Form Inputs

```css
background-color: #ffffff;
color:            #001f3e;
border:           1px solid #ccd2d8;       /* --gray-100 */
border-radius:    0.25rem;
padding:          0.375rem 0.75rem;
font-size:        1rem;
line-height:      1.5;
transition:       border-color 0.15s ease-in-out,
                  box-shadow   0.15s ease-in-out;

/* Focus */
border-color: #80bdff;
box-shadow:   0 0 0 0.2rem rgba(0, 123, 255, 0.25);

/* Invalid */
border-color: #dc3545;
box-shadow:   0 0 0 0.2rem rgba(220, 53, 69, 0.25);
```

### Carousel / Swiper Components

The site uses Swiper.js for promo carousels with these tokens:

```css
--swiper-theme-color:       #007aff;
--swiper-navigation-color:  #fff;
--swiper-pagination-color:  #fff;
--swiper-preloader-color:   #fff;
--swiper-navigation-size:   44px;
```

### Alerts

```css
/* Bootstrap alert pattern with brand colors */
.alert-primary { background: #cce1ff; color: #002a66; border: 1px solid #99c3ff; }
.alert-success { background: #cdf4e4; color: #015130; border: 1px solid #9aeac9; }
.alert-danger  { background: #f9d1d8; color: #5b0918; border: 1px solid #f4a2b1; }
.alert-warning { background: #feeed4; color: #644310; border: 1px solid #fddca9; }
```

---

## Borders & Radii

| Value          | Usage                                  |
| -------------- | -------------------------------------- |
| `0`            | Sharp UI                               |
| `0.2rem` (3.2px) | Small chips                          |
| `0.25rem` (4px)  | **Default buttons, inputs, cards**   |
| `0.3rem` (4.8px) | Slightly larger UI                   |
| `0.5rem` (8px)   | Medium cards                         |
| `10px`           | Promotional cards                    |
| `10rem` (160px)  | Pill / oval                          |
| `100px`          | Pill button (marketing CTAs)         |
| `50%`            | Avatars, circular icons              |

---

## Shadows

```css
/* Bootstrap default tier */
--shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);    /* small */
--shadow:    0 0.5rem 1rem    rgba(0, 0, 0, 0.15);       /* default */
--shadow-lg: 0 1rem    3rem   rgba(0, 0, 0, 0.175);      /* large */

/* Lift on hover */
box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);

/* Brand-tinted shadow */
box-shadow: 0 -2px 4px 0 rgba(0, 31, 62, 0.08);          /* uses --dark RGB */

/* Focus ring (semantic) */
box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);        /* primary */
box-shadow: 0 0 0 0.2rem rgba(220,  53,  69, 0.25);      /* danger */
box-shadow: 0 0 0 0.2rem rgba( 23, 162, 184, 0.5);       /* info */
```

---

## Iconography

- **Style**: Custom flat-color illustrated icons for product features (transfer, bill pay, QR scan, savings, insurance, lifestyle services)
- **App-feature icons**: Multi-color flat illustrations with subtle gradients — distinctly Vietnamese consumer-app aesthetic
- **UI icons**: Monoline 20–24px inheriting `currentColor`
- **Logo**: ZaloPay wordmark with the signature lightning-bolt blue glyph
- **Partner brand grid**: Customer / merchant logo collage with auto-scrolling marquee

---

## Imagery & Media

- **Hero**: Phone mockup of the ZaloPay app + lifestyle photography (Vietnamese consumers using the app)
- **Promotional banners**: Bold red `#e31748` gradient cards with white CTAs (Tết / lunar new year, voucher campaigns)
- **App screenshots**: Product surface UIs rendered on Android + iPhone frames
- **Partner logos**: Bank, telecom, and merchant logos in flat grayscale on light tint sections

---

## Motion

```css
--animate-duration: 1s;
--animate-delay:    1s;
--animate-repeat:   1;
```

The site uses [Animate.css](https://animate.style) tokens for scroll-triggered reveals (fade-in-up on feature cards, fade-in for hero copy). Bootstrap transitions handle hover and focus state changes at `0.15s ease-in-out`.

---

## Visual Tone

**Trustworthy. Vibrant. Vietnamese-consumer.**

Zalopay's design language balances financial-grade trust with the colorful, promo-heavy energy of a Vietnamese super-app:

1. **ZaloPay Blue is the anchor.** `#0068ff` shows up on the logo, primary CTAs, links, and focus rings — every interaction returns to this single brand voltage.
2. **Deep navy text** (`#001f3e`) instead of pure black creates a calmer, more institutional feel — appropriate for a payments brand.
3. **Bright payment green** (`#03ca77`) is reserved for success states and money-in moments — never for marketing surfaces.
4. **Promotional red & orange** (`#e31748`, `#faa828`) light up campaign banners — Tết vouchers, cashback promos, loyalty points. These get their own ramps so the design system can scale promotional intensity.
5. **Bootstrap as the substrate.** The site is built on Bootstrap's grid, utility classes, and form patterns — a pragmatic choice for a content-rich product page that needs to ship fast across many promotional landing pages.
6. **Custom 9-step ramps** (25→900) layered over Bootstrap's single-shade colors — this is the team's bespoke extension that lets product surfaces (cards, alerts, badges) sit in subtle tints without breaking brand consistency.
7. **System fonts** keep the page fast for Vietnamese mobile users on lower-end devices, while `SF Pro` lifts iOS rendering.
8. **Cool blue-grays** (rather than warm grays) keep neutrals in conversation with the brand blue — even a "neutral" border quietly references the brand.

The result is a fintech homepage that signals "trust me with your money" through restrained blue+navy gravitas, while leaving plenty of room for bright promotional cards to do the heavy lifting on customer-acquisition campaigns — exactly the right balance for Vietnam's most-used e-wallet.
