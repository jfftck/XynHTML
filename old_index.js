// Example 11: Dynamic List with XynTag and createRoot
const items = signal(["Apple", "Banana", "Cherry"]);

// Create input field
const listItemInput = new XynTag("input");
const inputElement = listItemInput.render();
inputElement.type = "text";
inputElement.placeholder = "Enter new item";
inputElement.style.cssText = "margin-right: 10px; padding: 5px;";

// Create add button
const addButton = new XynTag("button");
const addButtonElement = addButton.render();
addButtonElement.textContent = "+";
addButtonElement.onclick = () => {
    if (inputElement.value.trim()) {
        items.value = [...items.value, inputElement.value.trim()];
        inputElement.value = "";
    }
};
addButtonElement.style.cssText = "padding: 5px 10px; margin-right: 10px;";

// Create clear button
const clearButton = new XynTag("button");
const clearButtonElement = clearButton.render();
clearButtonElement.textContent = "Clear";
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

    // Add each item with remove button
    items.value.forEach((item, index) => {
        const li = document.createElement("li");
        li.style.cssText = "margin: 5px 0; padding: 3px; display: flex; justify-content: space-between; align-items: center;";

        const itemText = document.createElement("span");
        itemText.textContent = item;

        const removeButton = document.createElement("button");
        removeButton.textContent = "×";
        removeButton.style.cssText = "background: none; border: none; color: #ff4444; cursor: pointer; font-size: 16px; padding: 2px 6px; margin-left: 10px;";
        removeButton.onclick = () => {
            items.value = items.value.filter((_, i) => i !== index);
        };

        li.appendChild(itemText);
        li.appendChild(removeButton);
        listElement.appendChild(li);
    });
}, [items]);

// Create main container
const listContainer = new XynTag("div");
const listContainerElement = listContainer.render();
listContainerElement.className = "example-container";
listContainerElement.style.cssText = "margin: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;";

listContainerElement.appendChild(inputElement);
listContainerElement.appendChild(addButtonElement);
listContainerElement.appendChild(clearButtonElement);
listContainerElement.appendChild(listElement);

output("Dynamic list created below:");
const mountList = createMount(listContainer, "body");
mountList();

// Global theme management
const savedTheme = localStorage.getItem('xynhtml-theme') || getSystemTheme();
const globalTheme = signal(savedTheme);

// Apply global theme
function applyGlobalTheme(theme) {
    const isDark = theme === 'dark';

    // Set data attribute for CSS targeting
    document.body.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    document.documentElement.style.setProperty('--color-background', isDark ? '#121212' : '#f8f8f8');
    document.body.style.backgroundColor = isDark ? '#121212' : '#f8f8f8';
    document.body.style.color = isDark ? '#ffffff' : '#000000';

    // Update all example containers
    document.querySelectorAll('.example-container').forEach(container => {
        if (isDark) {
            container.style.backgroundColor = '#2d2d2d';
            container.style.borderColor = '#666';
            container.style.color = '#ffffff';
        } else {
            container.style.backgroundColor = '#f9f9f9';
            container.style.borderColor = '#ddd';
            container.style.color = '#000000';
        }
    });

    // Update form elements
    document.querySelectorAll('input, button').forEach(element => {
        if (element.type !== 'button' && element.tagName !== 'BUTTON') {
            if (isDark) {
                element.style.backgroundColor = '#3d3d3d';
                element.style.color = '#ffffff';
                element.style.borderColor = '#666';
            } else {
                element.style.backgroundColor = '#ffffff';
                element.style.color = '#000000';
                element.style.borderColor = '#ccc';
            }
        }
    });
}


// Example 12: Conditional Rendering with XynSwitch
const isVisible = signal(true);
const localTheme = signal(globalTheme.value);
const message = signal("Hello from XynHTML!");

// Effect to sync local theme with global theme changes
const localThemeSyncEffect = effect(() => {
    localTheme.value = globalTheme.value;
}, [globalTheme]);

// Create a styled card
const card = new XynTag("div");
const cardElement = card.render();
cardElement.className = "example-container";
cardElement.style.cssText = `
    padding: 20px;
    margin: 10px;
    border-radius: 8px;
    transition: all 0.3s ease;
    border: 2px solid #007acc;
`;

// Add content to card
const cardTitle = new XynTag("h3");
cardTitle.children = [text`Interactive Card`];
const cardContent = new XynTag("p");
cardContent.children = [text`${message}`];

cardElement.appendChild(cardTitle.render());
cardElement.appendChild(cardContent.render());

// Create placeholder for hidden state
const hiddenPlaceholder = new XynTag("div");
const hiddenPlaceholderElement = hiddenPlaceholder.render();
hiddenPlaceholderElement.style.cssText = "padding: 20px; margin: 10px; color: #666; font-style: italic;";
hiddenPlaceholderElement.textContent = "Card is hidden";

// Create XynSwitch for conditional rendering
const cardSwitch = new XynSwitch(isVisible, new Map([
    [true, card]
]));

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

// Create local theme toggle button
const themeButton = new XynTag("button");
const themeButtonElement = themeButton.render();
themeButtonElement.style.cssText = "padding: 8px 16px; margin: 5px; cursor: pointer;";
themeButtonElement.textContent = "Toggle Local Theme";
themeButtonElement.onclick = () => {
    localTheme.value = localTheme.value === "light" ? "dark" : "light";
};

// Effect to handle card theme styling
const cardTheme = derived(() => {
    if (localTheme.value === "dark") {
        return {
            backgroundColor: "#2d2d2d",
            color: "#ffffff",
            borderColor: "#666"
        };
    } else {
        return {
            backgroundColor: "#f0f8ff",
            color: "#000000",
            borderColor: "#007acc"
        };
    }
}, [localTheme]);
effect(() => {
    cardElement.style.backgroundColor = cardTheme.value.backgroundColor;
    cardElement.style.color = cardTheme.value.color;
    cardElement.style.borderColor = cardTheme.value.borderColor;
}, [cardTheme]);

// Create container for this example
const conditionalContainer = new XynTag("div");
const conditionalContainerElement = conditionalContainer.render();
conditionalContainer.css`example-container`;
conditionalContainerElement.style.cssText = "margin: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;";

conditionalContainerElement.appendChild(toggleButtonElement);
conditionalContainerElement.appendChild(themeButtonElement);

// Render the switch and append it to the container
const switchContainer = document.createElement("div");
createMount(cardSwitch, switchContainer)();
conditionalContainerElement.appendChild(switchContainer);

output("Conditional rendering with XynSwitch created below:");
const mountConditional = createMount(conditionalContainer, "body");
mountConditional();

// Example 13: Form with Reactive Validation and createRoot
const email = signal("");
const password = signal("");

// Derived validation signals
const isValidEmail = derived(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
}, [email]);

const isValidPassword = derived(() => {
    return password.value.length >= 8;
}, [password]);

const isFormValid = derived(() => {
    return isValidEmail.value && isValidPassword.value;
}, [isValidEmail, isValidPassword]);

// Create form elements
const form = new XynTag("form");
const formElement = form.render();
formElement.className = "example-container";
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
const mountForm = createMount(form, "body");
mountForm();

