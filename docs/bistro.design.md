# Sainik Mart Mobile App Design System (iOS & Android)

This document defines the cross-platform design specifications for **Sainik Mart**, implemented in this repo with **React Native + Expo**. Layout follows a Blinkit-style grocery app (dark hero, search pill, ADD chips). Color, logo, and copy follow the official circular Sainik Mart mark (forest green, gold, orange).

---

## 1. Design Tokens (YAML Format)

```yaml
system:
  name: Sainik Mart Design System
  platforms: ["ios", "android", "expo"]
  version: "1.2.0"

brand_colors:
  primary: "#145C38"        # Forest green (buttons, tabs)
  primary_dark: "#0C3F24"   # Logo fill / hero / splash
  primary_light: "#1F6B45"  # Highlights
  gold: "#C6A34E"           # Tagline, thin accents
  accent: "#E85A20"         # Logo S / cart orange (ADD, hero CTA)
  background: "#F6F4EF"     # Warm cream page
  surface: "#FFFFFF"        # Cards
  text_primary: "#1A241C"   # Near-black
  text_secondary: "#6B6560" # Warm muted
  primary_text: "#FFFFFF"   # Text on green / orange
  danger: "#B91C1C"

typography:
  font_family_ios: "System"
  font_family_android: "sans-serif"
  scale:
    display: 32
    heading: 24
    subheading: 18
    body: 14
    caption: 12

layout:
  grid_columns: 4
  margin_mobile: 16
  gutter_mobile: 12
  border_radius_card: 12
  border_radius_button: 24
  min_tap_ios: 44
  min_tap_android: 48
```

---

## 2. Core UI Components

### Logo
Circular official mark (`assets/images/logo.png`), clipped to a circle. Used on login, register, home hero, profile, splash, and app icons. Tab bar stays as system icons.

### Home hero
Dark forest block (`primary_dark`) with the circular logo, gold tagline (“Har zaroorat, ek jagah”), white title (“Welcome to Sainik Mart”), short grocery subtitle, a **white search pill**, and an orange search CTA.

### Navigation / tab bar
Active tab uses `primary` (`#145C38`). Inactive uses `text_secondary`. Cream page background (`#F6F4EF`).

### Menu item card
Square food image (1:1), product name, price in `accent`, and an orange **ADD** chip. Light shadow (`radius 8, y 4`).

### Buttons
Pill radius 24, fill `primary`, label white. Min height 48. Ghost outline for secondary auth actions. Accent fill for the home search CTA.

---

## 3. Platform notes (Expo)

| Element | iOS | Android |
| :--- | :--- | :--- |
| **Typography** | San Francisco (system) | Roboto / sans-serif |
| **Status bar** | Light content on green hero | Light icons on `primary_dark` |
| **Tap targets** | Minimum 44pt | Minimum 48dp |
| **Splash** | Forest `#0C3F24` + circular logo | Same |

---

## 4. Key workflows

* **Loading:** circular logo on forest splash (auth bootstrap); spinner elsewhere on cream.
* **Empty cart:** centered `text_secondary` copy and a primary **Continue Shopping** CTA.
* **Add to cart:** Product Details posts to the cart API; product cards show an ADD affordance into the same flow.
