
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

function outputCode(code) {
    const pre = document.createElement('pre');
    const codeElement = document.createElement('code');
    codeElement.innerHTML = code;
    pre.appendChild(codeElement);
    document.body.appendChild(pre);
}

// Example 1: Basic Signal Usage
outputHeader("Example 1: Basic Signal Usage");
outputCode(`<span class="keyword">const</span> <span class="variable">counter</span> = <span class="function">signal</span>(<span class="number">0</span>);
<span class="function">console.log</span>(<span class="string">"Initial counter value:"</span>, <span class="variable">counter</span>.<span class="property">value</span>);

<span class="comment">// Subscribe to changes</span>
<span class="keyword">const</span> <span class="variable">counterSubscriber</span> = () => {
    <span class="function">console.log</span>(<span class="string">"Counter changed to:"</span>, <span class="variable">counter</span>.<span class="property">value</span>);
};
<span class="variable">counter</span>.<span class="method">subscribe</span>(<span class="variable">counterSubscriber</span>);

<span class="comment">// Update the signal value</span>
<span class="variable">counter</span>.<span class="property">value</span> = <span class="number">5</span>;
<span class="variable">counter</span>.<span class="property">value</span> = <span class="number">10</span>;

<span class="comment">// Unsubscribe</span>
<span class="variable">counter</span>.<span class="method">unsubscribe</span>(<span class="variable">counterSubscriber</span>);`);

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
outputCode(`<span class="keyword">const</span> <span class="variable">firstName</span> = <span class="function">signal</span>(<span class="string">"John"</span>);
<span class="keyword">const</span> <span class="variable">lastName</span> = <span class="function">signal</span>(<span class="string">"Doe"</span>);

<span class="comment">// Effect that runs when either signal changes</span>
<span class="keyword">const</span> <span class="variable">unsubscribeEffect</span> = <span class="function">effect</span>(() => {
    <span class="function">console.log</span>(<span class="template">\`Full name: \${<span class="variable">firstName</span>.<span class="property">value</span>} \${<span class="variable">lastName</span>.<span class="property">value</span>}\`</span>);
}, [<span class="variable">firstName</span>, <span class="variable">lastName</span>]);

<span class="variable">firstName</span>.<span class="property">value</span> = <span class="string">"Jane"</span>;
<span class="variable">lastName</span>.<span class="property">value</span> = <span class="string">"Smith"</span>;`);

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
outputCode(`<span class="keyword">const</span> <span class="variable">price</span> = <span class="function">signal</span>(<span class="number">100</span>);
<span class="keyword">const</span> <span class="variable">quantity</span> = <span class="function">signal</span>(<span class="number">2</span>);
<span class="keyword">const</span> <span class="variable">taxRate</span> = <span class="function">signal</span>(<span class="number">0.1</span>);

<span class="comment">// Derived signal for subtotal</span>
<span class="keyword">const</span> [<span class="variable">subtotal</span>, <span class="variable">unsubscribeSubtotal</span>] = <span class="function">derived</span>(() => {
    <span class="keyword">return</span> <span class="variable">price</span>.<span class="property">value</span> * <span class="variable">quantity</span>.<span class="property">value</span>;
}, [<span class="variable">price</span>, <span class="variable">quantity</span>]);

<span class="comment">// Derived signal for total with tax</span>
<span class="keyword">const</span> [<span class="variable">total</span>, <span class="variable">unsubscribeTotal</span>] = <span class="function">derived</span>(() => {
    <span class="keyword">return</span> <span class="variable">subtotal</span>.<span class="property">value</span> * (<span class="number">1</span> + <span class="variable">taxRate</span>.<span class="property">value</span>);
}, [<span class="variable">subtotal</span>, <span class="variable">taxRate</span>]);`);

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
outputCode(`<span class="keyword">const</span> <span class="variable">todos</span> = <span class="function">signal</span>([]);
<span class="keyword">const</span> <span class="variable">filter</span> = <span class="function">signal</span>(<span class="string">"all"</span>); <span class="comment">// "all", "completed", "pending"</span>

<span class="comment">// Derived signal for filtered todos</span>
<span class="keyword">const</span> [<span class="variable">filteredTodos</span>, <span class="variable">unsubscribeFiltered</span>] = <span class="function">derived</span>(() => {
    <span class="keyword">if</span> (<span class="variable">filter</span>.<span class="property">value</span> === <span class="string">"completed"</span>) {
        <span class="keyword">return</span> <span class="variable">todos</span>.<span class="property">value</span>.<span class="method">filter</span>(<span class="variable">todo</span> => <span class="variable">todo</span>.<span class="property">completed</span>);
    } <span class="keyword">else if</span> (<span class="variable">filter</span>.<span class="property">value</span> === <span class="string">"pending"</span>) {
        <span class="keyword">return</span> <span class="variable">todos</span>.<span class="property">value</span>.<span class="method">filter</span>(<span class="variable">todo</span> => !<span class="variable">todo</span>.<span class="property">completed</span>);
    }
    <span class="keyword">return</span> <span class="variable">todos</span>.<span class="property">value</span>;
}, [<span class="variable">todos</span>, <span class="variable">filter</span>]);`);

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
outputCode(`<span class="keyword">const</span> <span class="variable">performanceSignal</span> = <span class="function">signal</span>(<span class="string">"test"</span>);
<span class="keyword">let</span> <span class="variable">updateCount</span> = <span class="number">0</span>;

<span class="keyword">const</span> <span class="variable">perfSubscriber</span> = () => {
    <span class="variable">updateCount</span>++;
    <span class="function">console.log</span>(<span class="template">\`Performance signal updated \${<span class="variable">updateCount</span>} times\`</span>);
};
<span class="variable">performanceSignal</span>.<span class="method">subscribe</span>(<span class="variable">perfSubscriber</span>);

<span class="comment">// Setting same value (should not trigger update)</span>
<span class="variable">performanceSignal</span>.<span class="property">value</span> = <span class="string">"test"</span>;

<span class="comment">// Setting different value (should trigger update)</span>
<span class="variable">performanceSignal</span>.<span class="property">value</span> = <span class="string">"new value"</span>;`);

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
outputCode(`<span class="keyword">const</span> <span class="variable">tempSignal</span> = <span class="function">signal</span>(<span class="number">0</span>);
<span class="keyword">let</span> <span class="variable">cleanupCount</span> = <span class="number">0</span>;

<span class="keyword">const</span> <span class="variable">tempSubscriber</span> = () => {
    <span class="variable">cleanupCount</span>++;
    <span class="function">console.log</span>(<span class="template">\`Temp signal updated \${<span class="variable">cleanupCount</span>} times\`</span>);
};
<span class="variable">tempSignal</span>.<span class="method">subscribe</span>(<span class="variable">tempSubscriber</span>);

<span class="variable">tempSignal</span>.<span class="property">value</span> = <span class="number">1</span>;
<span class="variable">tempSignal</span>.<span class="property">value</span> = <span class="number">2</span>;

<span class="comment">// Unsubscribing</span>
<span class="variable">tempSignal</span>.<span class="method">unsubscribe</span>(<span class="variable">tempSubscriber</span>);

<span class="comment">// This update won't trigger the subscriber</span>
<span class="variable">tempSignal</span>.<span class="property">value</span> = <span class="number">3</span>;`);

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
outputCode(`<span class="keyword">const</span> <span class="variable">input</span> = <span class="function">signal</span>(<span class="string">"hello world"</span>);

<span class="keyword">const</span> [<span class="variable">uppercase</span>, <span class="variable">unsubscribeUpper</span>] = <span class="function">derived</span>(() => {
    <span class="keyword">return</span> <span class="variable">input</span>.<span class="property">value</span>.<span class="method">toUpperCase</span>();
}, [<span class="variable">input</span>]);

<span class="keyword">const</span> [<span class="variable">wordCount</span>, <span class="variable">unsubscribeWordCount</span>] = <span class="function">derived</span>(() => {
    <span class="keyword">return</span> <span class="variable">uppercase</span>.<span class="property">value</span>.<span class="method">split</span>(<span class="string">' '</span>).<span class="property">length</span>;
}, [<span class="variable">uppercase</span>]);

<span class="keyword">const</span> [<span class="variable">analysis</span>, <span class="variable">unsubscribeAnalysis</span>] = <span class="function">derived</span>(() => {
    <span class="keyword">return</span> {
        <span class="property">original</span>: <span class="variable">input</span>.<span class="property">value</span>,
        <span class="property">uppercase</span>: <span class="variable">uppercase</span>.<span class="property">value</span>,
        <span class="property">wordCount</span>: <span class="variable">wordCount</span>.<span class="property">value</span>,
        <span class="property">charCount</span>: <span class="variable">input</span>.<span class="property">value</span>.<span class="property">length</span>
    };
}, [<span class="variable">input</span>, <span class="variable">uppercase</span>, <span class="variable">wordCount</span>]);`);

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
outputCode(`<span class="keyword">const</span> <span class="variable">sharedSignal</span> = <span class="function">signal</span>(<span class="string">"shared"</span>);

<span class="keyword">const</span> <span class="variable">subscriber1</span> = () => {
    <span class="function">console.log</span>(<span class="string">"Subscriber 1 received:"</span>, <span class="variable">sharedSignal</span>.<span class="property">value</span>);
};
<span class="keyword">const</span> <span class="variable">subscriber2</span> = () => {
    <span class="function">console.log</span>(<span class="string">"Subscriber 2 received:"</span>, <span class="variable">sharedSignal</span>.<span class="property">value</span>);
};
<span class="keyword">const</span> <span class="variable">subscriber3</span> = () => {
    <span class="function">console.log</span>(<span class="string">"Subscriber 3 received:"</span>, <span class="variable">sharedSignal</span>.<span class="property">value</span>);
};

<span class="variable">sharedSignal</span>.<span class="method">subscribe</span>(<span class="variable">subscriber1</span>);
<span class="variable">sharedSignal</span>.<span class="method">subscribe</span>(<span class="variable">subscriber2</span>);
<span class="variable">sharedSignal</span>.<span class="method">subscribe</span>(<span class="variable">subscriber3</span>);

<span class="variable">sharedSignal</span>.<span class="property">value</span> = <span class="string">"updated value"</span>;

<span class="comment">// Remove one subscriber</span>
<span class="variable">sharedSignal</span>.<span class="method">unsubscribe</span>(<span class="variable">subscriber2</span>);`);

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
outputCode(`<span class="keyword">const</span> <span class="variable">directSignal</span> = <span class="function">signal</span>(<span class="string">"initial"</span>);

<span class="keyword">const</span> <span class="variable">directSubscriber1</span> = () => {
    <span class="function">console.log</span>(<span class="string">"Direct subscriber 1:"</span>, <span class="variable">directSignal</span>.<span class="property">value</span>);
};
<span class="keyword">const</span> <span class="variable">directSubscriber2</span> = () => {
    <span class="function">console.log</span>(<span class="string">"Direct subscriber 2:"</span>, <span class="variable">directSignal</span>.<span class="property">value</span>);
};

<span class="comment">// Subscribe directly to the signal</span>
<span class="variable">directSignal</span>.<span class="method">subscribe</span>(<span class="variable">directSubscriber1</span>);
<span class="variable">directSignal</span>.<span class="method">subscribe</span>(<span class="variable">directSubscriber2</span>);

<span class="variable">directSignal</span>.<span class="property">value</span> = <span class="string">"first update"</span>;
<span class="variable">directSignal</span>.<span class="property">value</span> = <span class="string">"second update"</span>;

<span class="comment">// Unsubscribe one subscriber</span>
<span class="variable">directSignal</span>.<span class="method">unsubscribe</span>(<span class="variable">directSubscriber1</span>);`);

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
