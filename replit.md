# XynHTML

## Overview

XynHTML is a lightweight, reactive JavaScript library for building web applications using a declarative syntax. The library provides a signal-based reactivity system inspired by modern frameworks like React and Vue, but focuses on simplicity, performance, and zero build-step operation. It runs directly in browsers using ES modules.

The core philosophy centers on:
- **Reactive signals** for state management with automatic UI updates
- **Declarative component creation** using tagged template literals
- **Minimal API surface** to reduce learning curve
- **Performance optimization** through efficient change detection and subscription management
- **No build tooling required** - works directly in browsers

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**November 12, 2025 - v1.0.3 - Navigation Enhancement**
- Added enhanced sticky navigation bar with nested sub-sections:
  - **Dynamic data extraction** from loaded examples (no hard-coded structure)
  - **Sticky positioning** at top: 60px below theme selector
  - **Blurred glass effect** matching theme selector styling with backdrop-filter
  - **Side-by-side main sections** (Core Features and Extra Features) centered horizontally
  - **Vertical sub-sections** stacking below active/hovered main section
  - **Hover-based expansion** showing sub-sections on hover with 200ms delay
  - **Dual-signal scroll tracking** for main sections and individual examples
  - **Previous section highlighting** when sections scroll out of view
  - **Theme-aware styling** for both light and dark modes
- Navigation demonstrates advanced XynHTML reactive patterns:
  - Three-signal architecture (activeMainSection, activeSubSection, hoveredMainSection)
  - Derived signal (visibleMainSection) combining hover and scroll state
  - Multiple effects for synchronized UI updates
  - Tag-based DOM creation with XynHTML primitives
  - Dual IntersectionObserver setup for main and sub-section tracking
  - lastSeenSubSection tracking for scroll-out-of-view behavior
  - Proper cleanup function for observer memory management

**November 10, 2025 - v1.0.2 - API Refactoring**
- **Breaking Changes** to xyn_html_extra.js API for better dependency injection:
  - **createAnimationState()** and **createTransitionState()** now take `signal` function as first parameter and return `{state, attachToElement}` object instead of signal directly
  - **XynRouter.create()** now requires `signal` and `derived` functions as parameters: `XynRouter.create(signal, derived)`
  - **Removed** global `setSignal()` and `setDerived()` functions in favor of explicit dependency injection
- Updated all four xyn_html_extra.js examples to match new API:
  - animation-tracking.js, transition-tracking.js, basic-routing.js, advanced-routing.js

**October 28, 2025 - v1.0.1**
- Added four new examples demonstrating xyn_html_extra.js features:
  - **animation-tracking.js**: Visual demonstration of createAnimationState with CSS animations
  - **transition-tracking.js**: Interactive hover example showing createTransitionState
  - **basic-routing.js**: Simple client-side navigation using XynRouter
  - **advanced-routing.js**: Path parameters and exact routing patterns
- Fixed three critical bugs in xyn_html_extra.js:
  - **route() function**: Changed return value from `{matcher, ...}` to `{match: matcher, ...}` to match router expectations
  - **pathMatcher()**: Fixed parameter extraction to check for undefined path segments, ensuring exact routing works correctly
  - **animationState() and transitionState()**: Replaced invalid optional chaining assignments (`event?.value = e`) with proper null checks (`if (event) event.value = e`)
- Added cache-busting timestamps to example module loading in index.js
- Organized examples into "Core Features" and "Extra Features" sections in index.html

## System Architecture

### Core Reactivity System

**Signal-Based State Management**
- Implements a pub-sub pattern where signals hold reactive values that notify subscribers on changes
- Signals only trigger updates when values actually change (performance optimization through equality checks)
- Supports direct subscription management with subscribe/unsubscribe methods
- Effects system provides automatic cleanup and debouncing capabilities for side effects

**Derived Values (Computed State)**
- Derived signals automatically recompute when their dependencies change
- Supports chained derivations where one derived value depends on another
- Includes cleanup mechanisms to prevent memory leaks (unsubscribeDerived method)
- Implements lazy evaluation - only recalculates when accessed

### Component Architecture

**DOM Element Creation**
- `XynTag` class provides declarative element creation using CSS selector-like syntax
- `tag` template literal function (`xyn`) for creating elements with inline syntax
- `text` function creates reactive text nodes that update when signals change
- `XynSwitch` provides conditional rendering based on signal values

**Template System**
- Tagged template literals for element creation: `tag\`div.class#id@event\``
- Supports attributes, classes, IDs, and event handlers in selector syntax
- Reactive text interpolation using `""${signal}""` syntax
- Fragment support for efficient batch DOM updates

