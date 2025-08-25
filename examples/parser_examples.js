
import { signal, XynTag, text } from "../src/xyn_html.js";
import { html } from "../src/xyn_html_parser.js";

console.log("=== XynHTMLParser html() Examples ===");

// Example 1: Basic HTML parsing with signals
console.log("--- Example 1: Basic HTML with Signals ---");

const userName = signal("John Doe");
const isActive = signal(true);

try {
    const elements = html`
        <div class="user-card">
            <h2>Welcome, ${userName}!</h2>
            <p>Status: ${isActive}</p>
        </div>
    `;
    
    console.log("Parsed elements:", elements);
    console.log("Number of elements:", elements.length);
    console.log("First element type:", elements[0].constructor.name);
    
} catch (error) {
    console.error("Error in Example 1:", error);
}

// Example 2: Multiple interpolated values
console.log("--- Example 2: Multiple Interpolated Values ---");

const firstName = signal("Jane");
const lastName = signal("Smith");
const age = signal(25);

try {
    const profileElements = html`
        <div class="profile">
            <h1>${firstName} ${lastName}</h1>
            <p>Age: ${age}</p>
            <span>Full name: ${firstName} ${lastName}</span>
        </div>
    `;
    
    console.log("Profile elements:", profileElements);
    
    // Test reactivity
    setTimeout(() => {
        firstName.value = "Alice";
        lastName.value = "Johnson";
        age.value = 30;
        console.log("Updated signals - check if elements updated");
    }, 1000);
    
} catch (error) {
    console.error("Error in Example 2:", error);
}

// Example 3: Nested HTML structure
console.log("--- Example 3: Nested HTML Structure ---");

const items = signal(["Item 1", "Item 2", "Item 3"]);
const listTitle = signal("My List");

try {
    const nestedElements = html`
        <div class="container">
            <h2>${listTitle}</h2>
            <ul class="item-list">
                <li>Static item</li>
                <li data-dynamic="true">${items}</li>
            </ul>
            <footer>
                <small>Created with XynHTML Parser</small>
            </footer>
        </div>
    `;
    
    console.log("Nested elements:", nestedElements);
    
} catch (error) {
    console.error("Error in Example 3:", error);
}

// Example 4: Attributes with interpolated values
console.log("--- Example 4: Dynamic Attributes ---");

const buttonText = signal("Click Me");
const buttonClass = signal("btn-primary");
const buttonId = signal("my-button");
const isDisabled = signal(false);

try {
    const buttonElements = html`
        <button 
            id="${buttonId}"
            class="${buttonClass}" 
            disabled="${isDisabled}"
            data-text="${buttonText}">
            ${buttonText}
        </button>
    `;
    
    console.log("Button elements:", buttonElements);
    
    // Test attribute updates
    setTimeout(() => {
        buttonClass.value = "btn-secondary";
        isDisabled.value = true;
        buttonText.value = "Disabled Button";
        buttonId.value = "disabled-button";
        console.log("Updated button attributes");
    }, 2000);
    
} catch (error) {
    console.error("Error in Example 4:", error);
}

// Example 5: Multiple root-level elements
console.log("--- Example 5: Multiple Root Elements ---");

const title = signal("My Application");
const subtitle = signal("Built with XynHTML");
const version = signal("1.0.0");

try {
    const multipleElements = html`
        <header>
            <h1>${title}</h1>
            <p>${subtitle}</p>
        </header>
        <main>
            <p>Content goes here...</p>
        </main>
        <footer>
            <small>Version: ${version}</small>
        </footer>
    `;
    
    console.log("Multiple root elements:", multipleElements);
    console.log("Number of root elements:", multipleElements.length);
    
} catch (error) {
    console.error("Error in Example 5:", error);
}

// Example 6: Empty and edge cases
console.log("--- Example 6: Edge Cases ---");

const emptySignal = signal("");
const nullSignal = signal(null);
const undefinedSignal = signal(undefined);
const numberSignal = signal(42);

try {
    const edgeCaseElements = html`
        <div>
            <p>Empty: "${emptySignal}"</p>
            <p>Null: "${nullSignal}"</p>
            <p>Undefined: "${undefinedSignal}"</p>
            <p>Number: ${numberSignal}</p>
        </div>
    `;
    
    console.log("Edge case elements:", edgeCaseElements);
    
} catch (error) {
    console.error("Error in Example 6:", error);
}

// Example 7: Complex mixed content
console.log("--- Example 7: Complex Mixed Content ---");

const showAdvanced = signal(false);
const userRole = signal("admin");
const notifications = signal(3);

try {
    const complexElements = html`
        <div class="dashboard">
            <nav class="navbar" role="${userRole}">
                <span class="brand">Dashboard</span>
                <div class="notifications" data-count="${notifications}">
                    Notifications: ${notifications}
                </div>
            </nav>
            <main class="content">
                <section class="basic">
                    <h2>Basic Content</h2>
                    <p>Always visible content here.</p>
                </section>
                <section class="advanced" hidden="${showAdvanced}">
                    <h2>Advanced Settings</h2>
                    <p>Advanced content for ${userRole} users.</p>
                </section>
            </main>
        </div>
    `;
    
    console.log("Complex elements:", complexElements);
    
    // Toggle advanced view
    setTimeout(() => {
        showAdvanced.value = true;
        notifications.value = 5;
        console.log("Toggled advanced view and updated notifications");
    }, 3000);
    
} catch (error) {
    console.error("Error in Example 7:", error);
}

console.log("=== End of XynHTMLParser Examples ===");
