
import { signal, effect, derived } from "./xyn_html.js"

// Create output function to append to DOM
function output(message) {
    const p = document.createElement('p');
    p.textContent = message;
    document.body.appendChild(p);
}

function outputHeader(message) {
    const h2 = document.createElement('h2');
    h2.textContent = message;
    document.body.appendChild(h2);
}

// Example 1: Basic Signal Usage
outputHeader("Example 1: Basic Signal Usage");
const counter = signal(0);
output("Initial counter value: " + counter.value);

// Subscribe to changes - use signal's subscribe method
const counterSubscriber = () => {
    output("Counter changed to: " + counter.value);
};
counter.subscribe(counterSubscriber);

// Update the signal value
counter.value = 5;
counter.value = 10;

// Unsubscribe using the signal's unsubscribe method
counter.unsubscribe(counterSubscriber);

// Example 2: Multiple Signals and Effects
outputHeader("Example 2: Multiple Signals and Effects");
const firstName = signal("John");
const lastName = signal("Doe");

// Effect that runs when either firstName or lastName changes
const unsubscribeEffect = effect(() => {
    output(`Full name: ${firstName.value} ${lastName.value}`);
}, [firstName, lastName]);

// Update the signals
firstName.value = "Jane";
lastName.value = "Smith";

// Clean up effect
unsubscribeEffect();

// Example 3: Derived Values
outputHeader("Example 3: Derived Values");
output("Initial values:");
const price = signal(100);
const quantity = signal(2);
const taxRate = signal(0.1);

// Effect to log price and quantity changes
effect(() => {
    output(`Price: $${price.value} * ${quantity.value}`);
}, [price, quantity]);

// Derived signal for subtotal
const [subtotal, unsubscribeSubtotal] = derived(() => {
    return price.value * quantity.value;
}, [price, quantity]);

// Derived signal for total with tax
const [total, unsubscribeTotal] = derived(() => {
    return subtotal.value * (1 + taxRate.value);
}, [subtotal, taxRate]);

// Subscribe to derived values to see changes
const subtotalSubscriber = () => {
    output(`Subtotal: $${subtotal.value}`);
};
const totalSubscriber = () => {
    output(`Total with tax: $${total.value.toFixed(2)}`);
};

subtotal.subscribe(subtotalSubscriber);
total.subscribe(totalSubscriber);

// Update base values to trigger derived calculations
output("---");
output("Updating price to $150:");
price.value = 150;
output("---");
output("Updating quantity to 3:");
quantity.value = 3;
output("---");
output("Updating tax rate to 15%:");
taxRate.value = 0.15;

// Clean up all subscriptions
subtotal.unsubscribe(subtotalSubscriber);
total.unsubscribe(totalSubscriber);
unsubscribeSubtotal();
unsubscribeTotal();

// Example 4: Complex State Management
outputHeader("Example 4: Complex State Management");
const todos = signal([]);
const filter = signal("all"); // "all", "completed", "pending"

// Derived signal for filtered todos
const [filteredTodos, unsubscribeFiltered] = derived(() => {
    if (filter.value === "completed") {
        return todos.value.filter(todo => todo.completed);
    } else if (filter.value === "pending") {
        return todos.value.filter(todo => !todo.completed);
    }
    return todos.value;
}, [todos, filter]);

