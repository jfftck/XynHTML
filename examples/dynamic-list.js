import { signal, XynTag, text, effect } from "../src/xyn_html.js";

export async function example11() {
    const output = function(message) {
        const container = document.getElementById('example11-output');
        if (container) {
            const p = document.createElement('p');
            p.textContent = message;
            container.appendChild(p);
        }
    };

    const items = signal(["Apple", "Banana", "Cherry"]);

    // Create list container
    const listContainer = new XynTag("div");
    const itemInput = new XynTag("input");
    const addButton = new XynTag("button");
    const itemList = new XynTag("ul");

    // Render and configure input and button with proper styling
    const inputElement = itemInput.render();
    inputElement.placeholder = "Enter new item";
    inputElement.className = "form-input";

    const buttonElement = addButton.render();
    buttonElement.className = "form-button";
    buttonElement.onclick = () => {
        if (inputElement.value.trim()) {
            items.value = [...items.value, inputElement.value.trim()];
            inputElement.value = "";
        }
    };

    const clearButton = new XynTag("button");
    const clearElement = clearButton.render();
    clearElement.textContent = "Clear All";
    clearElement.className = "form-button secondary";
    clearElement.onclick = () => {
        items.value = [];
    };

    // Effect to update the list when items change
    const listElement = itemList.render();
    effect(() => {
        listElement.innerHTML = "";
        items.value.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            listElement.appendChild(li);
        });
    }, [items]);

    // Build the complete list container
    listContainer.children = [inputElement, buttonElement, clearElement, listElement];
    const containerElement = listContainer.render();
    containerElement.className = "example-container";

    const outputContainer = document.getElementById('example11-output');
    if (outputContainer) {
        output("Dynamic list with add functionality:");
        outputContainer.appendChild(containerElement);
    }
}