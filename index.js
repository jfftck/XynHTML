
import { signal, effect, derived } from "./xyn_html.js"

// Create output function to append to DOM
function output(message) {
    const div = document.createElement('div');
    div.textContent = message;
    div.style.marginBottom = '5px';
    document.body.appendChild(div);
}

function outputHeader(message) {
    const h3 = document.createElement('h3');
    h3.textContent = message;
    h3.style.color = '#333';
    h3.style.marginTop = '20px';
    h3.style.marginBottom = '10px';
    document.body.appendChild(h3);
}

// Example 1: Basic Signal Usage
outputHeader("Example 1: Basic Signal Usage");
const counter = signal(0);
output("Initial counter value: " + counter.value);

// Subscribe to changes - returns unsubscribe function
const unsubscribeCounter = counter.subscribe(() => {
    output("Counter changed to: " + counter.value);
});

// Update the signal value
counter.value = 5;
counter.value = 10;

// Unsubscribe using the returned function
unsubscribeCounter();

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
const price = signal(100);
const quantity = signal(2);
const taxRate = signal(0.1);

// Derived signal for subtotal
const [subtotal, unsubscribeSubtotal] = derived(() => {
    return price.value * quantity.value;
}, [price, quantity]);

// Derived signal for total with tax
const [total, unsubscribeTotal] = derived(() => {
    return subtotal.value * (1 + taxRate.value);
}, [subtotal, taxRate]);

// Subscribe to derived values to see changes
const unsubscribeSubtotalSub = subtotal.subscribe(() => {
    output(`Subtotal: $${subtotal.value}`);
});

const unsubscribeTotalSub = total.subscribe(() => {
    output(`Total with tax: $${total.value.toFixed(2)}`);
});

// Update base values to trigger derived calculations
output("Initial values:");
price.value = price.value; // Trigger initial calculation
output("Updating price to $150:");
price.value = 150;
output("Updating quantity to 3:");
quantity.value = 3;
output("Updating tax rate to 15%:");
taxRate.value = 0.15;

// Clean up all subscriptions
unsubscribeSubtotalSub();
unsubscribeTotalSub();
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
const unsubscribeFilteredSub = filteredTodos.subscribe(() => {
    output("Filtered todos: " + JSON.stringify(filteredTodos.value));
});

const unsubscribeStatsSub = todoStats.subscribe(() => {
    const stats = todoStats.value;
    output(`Todo Stats - Total: ${stats.total}, Completed: ${stats.completed}, Pending: ${stats.pending}`);
});

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
unsubscribeFilteredSub();
unsubscribeStatsSub();
unsubscribeFiltered();
unsubscribeStats();

// Example 5: Performance - No unnecessary updates
outputHeader("Example 5: Performance - No Unnecessary Updates");
const performanceSignal = signal("test");
let updateCount = 0;

const unsubscribePerf = performanceSignal.subscribe(() => {
    updateCount++;
    output(`Performance signal updated ${updateCount} times, value: ${performanceSignal.value}`);
});

output("Setting same value (should not trigger update):");
performanceSignal.value = "test";

output("Setting different value (should trigger update):");
performanceSignal.value = "new value";

output("Setting same value again (should not trigger update):");
performanceSignal.value = "new value";

// Clean up
unsubscribePerf();

// Example 6: Subscription Management
outputHeader("Example 6: Subscription Management");
const tempSignal = signal(0);
let cleanupCount = 0;

const unsubscribeTemp = tempSignal.subscribe(() => {
    cleanupCount++;
    output(`Temp signal updated ${cleanupCount} times`);
});

tempSignal.value = 1;
tempSignal.value = 2;

output("Unsubscribing...");
unsubscribeTemp();

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

const unsubscribeAnalysisSub = analysis.subscribe(() => {
    output("Text analysis: " + JSON.stringify(analysis.value));
});

input.value = "XynHTML is awesome";
input.value = "Building reactive applications made simple";

// Clean up all subscriptions
unsubscribeAnalysisSub();
unsubscribeAnalysis();
unsubscribeWordCount();
unsubscribeUpper();

// Example 8: Multiple Subscribers to One Signal
outputHeader("Example 8: Multiple Subscribers to One Signal");
const sharedSignal = signal("shared");

const unsubscribeShared1 = sharedSignal.subscribe(() => {
    output("Subscriber 1 received: " + sharedSignal.value);
});

const unsubscribeShared2 = sharedSignal.subscribe(() => {
    output("Subscriber 2 received: " + sharedSignal.value);
});

const unsubscribeShared3 = sharedSignal.subscribe(() => {
    output("Subscriber 3 received: " + sharedSignal.value);
});

output("Updating shared signal:");
sharedSignal.value = "updated value";

output("Removing subscriber 2:");
unsubscribeShared2();

output("Updating again (subscriber 2 should not receive):");
sharedSignal.value = "final value";

// Clean up remaining subscribers
unsubscribeShared1();
unsubscribeShared3();

outputHeader("All Examples Complete");
