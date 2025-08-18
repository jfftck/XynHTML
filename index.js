
import { signal, effect, derived, XynTag, text, createRoot } from "./xyn_html.js"

// Create output function to append to DOM
function output(message) {
    const p = document.createElement('p');
    p.textContent = message;
    document.body.appendChild(p);
}

function outputHeader(message) {
    const h3 = document.createElement('h3');
    h3.textContent = message;
    document.body.appendChild(h3);
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
<span class="function">output</span>(<span class="string">"Initial counter value: "</span> + <span class="variable">counter</span>.<span class="property">value</span>);

<span class="comment">// Subscribe to changes</span>
<span class="keyword">const</span> <span class="variable">counterSubscriber</span> = () => {
    <span class="function">output</span>(<span class="string">"Counter changed to: "</span> + <span class="variable">counter</span>.<span class="property">value</span>);
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
    <span class="function">output</span>(<span class="template">\`Full name: \${<span class="variable">firstName</span>.<span class="property">value</span>} \${<span class="variable">lastName</span>.<span class="property">value</span>}\`</span>);
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
    <span class="function">output</span>(<span class="template">\`Performance signal updated \${<span class="variable">updateCount</span>} times, value: \${<span class="variable">performanceSignal</span>.<span class="property">value</span>}\`</span>);
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
    <span class="function">output</span>(<span class="template">\`Temp signal updated \${<span class="variable">cleanupCount</span>} times\`</span>);
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
outputCode(`<span class="keyword">const</span> <span class="variable">textInput</span> = <span class="function">signal</span>(<span class="string">"hello world"</span>);

<span class="keyword">const</span> [<span class="variable">uppercase</span>, <span class="variable">unsubscribeUpper</span>] = <span class="function">derived</span>(() => {
    <span class="keyword">return</span> <span class="variable">textInput</span>.<span class="property">value</span>.<span class="method">toUpperCase</span>();
}, [<span class="variable">textInput</span>]);

<span class="keyword">const</span> [<span class="variable">wordCount</span>, <span class="variable">unsubscribeWordCount</span>] = <span class="function">derived</span>(() => {
    <span class="keyword">return</span> <span class="variable">uppercase</span>.<span class="property">value</span>.<span class="method">split</span>(<span class="string">' '</span>).<span class="property">length</span>;
}, [<span class="variable">uppercase</span>]);

<span class="keyword">const</span> [<span class="variable">analysis</span>, <span class="variable">unsubscribeAnalysis</span>] = <span class="function">derived</span>(() => {
    <span class="keyword">return</span> {
        <span class="property">original</span>: <span class="variable">textInput</span>.<span class="property">value</span>,
        <span class="property">uppercase</span>: <span class="variable">uppercase</span>.<span class="property">value</span>,
        <span class="property">wordCount</span>: <span class="variable">wordCount</span>.<span class="property">value</span>,
        <span class="property">charCount</span>: <span class="variable">textInput</span>.<span class="property">value</span>.<span class="property">length</span>
    };
}, [<span class="variable">textInput</span>, <span class="variable">uppercase</span>, <span class="variable">wordCount</span>]);`);

const textInput2 = signal("hello world");

const [uppercase, unsubscribeUpper] = derived(() => {
    return textInput2.value.toUpperCase();
}, [textInput2]);

const [wordCount, unsubscribeWordCount] = derived(() => {
    return uppercase.value.split(' ').length;
}, [uppercase]);

const [analysis, unsubscribeAnalysis] = derived(() => {
    return {
        original: textInput2.value,
        uppercase: uppercase.value,
        wordCount: wordCount.value,
        charCount: textInput2.value.length
    };
}, [textInput2, uppercase, wordCount]);

const analysisSubscriber = () => {
    output("Text analysis: " + JSON.stringify(analysis.value));
};
analysis.subscribe(analysisSubscriber);

textInput2.value = "XynHTML is awesome";
textInput2.value = "Building reactive applications made simple";

// Clean up all subscriptions
analysis.unsubscribe(analysisSubscriber);
unsubscribeAnalysis();
unsubscribeWordCount();
unsubscribeUpper();

// Example 8: Multiple Subscribers to One Signal
outputHeader("Example 8: Multiple Subscribers to One Signal");
outputCode(`<span class="keyword">const</span> <span class="variable">sharedSignal</span> = <span class="function">signal</span>(<span class="string">"shared"</span>);

<span class="keyword">const</span> <span class="variable">subscriber1</span> = () => {
    <span class="function">output</span>(<span class="string">"Subscriber 1 received: "</span> + <span class="variable">sharedSignal</span>.<span class="property">value</span>);
};
<span class="keyword">const</span> <span class="variable">subscriber2</span> = () => {
    <span class="function">output</span>(<span class="string">"Subscriber 2 received: "</span> + <span class="variable">sharedSignal</span>.<span class="property">value</span>);
};
<span class="keyword">const</span> <span class="variable">subscriber3</span> = () => {
    <span class="function">output</span>(<span class="string">"Subscriber 3 received: "</span> + <span class="variable">sharedSignal</span>.<span class="property">value</span>);
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
    <span class="function">output</span>(<span class="string">"Direct subscriber 1: "</span> + <span class="variable">directSignal</span>.<span class="property">value</span>);
};
<span class="keyword">const</span> <span class="variable">directSubscriber2</span> = () => {
    <span class="function">output</span>(<span class="string">"Direct subscriber 2: "</span> + <span class="variable">directSignal</span>.<span class="property">value</span>);
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

// Example 10: DOM Creation with XynTag and createRoot
outputHeader("Example 10: DOM Creation with XynTag and createRoot");
outputCode(`<span class="keyword">const</span> <span class="variable">buttonText</span> = <span class="function">signal</span>(<span class="string">"Click me!"</span>);
<span class="keyword">const</span> <span class="variable">clickCount</span> = <span class="function">signal</span>(<span class="number">0</span>);

<span class="comment">// Create a button with reactive text</span>
<span class="keyword">const</span> <span class="variable">button</span> = <span class="keyword">new</span> <span class="function">XynTag</span>(<span class="string">"button"</span>);
<span class="variable">button</span>.<span class="property">children</span> = [<span class="function">text</span><span class="template">\`\${<span class="variable">buttonText</span>}\`</span>];

<span class="comment">// Add click handler</span>
<span class="keyword">const</span> <span class="variable">buttonElement</span> = <span class="variable">button</span>.<span class="method">render</span>();
<span class="variable">buttonElement</span>.<span class="property">onclick</span> = () => {
    <span class="variable">clickCount</span>.<span class="property">value</span>++;
    <span class="variable">buttonText</span>.<span class="property">value</span> = <span class="template">\`Clicked \${<span class="variable">clickCount</span>.<span class="property">value</span>} times\`</span>;
};

<span class="comment">// Create a div container and mount using createRoot</span>
<span class="keyword">const</span> <span class="variable">container</span> = <span class="keyword">new</span> <span class="function">XynTag</span>(<span class="string">"div"</span>);
<span class="variable">container</span>.<span class="property">children</span> = [<span class="variable">button</span>];

<span class="keyword">const</span> <span class="variable">mount</span> = <span class="function">createRoot</span>(<span class="variable">container</span>, <span class="string">"body"</span>);
<span class="variable">mount</span>();`);

const buttonText = signal("Click me!");
const clickCount = signal(0);

// Create a button with reactive text
const button = new XynTag("button");
button.children = [text`${buttonText}`];

// Add click handler
const buttonElement = button.render();
buttonElement.onclick = () => {
    clickCount.value++;
    buttonText.value = `Clicked ${clickCount.value} times`;
};

// Create a div container with some styling
const container = new XynTag("div");
container.children = [button];
const containerElement = container.render();
containerElement.style.cssText = "margin: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;";

output("Interactive button created below:");
const mount = createRoot(container, "body");
mount();

// Example 11: Dynamic List with XynTag and createRoot
outputHeader("Example 11: Dynamic List with XynTag and createRoot");
outputCode(`<span class="keyword">const</span> <span class="variable">items</span> = <span class="function">signal</span>([<span class="string">"Apple"</span>, <span class="string">"Banana"</span>, <span class="string">"Cherry"</span>]);

<span class="comment">// Create list container</span>
<span class="keyword">const</span> <span class="variable">listContainer</span> = <span class="keyword">new</span> <span class="function">XynTag</span>(<span class="string">"div"</span>);
<span class="keyword">const</span> <span class="variable">itemInput</span> = <span class="keyword">new</span> <span class="function">XynTag</span>(<span class="string">"input"</span>);
<span class="keyword">const</span> <span class="variable">addButton</span> = <span class="keyword">new</span> <span class="function">XynTag</span>(<span class="string">"button"</span>);
<span class="keyword">const</span> <span class="variable">itemList</span> = <span class="keyword">new</span> <span class="function">XynTag</span>(<span class="string">"ul"</span>);

<span class="comment">// Effect to update the list when items change</span>
<span class="function">effect</span>(() => {
    <span class="variable">itemList</span>.<span class="property">children</span> = <span class="variable">items</span>.<span class="property">value</span>.<span class="method">map</span>(<span class="variable">item</span> => {
        <span class="keyword">const</span> <span class="variable">li</span> = <span class="keyword">new</span> <span class="function">XynTag</span>(<span class="string">"li"</span>);
        <span class="variable">li</span>.<span class="property">children</span> = [<span class="function">text</span><span class="template">\`\${<span class="variable">item</span>}\`</span>];
        <span class="keyword">return</span> <span class="variable">li</span>;
    });
}, [<span class="variable">items</span>]);

<span class="keyword">const</span> <span class="variable">mountList</span> = <span class="function">createRoot</span>(<span class="variable">listContainer</span>, <span class="string">"body"</span>);
<span class="variable">mountList</span>();`);

const items = signal(["Apple", "Banana", "Cherry"]);

// Create input field
const listItemInput = new XynTag("input");
const inputElement = listItemInput.render();
inputElement.type = "text";
inputElement.placeholder = "Enter new item";
inputElement.style.cssText = "margin-right: 10px; padding: 5px;";

// Create add button
const addButton = new XynTag("button");
addButton.children = [text`Add Item`];
const addButtonElement = addButton.render();
addButtonElement.onclick = () => {
    if (inputElement.value.trim()) {
        items.value = [...items.value, inputElement.value.trim()];
        inputElement.value = "";
    }
};
addButtonElement.style.cssText = "padding: 5px 10px; margin-right: 10px;";

// Create clear button
const clearButton = new XynTag("button");
clearButton.children = [text`Clear All`];
const clearButtonElement = clearButton.render();
clearButtonElement.onclick = () => {
    items.value = [];
};
clearButtonElement.style.cssText = "padding: 5px 10px;";

// Create list container
const itemList = new XynTag("ul");
let listElement = itemList.render();

// Effect to update the list when items change
const listEffect = effect(() => {
    // Clear existing list
    listElement.innerHTML = "";

    // Add each item
    items.value.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        li.style.cssText = "margin: 5px 0; padding: 3px;";
        listElement.appendChild(li);
    });
}, [items]);

// Create main container
const listContainer = new XynTag("div");
const listContainerElement = listContainer.render();
listContainerElement.style.cssText = "margin: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;";

listContainerElement.appendChild(inputElement);
listContainerElement.appendChild(addButtonElement);
listContainerElement.appendChild(clearButtonElement);
listContainerElement.appendChild(listElement);

output("Dynamic list created below:");
const mountList = createRoot(listContainer, "body");
mountList();

// Example 12: Conditional Rendering with CSS Classes and createRoot
outputHeader("Example 12: Conditional Rendering and CSS Classes");
outputCode(`<span class="keyword">const</span> <span class="variable">isVisible</span> = <span class="function">signal</span>(<span class="keyword">true</span>);
<span class="keyword">const</span> <span class="variable">theme</span> = <span class="function">signal</span>(<span class="string">"light"</span>);
<span class="keyword">const</span> <span class="variable">message</span> = <span class="function">signal</span>(<span class="string">"Hello from XynHTML!"</span>);

<span class="comment">// Create a styled card</span>
<span class="keyword">const</span> <span class="variable">card</span> = <span class="keyword">new</span> <span class="function">XynTag</span>(<span class="string">"div"</span>);
<span class="keyword">const</span> <span class="variable">cardTitle</span> = <span class="keyword">new</span> <span class="function">XynTag</span>(<span class="string">"h3"</span>);
<span class="variable">cardTitle</span>.<span class="property">children</span> = [<span class="function">text</span><span class="template">\`Interactive Card\`</span>];
<span class="keyword">const</span> <span class="variable">cardContent</span> = <span class="keyword">new</span> <span class="function">XynTag</span>(<span class="string">"p"</span>);
<span class="variable">cardContent</span>.<span class="property">children</span> = [<span class="function">text</span><span class="template">\`\${<span class="variable">message</span>}\`</span>];

<span class="comment">// Create toggle buttons</span>
<span class="keyword">const</span> <span class="variable">toggleButton</span> = <span class="keyword">new</span> <span class="function">XynTag</span>(<span class="string">"button"</span>);
<span class="keyword">const</span> <span class="variable">themeButton</span> = <span class="keyword">new</span> <span class="function">XynTag</span>(<span class="string">"button"</span>);

<span class="keyword">const</span> <span class="variable">conditionalContainer</span> = <span class="keyword">new</span> <span class="function">XynTag</span>(<span class="string">"div"</span>);
<span class="keyword">const</span> <span class="variable">mountConditional</span> = <span class="function">createRoot</span>(<span class="variable">conditionalContainer</span>, <span class="string">"body"</span>);
<span class="variable">mountConditional</span>();`);

const isVisible = signal(true);
const theme = signal("light");
const message = signal("Hello from XynHTML!");

// Create a styled card
const card = new XynTag("div");
const cardElement = card.render();
cardElement.style.cssText = `
    padding: 20px; 
    margin: 10px; 
    border-radius: 8px; 
    transition: all 0.3s ease;
    border: 2px solid #007acc;
    background-color: #f0f8ff;
`;

// Add content to card
const cardTitle = new XynTag("h3");
cardTitle.children = [text`Interactive Card`];
const cardContent = new XynTag("p");
cardContent.children = [text`${message}`];

cardElement.appendChild(cardTitle.render());
cardElement.appendChild(cardContent.render());

// Create toggle button
const toggleButton = new XynTag("button");
const toggleButtonElement = toggleButton.render();
toggleButtonElement.style.cssText = "padding: 8px 16px; margin: 5px; cursor: pointer;";

// Update button text based on visibility
const toggleTextEffect = effect(() => {
    toggleButtonElement.textContent = isVisible.value ? "Hide Card" : "Show Card";
}, [isVisible]);

toggleButtonElement.onclick = () => {
    isVisible.value = !isVisible.value;
};

// Create theme toggle button
const themeButton = new XynTag("button");
const themeButtonElement = themeButton.render();
themeButtonElement.style.cssText = "padding: 8px 16px; margin: 5px; cursor: pointer;";
themeButtonElement.textContent = "Toggle Theme";
themeButtonElement.onclick = () => {
    theme.value = theme.value === "light" ? "dark" : "light";
    // Update card styling based on theme
    if (theme.value === "dark") {
        cardElement.style.backgroundColor = "#2d2d2d";
        cardElement.style.color = "#ffffff";
        cardElement.style.borderColor = "#666";
    } else {
        cardElement.style.backgroundColor = "#f0f8ff";
        cardElement.style.color = "#000000";
        cardElement.style.borderColor = "#007acc";
    }
};

// Effect to handle visibility
const visibilityEffect = effect(() => {
    cardElement.style.display = isVisible.value ? "block" : "none";
}, [isVisible]);

// Create container for this example
const conditionalContainer = new XynTag("div");
const conditionalContainerElement = conditionalContainer.render();
conditionalContainerElement.style.cssText = "margin: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;";

conditionalContainerElement.appendChild(toggleButtonElement);
conditionalContainerElement.appendChild(themeButtonElement);
conditionalContainerElement.appendChild(cardElement);

output("Conditional rendering example created below:");
const mountConditional = createRoot(conditionalContainer, "body");
mountConditional();

// Example 13: Form with Reactive Validation and createRoot
outputHeader("Example 13: Form with Reactive Validation");
outputCode(`<span class="keyword">const</span> <span class="variable">email</span> = <span class="function">signal</span>(<span class="string">""</span>);
<span class="keyword">const</span> <span class="variable">password</span> = <span class="function">signal</span>(<span class="string">""</span>);

<span class="keyword">const</span> [<span class="variable">isValidEmail</span>, <span class="variable">unsubscribeEmail</span>] = <span class="function">derived</span>(() => {
    <span class="keyword">return</span> /<span class="regex">^[^\s@]+@[^\s@]+\.[^\s@]+$</span>/<span class="method">test</span>(<span class="variable">email</span>.<span class="property">value</span>);
}, [<span class="variable">email</span>]);

<span class="keyword">const</span> [<span class="variable">isValidPassword</span>, <span class="variable">unsubscribePassword</span>] = <span class="function">derived</span>(() => {
    <span class="keyword">return</span> <span class="variable">password</span>.<span class="property">value</span>.<span class="property">length</span> >= <span class="number">8</span>;
}, [<span class="variable">password</span>]);

<span class="keyword">const</span> [<span class="variable">isFormValid</span>, <span class="variable">unsubscribeForm</span>] = <span class="function">derived</span>(() => {
    <span class="keyword">return</span> <span class="variable">isValidEmail</span>.<span class="property">value</span> && <span class="variable">isValidPassword</span>.<span class="property">value</span>;
}, [<span class="variable">isValidEmail</span>, <span class="variable">isValidPassword</span>]);

<span class="keyword">const</span> <span class="variable">form</span> = <span class="keyword">new</span> <span class="function">XynTag</span>(<span class="string">"form"</span>);
<span class="keyword">const</span> <span class="variable">mountForm</span> = <span class="function">createRoot</span>(<span class="variable">form</span>, <span class="string">"body"</span>);
<span class="variable">mountForm</span>();`);

const email = signal("");
const password = signal("");

// Derived validation signals
const [isValidEmail, unsubscribeEmail] = derived(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
}, [email]);

const [isValidPassword, unsubscribePassword] = derived(() => {
    return password.value.length >= 8;
}, [password]);

const [isFormValid, unsubscribeForm] = derived(() => {
    return isValidEmail.value && isValidPassword.value;
}, [isValidEmail, isValidPassword]);

// Create form elements
const form = new XynTag("form");
const formElement = form.render();
formElement.style.cssText = "padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin: 20px; background-color: #fafafa;";

// Email input
const emailInput = document.createElement("input");
emailInput.type = "email";
emailInput.placeholder = "Enter your email";
emailInput.style.cssText = "width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ccc; border-radius: 4px;";
emailInput.oninput = (e) => {
    email.value = e.target.value;
};

// Email validation message
const emailValidation = document.createElement("div");
emailValidation.style.cssText = "font-size: 12px; margin: 5px 0;";

// Password input
const passwordInput = document.createElement("input");
passwordInput.type = "password";
passwordInput.placeholder = "Enter your password";
passwordInput.style.cssText = "width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ccc; border-radius: 4px;";
passwordInput.oninput = (e) => {
    password.value = e.target.value;
};

// Password validation message
const passwordValidation = document.createElement("div");
passwordValidation.style.cssText = "font-size: 12px; margin: 5px 0;";

// Submit button
const submitButton = document.createElement("button");
submitButton.type = "button";
submitButton.textContent = "Submit";
submitButton.style.cssText = "padding: 10px 20px; margin: 10px 0; border: none; border-radius: 4px; cursor: pointer;";
submitButton.onclick = () => {
    if (isFormValid.value) {
        output(`Form submitted! Email: ${email.value}`);
    }
};

// Effects for validation styling
effect(() => {
    emailInput.style.borderColor = email.value && !isValidEmail.value ? "#ff4444" : "#ccc";
    emailValidation.textContent = email.value && !isValidEmail.value ? "Please enter a valid email address" : "";
    emailValidation.style.color = "#ff4444";
}, [email, isValidEmail]);

effect(() => {
    passwordInput.style.borderColor = password.value && !isValidPassword.value ? "#ff4444" : "#ccc";
    passwordValidation.textContent = password.value && !isValidPassword.value ? "Password must be at least 8 characters long" : "";
    passwordValidation.style.color = "#ff4444";
}, [password, isValidPassword]);

effect(() => {
    submitButton.disabled = !isFormValid.value;
    submitButton.style.backgroundColor = isFormValid.value ? "#007acc" : "#cccccc";
    submitButton.style.color = isFormValid.value ? "white" : "#666666";
}, [isFormValid]);

// Assemble form
formElement.appendChild(document.createTextNode("Email:"));
formElement.appendChild(emailInput);
formElement.appendChild(emailValidation);
formElement.appendChild(document.createElement("br"));
formElement.appendChild(document.createTextNode("Password:"));
formElement.appendChild(passwordInput);
formElement.appendChild(passwordValidation);
formElement.appendChild(document.createElement("br"));
formElement.appendChild(submitButton);

output("Reactive form with validation created below:");
const mountForm = createRoot(form, "body");
mountForm();

// Clean up derived signals when done
// unsubscribeEmail();
// unsubscribePassword();
// unsubscribeForm();
