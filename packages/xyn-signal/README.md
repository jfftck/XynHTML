# xyn-signal

Lightweight, reactive signal-based state management for JavaScript applications.

## Installation

```bash
npm install xyn-signal
```

## Usage

```javascript
import { createSignal, watch, timing } from 'xyn-signal';

// Create a signal
const count = createSignal(0);

// Subscribe to changes
count.subscribe(() => {
  console.log('Count changed:', count.get());
});

// Update the value
count.set(1);
count.set(2);

// Object signals with reactive properties
const user = createSignal({ name: 'John', age: 30 });
user.set('name', 'Jane'); // Triggers subscribers

// Array signals with reactive methods
const items = createSignal([1, 2, 3]);
items.push(4); // Triggers subscribers

// Watch multiple signals
const firstName = createSignal('John');
const lastName = createSignal('Doe');

watch(firstName)
  .watch(lastName)
  .effect(() => {
    console.log(`Full name: ${firstName.get()} ${lastName.get()}`);
  });

// Derived signals
const { signal: fullName } = watch(firstName)
  .watch(lastName)
  .derived(() => `${firstName.get()} ${lastName.get()}`);

// Timing functions
const debouncedEffect = timing(300).debounce(() => {
  console.log('Debounced!');
});

watch(firstName).effect(debouncedEffect);
```

## API

### createSignal(initialValue)

Creates a reactive signal that can hold any value type.

- **Primitives**: Simple value storage with change detection
- **Objects**: Reactive property assignment and deletion
- **Arrays**: Reactive array methods (push, pop, shift, unshift, splice)
- **Map/Set**: Reactive collection operations

### watch(signal)

Creates a watcher for observing multiple signals.

- `.watch(signal)` - Chain additional signals
- `.effect(fn)` - Subscribe to all watched signals
- `.derived(fn, wrappingFn?)` - Create a derived signal

### timing(delay)

Creates timing-controlled function wrappers.

- `.debounce(fn)` - Execute after inactivity period
- `.throttle(fn)` - Limit execution rate
- `.delay(fn)` - Execute after fixed delay

## License

MIT
