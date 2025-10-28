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
- `XynRouter` class manages browser history and URL changes
- Path matching with parameter extraction
- Route configuration using declarative route objects
- Two routing modes:
  - `basicRouting`: Simple route switching
  - `exactRouting`: Strict path matching with exact flag

**Route Matching**
- `pathMatcher` function handles URL pattern matching
- Support for path parameters (e.g., `/user/:id`)
- Automatic parameter extraction into objects

### Animation & Transition Tracking (Extra Module)

**Animation State Management**
- `createAnimationState` tracks CSS animation lifecycle events
- Returns signal that updates on: started, iteration, ended, canceled states
- Listens to native browser animation events

**Transition State Management**
- `createTransitionState` monitors CSS transition lifecycle
- Tracks: started, running, ended, canceled states
- Integrates with browser's transitionstart/run/end/cancel events

### Extension Architecture

**Extra Features Module (xyn_html_extra.js)**
- Dependency injection pattern for signal/derived functions via `setSignal` and `setDerived`
- Optional features separated from core to keep main library lightweight
- Exports advanced components: routing, animation tracking, transition tracking

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