**Mounting Strategy**
- `mountNext` function appends elements to containers
- `createMount` (referenced but implementation focuses on direct DOM manipulation)
- Components render to real DOM elements, not virtual DOM

### Rendering Optimization

**Change Detection**
- Equality-based updates prevent unnecessary re-renders
- Debounced effects batch multiple rapid changes
- Direct DOM manipulation avoids virtual DOM overhead

**Subscription Management**
- Manual subscription cleanup to prevent memory leaks
- Effect cleanup functions returned for explicit resource management
- Derived values track their own subscriptions separately

### Routing System (Extra Module)

**Client-Side Routing**
- `XynRouter.create(signal, derived)` creates router instance with explicit dependencies
- Path matching with parameter extraction
- Route configuration using declarative route objects
- Two routing modes:
  - `basicRouting(routeSignal)`: Simple route switching
  - `exactRouting(routeSignal)`: Strict path matching with exact flag

**Route Matching**
- `pathMatcher(...path)` function handles URL pattern matching
- Support for path parameters using mutable objects (e.g., `pathMatcher("", "user", userIdParam)`)
- Automatic parameter extraction into provided objects
- Returns `{isMatch, isExact}` for route matching decisions

**Usage Pattern:**
```javascript
import { signal, derived } from "./xyn_html.js";
import { XynRouter, route, pathMatcher, basicRouting } from "./xyn_html_extra.js";

const currentRoute = signal("home");
const router = XynRouter.create(signal, derived);

const renderRoute = router.routes(
  route(pathMatcher("", ""), basicRouting(currentRoute), "home"),
  route(pathMatcher("", "about"), basicRouting(currentRoute), "about")
);

renderRoute.subscribe(() => {}); // Activate routing
```

### Animation & Transition Tracking (Extra Module)

**Animation State Management**
- `createAnimationState(signal, event?)` creates animation state tracker
- Returns object with `{state, attachToElement}` where:
  - `state`: signal tracking animation lifecycle (started, iteration, ended, canceled)
  - `attachToElement(el)`: attaches animation listeners to DOM element
- Listens to native browser animation events

**Transition State Management**
- `createTransitionState(signal, event?)` creates transition state tracker
- Returns object with `{state, attachToElement}` where:
  - `state`: signal tracking transition lifecycle (started, running, ended, canceled)
  - `attachToElement(el)`: attaches transition listeners to DOM element
- Integrates with browser's transitionstart/run/end/cancel events

**Usage Pattern:**
```javascript
import { signal } from "./xyn_html.js";
import { createAnimationState } from "./xyn_html_extra.js";

const animState = createAnimationState(signal);
animState.attachToElement(element);
animState.state.subscribe(() => console.log(animState.state.value));
```

### Extension Architecture

**Extra Features Module (xyn_html_extra.js)**
- Dependency injection pattern requiring signal/derived functions as parameters
- Optional features separated from core to keep main library lightweight
- Exports advanced components: routing, animation tracking, transition tracking
- No global state - all dependencies passed explicitly at creation time

### CSS Integration

**Styling Approach**
- CSS custom properties for themeable components
- Class-based styling with reactive class management
- Inline styles supported through element properties
- Theme switching via global signals (light/dark mode support)

### Example System Design

**Modular Examples**
- Each example as separate ES module with title export
- Common output utility function for consistent rendering
- Signal update tracking for debugging
- Progressive complexity from basic signals to advanced routing

## External Dependencies

### Browser APIs
- **DOM API**: Core element creation, manipulation, and event handling
- **ES Modules**: Native browser module system (no bundler required)
- **MutationObserver**: Potentially used for DOM change detection (not explicit in codebase)
- **History API**: Used by XynRouter for client-side navigation
- **Animation/Transition Events**: Native browser events for animation state tracking

### Third-Party Libraries (Examples/Documentation Only)
- **Highlight.js** (v11.9.0): Syntax highlighting for code examples in documentation
  - CDN: cdnjs.cloudflare.com
  - Languages: JavaScript support
- **Theme Toggles** (v4.10.1): UI component for theme switching demo
  - CDN: cdn.jsdelivr.net

### Development Tools
- No build tools required (runs directly in browser)
- No transpilation needed (uses native ES6+ features)
- No package manager dependencies for core library

### Deployment Considerations
- Static file hosting sufficient (no server-side rendering)
- Single JavaScript file distribution model
- ES module imports require proper MIME types from server
- CORS headers may be needed for CDN resources in examples