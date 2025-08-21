
# XynHTML

> ⚠️ **Warning**: This library is unstable and still under active development. APIs may change without notice. Use at your own risk in production environments.

A lightweight, reactive library for building web applications using a declarative syntax. XynHTML is inspired by React and Vue, but focuses on simplicity and performance with built-in reactive signals.

## Features

- **Reactive Signals**: Create reactive data that automatically updates the UI
- **Effects**: Run side effects when signals change
- **Derived Values**: Compute values based on other signals
- **Declarative Components**: Build UI components with XynTag
- **Conditional Rendering**: Show/hide elements based on signal values
- **Form Validation**: Build reactive forms with real-time validation
- **No Build Step**: Works directly in the browser with ES modules

## Implementation Status

Below is the current implementation status of XynHTML's planned features:

### Core Reactivity
- ✅ **Signal System** - Basic reactive state management with subscription/notification
- ✅ **Effect System** - Automatic side effect execution when signals change
- ✅ **Derived Values** - Computed signals that update based on dependencies

### Component System
- ✅ **DOM Element Components** - XynTag class for creating reactive HTML elements
- ✅ **Dynamic Text Rendering** - Template literal text nodes with signal interpolation
- ❌ **HTML String Parser** - Parse HTML strings into XynTag components
- ❌ **Emmet Parser** - CSS selector-like syntax for rapid component creation

### Advanced Data Structures
- ❌ **List-like Signal** - Reactive arrays with built-in list operations
- ❌ **Map-like Signal** - Reactive key-value stores with object-like interface
- ❌ **HTML Fragments** - Document fragment support for efficient DOM updates

### Developer Experience & Tooling
- ◯ **Code Parser with Syntax Highlighting** - Parse and highlight JavaScript, HTML, CSS, and other languages within XynTag components
- ◯ **Widget System** - Pre-built reactive components (buttons, forms, modals, tooltips, etc.) for rapid development

### Routing & Navigation
- ◯ **Client-Side Routing** - Hash-based and history API routing for single-page applications
- ◯ **Route Parameters** - Dynamic route segments with parameter extraction
- ◯ **Route Guards** - Authentication and authorization checks before route activation
- ◯ **Nested Routing** - Hierarchical route structures for complex applications
- ◯ **Route Transitions** - Animated transitions between routes with lifecycle hooks

### Legend
- ✅ **Implemented** - Feature is complete and functional
- ❌ **Planned** - Feature is planned but not yet implemented
- ◯ **Wishlist** - Feature ideas that might be completed in the future, but no commitment is made

## Quick Start

1. Import XynHTML in your project:

```javascript
import { signal, effect, derived, XynTag, text, createRoot } from "./xyn_html.js";
```

2. Create reactive signals:

```javascript
const counter = signal(0);
const message = signal("Hello World!");
```

3. Build UI components:

```javascript
const button = new XynTag("button");
button.children = [text`Count: ${counter}`];

const buttonElement = button.render();
buttonElement.onclick = () => counter.value++;

document.body.appendChild(buttonElement);
```

## Core Concepts

### Signals
Signals are reactive data containers that notify subscribers when their value changes:

```javascript
const name = signal("John");
name.value = "Jane"; // Triggers updates
```

### Effects
Effects run functions when dependent signals change:

```javascript
const unsubscribe = effect(() => {
    console.log(`Name is: ${name.value}`);
}, [name]);
```

### Derived Values
Create computed values that update automatically:

```javascript
const fullName = derived(() => {
    return `${firstName.value} ${lastName.value}`;
}, [firstName, lastName]);

// Clean up when done
fullName.unsubscribeDerived();
```

### XynTag Components
Build HTML elements with reactive content:

```javascript
const container = new XynTag("div");
const title = new XynTag("h1");
title.children = [text`Welcome, ${userName}!`];
container.children = [title];

document.body.appendChild(container.render());
```

## Examples

To see XynHTML in action with comprehensive examples, visit the [examples page](https://jfftck.github.io/XynHTML) in this repository. The examples cover:

- Basic signal usage and subscription
- Multiple signals and effects
- Derived values and computed properties
- Complex state management
- DOM creation and manipulation
- Conditional rendering
- Form validation
- Performance optimization
- Theme switching

## API Reference

### signal(initialValue)
Creates a new reactive signal.

### effect(callback, dependencies)
Runs a callback when any of the dependency signals change.

### derived(callback, dependencies)
Creates a computed signal that updates based on other signals. Returns a signal with an additional `unsubscribeDerived()` method for cleanup.

### XynTag(tagName, props, children)
Creates a new HTML element component.

### text\`template\`
Creates reactive text content with signal interpolation.

### createRoot(component, selector)
Mounts a component to a DOM element.

#### Derived Signal Methods
- **unsubscribeDerived()**: Cleans up the derived signal's internal effect subscription.

## Browser Support

XynHTML works in all modern browsers that support ES modules and Proxy objects:
- Chrome 61+
- Firefox 60+
- Safari 10.1+
- Edge 16+

## Getting Started

1. Clone or download this repository
2. Open `index.html` in your browser to see the examples
3. Start building your own reactive applications with XynHTML!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