// Derived signal for todo stats
const [todoStats, unsubscribeStats] = derived(() => {
    const total = todos.value.length;
    const completed = todos.value.filter(todo => todo.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
}, [todos]);

// Subscribe to see changes
const filteredSubscriber = () => {
    output("Filtered todos: " + JSON.stringify(filteredTodos.value));
};
const statsSubscriber = () => {
    const stats = todoStats.value;
    output(`Todo Stats - Total: ${stats.total}, Completed: ${stats.completed}, Pending: ${stats.pending}`);
};

filteredTodos.subscribe(filteredSubscriber);
todoStats.subscribe(statsSubscriber);

// Add some todos
todos.value = [
    { id: 1, text: "Learn XynHTML", completed: false },
    { id: 2, text: "Build an app", completed: false },
    { id: 3, text: "Write documentation", completed: true }
];

// Change filter
output("Setting filter to 'pending':");
filter.value = "pending";

output("Setting filter to 'completed':");
filter.value = "completed";

// Update a todo
output("Marking 'Learn XynHTML' as completed:");
todos.value = todos.value.map(todo =>
    todo.id === 1 ? { ...todo, completed: true } : todo
);

// Clean up subscriptions
filteredTodos.unsubscribe(filteredSubscriber);
todoStats.unsubscribe(statsSubscriber);
unsubscribeFiltered();
unsubscribeStats();

// Example 5: Performance - No unnecessary updates
outputHeader("Example 5: Performance - No Unnecessary Updates");
const performanceSignal = signal("test");
let updateCount = 0;

const perfSubscriber = () => {
    updateCount++;
    output(`Performance signal updated ${updateCount} times, value: ${performanceSignal.value}`);
};
performanceSignal.subscribe(perfSubscriber);

output("Setting same value (should not trigger update):");
performanceSignal.value = "test";

output("Setting different value (should trigger update):");
performanceSignal.value = "new value";

output("Setting same value again (should not trigger update):");
performanceSignal.value = "new value";

// Clean up
performanceSignal.unsubscribe(perfSubscriber);

// Example 6: Subscription Management
outputHeader("Example 6: Subscription Management");
const tempSignal = signal(0);
let cleanupCount = 0;

const tempSubscriber = () => {
    cleanupCount++;
    output(`Temp signal updated ${cleanupCount} times`);
};
tempSignal.subscribe(tempSubscriber);

tempSignal.value = 1;
tempSignal.value = 2;

output("Unsubscribing...");
tempSignal.unsubscribe(tempSubscriber);

output("Updating after unsubscribe (should not log):");
tempSignal.value = 3;

// Example 7: Chained Derived Values
outputHeader("Example 7: Chained Derived Values");
const input = signal("hello world");

const [uppercase, unsubscribeUpper] = derived(() => {
    return input.value.toUpperCase();
}, [input]);

const [wordCount, unsubscribeWordCount] = derived(() => {
    return uppercase.value.split(' ').length;
}, [uppercase]);

const [analysis, unsubscribeAnalysis] = derived(() => {
    return {
        original: input.value,
        uppercase: uppercase.value,
        wordCount: wordCount.value,
        charCount: input.value.length
    };
}, [input, uppercase, wordCount]);

const analysisSubscriber = () => {
    output("Text analysis: " + JSON.stringify(analysis.value));
};
analysis.subscribe(analysisSubscriber);

input.value = "XynHTML is awesome";
input.value = "Building reactive applications made simple";

// Clean up all subscriptions
analysis.unsubscribe(analysisSubscriber);
unsubscribeAnalysis();
unsubscribeWordCount();
unsubscribeUpper();

// Example 8: Multiple Subscribers to One Signal
outputHeader("Example 8: Multiple Subscribers to One Signal");
const sharedSignal = signal("shared");

const subscriber1 = () => {
    output("Subscriber 1 received: " + sharedSignal.value);
};
const subscriber2 = () => {
    output("Subscriber 2 received: " + sharedSignal.value);
};
const subscriber3 = () => {
    output("Subscriber 3 received: " + sharedSignal.value);
};

sharedSignal.subscribe(subscriber1);
sharedSignal.subscribe(subscriber2);
sharedSignal.subscribe(subscriber3);

output("Updating shared signal:");
sharedSignal.value = "updated value";

output("Removing subscriber 2:");
sharedSignal.unsubscribe(subscriber2);

output("Updating again (subscriber 2 should not receive):");
sharedSignal.value = "final value";

// Clean up remaining subscribers
sharedSignal.unsubscribe(subscriber1);
sharedSignal.unsubscribe(subscriber3);

// Example 9: Direct Signal Subscription without Effects
outputHeader("Example 9: Direct Signal Subscription");
const directSignal = signal("initial");

const directSubscriber1 = () => {
    output("Direct subscriber 1: " + directSignal.value);
};
const directSubscriber2 = () => {
    output("Direct subscriber 2: " + directSignal.value);
};

// Subscribe directly to the signal
directSignal.subscribe(directSubscriber1);
directSignal.subscribe(directSubscriber2);

directSignal.value = "first update";
directSignal.value = "second update";

// Unsubscribe one subscriber
directSignal.unsubscribe(directSubscriber1);
output("Unsubscribed first subscriber, updating again:");
directSignal.value = "third update";

// Clean up
directSignal.unsubscribe(directSubscriber2);

outputHeader("All Examples Complete");
