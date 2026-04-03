# Design System Strategy: The Encrypted Ledger

## 1. Overview & Creative North Star
**The Creative North Star: "The Obsidian Sanctum"**

This design system is engineered to feel like a high-performance, private terminal—a "Big Tech" aesthetic reimagined for the sovereign individual. It departs from the friendly, rounded "SaaS" look in favor of a sophisticated, developer-centric atmosphere. We prioritize visual silence, punctuated by high-voltage neon accents that signal security and activity. 

Through intentional asymmetry and the use of large-scale, high-contrast typography, we create an editorial feel that suggests every note is a high-value asset. The interface doesn't just hold data; it protects it behind layers of translucent "glass" and deep obsidian surfaces.

---

## 2. Colors & Surface Philosophy

The color palette is anchored in a true-dark spectrum, utilizing neon lime for functional "energy" and indigo for "depth."

### The "No-Line" Rule
Standard UI relies on lines to separate content; this design system prohibits them. **1px solid borders are strictly forbidden for sectioning.** Structure must be defined through:
*   **Tonal Transitions:** A `surface-container-low` card sitting atop a `background` base.
*   **Negative Space:** Using generous, intentional gaps to define grouped content.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of glass. 
*   **Level 0 (Background):** `#0e0e0e` – The infinite canvas.
*   **Level 1 (Sections):** `surface-container-low` (`#131313`) – For broad content grouping.
*   **Level 2 (Cards):** `surface-container` (`#1a1919`) – The primary interactive container.
*   **Level 3 (Pop-overs/Modals):** `surface-container-highest` (`#262626`) – Elements that demand immediate focus.

### The "Glass & Gradient" Rule
Floating elements (like navigation bars or context menus) must utilize **Glassmorphism**. Apply `surface-container` with a 70% opacity and a `backdrop-filter: blur(20px)`. 
*   **Signature Textures:** For high-impact areas (like "Create Note"), use a subtle linear gradient from `primary` (#b8fd4b) to `primary-container` (#83c300) at a 135-degree angle to add a metallic, premium "soul" to the action.

---

## 3. Typography: Editorial Authority

We use **Inter** for functional clarity and **Space Grotesk** for technical labeling to create a "hacker-chic" editorial vibe.

*   **Display-LG (3.5rem):** Used sparingly for dashboard headers to create a sense of arrival.
*   **Headline-SM (1.5rem):** Primary note titles. High contrast against the dark background.
*   **Body-MD (0.875rem):** The workhorse for note content; use a slightly reduced opacity (80%) on `on-surface` for long-form reading comfort.
*   **Label-MD (Space Grotesk, 0.75rem):** Used for metadata, encryption statuses, and timestamps. This monospaced-adjacent feel reinforces the "developer-focused" intent.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved via **Tonal Layering**. To "lift" a component, move it up the `surface-container` scale. A card shouldn't have a border; it should simply be two shades lighter than the floor it sits on.

### Ambient Shadows
Shadows are rarely used, but when necessary for "floating" states (e.g., a dragged note), use an **Ambient Shadow**:
*   **Shadow Color:** Hex `#000000` at 40% opacity.
*   **Blur:** 40px–60px for an extra-diffused, natural glow that mimics light hitting a matte surface.

### The "Ghost Border" Fallback
In high-density views where tonal shifts aren't enough, use a **Ghost Border**: `outline-variant` (#494847) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Primary Action (Button)
*   **Style:** `primary` (#b8fd4b) fill with `on-primary` (#3d5e00) text.
*   **Shape:** `rounded-full` (pill) to contrast against the sharp grid.
*   **Interaction:** On hover, apply a soft outer glow using the `surface-tint` color at 20% opacity.

### Note Cards
*   **Style:** No borders. Background: `surface-container-low`.
*   **Content:** Avoid dividers. Use a `1.5rem` vertical gap between the title and the "View contents" label.
*   **Status Indicators:** Use `secondary` (Indigo) for "Encrypted" chips and `primary` (Lime) for "Available/Live" states.

### Input Fields
*   **Style:** `surface-container-lowest` (pure black) background. 
*   **Border:** A 1px "Ghost Border" that transitions to a `primary` 1px border only on `:focus`.
*   **Text:** `body-md` for user input, `label-sm` (Space Grotesk) for the field name floating above.

### Context Menus (Glassmorphism)
*   **Style:** `surface-container-highest` at 80% opacity with `backdrop-filter: blur(12px)`.
*   **Radius:** `xl` (0.75rem) to signify a "detached" floating element.

---

## 6. Do's and Don'ts

### Do
*   **DO** use "Space Grotesk" for all technical data (ID numbers, dates, hash keys).
*   **DO** allow the deep background (#0e0e0e) to dominate the screen; whitespace (or "blackspace") is a luxury.
*   **DO** use the `primary` lime-green as a "laser pointer"—only for the most important actions.

### Don't
*   **DON'T** use 100% opaque borders. They break the illusion of depth and look "cheap."
*   **DON'T** use standard blue for links. Use `secondary` (#9492ff) or `primary`.
*   **DON'T** stack more than three levels of containers. It creates visual "mush." If you need more depth, use a backdrop blur.
*   **DON'T** use pure white (#ffffff) for large blocks of body text; it causes "halation" (glow) on dark backgrounds. Use `on-surface-variant` (#adaaaa) for secondary text.