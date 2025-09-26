import { signal, tag, effect } from "../src/xyn_html.js";

export const title = "Example 11: Dynamic List with XynTag and createMount";

export async function example11(output) {
    const items = signal(["Apple", "Banana", "Cherry"]);
    output.signalUpdate("items", items);

    // Create input field
    const listItemInput = tag`input`;
    const inputElement = listItemInput.render();
    inputElement.type = "text";
    inputElement.placeholder = "Enter new item";

    // Create add button
    const addButton = tag`button`;
    const addButtonElement = addButton.render();
    addButtonElement.textContent = "+";
    addButtonElement.onclick = () => {
        if (inputElement.value.trim()) {
            items.value = [...items.value, inputElement.value.trim()];
            inputElement.value = "";
        }
    };

    // Create clear button
    const clearButton = tag`button`;
    const clearButtonElement = clearButton.render();
    clearButtonElement.textContent = "Clear";
    clearButtonElement.onclick = () => {
        items.value = [];
    };

    // Create list container
    const itemList = tag`ul`;
    let listElement = itemList.render();

    // Effect to update the list when items change
    effect(() => {
        // Clear existing list
        listElement.innerHTML = "";

        // Add each item with remove button
        items.value.forEach((item, index) => {
            const li = document.createElement("li");
            li.className = "list-item";

            const itemText = document.createElement("span");
            itemText.textContent = item;

            const removeButton = document.createElement("button");
            removeButton.textContent = "×";
            removeButton.className = "remove-button";
            removeButton.onclick = () => {
                items.value = items.value.filter((_, i) => i !== index);
            };

            li.appendChild(itemText);
            li.appendChild(removeButton);
            listElement.appendChild(li);
        });
    }, [items]);

    // Create main container
    const listContainer = tag`div`;
    const listContainerElement = listContainer.render();
    listContainerElement.className = "example-container";

    listContainerElement.appendChild(inputElement);
    listContainerElement.appendChild(addButtonElement);
    listContainerElement.appendChild(clearButtonElement);
    listContainerElement.appendChild(listElement);

    output("Dynamic list created below:");
    output.append(listContainer);
}

