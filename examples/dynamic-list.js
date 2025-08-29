

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

    const outputContainer = document.getElementById('example11-output');
    if (outputContainer) {
        output("Dynamic list created below:");
        outputContainer.appendChild(listContainerElement);
    }
}

