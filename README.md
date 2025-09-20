
# XynHTML

> ⚠️ **Warning**: This library is unstable and still under active development. APIs may change without notice. Use at your own risk in production environments.

A lightweight, reactive library for building web applications using a declarative syntax. XynHTML is inspired by jQuery, but focuses on simplicity and performance with built-in reactive signals.

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
- ✅ **DOM Element Components** - Function for creating reactive HTML elements
- ✅ **Dynamic Text Rendering** - Template literal text nodes with signal interpolation
- ✅ **DOM Switch Elements** - XynSwitch class for creating reactive switcher of multiple HTML elements
- ✅ **HTML Fragments** - Document fragment support for efficient DOM updates
- 🟥 **Map an Iterable to Elements** - Utilize a list signal to reactively generate updates to a list of elements

### Advanced Data Structures
- 🟥 **List Signal** - Reactive arrays with built-in list operations
- 🟥 **Map Signal** - Reactive key-value stores with object-like interface

### Addtional Components
- 🟥 **Route Signal** - Reactive state management based on page route, this will parse the query parameters
- 🟥 **Animation Signal** - Reactive state management based on the last animation state
- 🟥 **Transition Signal** - Reactive state management that returns the last state of transitions

### Developer Experience & Tooling
- 🚧 **Code Parser with Syntax Highlighting** - Parse and highlight JavaScript, HTML, CSS, and other languages within XynTag components
- 🚧 **Widget System** - Pre-built reactive components (buttons, forms, modals, tooltips, etc.) for rapid development
    - 🚧 **Button** - A simple syntax for creating the different types of buttons
    - 🚧 **Input** - Support all kinds of text input with a single function
    - 🚧 **Check/Radio** - Made as an easy way to add selectable elements
    - 🚧 **Dropdown List** - Create dropdown lists that support single value and multiple values
    - 🚧 **Slider** - Add and extend sliders with reactive data
    - 🚧 **Time and Date** - Reactive clocks and calendars
    - 🚧 **Combo Lists** - Add a text input to any control with reactive values
    - 🚧 **Tooltips** - Add reactive tooltips and error messages to other reactive elements
    - 🚧 **Windows** - Dialog windows that are modal and free floating are handled with this control
    - 🚧 **Layout Container** - A reactive container designed to be used with the Theme Manager
    - 🚧 **Theme Manager** - A reactive and injected set of styles based on community developed themes

### Routing & Navigation
- 🚧 **Client-Side Routing** - Hash-based and history API routing for single-page applications
- 🚧 **Route Parameters** - Dynamic route segments with parameter extraction
- 🚧 **Route Guards** - Authentication and authorization checks before route activation
- 🚧 **Nested Routing** - Hierarchical route structures for complex applications
- 🚧 **Route Transitions** - Animated transitions between routes with lifecycle hooks

### Legend
- ✅ **Implemented** - Feature is complete and functional
- 🟥 **Planned** - Feature is planned but not yet implemented
- 🏢 **Wishlist Completed** - Wishlist feature that has been implemented
- 🚧 **Wishlist Incomplete** - Wishlist feature ideas that might be completed in the future, but no commitment is made

## Quick Start

1. Import XynHTML in your project:

```javascript
import { signal, effect, derived, tag, text, mountNext, mountRoot } from "./xyn_html.js";
```

2. Create reactive signals:

```javascript
const counter = signal(0);
const message = signal("Hello World!");
```

3. Build UI components:

```javascript
const button = tag`button`;
button.children.add(text`Count: ${counter}`);
button.event.add("click", () => counter.value++);

mountNext(button, document.body);
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

### XynHTML Components
Build HTML elements with reactive content:

```javascript
const container = tag`div`;
const title = tag`h1`;
title.children.add(text`Welcome, ${userName}!`);
container.children.add(title);

mountNext(container, "body"); // Can also get the by selector strings
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

### tag(tagName, ...{XynHTML.tag | Object<string, any>}) | tag\`tagName\`
Creates a new HTML element component.

### text\`template\`
Creates reactive text content with signal interpolation.

### mountNext(component, selector) | mountRoot(component, selector)
Both mount a component to a DOM element, with the only difference of `mountRoot` will clear the contents and then mount it, and mountNext just appends it.

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
