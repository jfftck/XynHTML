
import { signal, XynTag, text, XynSwitch } from "../src/xyn_html.js";

export async function example12() {
    const output = function(message) {
        const container = document.getElementById('example12-output');
        if (container) {
            const p = document.createElement('p');
            p.textContent = message;
            container.appendChild(p);
        }
    };

    const isVisible = signal(true);
    const message = signal("Hello from XynHTML!");

    // Create a styled card
    const card = new XynTag("div");
    const cardTitle = new XynTag("h3");
    cardTitle.children = [text`Interactive Card`];
    const cardContent = new XynTag("p");
    cardContent.children = [text`${message}`];

    card.children = [cardTitle, cardContent];
    const cardElement = card.render();
    cardElement.style.cssText = "padding: 20px; border: 2px solid #007bff; border-radius: 8px; background: #f8f9fa; margin: 10px 0;";

    // Create placeholder for hidden state
    const hiddenPlaceholder = new XynTag("div");
    hiddenPlaceholder.children = [text`Card is hidden`];
    const hiddenElement = hiddenPlaceholder.render();
    hiddenElement.style.cssText = "padding: 20px; border: 2px dashed #ccc; border-radius: 8px; color: #666; margin: 10px 0;";

    // Create XynSwitch for conditional rendering
    const cardSwitch = new XynSwitch(isVisible, new Map([
        [true, card],
        [false, hiddenPlaceholder]
    ]));

    // Create toggle button
    const toggleButton = new XynTag("button");
    toggleButton.children = [text`Toggle Visibility`];
    const toggleElement = toggleButton.render();
    toggleElement.onclick = () => {
        isVisible.value = !isVisible.value;
    };

    const container = new XynTag("div");
    container.children = [toggleButton, cardSwitch];
    const containerElement = container.render();
    containerElement.className = "example-container";

    const outputContainer = document.getElementById('example12-output');
    if (outputContainer) {
        output("Conditional rendering with XynSwitch:");
        outputContainer.appendChild(containerElement);
    }
}
