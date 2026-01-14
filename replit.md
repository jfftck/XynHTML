# XynHTML

## Overview

XynHTML is a lightweight, reactive JavaScript library for building web applications using a declarative syntax. It features a signal-based reactivity system for automatic UI updates, declarative component creation with tagged template literals, and a minimal API. Designed for simplicity and performance, XynHTML operates directly in browsers using ES modules, requiring no build tooling. Its core purpose is to offer an efficient, easy-to-use alternative for reactive web development, focusing on signal-based state management, declarative UI, and zero build-step operation.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**January 14, 2026 - v1.4.0 - Timing Functions**
- Added tests for `timing()` function (7 new tests, 50 total passing)
- Added Example 23: Timing Functions demonstrating:
  - debounce, throttle, delay with `watch().effect()` for side effects
  - debounce, throttle, delay with `watch().derived()` using wrappingFn argument
  - Each example uses firstName/lastName pattern to show timing behavior
  - Summary shows syntax for both effect and derived patterns

**January 14, 2026 - v1.3.0 - Watch Function**
- Added `watch()` function to xyn_signal.js for observing multiple signals
- Created comprehensive test suite for watch function (8 new tests)
- Added Example 22: Watch Multiple Signals demonstrating:
  - Basic watch with effect for single signal observation
  - Chaining `.watch()` to observe multiple signals
  - Creating derived signals from multiple sources with `.derived()`
  - Proper cleanup with unsubscribe functions

**January 12, 2026 - v1.2.0 - Right Sidebar Navigation**
- Converted top horizontal navigation to a right-aligned sticky sidebar
- Added toggle button with hamburger-to-arrow icon transformation animation
- Implemented responsive behavior:
  - Auto-opens on wide screens (>900px)
  - Auto-closes on narrow screens (<900px)
  - Smooth slide-in/out transitions
- Added XynSignal section to navigation with 4 examples

**January 10, 2026 - v1.1.0 - XynSignal Module Examples and Tests**
- Added new "XynSignal Features" section with four examples demonstrating the new createSignal API:
  - **signal-comparison.js**: Side-by-side comparison of legacy `signal()` vs new `createSignal()` 
  - **object-signal.js**: Object reactivity with direct property assignment and deletion
  - **array-signal.js**: Array reactivity with push/pop/shift/unshift/splice method interception
  - **collection-signal.js**: Map and Set signal reactivity demonstrations
- Created comprehensive test suite in `src/__tests__/xyn_signal.test.js`:
  - Primitive signal tests (value access, updates, subscriber notifications, unsubscribe)
  - Object signal tests (property assignment, deletion, change metadata)
  - Array signal tests (mutator method interception)
  - Map/Set signal tests (collection operations)
  - Regression test for `createSignal({}).value.a = 1` API pattern
- Fixed bugs in xyn_signal.js:
  - Changed `new Symbol()` to `Symbol()` (Symbol cannot be used as constructor)
  - Changed `VALUE_DELETE` to `CollectionValue.DELETE` (undefined variable reference)
- Updated replit.md with comprehensive XynSignal module documentation

## System Architecture

### Core Reactivity System

**Signal-Based State Management**
- Implements a pub-sub pattern where signals hold reactive values that notify subscribers on changes.
- Updates only trigger when values change (equality checks for performance).
- Supports direct subscription management with subscribe/unsubscribe methods.
- Effects system provides automatic cleanup and debouncing for side effects.

**Derived Values (Computed State)**
- Derived signals automatically recompute when dependencies change, supporting chained derivations.
- Includes cleanup mechanisms to prevent memory leaks.
- Implements lazy evaluation, recalculating only when accessed.

### Component Architecture

**DOM Element Creation**
- `XynTag` class and `tag` template literal function (`xyn`) provide declarative element creation.
- `text` function creates reactive text nodes.
- `XynSwitch` provides conditional rendering based on signal values.

**Template System**
- Uses tagged template literals for element creation with CSS selector-like syntax for attributes, classes, IDs, and event handlers.
- Supports reactive text interpolation and fragment support for efficient DOM updates.

**Mounting Strategy**
- `mountNext` function appends elements to containers.
- Components render directly to real DOM elements.

### Rendering Optimization

**Change Detection**
- Equality-based updates prevent unnecessary re-renders.
- Debounced effects batch rapid changes.
- Direct DOM manipulation avoids virtual DOM overhead.

**Subscription Management**
- Manual subscription cleanup and effect cleanup functions for explicit resource management.

### Routing System (Extra Module)

**Client-Side Routing**
- `XynRouter.create(signal, derived)` creates a router instance for client-side navigation.
- Supports path matching with parameter extraction and declarative route configuration.
- Offers `basicRouting` for simple switching and `exactRouting` for strict path matching.

**Route Matching**
- `pathMatcher(...path)` handles URL pattern matching and parameter extraction.

### Animation & Transition Tracking (Extra Module)

**State Management**
- `createAnimationState(signal)` and `createTransitionState(signal)` track native browser animation and transition lifecycles.
- Returns an object with a `state` signal and an `attachToElement` function to bind listeners to DOM elements.

### XynSignal Module (xyn_signal.js)

- Provides an enhanced `createSignal` function for reactive support across various data types (primitives, objects, arrays, Map, Set).
- All signal types offer a `.value` property and a `.subscribe(callback)` method that returns an unsubscribe function.
- Object and Array signals intercept mutations for fine-grained reactivity.
- Map/Set signals intercept their respective methods (`set`, `add`, `delete`, `clear`) for reactive updates.

**Watch Function**
- `watch(signal)` returns an object with chainable methods for observing multiple signals:
  - `.watch(signal)` - Chain additional signals to observe
  - `.effect(subscriber)` - Subscribe to all watched signals, returns unsubscribe function
  - `.derived(fn)` - Create a derived signal from all watched signals, returns `{signal, unsubscribe}`

**Timing Functions**
- `timing(delay)` returns an object with methods to wrap functions for timing control:
  - `.debounce(fn)` - Delays execution until inactivity period passes; only last call executes
  - `.throttle(fn)` - Executes immediately, then limits to once per delay period
  - `.delay(fn)` - Each call executes after the fixed delay

### Extension Architecture

**Extra Features Module (xyn_html_extra.js)**
- Separates optional features (routing, animation, transition tracking) from the core library.
- Uses dependency injection, requiring `signal` and `derived` functions as parameters, to maintain a lightweight core.

### CSS Integration

**Styling Approach**
- Utilizes CSS custom properties for themeable components and class-based styling.
- Supports reactive class management and inline styles.
- Theme switching is managed via global signals (e.g., light/dark mode).

## External Dependencies

### Browser APIs
- **DOM API**: For core element manipulation and event handling.
- **ES Modules**: Native module system for direct browser execution.
- **History API**: Utilized by `XynRouter` for client-side navigation.
- **Animation/Transition Events**: Native browser events for state tracking.

### Third-Party Libraries (Examples/Documentation Only)
- **Highlight.js**: For syntax highlighting in code examples.
- **Theme Toggles**: UI component for theme switching demonstrations.
- **@oddbird/css-anchor-positioning**: Polyfill for CSS Anchor Positioning API.